const app = getApp();
const poiApi = require('../../../api/poi.js');
const flowerApi = require('../../../api/flower.js');

Page({
  data: {
    latitude: 23.158,
    longitude: 113.352,
    scale: 16,
    markers: [],
    circles: [], // 热力图圆形

    // 当前位置
    currentLocation: null,

    // POI列表
    poiList: [],

    // 赏花点列表
    flowerSpots: [],

    // 固定为赏花模式
    mode: 'flower',

    // 热力图开关
    showHeatmap: false
  },

  onLoad(options) {
    this.mapCtx = wx.createMapContext('map');
    // this.getCurrentLocation(); // 注释掉自动获取位置，默认显示华南农业大学

    // 如果从赏花页面跳转过来，自动开启热力图
    if (options.heatmap === 'true') {
      this.setData({ showHeatmap: true });
    }

    this.loadAllMarkers();
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude,
          name: '我的位置'
        };
        
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          currentLocation: location
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
      }
    });
  },

  // 加载所有标记（POI + 赏花点）
  loadAllMarkers() {
    const { mode } = this.data;

    // 根据模式决定加载哪些数据
    const promises = [];
    if (mode === 'flower') {
      // 仅加载赏花点
      promises.push(Promise.resolve({ code: -1 })); // POI 占位
      promises.push(flowerApi.getFlowerSpots({}));
    } else {
      // 加载全部
      promises.push(poiApi.getPoiList({ pageSize: 100 }));
      promises.push(flowerApi.getFlowerSpots({}));
    }

    Promise.all(promises).then(([poiRes, flowerRes]) => {
      const markers = [];

      // 处理 POI 标记（普通样式）
      if (mode !== 'flower' && poiRes.code === 0) {
        const poiList = poiRes.data.list || [];
        const poiMarkers = poiList.map((poi) => ({
          id: 1000000 + Number(spot.id),
          latitude: parseFloat(poi.latitude),
          longitude: parseFloat(poi.longitude),
          title: poi.name,
          width: 30,
          height: 30,
          label: {
            content: '📍',
            fontSize: 20,
            anchorX: 0,
            anchorY: -10
          },
          callout: {
            content: poi.name,
            display: 'BYCLICK',
            padding: 10,
            borderRadius: 5,
            bgColor: '#ffffff',
            color: '#333333',
            fontSize: 14
          }
        }));
        markers.push(...poiMarkers);
        this.setData({ poiList });
      }

      // 处理赏花点标记（特殊样式：粉色花朵）
      if (flowerRes.code === 0) {
        const flowerSpots = flowerRes.data || [];
        const flowerMarkers = flowerSpots.map((spot) => ({
          id: spot.id,
          latitude: parseFloat(spot.latitude),
          longitude: parseFloat(spot.longitude),
          title: spot.name,
          width: 1,
          height: 1,
          label: {
            content: '🌸',
            fontSize: 10,
            anchorX: -5,
            anchorY: -7
          },
          callout: {
            content: `🌸 ${spot.name}`,
            display: 'BYCLICK',
            padding: 10,
            borderRadius: 5,
            bgColor: '#ffe4e1',
            color: '#d63384',
            fontSize: 14
          }
        }));
        markers.push(...flowerMarkers);
        this.setData({ flowerSpots });
      }

      this.setData({ markers });
      console.log(`地图加载完成 (${mode}模式): ${markers.length} 个标记点`);

      // 如果需要显示热力图，加载完成后自动生成
      if (this.data.showHeatmap) {
        setTimeout(() => {
          this.generateHeatmap();
        }, 500);
      }
    }).catch(err => {
      console.error('加载地图标记失败:', err);
      this.setData({ markers: [], poiList: [], flowerSpots: [] });
    });
  },

  // 点击地图标记
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const marker = this.data.markers.find(m => m.id === markerId);
    
    if (marker) {
      wx.showToast({
        title: marker.title,
        icon: 'none'
      });
    }
  },

  // 回到当前位置
  moveToLocation() {
    this.mapCtx.moveToLocation();
  },

  // 切换热力图
  toggleHeatmap() {
    const showHeatmap = !this.data.showHeatmap;
    this.setData({ showHeatmap });

    if (showHeatmap) {
      this.generateHeatmap();
      // 隐藏花朵标记
      this.hideFlowerMarkers();
    } else {
      this.setData({ circles: [] });
      // 恢复花朵标记
      this.showFlowerMarkers();
    }

    wx.showToast({
      title: showHeatmap ? '热力图已开启' : '热力图已关闭',
      icon: 'none'
    });
  },

  // 隐藏花朵标记
  hideFlowerMarkers() {
    const markers = this.data.markers.map(marker => ({
      ...marker,
      label: marker.label ? { ...marker.label, content: '' } : undefined
    }));
    this.setData({ markers });
  },

  // 显示花朵标记
  showFlowerMarkers() {
    const markers = this.data.markers.map(marker => ({
      ...marker,
      label: marker.label ? { ...marker.label, content: '🌸' } : undefined
    }));
    this.setData({ markers });
  },

  // 生成热力图数据
  generateHeatmap() {
    const { flowerSpots } = this.data;

    if (!flowerSpots || flowerSpots.length === 0) {
      wx.showToast({
        title: '暂无赏花点数据',
        icon: 'none'
      });
      return;
    }

    // 获取打卡数据（模拟数据，实际应从后端获取）
    const circles = flowerSpots.map(spot => {
      // 模拟打卡数量（实际应从 spot.checkin_count 获取）
      const checkinCount = spot.checkin_count || Math.floor(Math.random() * 100);

      // 根据打卡数量计算热力值 (0-1)
      const maxCheckins = 100; // 最大打卡数
      const heatValue = Math.min(checkinCount / maxCheckins, 1);

      // 根据热力值计算颜色和半径
      const color = this.getHeatColor(heatValue);
      const radius = 32.5 + heatValue * 97.5; // 32.5-130米（原来25-100米的1.3倍）

      return {
        latitude: parseFloat(spot.latitude),
        longitude: parseFloat(spot.longitude),
        radius: radius,
        color: color,
        fillColor: color,
        strokeWidth: 0
      };
    });

    this.setData({ circles });
    console.log(`热力图生成完成: ${circles.length} 个热力点`);
  },

  // 根据热力值获取颜色
  getHeatColor(value) {
    // value: 0-1
    // 7个等级的红色渐变：浅红 -> 深红

    if (value < 0.14) {
      // 等级1: 极浅红
      return '#FF525220';
    } else if (value < 0.28) {
      // 等级2: 很浅红
      return '#FF525235';
    } else if (value < 0.42) {
      // 等级3: 浅红
      return '#FF525250';
    } else if (value < 0.57) {
      // 等级4: 中等红
      return '#FF525265';
    } else if (value < 0.71) {
      // 等级5: 较深红
      return '#FF525280';
    } else if (value < 0.85) {
      // 等级6: 深红
      return '#FF5252A0';
    } else {
      // 等级7: 极深红
      return '#FF5252C0';
    }
  }
});
