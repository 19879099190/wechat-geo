// pages/bus/bus.js
const busApi = require('../../api/bus.js');

Page({
  data: {
    busList: [],
    loading: false,
    selectedLine: null,
    showDetail: false,
    realtimeBuses: [],
    showRealtime: false,
    userId: null,

    // 地图相关
    showMap: false,
    mapMarkers: [],
    mapPolyline: [],
    mapCenter: { latitude: 23.158, longitude: 113.352 },
    mapLineName: ''
  },

  onLoad() {
    // 获取用户ID
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      this.setData({ userId: userInfo.id });
    }
    
    this.loadBusList();
  },

  // 加载校巴线路列表
  loadBusList() {
    this.setData({ loading: true });
    
    busApi.getBusLines()
      .then(res => {
        if (res.code === 0) {
          this.setData({
            busList: res.data || []
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

  // 查看线路详情
  viewLineDetail(e) {
    const line = e.currentTarget.dataset.line;
    
    // 加载线路详细信息
    busApi.getLineDetail(line.id)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            selectedLine: res.data,
            showDetail: true
          });
        }
      })
      .catch(() => {
        wx.showToast({
          title: '加载详情失败',
          icon: 'none'
        });
      });
  },

  // 关闭详情
  closeDetail() {
    this.setData({
      showDetail: false,
      showRealtime: false,
      selectedLine: null
    });
  },

  // 阻止点击弹窗内容时触发遮罩层的关闭事件；不要拦截 touchmove，
  // 否则真机上的 scroll-view 无法接收滑动手势。
  preventModalClose() {},

  // 查看实时位置
  viewRealtime(e) {
    const lineId = e.currentTarget.dataset.id;
    
    wx.showLoading({ title: '加载中...' });
    
    busApi.getRealtimeLocation(lineId)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0) {
          this.setData({
            realtimeBuses: res.data || [],
            showRealtime: true
          });
        } else {
          wx.showToast({
            title: res.message || '获取失败',
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
  },

  // 订阅到站提醒
  subscribeArrival(e) {
    const { userId } = this.data;
    const lineId = e.currentTarget.dataset.lineid;
    const stopId = e.currentTarget.dataset.stopid;
    
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
    
    wx.showModal({
      title: '到站提醒',
      content: '是否订阅该站点的到站提醒？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '订阅中...' });
          
          busApi.subscribeArrival({
            userId,
            lineId,
            stopId
          })
            .then(res => {
              wx.hideLoading();
              
              if (res.code === 0) {
                wx.showToast({
                  title: '订阅成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: res.message || '订阅失败',
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

  // 查看站点地图
  viewStopMap(e) {
    const stop = e.currentTarget.dataset.stop;
    
    if (stop && stop.latitude && stop.longitude) {
      wx.openLocation({
        latitude: stop.latitude,
        longitude: stop.longitude,
        name: stop.name,
        address: stop.address || '',
        scale: 16
      });
    } else {
      wx.showToast({
        title: '站点位置信息不可用',
        icon: 'none'
      });
    }
  },

  // 查看到站时间
  viewArrivalTime(e) {
    const lineId = e.currentTarget.dataset.lineid;
    const stopId = e.currentTarget.dataset.stopid;
    
    wx.showLoading({ title: '查询中...' });
    
    busApi.getArrivalTime({ lineId, stopId })
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0 && res.data.length > 0) {
          const arrivals = res.data.map(item => 
            `${item.busNumber}号车: ${item.estimatedTime}分钟后到达`
          ).join('\n');
          
          wx.showModal({
            title: '到站时间',
            content: arrivals,
            showCancel: false
          });
        } else {
          wx.showToast({
            title: '暂无车辆信息',
            icon: 'none'
          });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({
          title: '查询失败',
          icon: 'none'
        });
      });
  },

  // 查看完整路线图
  viewRouteMap(e) {
    const line = e.currentTarget.dataset.line || this.data.selectedLine;

    if (!line) {
      wx.showToast({
        title: '线路数据错误',
        icon: 'none'
      });
      return;
    }

    if (!line.stations || line.stations.length === 0) {
      wx.showToast({
        title: '暂无站点信息',
        icon: 'none'
      });
      return;
    }

    const stations = line.stations;

    // 显示加载提示
    wx.showLoading({ title: '加载路线中...' });

    // 调用后端路径规划 API 获取真实道路路径
    const config = require('../../config.js');
    wx.request({
      url: `${config.apiBaseUrl}/bus/line/${line.id}/route`,
      method: 'GET',
      success: (res) => {
        wx.hideLoading();

        if (res.statusCode !== 200 || res.data.code !== 0) {
          throw new Error(res.data.message || '加载路线失败');
        }

        // 生成站点标记
        const markers = stations.map((station, index) => ({
          id: station.id,
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude),
          title: station.name,
          width: 1,
          height: 1,
          label: {
            content: station.name,
            fontSize: 11,
            color: '#333333',
            bgColor: '#ffffff',
            borderRadius: 4,
            padding: 6,
            anchorX: 0,
            anchorY: 0,
            borderWidth: 1,
            borderColor: '#2196f3'
          }
        }));

        // 使用真实道路路径或降级为直线
        const points = res.data.data && res.data.data.points ? res.data.data.points : stations.map(station => ({
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude)
        }));

        const polyline = [{
          points: points,
          color: '#2196f3',
          width: 6,
          arrowLine: true,
          borderColor: '#1976d2',
          borderWidth: 2
        }];

        // 计算中心点
        const centerLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
        const centerLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;

        this.setData({
          showMap: true,
          mapMarkers: markers,
          mapPolyline: polyline,
          mapCenter: { latitude: centerLat, longitude: centerLng },
          mapLineName: line.name
        });

        console.log(`校巴路线加载完成: ${line.name}, ${stations.length} 个站点, ${res.data.data && res.data.data.points ? '真实道路' : '直线'}`);

        // 调整地图视野
        setTimeout(() => {
          const mapCtx = wx.createMapContext('busRouteMap', this);
          if (mapCtx && points.length >= 2) {
            mapCtx.includePoints({ points, padding: [60, 60, 60, 60] });
          }
        }, 300);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('加载路线失败:', err);

        // 降级处理：使用直线连接
        const markers = stations.map((station, index) => ({
          id: station.id,
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude),
          title: station.name,
          width: 1,
          height: 1,
          label: {
            content: station.name,
            fontSize: 11,
            color: '#333333',
            bgColor: '#ffffff',
            borderRadius: 4,
            padding: 6,
            anchorX: 0,
            anchorY: 0,
            borderWidth: 1,
            borderColor: '#2196f3'
          }
        }));

        const points = stations.map(station => ({
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude)
        }));

        const polyline = [{
          points: points,
          color: '#2196f3',
          width: 6,
          arrowLine: true,
          borderColor: '#1976d2',
          borderWidth: 2
        }];

        const centerLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
        const centerLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;

        this.setData({
          showMap: true,
          mapMarkers: markers,
          mapPolyline: polyline,
          mapCenter: { latitude: centerLat, longitude: centerLng },
          mapLineName: line.name
        });

        wx.showToast({
          title: '使用直线显示',
          icon: 'none'
        });

        // 调整地图视野
        setTimeout(() => {
          const mapCtx = wx.createMapContext('busRouteMap', this);
          if (mapCtx && points.length >= 2) {
            mapCtx.includePoints({ points, padding: [60, 60, 60, 60] });
          }
        }, 300);
      }
    });
  },

  // 关闭地图
  closeMap() {
    this.setData({
      showMap: false,
      mapMarkers: [],
      mapPolyline: []
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadBusList();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '华农校巴时刻表',
      path: '/pages/bus/bus',
      imageUrl: '/images/bus-share.png'
    };
  }
});
