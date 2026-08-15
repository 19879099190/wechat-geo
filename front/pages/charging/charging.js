// pages/charging/charging.js
const chargingApi = require('../../api/charging.js');

Page({
  data: {
    stationList: [],
    loading: false,
    statusFilter: -1, // -1表示全部
    statusOptions: [
      { value: -1, label: '全部状态' },
      { value: 0, label: '空闲' },
      { value: 1, label: '充电中' },
      { value: 2, label: '已预约' },
      { value: 3, label: '故障' }
    ],
    statusText: ['空闲', '充电中', '已预约', '故障'],
    statusColor: ['#52c41a', '#1890ff', '#faad14', '#f5222d']
  },

  onLoad() {
    this.loadStationList();
  },

  onShow() {
    // 每次显示页面时刷新列表，确保状态是最新的
    this.loadStationList();
  },

  // 加载充电桩列表
  loadStationList() {
    this.setData({ loading: true });
    
    const params = {};
    if (this.data.statusFilter !== -1) {
      params.status = this.data.statusFilter;
    }
    
    chargingApi.getStations(params)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            stationList: res.data || []
          });
        } else {
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(() => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 状态筛选
  onStatusChange(e) {
    this.setData({
      statusFilter: parseInt(e.detail.value)
    });
    this.loadStationList();
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/charging/detail/detail?id=${id}`
    });
  },

  // 预约充电
  reserveStation(e) {
    const station = e.currentTarget.dataset.station;
    
    if (station.status !== 0) {
      wx.showToast({
        title: '该充电桩不可预约',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '预约充电',
      content: `确定预约 ${station.name} 吗？`,
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用预约API
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          this.loadStationList();
        }
      }
    });
  },

  // 导航到充电桩
  navigateToStation(e) {
    const station = e.currentTarget.dataset.station;
    
    wx.openLocation({
      latitude: station.latitude,
      longitude: station.longitude,
      name: station.name,
      address: station.location,
      scale: 18
    });
  },

  goToSuggestion() {
    wx.navigateTo({ url: '/pages/charging/suggestion/suggestion' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStationList();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
