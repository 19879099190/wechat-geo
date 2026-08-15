const https = require('https');

const TENCENT_MAP_HOST = 'apis.map.qq.com';
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024;

function getMapKey() {
  const key = String(process.env.TENCENT_MAP_KEY || '').trim();
  if (!key || key === 'your_tencent_map_key') {
    const error = new Error('腾讯地图 Key 未配置');
    error.code = 'MAP_KEY_MISSING';
    throw error;
  }
  return key;
}

function requestTencentMap(pathname, params = {}) {
  const url = new URL(`https://${TENCENT_MAP_HOST}${pathname}`);
  Object.entries({ ...params, key: getMapKey(), output: 'json' }).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, String(value));
    }
  });

  const headers = {
    Accept: 'application/json',
    'User-Agent': 'wechat-geo-backend/1.0'
  };
  const referer = String(process.env.TENCENT_MAP_REFERER || '').trim();
  if (referer) headers.Referer = referer;

  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 10000, headers }, response => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_RESPONSE_SIZE) {
          request.destroy(new Error('腾讯地图响应数据过大'));
        }
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`腾讯地图服务返回 HTTP ${response.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error('腾讯地图响应格式错误'));
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('腾讯地图请求超时')));
    request.on('error', reject);
  });
}

module.exports = { requestTencentMap };
