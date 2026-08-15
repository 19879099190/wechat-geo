// utils/request.js
const config = require('../config.js');

const assetBaseUrl = config.apiBaseUrl.replace(/\/api\/?$/, '');

function normalizeAssetUrls(value) {
  if (typeof value === 'string') {
    if (value.startsWith('/images/')) return `${assetBaseUrl}${value}`;
    // Also support JSON-encoded image arrays that pages parse later.
    return value.replace(/(^|["'\s])\/images\//g, `$1${assetBaseUrl}/images/`);
  }
  if (Array.isArray(value)) {
    return value.map(normalizeAssetUrls);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((result, key) => {
      result[key] = normalizeAssetUrls(value[key]);
      return result;
    }, {});
  }
  return value;
}

/**
 * 封装wx.request
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.apiBaseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success(res) {
        if (res.statusCode === 200) {
          // 直接返回完整的响应数据
          resolve(normalizeAssetUrls(res.data));
        } else {
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data) {
  return request({
    url,
    method: 'GET',
    data
  });
}

/**
 * POST请求
 */
function post(url, data) {
  return request({
    url,
    method: 'POST',
    data
  });
}

/**
 * PUT请求
 */
function put(url, data) {
  return request({
    url,
    method: 'PUT',
    data
  });
}

/**
 * DELETE请求
 */
function del(url, data) {
  return request({
    url,
    method: 'DELETE',
    data
  });
}

module.exports = {
  get,
  post,
  put,
  del
};
