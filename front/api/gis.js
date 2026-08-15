// api/gis.js
// GIS分析功能API
const request = require('../utils/request.js');

/**
 * 缓冲区分析
 * @param {Object} params - {latitude, longitude, radius, type}
 */
function bufferAnalysis(params) {
  return request.post('/gis/buffer-analysis', params);
}

/**
 * 周边快速搜索
 * @param {Object} params - {latitude, longitude, radius, types, keyword}
 */
function nearbySearch(params) {
  return request.get('/gis/nearby-search', params);
}

/**
 * 获取热力图数据
 * @param {String} type - 数据类型 (poi, flower, charging等)
 */
function getHeatmapData(type) {
  return request.get('/gis/heatmap', { type });
}

/**
 * 空间查询
 * @param {Object} params - {bounds, type}
 */
function spatialQuery(params) {
  return request.post('/gis/spatial-query', params);
}

/**
 * 最近设施查询
 * @param {Object} params - {latitude, longitude, facilityType, limit}
 */
function findNearestFacility(params) {
  return request.get('/gis/nearest-facility', params);
}

/**
 * 可达性分析
 * @param {Object} params - {latitude, longitude, mode, time}
 */
function accessibilityAnalysis(params) {
  return request.post('/gis/accessibility', params);
}

/**
 * 路径优化（多点）
 * @param {Object} params - {points, mode}
 */
function optimizeRoute(params) {
  return request.post('/gis/optimize-route', params);
}

module.exports = {
  bufferAnalysis,
  nearbySearch,
  getHeatmapData,
  spatialQuery,
  findNearestFacility,
  accessibilityAnalysis,
  optimizeRoute
};

