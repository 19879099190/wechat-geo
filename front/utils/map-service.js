// 地图服务统一通过后端代理，前端不保存也不传递第三方地图 Key。
const request = require('./request.js');

class MapService {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.minInterval = 300;
    this.lastRequestTime = 0;
  }

  throttleRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;
    const { requestFn, resolve, reject } = this.requestQueue.shift();
    const waitTime = Math.max(0, this.minInterval - (Date.now() - this.lastRequestTime));

    setTimeout(() => {
      this.lastRequestTime = Date.now();
      Promise.resolve()
        .then(requestFn)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.isProcessing = false;
          this.processQueue();
        });
    }, waitTime);
  }

  mapRequest(requestFn, fallbackMessage) {
    return this.throttleRequest(() => requestFn()
      .then(data => {
        if (data && data.status === 0) return data;
        const error = new Error((data && data.message) || fallbackMessage);
        error.status = data && data.status;
        throw error;
      })
      .catch(error => {
        if (error instanceof Error) throw error;
        const data = error && error.data ? error.data : error;
        const normalized = new Error((data && data.message) || fallbackMessage);
        normalized.status = data && data.status;
        throw normalized;
      }));
  }

  direction(options) {
    return this.mapRequest(
      () => request.post('/map/direction', {
        mode: options.mode || 'walking',
        from: options.from,
        to: options.to,
        policy: options.policy
      }),
      '路径规划失败'
    );
  }

  search(keyword, options = {}) {
    return this.mapRequest(
      () => request.get('/map/search', {
        keyword,
        latitude: options.latitude,
        longitude: options.longitude,
        radius: options.radius,
        region: options.region,
        page: options.page,
        pageSize: options.pageSize
      }),
      '地点搜索失败'
    );
  }

  reverseGeocoder(location) {
    return this.mapRequest(
      () => request.get('/map/reverse-geocoder', {
        latitude: location.latitude,
        longitude: location.longitude,
        getPoi: location.getPoi ? 1 : 0
      }),
      '地址解析失败'
    );
  }

  suggestion(keyword, options = {}) {
    return this.mapRequest(
      () => request.get('/map/suggestion', {
        keyword,
        region: options.region,
        page: options.page,
        pageSize: options.pageSize
      }),
      '地点联想失败'
    );
  }

  geocoder(address, options = {}) {
    return this.mapRequest(
      () => request.get('/map/geocoder', { address, region: options.region }),
      '地址解析失败'
    );
  }

  calculateDistance(options) {
    return this.mapRequest(
      () => request.get('/map/distance', {
        mode: options.mode || 'walking',
        from: options.from,
        to: options.to
      }),
      '距离计算失败'
    );
  }
}

module.exports = new MapService();
