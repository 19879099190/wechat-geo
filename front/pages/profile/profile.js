// pages/profile/profile.js
Page({
  data: {
    isLogin: false,
    userInfo: {
      nickname: '游客',
      avatar: '',
      phone: ''
    },
    menuList: [
      { icon: '⭐', name: '我的收藏', url: '/pages/favorites/favorites' },
      { icon: '🔋', name: '我的预约', url: '/pages/charging/reservations/reservations' },
      { icon: '📊', name: '充电记录', url: '/pages/charging/records/records' },
      { icon: '📍', name: '常用路线', url: '/pages/routes/routes' },
      { icon: '⚙️', name: '设置', url: '/pages/settings/settings' }
    ]
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: {
          nickname: '游客',
          avatar: '',
          phone: ''
        }
      });
    }
  },

  // 点击头像区域
  onUserInfoTap() {
    if (!this.data.isLogin) {
      // 未登录，跳转到登录页
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },

  // 点击菜单
  onMenuTap(e) {
    if (!this.data.isLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }

    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          this.setData({
            isLogin: false,
            userInfo: {
              nickname: '游客',
              avatar: '',
              phone: ''
            }
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});
