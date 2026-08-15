// pages/settings/settings.js
Page({
  data: {
    notificationEnabled: true,
    autoLocationEnabled: true,
    language: '简体中文',
    mapStyle: '标准',
    showCompass: true,
    showScale: true,
    cacheSize: '0 MB'
  },

  onLoad() {
    this.loadSettings();
    this.calculateCacheSize();
  },

  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('appSettings') || {};
    this.setData({
      notificationEnabled: settings.notificationEnabled !== false,
      autoLocationEnabled: settings.autoLocationEnabled !== false,
      language: settings.language || '简体中文',
      mapStyle: settings.mapStyle || '标准',
      showCompass: settings.showCompass !== false,
      showScale: settings.showScale !== false
    });
  },

  // 保存设置
  saveSettings() {
    const settings = {
      notificationEnabled: this.data.notificationEnabled,
      autoLocationEnabled: this.data.autoLocationEnabled,
      language: this.data.language,
      mapStyle: this.data.mapStyle,
      showCompass: this.data.showCompass,
      showScale: this.data.showScale
    };
    wx.setStorageSync('appSettings', settings);
  },

  // 消息通知开关
  onNotificationChange(e) {
    this.setData({
      notificationEnabled: e.detail.value
    });
    this.saveSettings();
  },

  // 自动定位开关
  onAutoLocationChange(e) {
    this.setData({
      autoLocationEnabled: e.detail.value
    });
    this.saveSettings();
  },

  // 显示指南针开关
  onShowCompassChange(e) {
    this.setData({
      showCompass: e.detail.value
    });
    this.saveSettings();
  },

  // 显示比例尺开关
  onShowScaleChange(e) {
    this.setData({
      showScale: e.detail.value
    });
    this.saveSettings();
  },

  // 选择语言
  selectLanguage() {
    wx.showActionSheet({
      itemList: ['简体中文', 'English'],
      success: (res) => {
        const languages = ['简体中文', 'English'];
        this.setData({
          language: languages[res.tapIndex]
        });
        this.saveSettings();
      }
    });
  },

  // 选择地图样式
  selectMapStyle() {
    wx.showActionSheet({
      itemList: ['标准', '卫星', '夜间'],
      success: (res) => {
        const styles = ['标准', '卫星', '夜间'];
        this.setData({
          mapStyle: styles[res.tapIndex]
        });
        this.saveSettings();
        wx.showToast({
          title: '地图样式已更改',
          icon: 'success'
        });
      }
    });
  },

  // 计算缓存大小
  calculateCacheSize() {
    try {
      const info = wx.getStorageInfoSync();
      const sizeKB = info.currentSize;
      const sizeMB = (sizeKB / 1024).toFixed(2);
      this.setData({
        cacheSize: `${sizeMB} MB`
      });
    } catch (e) {
      console.error('获取缓存大小失败', e);
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？这不会删除您的登录信息和收藏数据。',
      success: (res) => {
        if (res.confirm) {
          // 保留重要数据
          const token = wx.getStorageSync('token');
          const userInfo = wx.getStorageSync('userInfo');
          const commonRoutes = wx.getStorageSync('commonRoutes');
          const appSettings = wx.getStorageSync('appSettings');
          
          // 清除所有缓存
          wx.clearStorageSync();
          
          // 恢复重要数据
          if (token) wx.setStorageSync('token', token);
          if (userInfo) wx.setStorageSync('userInfo', userInfo);
          if (commonRoutes) wx.setStorageSync('commonRoutes', commonRoutes);
          if (appSettings) wx.setStorageSync('appSettings', appSettings);
          
          this.calculateCacheSize();
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 检查更新
  checkUpdate() {
    wx.showLoading({
      title: '检查中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '当前已是最新版本',
        content: '版本号：v1.0.0',
        showCancel: false
      });
    }, 1000);
  },

  // 关于我们
  about() {
    wx.showModal({
      title: '关于华农掌中行',
      content: '华农掌中行是一款为华南农业大学师生提供校园导航、充电桩预约、校巴查询等服务的小程序。\n\n版本：v1.0.0\n开发团队：华农信息化办公室',
      showCancel: false
    });
  }
});

