// utils/helpers.js - 共享工具函数

// Haversine 公式计算两点间距离（米）
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 计算两点间距离（米）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 生成路径点（简化版，实际应使用路网数据）
 */
function generateRoutePoints(from, to, offset = 0) {
  const points = [];
  const steps = 10; // 路径点数量

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    // 添加一些随机偏移使路线更自然
    const latOffset = offset * Math.sin(ratio * Math.PI) * 0.001;
    const lngOffset = offset * Math.cos(ratio * Math.PI) * 0.001;

    points.push({
      latitude: from.latitude + (to.latitude - from.latitude) * ratio + latOffset,
      longitude: from.longitude + (to.longitude - from.longitude) * ratio + lngOffset
    });
  }

  return points;
}

// 解码腾讯地图压缩坐标
function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return points;
}

// 解析 spots 字段并关联 flower_spots 详情（接受 pool 作为参数）
async function enrichRouteSpots(routes, pool) {
  const allSpotIds = new Set();

  const parsedRoutes = routes.map(route => {
    let spots = [];
    try { spots = route.spots ? JSON.parse(route.spots) : []; } catch (e) { spots = []; }

    // 兼容旧格式: ["16，17，12，11"] (中文逗号分隔的单字符串)
    if (spots.length === 1 && typeof spots[0] === 'string') {
      const ids = spots[0].split(/[,，]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      spots = ids.map((id, idx) => ({ spot_id: id, order: idx + 1, duration: '' }));
    }
    // 兼容纯数字数组: [16, 17, 12]
    else if (spots.length > 0 && typeof spots[0] === 'number') {
      spots = spots.map((id, idx) => ({ spot_id: id, order: idx + 1, duration: '' }));
    }
    // 新格式 [{spot_id, order, duration}] 直接使用

    spots.forEach(s => { if (s.spot_id) allSpotIds.add(s.spot_id); });

    let tags = [], highlights = [], tips = [];
    try { tags = route.tags ? JSON.parse(route.tags) : []; } catch (e) {}
    try { highlights = route.highlights ? JSON.parse(route.highlights) : []; } catch (e) {}
    try { tips = route.tips ? JSON.parse(route.tips) : []; } catch (e) {}

    return { ...route, spots, tags, highlights, tips };
  });

  if (allSpotIds.size === 0) return parsedRoutes;

  const ids = Array.from(allSpotIds);
  const placeholders = ids.map(() => '?').join(',');
  const [spotRows] = await pool.query(
    `SELECT id, name, latitude, longitude, images, type, status FROM flower_spots WHERE id IN (${placeholders})`,
    ids
  );

  const spotMap = {};
  spotRows.forEach(s => { spotMap[s.id] = s; });

  return parsedRoutes.map(route => {
    route.spots = route.spots.map(s => {
      const detail = spotMap[s.spot_id];
      if (detail) {
        let images = [];
        try { images = detail.images ? JSON.parse(detail.images) : []; } catch (e) {}
        return { ...s, name: detail.name, latitude: detail.latitude, longitude: detail.longitude, images, type: detail.type, status: detail.status };
      }
      return s;
    });

    // 若未填距离，根据坐标自动计算
    if (!route.distance && route.spots.length >= 2) {
      let totalDist = 0;
      for (let i = 1; i < route.spots.length; i++) {
        const prev = route.spots[i - 1];
        const curr = route.spots[i];
        if (prev.latitude && curr.latitude) {
          totalDist += haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
        }
      }
      route.distance = Math.round(totalDist);
    }

    return route;
  });
}

module.exports = {
  haversineDistance,
  calculateDistance,
  generateRoutePoints,
  decodePolyline,
  enrichRouteSpots
};
