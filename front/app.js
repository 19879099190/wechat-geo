// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('华农掌中行小程序启动');
    
    // 检查更新
    this.checkUpdate();
  },
  
  onShow() {
    // 小程序显示时执行
  },
  
  onHide() {
    // 小程序隐藏时执行
  },
  
  onError(msg) {
    console.error('小程序错误:', msg);
  },
  
  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请删除小程序后重新搜索打开',
              showCancel: false
            });
          });
        }
      });
    }
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    location: null
  }
});

