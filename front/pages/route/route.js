const routeApi = require('../../api/route.js');

Page({
  data: {
    centerLat: 39.908823,
    centerLng: 116.397470,
    scale: 13,
    markers: [],
    polyline: [],
    distance: '',
    duration: '',
    modeText: '',
    steps: [],
    routeData: null,
    saving: false
  },

  onLoad(options) {
    this.mapCtx = wx.createMapContext('routeMap');
    
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data));
        this.processRouteData(data);
      } catch (e) {
        console.error('解析路线数据失败', e);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    }
  },

  processRouteData(data) {
    const { routeData, startPoint, endPoint, mode } = data;

    console.log('路线数据:', routeData);

    // 获取路线信息
    const route = routeData.routes[0];
    const distance = this.formatDistance(route.distance);
    const duration = this.formatDuration(route.duration);
    
    // 设置地图中心点
    const centerLat = (startPoint.latitude + endPoint.latitude) / 2;
    const centerLng = (startPoint.longitude + endPoint.longitude) / 2;

    // 创建标记点
    const markers = [
      {
        id: 1,
        latitude: startPoint.latitude,
        longitude: startPoint.longitude,
        width: 32,
        height: 32,
        label: {
          content: '起',
          color: '#ffffff',
          fontSize: 14,
          bgColor: '#52c41a',
          borderRadius: 20,
          padding: 5
        }
      },
      {
        id: 2,
        latitude: endPoint.latitude,
        longitude: endPoint.longitude,
        width: 32,
        height: 32,
        label: {
          content: '终',
          color: '#ffffff',
          fontSize: 14,
          bgColor: '#f5222d',
          borderRadius: 20,
          padding: 5
        }
      }
    ];

    // 创建路线
    const polyline = this.createPolyline(route);

    // 处理导航步骤
    const steps = this.processSteps(route.steps);

    // 获取出行方式文本
    const modeText = this.getModeText(mode);

    this.setData({
      centerLat,
      centerLng,
      scale: 12,
      markers,
      polyline,
      distance,
      duration,
      modeText,
      steps,
      routeData: data
    }, () => {
      console.log('地图数据已更新');
      console.log('标记点:', markers);
      console.log('路线:', polyline);
      
      // 调整地图视野，确保起点和终点都在可见范围内
      if (this.mapCtx) {
        setTimeout(() => {
          this.mapCtx.includePoints({
            points: [
              {
                latitude: startPoint.latitude,
                longitude: startPoint.longitude
              },
              {
                latitude: endPoint.latitude,
                longitude: endPoint.longitude
              }
            ],
            padding: [80, 80, 80, 80]
          });
        }, 300);
      }
    });
  },

  createPolyline(route) {
    let points = [];
    
    // 腾讯地图返回的polyline是压缩坐标，需要解压
    if (route.polyline && Array.isArray(route.polyline)) {
      // 创建副本，避免修改原始数据
      let coors = [...route.polyline];
      let kr = 1000000;
      
      // 坐标解压缩算法
      for (let i = 2; i < coors.length; i++) {
        coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
      }
      
      // 转换为微信小程序地图需要的格式
      for (let i = 0; i < coors.length; i += 2) {
        points.push({
          latitude: coors[i],
          longitude: coors[i + 1]
        });
      }
    }

    console.log('路线点数量:', points.length);
    console.log('前3个点:', points.slice(0, 3));

    return [{
      points: points,
      color: '#667eeaDD',
      width: 8,
      borderColor: '#ffffff',
      borderWidth: 2,
      arrowLine: true,
      arrowIconPath: '',
      dottedLine: false
    }];
  },

  processSteps(steps) {
    return steps.map(step => ({
      instruction: step.instruction,
      distance: this.formatDistance(step.distance)
    }));
  },

  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}米`;
    } else {
      return `${(meters / 1000).toFixed(1)}公里`;
    }
  },

  formatDuration(minutes) {
    // 腾讯地图 API 返回的 duration 单位是分钟，不是秒
    if (!minutes || minutes === 0) {
      return '1分钟';
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours > 0) {
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    } else {
      return `${mins}分钟`;
    }
  },

  getModeText(mode) {
    const modeMap = {
      'driving': '驾车',
      'walking': '步行',
      'bicycling': '骑行',
      'transit': '公交'
    };
    return modeMap[mode] || '步行';
  },

  onStepTap(e) {
    const index = e.currentTarget.dataset.index;
    wx.showToast({
      title: `第${index + 1}步`,
      icon: 'none'
    });
  },

  backToHome() {
    wx.navigateBack();
  },

  startNavigation() {
    const { routeData } = this.data;
    if (!routeData) return;

    const { startPoint, endPoint } = routeData;
    
    wx.openLocation({
      latitude: endPoint.latitude,
      longitude: endPoint.longitude,
      scale: 15,
      name: '目的地',
      address: '导航目的地'
    });
  },

  saveFrequentRoute() {
    const userInfo = wx.getStorageSync('userInfo');
    const { routeData, saving } = this.data;
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (!routeData || saving) return;

    const route = routeData.routeData.routes[0];
    const from = {
      name: routeData.startPoint.name || '起点',
      latitude: routeData.startPoint.latitude,
      longitude: routeData.startPoint.longitude
    };
    const to = {
      name: routeData.endPoint.name || '终点',
      latitude: routeData.endPoint.latitude,
      longitude: routeData.endPoint.longitude
    };

    this.setData({ saving: true });
    routeApi.saveFrequentRoute({
      name: `${from.name} → ${to.name}`,
      from,
      to,
      mode: routeData.mode,
      duration: route.duration,
      distance: route.distance
    }).then(res => {
      wx.showToast({ title: res.code === 0 ? '已保存' : res.message, icon: res.code === 0 ? 'success' : 'none' });
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }).finally(() => this.setData({ saving: false }));
  }
});

