// api/poi.js
// POI相关API
const request = require('../utils/request.js');

/**
 * 获取POI列表
 */
function getPoiList(params) {
  return request.get('/poi/list', params);
}

/**
 * 获取POI详情
 * @param {Number} id - POI ID
 */
function getPoiDetail(id) {
  return request.get(`/poi/detail/${id}`);
}

/**
 * 搜索POI
 */
function searchPoi(keyword, location) {
  return request.get('/poi/search', { keyword });
}

/**
 * 获取附近POI
 */
function getNearbyPoi(location) {
  return request.get('/poi/nearby', location);
}

/**
 * 收藏POI
 * @param {Number} poiId
 */
function favoritePoi(poiId) {
  return request.post('/poi/favorite', { poiId });
}

/**
 * 取消收藏
 * @param {Number} poiId
 */
function unfavoritePoi(poiId) {
  return request.del('/poi/favorite', { poiId });
}

/**
 * 获取我的收藏
 */
function getMyFavorites() {
  return request.get('/poi/favorites');
}

/**
 * 添加POI
 * @param {Object} data - {name, type, latitude, longitude, description, rating, openTime}
 */
function addPoi(data) {
  return request.post('/admin/poi/add', data);
}

/**
 * 更新POI
 * @param {Number} id - POI ID
 * @param {Object} data - {name, type, latitude, longitude, description, rating, openTime}
 */
function updatePoi(id, data) {
  return request.put(`/admin/poi/update/${id}`, data);
}

/**
 * 删除POI
 * @param {Number} id - POI ID
 */
function deletePoi(id) {
  return request.del(`/admin/poi/delete/${id}`);
}

/**
 * 添加收藏
 * @param {Number} userId - 用户ID
 * @param {Number} poiId - POI ID
 */
function addFavorite(userId, poiId) {
  return request.post('/favorites/add', { userId, poiId });
}

/**
 * 取消收藏
 * @param {Number} userId - 用户ID
 * @param {Number} poiId - POI ID
 */
function removeFavorite(userId, poiId) {
  return request.post('/favorites/remove', { userId, poiId });
}

/**
 * 获取收藏列表
 * @param {Number} userId - 用户ID
 */
function getFavoriteList(userId) {
  return request.get('/favorites/list', { userId });
}

/**
 * 检查是否已收藏
 * @param {Number} userId - 用户ID
 * @param {Number} poiId - POI ID
 */
function checkFavorite(userId, poiId) {
  return request.get('/favorites/check', { userId, poiId });
}

module.exports = {
  getPoiList,
  getPoiDetail,
  searchPoi,
  getNearbyPoi,
  favoritePoi,
  unfavoritePoi,
  getMyFavorites,
  addPoi,
  updatePoi,
  deletePoi,
  addFavorite,
  removeFavorite,
  getFavoriteList,
  checkFavorite
};
