const request = require('../utils/request.js');

function getParkingLots(params) {
  return request.get('/parking/list', params);
}

function getParkingDetail(id) {
  return request.get(`/parking/detail/${id}`);
}

module.exports = { getParkingLots, getParkingDetail };
