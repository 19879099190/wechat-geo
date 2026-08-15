const app = getApp();
const poiApi = require('../../api/poi.js');
const flowerApi = require('../../api/flower.js');
const busApi = require('../../api/bus.js');

Page({
  data: {
    latitude: 23.158,
    longitude: 113.352,
    scale: 16,
    markers: [],
    polyline: [],

    // 当前位置
    currentLocation: null,

    // POI列表
    poiList: [],

    // 赏花点列表
    flowerSpots: [],

    // 显示模式：all(全部) / flower(仅赏花点) / busline(校巴路线)
    mode: 'all',

    // 校巴路线相关
    busLineId: null,
    busLines: []
  },

  onLoad(options) {
      this.mapCtx = wx.createMapContext('map');
    // this.getCurrentLocation(); // 注释掉自动获取位置，默认显示华南农业大学

      // 获取显示模式参数
      const mode = options.mode || 'all';
      const type = options.type;

      this.setData({ mode });

      // 如果是校巴路线模式
      if (type === 'busline') {
        const lineId = parseInt(options.lineId);
        if (lineId) {
          this.setData({ busLineId: lineId });
          this.loadBusLineMap(lineId);
        } else {
          // 加载所有校巴路线
          this.loadAllBusLines();
        }
      } else {
        this.loadAllMarkers();
      }
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
          id: Number(poi.id),
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
        const flowerMarkers = flowerSpots.map((spot, index) => ({
          id: 10000 + spot.id, // 加偏移避免与 POI ID 冲突
          latitude: parseFloat(spot.latitude),
          longitude: parseFloat(spot.longitude),
          title: spot.name,
          width: 35,
          height: 35,
          label: {
            content: '🌸',
            fontSize: 24,
            anchorX: 0,
            anchorY: -12
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

  // 加载单条校巴路线
  loadBusLineMap(lineId) {
    wx.showLoading({ title: '加载中...' });

    // 调用新的路线规划 API
    busApi.getLineDetail(lineId)
      .then(res => {
        if (res.code === 0 && res.data) {
          const line = res.data;

          // 调用路线规划 API 获取真实道路路径
          return fetch(`${require('../../config.js').apiBaseUrl}/bus/line/${lineId}/route`)
            .then(response => response.json())
            .then(routeRes => {
              if (routeRes.code === 0) {
                return { line, route: routeRes.data };
              } else {
                // 如果路线规划失败，使用直线
                return { line, route: null };
              }
            });
        } else {
          throw new Error(res.message || '加载失败');
        }
      })
      .then(({ line, route }) => {
        wx.hideLoading();

        const stations = line.stations || [];

        if (stations.length === 0) {
          wx.showToast({
            title: '该线路暂无站点信息',
            icon: 'none'
          });
          return;
        }

        // 生成站点标记
        const markers = stations.map((station, index) => ({
          id: station.id,
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude),
          title: station.name,
          width: 30,
          height: 30,
          label: {
            content: `${index + 1}`,
            fontSize: 14,
            color: '#ffffff',
            bgColor: '#2196f3',
            borderRadius: 15,
            padding: 5,
            anchorX: 0,
            anchorY: -5
          },
          callout: {
            content: `${index + 1}. ${station.name}`,
            display: 'BYCLICK',
            padding: 10,
            borderRadius: 5,
            bgColor: '#ffffff',
            color: '#333333',
            fontSize: 14
          }
        }));

        // 使用真实道路路径或直线
        const points = route && route.points ? route.points : stations.map(station => ({
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

        // 计算地图中心点
        const avgLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
        const avgLng = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;

        this.setData({
          markers,
          polyline,
          latitude: avgLat,
          longitude: avgLng,
          scale: 14
        });

        console.log(`校巴路线加载完成: ${line.name}, ${stations.length} 个站点, ${route ? '真实道路' : '直线'}`);
      })
      .catch(err => {
        wx.hideLoading();
        console.error('加载校巴路线失败:', err);
        wx.showToast({
          title: err.message || '网络请求失败',
          icon: 'none'
        });
      });
  },

  // 加载所有校巴路线（多条线路）
  loadAllBusLines() {
    wx.showLoading({ title: '加载中...' });

    busApi.getBusLines()
      .then(res => {
        if (res.code === 0 && res.data && res.data.length > 0) {
          const lines = res.data;

          // 为每条线路加载详情和路线
          const promises = lines.map(line =>
            fetch(`${require('../../config.js').apiBaseUrl}/bus/line/${line.id}/route`)
              .then(response => response.json())
              .catch(() => ({ code: -1 }))
          );

          return Promise.all(promises);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '暂无校巴线路',
            icon: 'none'
          });
          return Promise.reject('no data');
        }
      })
      .then(results => {
        wx.hideLoading();

        const markers = [];
        const polylines = [];
        const colors = ['#2196f3', '#ff6b9d', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

        results.forEach((res, lineIndex) => {
          if (res.code === 0 && res.data) {
            const { points, stations } = res.data;
            const color = colors[lineIndex % colors.length];

            if (stations && stations.length > 0) {
              // 添加站点标记
              stations.forEach((station, stationIndex) => {
                markers.push({
                  id: 2000000 + lineIndex * 10000 + stationIndex,
                  latitude: parseFloat(station.latitude),
                  longitude: parseFloat(station.longitude),
                  title: station.name,
                  width: 28,
                  height: 28,
                  label: {
                    content: `${stationIndex + 1}`,
                    fontSize: 12,
                    color: '#ffffff',
                    bgColor: color,
                    borderRadius: 14,
                    padding: 4,
                    anchorX: 0,
                    anchorY: -5
                  },
                  callout: {
                    content: `${stationIndex + 1}. ${station.name}`,
                    display: 'BYCLICK',
                    padding: 10,
                    borderRadius: 5,
                    bgColor: '#ffffff',
                    color: '#333333',
                    fontSize: 13
                  }
                });
              });

              // 添加路线（使用真实道路路径）
              polylines.push({
                points: points || stations.map(s => ({
                  latitude: parseFloat(s.latitude),
                  longitude: parseFloat(s.longitude)
                })),
                color: color,
                width: 5,
                arrowLine: true,
                borderColor: color,
                borderWidth: 1
              });
            }
          }
        });

        this.setData({
          markers,
          polyline: polylines,
          scale: 13
        });

        console.log(`所有校巴路线加载完成: ${polylines.length} 条线路, ${markers.length} 个站点`);
      })
      .catch(err => {
        if (err !== 'no data') {
          wx.hideLoading();
          console.error('加载校巴路线失败:', err);
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      });
  }
});
