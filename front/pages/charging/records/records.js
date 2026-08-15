// pages/charging/records/records.js
const chargingApi = require('../../../api/charging.js');

Page({
  data: {
    recordList: [],
    loading: false,
    totalRecords: 0,
    totalEnergy: 0,
    totalCost: 0
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  // 加载充电记录
  loadRecords() {
    this.setData({ loading: true });
    
    const userInfo = wx.getStorageSync('userInfo');
    console.log('=== 加载充电记录 ===');
    console.log('用户信息:', userInfo);
    
    if (!userInfo || !userInfo.id) {
      console.error('❌ 用户未登录');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({ loading: false });
      return;
    }

    console.log('请求参数:', { userId: userInfo.id });
    
    chargingApi.getChargingRecords({ userId: userInfo.id })
      .then(res => {
        console.log('充电记录响应:', res);
        
        if (res.code === 0) {
          const records = res.data || [];
          console.log('充电记录数量:', records.length);
          console.log('充电记录数据:', records);
          
          // 格式化记录数据并计算统计
          let totalEnergy = 0;
          let totalCost = 0;
          
          const formattedList = records.map(record => {
            if (record.energy) {
              totalEnergy += parseFloat(record.energy);
            }
            if (record.cost) {
              totalCost += parseFloat(record.cost);
            }
            
            return {
              ...record,
              start_time: this.formatTime(record.start_time),
              end_time: record.end_time ? this.formatTime(record.end_time) : null
            };
          });
          
          console.log('格式化后的记录:', formattedList);
          
          this.setData({
            recordList: formattedList,
            totalRecords: records.length,
            totalEnergy: totalEnergy.toFixed(2),
            totalCost: totalCost.toFixed(2)
          });
          
          console.log('✓ 数据已设置到页面');
        } else {
          console.error('❌ 加载失败:', res.message);
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch((err) => {
        console.error('❌ 网络请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 查看充电桩详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/charging/detail/detail?id=${id}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecords();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

