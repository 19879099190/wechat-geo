// pages/poi/edit/edit.js
const poiApi = require('../../../api/poi.js');

Page({
  data: {
    isEdit: false,
    poiId: null,
    
    // 表单数据
    formData: {
      name: '',
      type: 'canteen',
      latitude: '',
      longitude: '',
      description: '',
      comment: '',
      rating: 0,
      openTime: ''
    },
    
    // 类型选项
    types: [
      { value: 'canteen', label: '食堂' },
      { value: 'library', label: '图书馆' },
      { value: 'classroom', label: '教学楼' },
      { value: 'dormitory', label: '宿舍' },
      { value: 'scenic', label: '景点' },
      { value: 'sports', label: '运动场馆' }
    ],
    typeIndex: 0
  },

  onLoad(options) {
    // 如果有id参数，说明是编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        poiId: options.id
      });
      this.loadPoiDetail(options.id);
    }
  },

  // 加载POI详情（编辑模式）
  loadPoiDetail(id) {
    wx.showLoading({ title: '加载中...' });
    
    poiApi.getPoiDetail(id)
      .then(res => {
        wx.hideLoading();
        if (res.code === 0) {
          const poi = res.data;
          const typeIndex = this.data.types.findIndex(t => t.value === poi.type);
          
          this.setData({
            formData: {
              name: poi.name || '',
              type: poi.type || 'canteen',
              latitude: poi.latitude ? poi.latitude.toString() : '',
              longitude: poi.longitude ? poi.longitude.toString() : '',
              description: poi.description || '',
              comment: poi.comment || '',
              rating: poi.rating || 0,
              openTime: poi.open_time || ''
            },
            typeIndex: typeIndex !== -1 ? typeIndex : 0
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
  },

  // 输入名称
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  // 选择类型
  onTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      typeIndex: index,
      'formData.type': this.data.types[index].value
    });
  },

  // 输入纬度
  onLatitudeInput(e) {
    this.setData({
      'formData.latitude': e.detail.value
    });
  },

  // 输入经度
  onLongitudeInput(e) {
    this.setData({
      'formData.longitude': e.detail.value
    });
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  onCommentInput(e) {
    this.setData({ 'formData.comment': e.detail.value });
  },

  // 输入评分
  onRatingInput(e) {
    let value = parseFloat(e.detail.value);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 5) value = 5;
    
    this.setData({
      'formData.rating': value
    });
  },

  // 输入开放时间
  onOpenTimeInput(e) {
    this.setData({
      'formData.openTime': e.detail.value
    });
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          'formData.latitude': res.latitude.toFixed(6),
          'formData.longitude': res.longitude.toFixed(6)
        });
        wx.showToast({
          title: '位置获取成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '位置获取失败',
          icon: 'none'
        });
      }
    });
  },

  // 提交表单
  submitForm() {
    const { formData, isEdit, poiId } = this.data;
    
    // 验证必填项
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      wx.showToast({
        title: '请输入经纬度',
        icon: 'none'
      });
      return;
    }
    
    // 验证经纬度格式
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      wx.showToast({
        title: '经纬度格式错误',
        icon: 'none'
      });
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      wx.showToast({
        title: '经纬度范围错误',
        icon: 'none'
      });
      return;
    }
    
    // 准备提交数据
    const submitData = {
      name: formData.name.trim(),
      type: formData.type,
      latitude: lat,
      longitude: lng,
      description: formData.description.trim(),
      comment: formData.comment.trim(),
      rating: formData.rating,
      open_time: formData.openTime.trim()
    };
    
    wx.showLoading({ title: isEdit ? '保存中...' : '添加中...' });
    
    const apiCall = isEdit 
      ? poiApi.updatePoi(poiId, submitData)
      : poiApi.addPoi(submitData);
    
    apiCall
      .then(res => {
        wx.hideLoading();
        if (res.code === 0) {
          wx.showToast({
            title: isEdit ? '修改成功' : '添加成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.message || (isEdit ? '修改失败' : '添加失败'),
            icon: 'none'
          });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      });
  }
});

