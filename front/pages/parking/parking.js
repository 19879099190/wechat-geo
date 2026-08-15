const parkingApi = require('../../api/parking.js');

Page({
  data: {
    lots: [],
    loading: false,
    type: '',
    types: [
      { value: '', label: '全部' },
      { value: 'bike', label: '自行车' },
      { value: 'ebike', label: '电动车' },
      { value: 'car', label: '汽车' }
    ],
    typeText: { bike: '自行车', ebike: '电动车', car: '汽车' }
  },

  onLoad() { this.loadLots(); },
  onPullDownRefresh() { this.loadLots().finally(() => wx.stopPullDownRefresh()); },

  loadLots() {
    this.setData({ loading: true });
    return parkingApi.getParkingLots(this.data.type ? { type: this.data.type } : {})
      .then(res => {
        if (res.code === 0) this.setData({ lots: res.data || [] });
        else wx.showToast({ title: res.message, icon: 'none' });
      })
      .catch(() => wx.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => this.setData({ loading: false }));
  },

  onTypeTap(e) {
    this.setData({ type: e.currentTarget.dataset.type }, () => this.loadLots());
  },

  navigate(e) {
    const lot = e.currentTarget.dataset.lot;
    wx.openLocation({
      latitude: Number(lot.latitude),
      longitude: Number(lot.longitude),
      name: lot.name,
      address: lot.location,
      scale: 18
    });
  }
});
