// api/route.js
// 路径规划API（使用微信内置地图）
const request = require('../utils/request.js');

/**
 * 保存常用路线
 * @param {Object} route - {name, from, to, mode}
 */
function saveFrequentRoute(route) {
  const userInfo = wx.getStorageSync('userInfo');
  return request.post('/route/save', { ...route, userId: userInfo && userInfo.id });
}

/**
 * 获取我的常用路线
 */
function getMyRoutes() {
  const userInfo = wx.getStorageSync('userInfo');
  return request.get('/route/my-routes', { userId: userInfo && userInfo.id });
}

/**
 * 删除常用路线
 * @param {Number} routeId
 */
function deleteRoute(routeId) {
  const userInfo = wx.getStorageSync('userInfo');
  return request.del('/route/delete', { routeId, userId: userInfo && userInfo.id });
}

/**
 * 获取实时路况
 * @param {Object} bounds - 地图可视区域边界
 */
function getTrafficInfo(bounds) {
  return request.get('/route/traffic', bounds);
}

module.exports = {
  saveFrequentRoute,
  getMyRoutes,
  deleteRoute,
  getTrafficInfo
};
