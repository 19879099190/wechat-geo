// pages/charging/reservations/reservations.js
const chargingApi = require('../../../api/charging.js');

Page({
  data: {
    reservationList: [],
    loading: false,
    statusText: ['待确认', '进行中', '已完成', '已取消', '已过期'],
    statusColor: ['#faad14', '#1890ff', '#52c41a', '#999', '#f5222d']
  },

  onLoad() {
    this.loadReservations();
    // 启动定时器，每分钟更新一次剩余时间
    this.startTimer();
  },

  onShow() {
    this.loadReservations();
    // 重新启动定时器
    this.startTimer();
  },
  
  onHide() {
    // 停止定时器
    this.stopTimer();
  },
  
  onUnload() {
    // 停止定时器
    this.stopTimer();
  },

  // 加载预约列表
  loadReservations() {
    this.setData({ loading: true });
    
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({ loading: false });
      return;
    }

    chargingApi.getUserReservations({ userId: userInfo.id })
      .then(res => {
        if (res.code === 0) {
          const reservations = res.data || [];
          
          // 格式化预约数据并计算剩余时间
          const formattedList = reservations.map(item => {
            const formatted = {
              ...item,
              start_time_display: this.formatTime(item.start_time),
              created_at_display: this.formatTime(item.created_at),
              start_time_raw: item.start_time // 保留原始时间用于计算
            };
            
            // 计算剩余时间（仅对进行中的预约）
            if (item.status === 1) {
              formatted.remainingTime = this.calculateRemainingTime(item.start_time);
              formatted.isExpired = formatted.remainingTime === '已过期';
            }
            
            return formatted;
          });
          
          this.setData({
            reservationList: formattedList
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
  
  // 计算剩余时间
  calculateRemainingTime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const expiryTime = new Date(start.getTime() + 30 * 60 * 1000); // 预约后30分钟过期
    const diff = expiryTime - now;
    
    if (diff <= 0) {
      return '已过期';
    }
    
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return '即将过期';
    } else if (minutes < 60) {
      return `剩余${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `剩余${hours}小时${mins}分钟`;
    }
  },
  
  // 启动定时器
  startTimer() {
    // 先清除旧的定时器
    this.stopTimer();
    
    // 每分钟更新一次剩余时间
    this.timer = setInterval(() => {
      const { reservationList } = this.data;
      
      if (!reservationList || reservationList.length === 0) {
        return;
      }
      
      let needRefresh = false;
      
      // 更新每个进行中预约的剩余时间
      const updatedList = reservationList.map(item => {
        if (item.status === 1 && item.start_time_raw) {
          const remainingTime = this.calculateRemainingTime(item.start_time_raw);
          const isExpired = remainingTime === '已过期';
          
          // 如果状态变为过期，需要刷新列表
          if (isExpired && !item.isExpired) {
            needRefresh = true;
          }
          
          return {
            ...item,
            remainingTime,
            isExpired
          };
        }
        return item;
      });
      
      this.setData({
        reservationList: updatedList
      });
      
      // 如果有预约过期，重新加载列表以获取最新状态
      if (needRefresh) {
        console.log('检测到预约过期，刷新列表...');
        setTimeout(() => {
          this.loadReservations();
        }, 2000);
      }
    }, 60000); // 每分钟执行一次
    
    console.log('✓ 预约剩余时间更新定时器已启动');
  },
  
  // 停止定时器
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('✓ 预约剩余时间更新定时器已停止');
    }
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

  // 查看预约详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/charging/detail/detail?id=${id}`
    });
  },

  // 取消预约
  cancelReservation(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          chargingApi.cancelReservation(id)
            .then(res => {
              wx.hideLoading();
              
              if (res.code === 0) {
                wx.showToast({
                  title: '已取消预约',
                  icon: 'success'
                });
                this.loadReservations();
              } else {
                wx.showToast({
                  title: res.message || '操作失败',
                  icon: 'none'
                });
              }
            })
            .catch(() => {
              wx.hideLoading();
              wx.showToast({
                title: '网络请求失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadReservations();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});

