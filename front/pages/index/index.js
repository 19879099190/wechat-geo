// pages/index/index.js
Page({
  data: {
    message: '华农掌中行'
  },

  onLoad() {
    console.log('主页加载成功');
  },

  // 跳转到路线规划
  goToNavigation() {
    wx.navigateTo({
      url: '/pages/navigation/navigation'
    });
  },

  // 跳转到地图
  goToMap() {
    wx.switchTab({
      url: '/pages/map/map'
    });
  },

  // 跳转到赏花专题
  goToFlower() {
    wx.navigateTo({
      url: '/pages/flower/flower'
    });
  },

  // 跳转到发现
  goToPoi() {
    wx.switchTab({
      url: '/pages/poi/poi'
    });
  },

  // 跳转到充电桩
  goToCharging() {
    wx.navigateTo({
      url: '/pages/charging/charging'
    });
  },

  goToParking() {
    wx.navigateTo({ url: '/pages/parking/parking' });
  },

  // 跳转到校巴
  goToBus() {
    wx.navigateTo({
      url: '/pages/bus/bus'
    });
  },

  // 跳转到校园动态列表
  goToNews() {
    wx.navigateTo({
      url: '/pages/news/news'
    });
  },

  // 跳转到校园动态详情
  goToNewsDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 点击分类
  onCategoryTap(e) {
    const type = e.currentTarget.dataset.type;
    wx.switchTab({
      url: '/pages/poi/poi'
    });
  }
});
