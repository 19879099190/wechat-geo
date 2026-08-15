const chargingApi = require('../../../api/charging.js');

Page({
  data: {
    locationName: '',
    latitude: null,
    longitude: null,
    reason: '',
    submitting: false,
    suggestions: [],
    statusText: ['待审核', '已采纳', '已拒绝']
  },

  onShow() { this.loadSuggestions(); },

  chooseLocation() {
    wx.chooseLocation({
      success: res => this.setData({
        locationName: res.name || res.address,
        latitude: res.latitude,
        longitude: res.longitude
      })
    });
  },

  onReasonInput(e) { this.setData({ reason: e.detail.value }); },

  submit() {
    const userInfo = wx.getStorageSync('userInfo');
    const { locationName, latitude, longitude, reason, submitting } = this.data;
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (!locationName || !reason.trim()) {
      wx.showToast({ title: '请选择位置并填写原因', icon: 'none' });
      return;
    }
    if (submitting) return;

    this.setData({ submitting: true });
    chargingApi.submitSuggestion({
      userId: userInfo.id, locationName, latitude, longitude, reason: reason.trim()
    }).then(res => {
      if (res.code === 0) {
        wx.showToast({ title: '提交成功', icon: 'success' });
        this.setData({ locationName: '', latitude: null, longitude: null, reason: '' });
        this.loadSuggestions();
      } else wx.showToast({ title: res.message, icon: 'none' });
    }).catch(() => wx.showToast({ title: '提交失败', icon: 'none' }))
      .finally(() => this.setData({ submitting: false }));
  },

  loadSuggestions() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) return;
    chargingApi.getSuggestions(userInfo.id).then(res => {
      if (res.code === 0) this.setData({ suggestions: res.data || [] });
    });
  }
});
