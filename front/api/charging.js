// api/charging.js
const request = require('../utils/request.js');

/**
 * 获取充电桩列表
 */
function getStations(params) {
  return request.get('/charging/stations', params);
}

/**
 * 获取充电桩详情
 */
function getStationDetail(id) {
  return request.get(`/charging/station/${id}`);
}

/**
 * 预约充电桩
 */
function reserveStation(data) {
  return request.post('/charging/reserve', data);
}

/**
 * 取消预约
 */
function cancelReservation(id) {
  return request.post(`/charging/cancel/${id}`);
}

/**
 * 获取充电记录
 */
function getChargingRecords(params) {
  return request.get('/charging/records', params);
}

/**
 * 获取用户预约信息
 */
function getUserReservation(params) {
  return request.get('/charging/reservation', params);
}

/**
 * 获取用户所有预约列表
 */
function getUserReservations(params) {
  return request.get('/charging/reservations', params);
}

/**
 * 提交规划建议
 */
function submitSuggestion(data) {
  return request.post('/charging/suggestion', data);
}

function getSuggestions(userId) {
  return request.get('/charging/suggestions', { userId });
}

/**
 * 开始充电
 */
function startCharging(data) {
  return request.post('/charging/start', data);
}

/**
 * 结束充电
 */
function stopCharging(data) {
  return request.post('/charging/stop', data);
}

/**
 * 取消充电
 */
function cancelCharging(data) {
  return request.post('/charging/cancel-charging', data);
}

module.exports = {
  getStations,
  getStationDetail,
  reserveStation,
  cancelReservation,
  getChargingRecords,
  getUserReservation,
  getUserReservations,
  submitSuggestion,
  getSuggestions,
  startCharging,
  stopCharging,
  cancelCharging
};

