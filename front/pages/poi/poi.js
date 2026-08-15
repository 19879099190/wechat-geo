// pages/poi/poi.js
const poiApi = require('../../api/poi.js');

Page({
  data: {
    poiList: [],
    loading: false,
    types: [
      { value: '', label: '全部' },
      { value: 'canteen', label: '食堂' },
      { value: 'library', label: '图书馆' },
      { value: 'classroom', label: '教学楼' },
      { value: 'dormitory', label: '宿舍' },
      { value: 'scenic', label: '景点' },
      { value: 'sports', label: '运动场馆' }
    ],
    currentType: '',
    currentTypeIndex: 0
  },

  onLoad(options) {
    // 如果从首页传递了类型参数
    if (options.type) {
      const typeIndex = this.data.types.findIndex(t => t.value === options.type);
      if (typeIndex !== -1) {
        this.setData({
          currentType: options.type,
          currentTypeIndex: typeIndex
        });
      }
    }
    
    this.loadPoiList();
  },

  // 加载POI列表
  loadPoiList() {
    this.setData({ loading: true });
    
    const params = {};
    if (this.data.currentType) {
      params.type = this.data.currentType;
    }
    
    poiApi.getPoiList(params)
      .then(res => {
        if (res.code === 0) {
          this.setData({
            poiList: res.data.list || []
          });
        } else {
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch((err) => {
        console.error('加载POI列表失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 切换类型
  onTypeChange(e) {
    const index = e.detail.value;
    const selectedType = this.data.types[index].value;
    this.setData({
      currentType: selectedType,
      currentTypeIndex: index
    });
    this.loadPoiList();
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/poi/detail/detail?id=${id}`
    });
  }
});
