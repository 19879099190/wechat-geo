// 赏花路线推荐页面
const flowerApi = require('../../../api/flower.js');
const mapService = require('../../../utils/map-service.js');

Page({
  data: {
    routes: [],
    loading: true,
    selectedRoute: null,
    showMap: false,
    mapMarkers: [],
    mapPolyline: [],
    mapPlanning: false,
    mapCenter: { latitude: 23.158, longitude: 113.352 }
  },

  onLoad() {
    this.loadRoutes();
  },

  // 从 API 加载路线
  loadRoutes() {
    this.setData({ loading: true });
    flowerApi.getFlowerRoutes().then(res => {
      if (res.code === 0 && res.data) {
        const routes = res.data.map(r => ({
          ...r,
          distanceText: r.distance ? (r.distance >= 1000 ? (r.distance / 1000).toFixed(1) + '公里' : r.distance + '米') : '-',
          best_time: r.best_time || '春季'
        }));
        this.setData({ routes, loading: false });
      } else {
        this.setData({ routes: [], loading: false });
      }
    }).catch(() => {
      this.setData({ routes: [], loading: false });
      wx.showToast({ title: '加载路线失败', icon: 'none' });
    });
  },

  // 查看路线详情
  viewRouteDetail(e) {
    const route = e.currentTarget.dataset.route;
    this.setData({ selectedRoute: route });
  },

  // 关闭详情
  closeDetail() {
    this.setData({ selectedRoute: null });
  },

  // 查看地图
  async viewOnMap(e) {
    const route = e.currentTarget.dataset.route;
    const planningId = (this.routePlanningId || 0) + 1;
    this.routePlanningId = planningId;
    const spots = (route.spots || []).filter(s =>
      s.latitude !== null && s.latitude !== '' &&
      s.longitude !== null && s.longitude !== '' &&
      Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude))
    );
    if (!spots.length) {
      wx.showToast({ title: '该路线暂无坐标数据', icon: 'none' });
      return;
    }

    const markers = spots.map((s, idx) => ({
      id: s.spot_id || idx,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      title: s.name || '',
      callout: {
        content: s.name || '',
        display: 'ALWAYS',
        fontSize: 12,
        borderRadius: 4,
        padding: 4,
        bgColor: '#ffffff',
        color: '#333333'
      },
      label: {
        content: (idx + 1) + '',
        color: '#ffffff',
        bgColor: '#ff6b9d',
        borderRadius: 10,
        padding: 2,
        fontSize: 10
      },
      width: 28,
      height: 28
    }));

    const points = spots.map(s => ({
      latitude: Number(s.latitude),
      longitude: Number(s.longitude)
    }));

    // 计算中心点
    let centerLat = 23.158, centerLng = 113.352;
    if (points.length) {
      centerLat = points.reduce((s, p) => s + p.latitude, 0) / points.length;
      centerLng = points.reduce((s, p) => s + p.longitude, 0) / points.length;
    }

    this.setData({
      showMap: true,
      mapMarkers: markers,
      mapPolyline: [],
      mapPlanning: points.length >= 2,
      mapCenter: { latitude: centerLat, longitude: centerLng },
      mapRouteName: route.name
    });

    this.fitMapPoints(points);

    if (points.length < 2) return;

    this.routeLoadingId = planningId;
    wx.showLoading({ title: '沿道路规划中...', mask: false });
    try {
      // 步行接口不支持途经点，因此按相邻赏花点逐段规划。
      const segmentResults = await Promise.all(points.slice(0, -1).map((from, index) => {
        const to = points[index + 1];

        // 同一位置（或相距不足 5 米）的景点无需调用路径规划接口。
        // 腾讯地图会把重合起终点判定为 374“起终点坐标错误”。
        if (this.getPointDistance(from, to) < 5) {
          console.log(`赏花路线第 ${index + 1} 段景点位置重合，已跳过路径规划`);
          return Promise.resolve({ points: [], skipped: true, failed: false });
        }

        return mapService.direction({
          mode: 'walking',
          from: `${from.latitude},${from.longitude}`,
          to: `${to.latitude},${to.longitude}`
        }).then(res => ({
          points: this.getRoutePoints(res),
          skipped: false,
          failed: false
        })).catch(error => {
          const fromName = spots[index].name || `景点 ${index + 1}`;
          const toName = spots[index + 1].name || `景点 ${index + 2}`;
          console.error(`赏花路线第 ${index + 1} 段（${fromName} → ${toName}）规划失败:`, error);
          return { points: [], skipped: false, failed: true };
        });
      }));

      // 失败的路段不再使用直线替代，避免把穿楼、跨绿地的连线误认为道路。
      const polylines = segmentResults.filter(segment => segment.points.length >= 2).map(segment => ({
        points: segment.points,
        color: '#ff6b9dCC',
        width: 5,
        borderColor: '#ffffff',
        borderWidth: 2,
        dottedLine: false,
        arrowLine: true
      }));

      if (!this.data.showMap || this.routePlanningId !== planningId) return;
      this.setData({ mapPolyline: polylines, mapPlanning: false });

      const routePoints = segmentResults.reduce((all, segment) => all.concat(segment.points), []);
      this.fitMapPoints(routePoints.length ? routePoints : points);

      if (segmentResults.some(segment => segment.failed)) {
        wx.showToast({ title: '部分路段规划失败', icon: 'none' });
      }
    } finally {
      if (this.routePlanningId === planningId) {
        if (this.routeLoadingId === planningId) {
          wx.hideLoading();
          this.routeLoadingId = null;
        }
        if (this.data.showMap && this.data.mapPlanning) {
          this.setData({ mapPlanning: false });
        }
      }
    }
  },

  // 腾讯地图 direction 返回增量压缩的 [纬度, 经度, ...] 坐标数组。
  getRoutePoints(res) {
    const routes = res && res.result && res.result.routes;
    const polyline = routes && routes[0] && routes[0].polyline;
    if (!Array.isArray(polyline) || polyline.length < 4) return [];

    const coordinates = polyline.map(Number);
    for (let i = 2; i < coordinates.length; i++) {
      coordinates[i] = coordinates[i - 2] + coordinates[i] / 1000000;
    }

    const points = [];
    for (let i = 0; i < coordinates.length - 1; i += 2) {
      if (Number.isFinite(coordinates[i]) && Number.isFinite(coordinates[i + 1])) {
        points.push({ latitude: coordinates[i], longitude: coordinates[i + 1] });
      }
    }
    return points;
  },

  getPointDistance(from, to) {
    const toRadians = degree => degree * Math.PI / 180;
    const lat1 = toRadians(from.latitude);
    const lat2 = toRadians(to.latitude);
    const deltaLat = lat2 - lat1;
    const deltaLng = toRadians(to.longitude - from.longitude);
    const value = Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  },

  fitMapPoints(points) {
    if (!points || !points.length) return;
    setTimeout(() => {
      if (!this.data.showMap) return;
      const mapCtx = wx.createMapContext('routeMap', this);
      if (mapCtx) {
        mapCtx.includePoints({ points, padding: [60, 60, 60, 60] });
      }
    }, 300);
  },

  // 关闭地图
  closeMap() {
    this.routePlanningId = (this.routePlanningId || 0) + 1;
    if (this.routeLoadingId) {
      wx.hideLoading();
      this.routeLoadingId = null;
    }
    this.setData({ showMap: false, mapMarkers: [], mapPolyline: [], mapPlanning: false });
  },

  // 开始导航
  startNavigation(e) {
    const route = e.currentTarget.dataset.route;
    wx.showModal({
      title: '开始导航',
      content: `确定开始"${route.name}"的导航吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/navigation/navigation?routeId=${route.id}`
          });
        }
      }
    });
  },

  // 收藏路线
  favoriteRoute(e) {
    wx.showToast({ title: '收藏成功', icon: 'success' });
  },

  onShareAppMessage() {
    return {
      title: '华农赏花路线推荐',
      path: '/pages/flower/routes/routes'
    };
  }
});
