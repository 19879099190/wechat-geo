// pages/charging/detail/detail.js
const chargingApi = require('../../../api/charging.js');

Page({
  data: {
    station: null,
    loading: true,
    statusText: ['空闲', '充电中', '已预约', '故障'],
    statusColor: ['#52c41a', '#1890ff', '#faad14', '#f5222d'],
    showRecords: false,
    userId: null,
    myReservation: null,
    isCharging: false,
    chargingDuration: '0分钟',
    chargingStartTime: null,
    chargingRecordId: null,
    showReserveDialog: false,
    reserveDate: '',
    reserveTime: '',
    durationOptions: ['30分钟', '1小时', '2小时', '3小时', '4小时'],
    durationIndex: 1,
    phone: '',
    estimatedCost: 0
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      // 获取用户ID
      const userInfo = wx.getStorageSync('userInfo');
      console.log('用户信息:', userInfo); // 添加日志
      
      if (userInfo && userInfo.id) {
        this.setData({ 
          userId: userInfo.id,
          phone: userInfo.phone || ''
        });
        console.log('userId已设置:', userInfo.id); // 添加日志
      } else {
        console.warn('⚠️ 未找到用户信息，使用默认userId=1'); // 添加日志
        // 如果没有登录，使用测试用户ID
        this.setData({ 
          userId: 1,
          phone: '13800138000'
        });
      }
      
      this.loadStationDetail(id);
      this.checkMyReservation(id);
    }
  },

  onShow() {
    // 每次显示页面时重新检查充电状态
    const { station } = this.data;
    if (station && station.id) {
      console.log('页面显示，重新检查充电状态...');
      this.checkOngoingCharging(station.id);
    }
  },

  // 加载充电桩详情
  loadStationDetail(id) {
    this.setData({ loading: true });
    
    console.log('正在加载充电桩详情, ID:', id);
    
    chargingApi.getStationDetail(id)
      .then(res => {
        console.log('充电桩详情响应:', res);
        
        if (res.code === 0) {
          console.log('充电桩状态:', res.data.status, ['空闲', '充电中', '已预约', '故障'][res.data.status]);
          
          this.setData({
            station: res.data,
            loading: false
          });
          this.calculateEstimatedCost();
          
          // 检查是否有该用户正在进行的充电记录
          this.checkOngoingCharging(id);
        } else {
          console.error('加载失败:', res.message);
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch((err) => {
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },
  
  // 检查是否有正在进行的充电
  checkOngoingCharging(stationId) {
    const { userId } = this.data;
    if (!userId) {
      console.log('⚠️ checkOngoingCharging: userId为空，跳过检查');
      return;
    }
    
    console.log('🔍 检查进行中的充电记录, userId:', userId, 'stationId:', stationId);
    
    // 查询该用户进行中的充电记录（只查询未结束的）
    chargingApi.getChargingRecords({ userId, status: 'ongoing' })
      .then(res => {
        console.log('充电记录查询响应:', res);
        
        if (res.code === 0 && res.data && res.data.length > 0) {
          console.log('找到进行中的充电记录:', res.data.length, '条');
          
          // 查找该充电桩的进行中记录
          const ongoingRecord = res.data.find(record => 
            record.station_id == stationId
          );
          
          if (ongoingRecord) {
            console.log('✅ 发现该充电桩的进行中充电记录:', ongoingRecord);
            
            const startTime = new Date(ongoingRecord.start_time);
            const now = new Date();
            const durationMs = now - startTime;
            const durationMinutes = Math.floor(durationMs / 60000);
            
            let durationText;
            if (durationMinutes < 60) {
              durationText = `${durationMinutes}分钟`;
            } else {
              const hours = Math.floor(durationMinutes / 60);
              const minutes = durationMinutes % 60;
              durationText = `${hours}小时${minutes}分钟`;
            }
            
            // 恢复充电状态
            this.setData({
              isCharging: true,
              chargingStartTime: startTime,
              chargingDuration: durationText,
              chargingRecordId: ongoingRecord.id
            });
            
            console.log('✓ 充电状态已恢复:', {
              isCharging: this.data.isCharging,
              recordId: this.data.chargingRecordId,
              duration: durationText
            });
            
            // 启动计时器
            this.startChargingTimer();
          } else {
            console.log('ℹ️ 该充电桩没有进行中的充电记录');
            // 确保清除充电状态
            this.setData({
              isCharging: false,
              chargingStartTime: null,
              chargingDuration: '0分钟',
              chargingRecordId: null
            });
          }
        } else {
          console.log('ℹ️ 没有找到任何进行中的充电记录');
          // 确保清除充电状态
          this.setData({
            isCharging: false,
            chargingStartTime: null,
            chargingDuration: '0分钟',
            chargingRecordId: null
          });
        }
      })
      .catch(err => {
        console.error('❌ 查询充电记录失败:', err);
      });
  },

  // 检查我的预约
  checkMyReservation(stationId) {
    const { userId } = this.data;
    if (!userId) return;

    console.log('检查预约信息, userId:', userId, 'stationId:', stationId);
    
    chargingApi.getUserReservation({ userId, stationId })
      .then(res => {
        console.log('预约查询响应:', res);
        
        if (res.code === 0 && res.data) {
          const reservation = res.data;
          console.log('找到预约:', reservation);
          
          this.setData({
            myReservation: {
              id: reservation.id,
              startTime: this.formatTime(reservation.start_time),
              remainingTime: this.calculateRemainingTime(reservation.start_time)
            }
          });
        } else {
          console.log('没有找到预约');
          this.setData({
            myReservation: null
          });
        }
      })
      .catch(err => {
        console.error('查询预约失败:', err);
      });
  },

  // 显示预约对话框
  showReserveDialog() {
    const { userId } = this.data;
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }

    // 设置默认日期为今天
    this.setData({ 
      showReserveDialog: true,
      reserveDate: this.getTodayDate()
    });
  },

  // 隐藏预约对话框
  hideReserveDialog() {
    this.setData({ showReserveDialog: false });
  },

  // 阻止冒泡
  stopPropagation() {},

  // 日期选择
  onDateChange(e) {
    this.setData({
      reserveDate: e.detail.value
    });
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      reserveTime: e.detail.value
    });
  },

  // 时长选择
  onDurationChange(e) {
    this.setData({
      durationIndex: e.detail.value
    });
    this.calculateEstimatedCost();
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 计算预计费用
  calculateEstimatedCost() {
    const { station, durationIndex } = this.data;
    if (!station) return;

    const durations = [0.5, 1, 2, 3, 4]; // 小时
    const duration = durations[durationIndex];
    const power = station.power / 1000; // 转换为kW
    const price = station.price || 1.5;
    
    // 预计用电量 = 功率 × 时间
    const estimatedKWh = power * duration;
    const cost = (estimatedKWh * price).toFixed(2);
    
    this.setData({ estimatedCost: cost });
  },

  // 确认预约
  confirmReserve() {
    const { station, reserveDate, reserveTime, durationIndex, phone } = this.data;
    
    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    const durations = [30, 60, 120, 180, 240]; // 分钟
    const duration = durations[durationIndex];
    
    // 格式化显示时间
    const displayTime = (reserveDate && reserveTime) 
      ? `${reserveDate} ${reserveTime}` 
      : '立即';

    wx.showModal({
      title: '确认预约',
      content: `充电桩：${station.name}\n预约时间：${displayTime}\n预计时长：${this.data.durationOptions[durationIndex]}\n预计费用：${this.data.estimatedCost}元`,
      success: (res) => {
        if (res.confirm) {
          this.doReserve(reserveDate, reserveTime, duration);
        }
      }
    });
  },

  // 执行预约
  doReserve(date, time, duration) {
    const { station, phone, userId } = this.data;
    
    console.log('=== 开始预约 ===');
    console.log('userId:', userId);
    console.log('stationId:', station.id);
    console.log('phone:', phone);
    
    if (!userId) {
      console.error('❌ userId为空，无法预约');
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
      return;
    }
    
    wx.showLoading({ title: '预约中...' });
    
    // 如果选择了日期和时间，使用选择的日期时间；否则使用当前时间
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');

    const currentTime =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const startTime = (date && time) ? `${date} ${time}:00`  : currentTime;;
    
    const requestData = {
      userId: userId,
      stationId: station.id,
      startTime: startTime,
      duration: duration,
      phone: phone
    };
    
    console.log('请求数据:', requestData);
    
    chargingApi.reserveStation(requestData)
      .then(res => {
        wx.hideLoading();
        
        console.log('预约响应:', res);
        
        if (res.code === 0) {
          console.log('✅ 预约成功，预约ID:', res.data.reservationId);
          
          // 立即更新本地状态为已预约
          this.setData({
            'station.status': 2,
            showReserveDialog: false,
            myReservation: {
              id: res.data.reservationId,
              startTime: this.formatTime(startTime),
              remainingTime: '30分钟'
            }
          });
          
          console.log('本地状态已更新为: 已预约(2)');
          
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟刷新以确保数据库已更新
          setTimeout(() => {
            console.log('开始刷新充电桩详情...');
            this.loadStationDetail(station.id);
            this.checkMyReservation(station.id);
          }, 2000);
        } else {
          console.error('❌ 预约失败:', res.message);
          wx.showToast({
            title: res.message || '预约失败',
            icon: 'none'
          });
        }
      })
      .catch((err) => {
        wx.hideLoading();
        console.error('❌ 网络请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      });
  },

  // 取消预约
  cancelReservation() {
    const { myReservation, station } = this.data;
    
    if (!myReservation) return;
    
    wx.showModal({
      title: '取消预约',
      content: '确定要取消预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          chargingApi.cancelReservation(myReservation.id)
            .then(res => {
              wx.hideLoading();
              
              if (res.code === 0) {
                // 立即更新本地状态
                this.setData({
                  myReservation: null,
                  'station.status': 0
                });
                
                wx.showToast({
                  title: '已取消预约',
                  icon: 'success',
                  duration: 2000
                });
                
                // 延迟刷新确保数据库已更新
                setTimeout(() => {
                  this.loadStationDetail(station.id);
                }, 2000);
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

  // 导航到充电桩
  navigateTo() {
    const { station } = this.data;
    wx.openLocation({
      latitude: station.latitude,
      longitude: station.longitude,
      name: station.name,
      address: station.location,
      scale: 18
    });
  },

  // 报告故障
  reportFault() {
    const { station, userId } = this.data;
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '报告故障',
      content: '请描述充电桩存在的问题',
      editable: true,
      placeholderText: '请输入故障描述',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showLoading({ title: '提交中...' });
          
          // TODO: 调用故障报告API
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '已提交故障报告',
              icon: 'success'
            });
          }, 1000);
        }
      }
    });
  },

  // 开始充电（使用预约）
  startCharging() {
    const { userId, station, myReservation } = this.data;
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '开始充电',
      content: `确定使用预约开始充电吗？\n充电桩：${station.name}`,
      success: (res) => {
        if (res.confirm) {
          this.doStartCharging(myReservation.id);
        }
      }
    });
  },

  // 立即充电（无预约）
  startChargingDirect() {
    const { userId, station } = this.data;
    
    if (!userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '立即充电',
      content: `确定开始充电吗？\n充电桩：${station.name}\n价格：${station.price}元/度`,
      success: (res) => {
        if (res.confirm) {
          this.doStartCharging(null);
        }
      }
    });
  },

  // 执行开始充电
  doStartCharging(reservationId) {
    const { userId, station } = this.data;
    
    console.log('=== 调用开始充电API ===');
    console.log('userId:', userId, 'stationId:', station.id, 'reservationId:', reservationId);
    
    // 检查必要参数
    if (!userId) {
      wx.showToast({
        title: '用户信息缺失，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    if (!station || !station.id) {
      wx.showToast({
        title: '充电桩信息缺失',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '启动中...' });
    
    chargingApi.startCharging({
      userId: userId,
      stationId: station.id,
      reservationId: reservationId || null
    })
      .then(res => {
        wx.hideLoading();
        
        console.log('开始充电响应:', res);
        
        if (res.code === 0) {
          const startTime = new Date();
          const recordId = res.data.recordId;
          
          console.log('✓ 充电已开始，记录ID:', recordId);
          
          // 更新本地状态
          this.setData({
            isCharging: true,
            chargingStartTime: startTime,
            chargingDuration: '0分钟',
            chargingRecordId: recordId,
            'station.status': 1,
            myReservation: null // 清除预约信息
          });
          
          // 验证数据已保存
          console.log('本地状态已更新:', {
            isCharging: this.data.isCharging,
            chargingRecordId: this.data.chargingRecordId,
            stationStatus: this.data.station.status
          });
          
          // 启动计时器
          this.startChargingTimer();
          
          wx.showToast({
            title: '充电已开始',
            icon: 'success',
            duration: 2000
          });
          
          // 刷新充电桩状态
          setTimeout(() => {
            this.loadStationDetail(station.id);
          }, 1000);
        } else {
          console.error('❌ 开始充电失败:', res.message);
          wx.showToast({
            title: res.message || '启动失败',
            icon: 'none',
            duration: 3000
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('❌ 网络请求失败:', err);
        wx.showToast({
          title: '网络请求失败: ' + (err.message || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      });
  },

  // 结束充电
  stopCharging() {
    wx.showModal({
      title: '结束充电',
      content: '确定要结束充电吗？',
      success: (res) => {
        if (res.confirm) {
          this.doStopCharging();
        }
      }
    });
  },
  
  // 取消充电
  cancelCharging() {
    const { chargingDuration } = this.data;
    
    wx.showModal({
      title: '取消充电',
      content: `确定要取消充电吗？\n已充电：${chargingDuration}\n\n取消后将按实际充电时长计费`,
      confirmText: '确认取消',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          this.doCancelCharging();
        }
      }
    });
  },
  
  // 执行取消充电
  doCancelCharging() {
    const { userId, station, chargingRecordId } = this.data;
    
    console.log('=== 调用取消充电API ===');
    console.log('userId:', userId, 'stationId:', station.id, 'recordId:', chargingRecordId);
    
    // 检查必要参数
    if (!userId) {
      wx.showToast({
        title: '用户信息缺失，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    if (!station || !station.id) {
      wx.showToast({
        title: '充电桩信息缺失',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '取消中...' });
    
    chargingApi.cancelCharging({
      userId: userId,
      stationId: station.id,
      recordId: chargingRecordId || null
    })
      .then(res => {
        wx.hideLoading();
        
        console.log('取消充电响应:', res);
        
        if (res.code === 0) {
          // 停止计时器
          if (this.chargingTimer) {
            clearInterval(this.chargingTimer);
            this.chargingTimer = null;
          }
          
          // 更新本地状态
          this.setData({
            isCharging: false,
            chargingStartTime: null,
            chargingDuration: '0分钟',
            chargingRecordId: null,
            'station.status': 0
          });
          
          console.log('✓ 充电已取消');
          
          wx.showModal({
            title: '充电已取消',
            content: `充电时长：${res.data.duration}\n充电量：${res.data.energy} kWh\n费用：¥${res.data.cost}`,
            showCancel: false,
            success: () => {
              // 刷新充电桩状态
              this.loadStationDetail(station.id);
            }
          });
        } else {
          console.error('❌ 取消充电失败:', res.message);
          wx.showToast({
            title: res.message || '取消失败',
            icon: 'none',
            duration: 3000
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('❌ 网络请求失败:', err);
        wx.showToast({
          title: '网络请求失败: ' + (err.message || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      });
  },

  // 执行结束充电
  doStopCharging() {
    const { userId, station, chargingStartTime, chargingRecordId } = this.data;
    
    console.log('=== 调用结束充电API ===');
    console.log('userId:', userId, 'stationId:', station.id, 'recordId:', chargingRecordId);
    
    // 检查必要参数
    if (!userId) {
      wx.showToast({
        title: '用户信息缺失，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    if (!station || !station.id) {
      wx.showToast({
        title: '充电桩信息缺失',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '结算中...' });
    
    chargingApi.stopCharging({
      userId: userId,
      stationId: station.id,
      recordId: chargingRecordId || null
    })
      .then(res => {
        wx.hideLoading();
        
        console.log('结束充电响应:', res);
        
        if (res.code === 0) {
          // 停止计时器
          if (this.chargingTimer) {
            clearInterval(this.chargingTimer);
            this.chargingTimer = null;
          }
          
          // 更新本地状态
          this.setData({
            isCharging: false,
            chargingStartTime: null,
            chargingDuration: '0分钟',
            chargingRecordId: null,
            'station.status': 0
          });
          
          console.log('✓ 充电已结束');
          
          wx.showModal({
            title: '充电完成',
            content: `充电时长：${res.data.duration}\n充电量：${res.data.energy} kWh\n费用：¥${res.data.cost}`,
            showCancel: false,
            success: () => {
              // 刷新充电桩状态
              this.loadStationDetail(station.id);
            }
          });
        } else {
          console.error('❌ 结束充电失败:', res.message);
          wx.showToast({
            title: res.message || '结算失败',
            icon: 'none',
            duration: 3000
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('❌ 网络请求失败:', err);
        wx.showToast({
          title: '网络请求失败: ' + (err.message || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      });
  },

  // 启动充电计时器
  startChargingTimer() {
    if (this.chargingTimer) {
      clearInterval(this.chargingTimer);
    }
    
    this.chargingTimer = setInterval(() => {
      const { chargingStartTime } = this.data;
      if (chargingStartTime) {
        const now = new Date();
        const duration = Math.floor((now - chargingStartTime) / 60000); // 分钟
        
        let durationText;
        if (duration < 60) {
          durationText = `${duration}分钟`;
        } else {
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          durationText = `${hours}小时${minutes}分钟`;
        }
        
        this.setData({
          chargingDuration: durationText
        });
      }
    }, 60000); // 每分钟更新一次
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 获取今天日期
  getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 计算剩余时间
  calculateRemainingTime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diff = start.getTime() + 30 * 60 * 1000 - now.getTime(); // 30分钟有效期
    
    if (diff <= 0) {
      return '已过期';
    }
    
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟`;
  },

  // 分享
  onShareAppMessage() {
    const { station } = this.data;
    return {
      title: `${station.name} - 充电桩`,
      path: `/pages/charging/detail/detail?id=${station.id}`,
      imageUrl: '/images/charging-share.png'
    };
  },

  // 下拉刷新
  onPullDownRefresh() {
    const { station } = this.data;
    if (station) {
      this.loadStationDetail(station.id);
      this.checkMyReservation(station.id);
    }
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 页面卸载
  onUnload() {
    // 清理计时器
    if (this.chargingTimer) {
      clearInterval(this.chargingTimer);
      this.chargingTimer = null;
    }
  }
});
