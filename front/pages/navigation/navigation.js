const app = getApp();
const mapService = require('../../utils/map-service.js');

Page({
  data: {
    startLocation: '',
    endLocation: '',
    startPoint: null,
    endPoint: null,
    travelMode: 'driving',
    modes: [
      { value: 'driving', label: '驾车' },
      { value: 'walking', label: '步行' },
      { value: 'bicycling', label: '骑行' },
      { value: 'transit', label: '公交' }
    ]
  },

  onLoad() {
    this.getCurrentLocation();
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.showLoading({ title: '获取位置中...' });
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.hideLoading();
        this.setData({
          startPoint: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        this.getLocationName(res.latitude, res.longitude, 'start');
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '获取位置失败，请检查定位权限',
          showCancel: false
        });
      }
    });
  },

  // 获取位置名称
  getLocationName(lat, lng, type) {
    mapService.reverseGeocoder({
      latitude: lat,
      longitude: lng
    }).then(res => {
      if (type === 'start') {
        this.setData({
          startLocation: res.result.address
        });
      } else {
        this.setData({
          endLocation: res.result.address
        });
      }
    }).catch(err => {
      console.error('获取地址失败', err);
    });
  },

  // 选择起点
  chooseStartLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          startLocation: res.name || res.address,
          startPoint: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      }
    });
  },

  // 选择终点
  chooseEndLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          endLocation: res.name || res.address,
          endPoint: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      }
    });
  },

  // 切换出行方式
  onModeChange(e) {
    this.setData({
      travelMode: e.currentTarget.dataset.mode
    });
  },

  // 交换起点终点
  swapLocations() {
    const { startLocation, endLocation, startPoint, endPoint } = this.data;
    this.setData({
      startLocation: endLocation,
      endLocation: startLocation,
      startPoint: endPoint,
      endPoint: startPoint
    });
  },

  // 开始规划路径
  planRoute() {
    const { startPoint, endPoint, travelMode } = this.data;

    if (!startPoint) {
      wx.showToast({
        title: '请选择起点',
        icon: 'none'
      });
      return;
    }

    if (!endPoint) {
      wx.showToast({
        title: '请选择终点',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '规划中...' });

    mapService.direction({
      mode: travelMode,
      from: `${startPoint.latitude},${startPoint.longitude}`,
      to: `${endPoint.latitude},${endPoint.longitude}`
    }).then(res => {
      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/route/route?data=${encodeURIComponent(JSON.stringify({
          routeData: res.result,
          startPoint: { ...startPoint, name: this.data.startLocation || '起点' },
          endPoint: { ...endPoint, name: this.data.endLocation || '终点' },
          mode: travelMode
        }))}`
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showModal({
        title: '规划失败',
        content: err.message || '路径规划失败，请重试',
        showCancel: false
      });
    });
  }
});

