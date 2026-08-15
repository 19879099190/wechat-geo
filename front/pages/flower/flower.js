// 赏花专题页面 - 完整版
Page({
  data: {
    flowerSpots: [],
    filteredSpots: [],
    categories: ['全部', '紫荆花', '樱花', '木棉花', '桃花', '荷花', '其他'],
    currentCategory: '全部',
    searchKeyword: '',
    
    // 统计数据
    stats: {
      totalSpots: 0,
      blooming: 0,
      upcoming: 0
    },

    // GIS分析
    showGisPanel: false,
    showHeatmap: false,
    bufferRadius: 500,
    bufferRadiusOptions: ['100', '200', '500', '1000', '2000'],
    nearbyResults: [],

    // 用户位置
    userLocation: null
  },

  onLoad() {
    console.log('赏花页面加载');
    this.getUserLocation();
    this.loadFlowerSpots();
  },

  // 获取用户位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          userLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        this.calculateDistances();
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
      }
    });
  },

  // 加载赏花点数据
  loadFlowerSpots() {
    wx.showLoading({ title: '加载中...' });

    const flowerApi = require('../../api/flower.js');

    flowerApi.getFlowerSpots()
      .then(res => {
        if (res.code === 0) {
          const spots = res.data || [];

          // 格式化数据，确保字段名一致
          const formattedSpots = spots.map(spot => {
            const images = Array.isArray(spot.images) ? spot.images : JSON.parse(spot.images || '[]');
            return {
              id: spot.id,
              name: spot.name,
              type: spot.type,
              latitude: parseFloat(spot.latitude),
              longitude: parseFloat(spot.longitude),
              description: spot.description,
              bestTime: spot.best_time,
              features: Array.isArray(spot.features) ? spot.features : JSON.parse(spot.features || '[]'),
              rating: parseFloat(spot.rating || 0),
              status: spot.status,
              viewCount: spot.view_count || 0,
              images,
              displayImageUrl: images[0] || '/images/R-C.jpg',
              hasVideo: !!spot.has_video,
              has360: !!spot.has_360,
              hasLiveStream: !!spot.has_live_stream
            };
          });

          // 计算统计数据
          const stats = {
            totalSpots: formattedSpots.length,
            blooming: formattedSpots.filter(s => s.status === 'blooming').length,
            upcoming: formattedSpots.filter(s => s.status === 'upcoming').length
          };

          this.setData({
            flowerSpots: formattedSpots,
            filteredSpots: formattedSpots,
            stats
          });

          wx.hideLoading();
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('加载赏花点失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      });
  },

  onSpotImageError(e) {
    const id = Number(e.currentTarget.dataset.id);
    const fallback = '/images/R-C.jpg';
    if (e.currentTarget.dataset.src === fallback) return;
    const replaceImage = spot => spot.id === id
      ? { ...spot, displayImageUrl: fallback }
      : spot;

    this.setData({
      flowerSpots: this.data.flowerSpots.map(replaceImage),
      filteredSpots: this.data.filteredSpots.map(replaceImage)
    });
    console.warn('赏花列表图片加载失败，已使用占位图:', id, e.detail);
  },

  // 计算距离
  calculateDistances() {
    const { flowerSpots, userLocation } = this.data;
    if (!userLocation) return;

    const spotsWithDistance = flowerSpots.map(spot => {
      const distance = this.getDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.latitude,
        spot.longitude
      );
      return {
        ...spot,
        distance: distance,
        distanceText: distance < 1000 
          ? `${Math.round(distance)}m` 
          : `${(distance / 1000).toFixed(1)}km`
      };
    });

    this.setData({
      flowerSpots: spotsWithDistance,
      filteredSpots: spotsWithDistance
    });
  },

  // 计算两点距离（米）
  getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.filterSpots();
  },

  // 过滤赏花点
  filterSpots() {
    const { flowerSpots, currentCategory, searchKeyword } = this.data;
    
    let filtered = flowerSpots;
    
    // 分类过滤
    if (currentCategory !== '全部') {
      filtered = filtered.filter(spot => spot.type === currentCategory);
    }
    
    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(spot => 
        spot.name.toLowerCase().includes(keyword) ||
        spot.description.toLowerCase().includes(keyword)
      );
    }
    
    this.setData({ filteredSpots: filtered });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.filterSpots();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchKeyword: '' });
    this.filterSpots();
  },

  // 查看赏花点详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/flower/detail/detail?id=${id}`
    });
  },

  // 查看推荐路线
  viewRoutes() {
    wx.navigateTo({
      url: '/pages/flower/routes/routes'
    });
  },

  // 跳转到周边搜索页面
  showGisAnalysis() {
    wx.navigateTo({
      url: '/pages/flower/nearby/nearby'
    });
  },

  // 隐藏GIS分析面板
  hideGisPanel() {
    this.setData({ 
      showGisPanel: false,
      nearbyResults: []
    });
  },

  // 半径选择
  onRadiusChange(e) {
    const index = e.detail.value;
    const radius = this.data.bufferRadiusOptions[index];
    this.setData({ bufferRadius: parseInt(radius) });
  },

  // 缓冲区分析
  bufferAnalysis() {
    const { userLocation, flowerSpots, bufferRadius } = this.data;
    
    if (!userLocation) {
      wx.showToast({
        title: '请先获取位置',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '分析中...' });

    // 找出缓冲区内的赏花点
    const results = flowerSpots.filter(spot => {
      const distance = this.getDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.latitude,
        spot.longitude
      );
      return distance <= bufferRadius;
    }).map(spot => ({
      ...spot,
      distance: this.getDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.latitude,
        spot.longitude
      )
    })).sort((a, b) => a.distance - b.distance);

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ nearbyResults: results });
      
      if (results.length === 0) {
        wx.showToast({
          title: `${bufferRadius}米内无赏花点`,
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: `找到${results.length}个赏花点`,
          icon: 'success'
        });
      }
    }, 500);
  },

  // 周边搜索
  nearbySearch() {
    this.bufferAnalysis(); // 使用相同的逻辑
  },

  // 切换热力图（跳转到地图页面）
  toggleHeatmap() {
    wx.navigateTo({
      url: '/pages/flower/map/map?heatmap=true'
    });
  },

  // 导航到赏花点
  navigateToSpot(e) {
    const spot = e.currentTarget.dataset.spot;
    wx.openLocation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      name: spot.name,
      address: spot.description,
      scale: 18,
      fail: (err) => {
        console.error('导航失败:', err);
        wx.showModal({
          title: '提示',
          content: '开发工具不支持导航功能，请在真机上测试',
          showCancel: false
        });
      }
    });
  },

  // 查看地图
  viewOnMap() {
    wx.navigateTo({
      url: '/pages/flower/map/map'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '华农赏花地图 - 发现校园最美花景',
      path: '/pages/flower/flower'
    };
  }
});
