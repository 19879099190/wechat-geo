const routeApi = require('../../api/route.js');

Page({
  data: {
    routes: [],
    loading: false,
    modeText: {
      walking: '步行', bicycling: '骑行', driving: '驾车', transit: '公交', bus: '校巴'
    }
  },

  onShow() {
    this.loadRoutes();
  },

  loadRoutes() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      this.setData({ routes: [] });
      return;
    }
    this.setData({ loading: true });
    routeApi.getMyRoutes().then(res => {
      if (res.code === 0) this.setData({ routes: res.data || [] });
    }).catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => this.setData({ loading: false }));
  },

  useRoute(e) {
    const route = e.currentTarget.dataset.route;
    wx.openLocation({
      latitude: Number(route.to_latitude),
      longitude: Number(route.to_longitude),
      name: route.to_name,
      address: route.name,
      scale: 17
    });
  },

  deleteRoute(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除路线',
      content: '确定删除这条常用路线吗？',
      success: ({ confirm }) => {
        if (!confirm) return;
        routeApi.deleteRoute(id).then(res => {
          if (res.code === 0) {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadRoutes();
          } else {
            wx.showToast({ title: res.message, icon: 'none' });
          }
        });
      }
    });
  },

  addRoute() {
    wx.navigateTo({ url: '/pages/navigation/navigation' });
  }
});
