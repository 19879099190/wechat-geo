const request = require('../../../utils/request.js');
const flowerApi = require('../../../api/flower.js');

const TYPE_ICONS = {
  dormitory: '🏠',
  office: '🏢',
  sports: '⚽',
  shop: '🛒',
  canteen: '🍜',
  classroom: '📚',
  library: '📖'
};

const TYPE_LABELS = {
  dormitory: '宿舍',
  office: '办公楼',
  sports: '运动场所',
  shop: '商店',
  canteen: '食堂',
  classroom: '教学楼',
  library: '图书馆'
};

Page({
  data: {
    // 地图中心
    latitude: 23.158,
    longitude: 113.352,
    scale: 16,
    markers: [],
    circles: [],

    // 赏花点
    flowerSpots: [],
    selectedSpotIndex: 0,
    selectedSpot: null,

    // 半径
    radiusOptions: [500, 1000, 1500, 2000],
    selectedRadius: 500,

    // 搜索结果
    searchDone: false,
    poiResults: [],

    // POI 详情弹窗
    selectedPoi: null,
    showPoiDetail: false,

    searching: false
  },

  onLoad() {
    this.loadFlowerSpots();
  },

  loadFlowerSpots() {
    wx.showLoading({ title: '加载中...' });
    flowerApi.getFlowerSpots().then(res => {
      wx.hideLoading();
      if (res.code === 0 && res.data && res.data.length > 0) {
        const spots = res.data.map(s => ({
          id: s.id,
          name: s.name,
          latitude: parseFloat(s.latitude),
          longitude: parseFloat(s.longitude),
          type: s.type
        }));
        this.setData({
          flowerSpots: spots,
          selectedSpot: spots[0],
          latitude: spots[0].latitude,
          longitude: spots[0].longitude
        });
      }
    }).catch(() => {
      wx.hideLoading();
    });
  },

  onSpotChange(e) {
    const index = parseInt(e.detail.value);
    const spot = this.data.flowerSpots[index];
    this.setData({
      selectedSpotIndex: index,
      selectedSpot: spot,
      latitude: spot.latitude,
      longitude: spot.longitude,
      circles: [],
      markers: [],
      searchDone: false,
      poiResults: [],
      showPoiDetail: false
    });
  },

  onRadiusSelect(e) {
    const radius = e.currentTarget.dataset.radius;
    this.setData({ selectedRadius: radius });
    // 如果已搜索过，实时更新圆圈大小
    if (this.data.searchDone) {
      this.setData({ circles: this.buildCircles(radius) });
    }
  },

  buildCircles(radius) {
    const { selectedSpot } = this.data;
    if (!selectedSpot) return [];
    return [{
      latitude: selectedSpot.latitude,
      longitude: selectedSpot.longitude,
      radius: radius,
      color: '#FF69B480',
      fillColor: '#FF69B415',
      strokeWidth: 2
    }];
  },

  doSearch() {
    const { selectedSpot, selectedRadius } = this.data;
    if (!selectedSpot) {
      wx.showToast({ title: '请先选择赏花点', icon: 'none' });
      return;
    }

    this.setData({ searching: true, showPoiDetail: false });

    request.get('/gis/nearby-search', {
      latitude: selectedSpot.latitude,
      longitude: selectedSpot.longitude,
      radius: selectedRadius
    }).then(res => {
      if (res.code === 0) {
        const pois = res.data || [];
        const markers = this.buildPoiMarkers(pois);

        // 赏花点中心标记
        markers.unshift({
          id: 999999,
          latitude: selectedSpot.latitude,
          longitude: selectedSpot.longitude,
          title: selectedSpot.name,
          width: 1,
          height: 1,
          label: {
            content: '🌸',
            fontSize: 28,
            anchorX: -14,
            anchorY: -20
          },
          callout: {
            content: `🌸 ${selectedSpot.name}`,
            display: 'BYCLICK',
            padding: 10,
            borderRadius: 5,
            bgColor: '#ffe4e1',
            color: '#d63384',
            fontSize: 14
          }
        });

        this.setData({
          searching: false,
          searchDone: true,
          poiResults: pois,
          markers,
          circles: this.buildCircles(selectedRadius),
          latitude: selectedSpot.latitude,
          longitude: selectedSpot.longitude,
          scale: selectedRadius <= 500 ? 17 : selectedRadius <= 1000 ? 16 : 15
        });

        if (pois.length === 0) {
          wx.showToast({ title: `${selectedRadius}米内暂无兴趣点`, icon: 'none' });
        }
      } else {
        this.setData({ searching: false });
        wx.showToast({ title: '搜索失败', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ searching: false });
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },

  buildPoiMarkers(pois) {
    return pois.map(poi => ({
      id: poi.id,
      latitude: parseFloat(poi.latitude),
      longitude: parseFloat(poi.longitude),
      title: poi.name,
      width: 1,
      height: 1,
      label: {
        content: `${TYPE_ICONS[poi.type] || '📍'}\n${poi.name}`,
        fontSize: 11,
        color: '#333333',
        bgColor: '#ffffffDD',
        borderRadius: 4,
        padding: 4,
        anchorX: 0,
        anchorY: -10,
        textAlign: 'center'
      },
      callout: {
        content: poi.name,
        display: 'BYCLICK',
        padding: 8,
        borderRadius: 5,
        bgColor: '#ffffff',
        color: '#333333',
        fontSize: 12
      }
    }));
  },

  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    if (markerId === 999999) return;

    const poi = this.data.poiResults.find(p => p.id === markerId);
    if (poi) {
      this.setData({
        selectedPoi: {
          ...poi,
          typeLabel: TYPE_LABELS[poi.type] || poi.type,
          typeIcon: TYPE_ICONS[poi.type] || '📍'
        },
        showPoiDetail: true
      });
    }
  },

  closePoiDetail() {
    this.setData({ showPoiDetail: false });
  }
});
