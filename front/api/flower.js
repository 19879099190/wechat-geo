// api/flower.js
// 赏花相关API
const request = require('../utils/request.js');
const config = require('../config.js');

const assetBaseUrl = config.apiBaseUrl.replace(/\/api\/?$/, '');

function normalizeImageUrl(url) {
  if (typeof url !== 'string' || !url) return url;
  if (/^(https?:|wxfile:|data:|blob:|\/\/)/i.test(url)) return url;
  return url.startsWith('/') ? `${assetBaseUrl}${url}` : url;
}

function normalizeImages(images) {
  return Array.isArray(images) ? images.map(normalizeImageUrl) : images;
}

function normalizeFlowerData(data) {
  if (Array.isArray(data)) return data.map(normalizeFlowerData);
  if (!data || typeof data !== 'object') return data;

  const normalized = { ...data };
  if (Array.isArray(normalized.images)) {
    normalized.images = normalizeImages(normalized.images);
  }
  if (normalized.image) {
    normalized.image = normalizeImageUrl(normalized.image);
  }
  if (Array.isArray(normalized.reviews)) {
    normalized.reviews = normalized.reviews.map(normalizeFlowerData);
  }
  if (normalized.checkin) {
    normalized.checkin = normalizeFlowerData(normalized.checkin);
  }
  return normalized;
}

function normalizeResponse(response) {
  if (response && response.code === 0) {
    return { ...response, data: normalizeFlowerData(response.data) };
  }
  return response;
}

/**
 * 获取赏花点列表
 */
function getFlowerSpots(params) {
  return request.get('/flower/spots', params).then(normalizeResponse);
}

/**
 * 获取赏花点详情
 * @param {Number} id - 赏花点 ID
 */
function getFlowerSpotDetail(id) {
  return request.get(`/flower/spot/${id}`).then(normalizeResponse);
}

/**
 * 获取赏花路线列表
 */
function getFlowerRoutes() {
  return request.get('/flower/routes');
}

/**
 * 获取赏花路线详情
 * @param {Number} id - 路线 ID
 */
function getFlowerRouteDetail(id) {
  return request.get(`/flower/routes/${id}`);
}

/**
 * 上传打卡图片
 * @param {String} filePath - 本地图片路径
 */
function uploadCheckinImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${config.apiBaseUrl}/flower/upload-checkin`,
      filePath: filePath,
      name: 'image',
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          // Keep the relative URL for storage; normalize it when reading.
          resolve(data);
        } else {
          reject(new Error(data.message || '上传失败'));
        }
      },
      fail: reject
    });
  });
}

/**
 * 创建打卡记录
 * @param {Object} data - { userId, spotId, images, comment, rating }
 */
function createCheckin(data) {
  return request.post('/flower/checkin', data);
}

/**
 * 获取打卡记录
 * @param {Number} spotId - 赏花点 ID
 */
function getCheckins(spotId) {
  return request.get(`/flower/checkins/${spotId}`).then(normalizeResponse);
}

/**
 * 获取用户在某个赏花点的打卡状态
 * @param {Number} userId - 用户 ID
 * @param {Number} spotId - 赏花点 ID
 */
function getUserCheckinStatus(userId, spotId) {
  return request.get('/flower/user-checkin-status', { userId, spotId }).then(normalizeResponse);
}

module.exports = {
  getFlowerSpots,
  getFlowerSpotDetail,
  getFlowerRoutes,
  getFlowerRouteDetail,
  uploadCheckinImage,
  createCheckin,
  getCheckins,
  getUserCheckinStatus
};
