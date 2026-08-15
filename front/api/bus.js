// api/bus.js
const request = require('../utils/request.js');

/**
 * 获取校巴线路列表
 */
function getBusLines() {
  return request.get('/bus/lines');
}

/**
 * 获取线路详情
 */
function getLineDetail(id) {
  return request.get(`/bus/line/${id}`);
}

/**
 * 获取实时车辆位置
 */
function getRealtimeLocation(lineId) {
  return request.get(`/bus/realtime/${lineId}`);
}

/**
 * 获取到站时间
 */
function getArrivalTime(params) {
  return request.get('/bus/arrival', params);
}

/**
 * 订阅到站提醒
 */
function subscribeArrival(data) {
  return request.post('/bus/subscribe', data);
}

/**
 * 取消订阅
 */
function unsubscribeArrival(id) {
  return request.del(`/bus/subscribe/${id}`);
}

module.exports = {
  getBusLines,
  getLineDetail,
  getRealtimeLocation,
  getArrivalTime,
  subscribeArrival,
  unsubscribeArrival
};

