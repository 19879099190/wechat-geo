// pages/favorites/favorites.js
const poiApi = require('../../api/poi.js');

Page({
  data: {
    favoriteList: [],
    loading: true,
    userId: null
  },

  onLoad() {
    // 获取用户ID
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      this.setData({ userId: userInfo.id });
      this.loadFavorites();
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }
  },

  onShow() {
    // 每次显示页面时刷新收藏列表
    if (this.data.userId) {
      this.loadFavorites();
    }
  },

  // 加载收藏列表
  loadFavorites() {
    this.setData({ loading: true });
    
    poiApi.getFavoriteList(this.data.userId)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            favoriteList: res.data.list || [],
            loading: false
          });
        } else {
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      })
      .catch(() => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/poi/detail/detail?id=${id}`
    });
  },

  // 取消收藏
  removeFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '取消收藏',
      content: `确定要取消收藏"${name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          poiApi.removeFavorite(this.data.userId, id)
            .then(result => {
              if (result.code === 0) {
                wx.showToast({
                  title: '取消收藏成功',
                  icon: 'success'
                });
                // 刷新列表
                this.loadFavorites();
              } else {
                wx.showToast({
                  title: result.message || '操作失败',
                  icon: 'none'
                });
              }
            })
            .catch(() => {
              wx.showToast({
                title: '操作失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  // 导航到POI
  navigateTo(e) {
    const poi = e.currentTarget.dataset.poi;
    wx.openLocation({
      latitude: parseFloat(poi.latitude),
      longitude: parseFloat(poi.longitude),
      name: poi.name,
      address: poi.description || ''
    });
  }
});

