const express = require('express');
const { requestTencentMap } = require('../utils/tencent-map');

const router = express.Router();
const ALLOWED_MODES = new Set(['driving', 'walking', 'bicycling', 'transit']);

function coordinate(value, fieldName) {
  let latitude;
  let longitude;

  if (typeof value === 'string') {
    [latitude, longitude] = value.split(',').map(Number);
  } else if (value && typeof value === 'object') {
    latitude = Number(value.latitude ?? value.lat);
    longitude = Number(value.longitude ?? value.lng);
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    const error = new Error(`${fieldName} 坐标格式错误`);
    error.statusCode = 400;
    throw error;
  }
  return `${latitude},${longitude}`;
}

function positiveInteger(value, defaultValue, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
  return Math.min(parsed, max);
}

async function proxy(res, requestFactory) {
  try {
    const data = await requestFactory();
    res.json(data);
  } catch (error) {
    const statusCode = error.statusCode || (error.code === 'MAP_KEY_MISSING' ? 503 : 502);
    console.error('腾讯地图代理请求失败:', error.message);
    res.status(statusCode).json({
      status: -1,
      message: error.message || '腾讯地图服务请求失败'
    });
  }
}

module.exports = () => {
  router.post('/direction', (req, res) => proxy(res, async () => {
    const mode = req.body.mode || 'walking';
    if (!ALLOWED_MODES.has(mode)) {
      const error = new Error('不支持的出行方式');
      error.statusCode = 400;
      throw error;
    }
    return requestTencentMap(`/ws/direction/v1/${mode}/`, {
      from: coordinate(req.body.from, '起点'),
      to: coordinate(req.body.to, '终点'),
      policy: req.body.policy
    });
  }));

  router.get('/search', (req, res) => proxy(res, async () => {
    const keyword = String(req.query.keyword || '').trim();
    if (!keyword) {
      const error = new Error('搜索关键词不能为空');
      error.statusCode = 400;
      throw error;
    }

    const params = {
      keyword,
      orderby: req.query.orderby || '_distance',
      page_size: positiveInteger(req.query.pageSize, 10, 20),
      page_index: positiveInteger(req.query.page, 1, 100)
    };

    if (req.query.latitude !== undefined || req.query.longitude !== undefined) {
      const location = coordinate({
        latitude: req.query.latitude,
        longitude: req.query.longitude
      }, '搜索中心');
      params.boundary = `nearby(${location},${positiveInteger(req.query.radius, 1000, 50000)},1)`;
    } else {
      params.boundary = `region(${String(req.query.region || '广州市').slice(0, 30)},1)`;
    }

    return requestTencentMap('/ws/place/v1/search', params);
  }));

  router.get('/reverse-geocoder', (req, res) => proxy(res, () =>
    requestTencentMap('/ws/geocoder/v1/', {
      location: coordinate({ latitude: req.query.latitude, longitude: req.query.longitude }, '位置'),
      coord_type: 5,
      get_poi: req.query.getPoi === '1' ? 1 : 0
    })
  ));

  router.get('/suggestion', (req, res) => proxy(res, async () => {
    const keyword = String(req.query.keyword || '').trim();
    if (!keyword) {
      const error = new Error('搜索关键词不能为空');
      error.statusCode = 400;
      throw error;
    }
    return requestTencentMap('/ws/place/v1/suggestion', {
      keyword,
      region: String(req.query.region || '广州市').slice(0, 30),
      page_size: positiveInteger(req.query.pageSize, 10, 20),
      page_index: positiveInteger(req.query.page, 1, 100)
    });
  }));

  router.get('/geocoder', (req, res) => proxy(res, async () => {
    const address = String(req.query.address || '').trim();
    if (!address) {
      const error = new Error('地址不能为空');
      error.statusCode = 400;
      throw error;
    }
    return requestTencentMap('/ws/geocoder/v1/', {
      address,
      region: req.query.region ? String(req.query.region).slice(0, 30) : undefined
    });
  }));

  router.get('/distance', (req, res) => proxy(res, () => {
    const mode = req.query.mode || 'walking';
    if (!ALLOWED_MODES.has(mode)) {
      const error = new Error('不支持的出行方式');
      error.statusCode = 400;
      throw error;
    }
    return requestTencentMap('/ws/distance/v1/', {
      mode,
      from: coordinate(req.query.from, '起点'),
      to: coordinate(req.query.to, '终点')
    });
  }));

  return router;
};
