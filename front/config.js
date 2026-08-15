// config.js
module.exports = {
  // API基础地址
  // 生产环境: 'https://wxgeo.codekissyoung.com/api'
  // 本地调试: 'http://localhost:4000/api'
  // apiBaseUrl: 'http://localhost:4000/api',
  // WebSocket地址
  // 生产环境: 'wss://wxgeo.codekissyoung.com/ws'
  // 本地调试: 'ws://localhost:4001'
  // wsUrl: 'ws://localhost:4001',
  
  apiBaseUrl: 'http://10.197.64.102:4000/api',
  wsUrl: 'ws://10.197.64.102:4001',

  // 华农校园中心坐标 (示例坐标,需根据实际调整)
  campusCenter: {
    latitude: 23.158,
    longitude: 113.352,
    name: '华南农业大学'
  },

  // 地图缩放级别
  mapScale: 16,

  // 充电桩状态
  chargingStatus: {
    AVAILABLE: 0,    // 空闲
    CHARGING: 1,     // 充电中
    RESERVED: 2,     // 已预约
    OFFLINE: 3       // 离线/故障
  },
  
  // POI类型
  poiTypes: {
    CANTEEN: 'canteen',         // 食堂
    LIBRARY: 'library',         // 图书馆
    CLASSROOM: 'classroom',     // 教学楼
    DORMITORY: 'dormitory',     // 宿舍
    SCENIC: 'scenic',           // 景点
    SPORTS: 'sports',           // 运动场馆
    OFFICE: 'office',           // 办公楼
    SHOP: 'shop'                // 商店
  },
  
  // 出行方式
  travelModes: {
    WALK: 'walking',
    BUS: 'bus',
    BIKE: 'bicycling',
    EBIKE: 'ebike'
  }
};
