// pages/poi/detail/detail.js
const config = require('../../../config.js');
const poiApi = require('../../../api/poi.js');

Page({
  data: {
    poi: null,
    loading: true,
    isFavorited: false,
    userId: null
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      // 获取用户ID
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.id) {
        this.setData({ userId: userInfo.id });
      }
      
      this.loadPoiDetail(id);
    }
  },

  // 加载POI详情
  loadPoiDetail(id) {
    const { userId } = this.data;
    
    const queryId = userId ? `${id}?userId=${userId}` : id;
    poiApi.getPoiDetail(queryId)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            poi: res.data,
            loading: false,
            isFavorited: res.data.isFavorited || false
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(() => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      });
  },

  // 导航到此地
  navigateTo() {
    const { poi } = this.data;
    wx.openLocation({
      latitude: poi.latitude,
      longitude: poi.longitude,
      name: poi.name,
      address: poi.description
    });
  },

  // 收藏/取消收藏
  toggleFavorite() {
    const { userId, poi, isFavorited } = this.data;
    
    console.log('收藏操作 - userId:', userId);
    console.log('收藏操作 - poi:', poi);
    console.log('收藏操作 - isFavorited:', isFavorited);
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      // 跳转到登录页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }
    
    if (!poi || !poi.id) {
      wx.showToast({
        title: 'POI信息错误',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '处理中...' });
    
    const apiCall = isFavorited 
      ? poiApi.removeFavorite(userId, poi.id)
      : poiApi.addFavorite(userId, poi.id);
    
    apiCall
      .then(res => {
        wx.hideLoading();
        console.log('收藏API响应:', res);
        
        if (res.code === 0) {
          this.setData({
            isFavorited: !isFavorited
          });
          wx.showToast({
            title: isFavorited ? '取消收藏' : '收藏成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '操作失败',
            icon: 'none',
            duration: 2000
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('收藏失败:', err);
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none',
          duration: 2000
        });
      });
  },

  // 分享
  onShareAppMessage() {
    const { poi } = this.data;
    return {
      title: poi.name,
      path: `/pages/poi/detail/detail?id=${poi.id}`
    };
  }
});
