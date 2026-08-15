// 赏花点详情页面
const flowerApi = require('../../../api/flower.js');

Page({
  data: {
    spot: null,
    currentImageIndex: 0,
    showVideoPlayer: false,
    show360Viewer: false,

    // 打卡相关
    checkInStatus: null // 打卡状态: null(未打卡) / { time, image }
  },

  onLoad(options) {
    const id = parseInt(options.id);
    this.loadSpotDetail(id);
    this.checkUserCheckinStatus(id);
  },

  // 加载赏花点详情
  loadSpotDetail(id) {
    wx.showLoading({ title: '加载中...' });

    flowerApi.getFlowerSpotDetail(id)
      .then(res => {
        if (res.code === 0) {
          const spot = res.data;

          // 格式化数据
          const formattedSpot = {
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
            checkinCount: spot.checkin_count || 0,
            images: Array.isArray(spot.images) ? spot.images : JSON.parse(spot.images || '[]'),
            hasVideo: !!spot.has_video,
            videoUrl: spot.video_url,
            has360: !!spot.has_360,
            hasLiveStream: !!spot.has_live_stream,
            liveStreamUrl: spot.live_stream_url,
            openingHours: spot.opening_hours || '全天开放',
            ticketPrice: spot.ticket_price || '免费',
            facilities: Array.isArray(spot.facilities) ? spot.facilities : JSON.parse(spot.facilities || '[]'),
            tips: Array.isArray(spot.tips) ? spot.tips : JSON.parse(spot.tips || '[]'),
            nearbySpots: Array.isArray(spot.nearby_spots) ? spot.nearby_spots : JSON.parse(spot.nearby_spots || '[]'),
            reviews: Array.isArray(spot.reviews) ? spot.reviews : JSON.parse(spot.reviews || '[]')
          };

          this.setData({ spot: formattedSpot });
          wx.hideLoading();

          // 更新浏览次数
          this.updateViewCount(id);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('加载赏花点详情失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      });
  },

  // 更新浏览次数
  updateViewCount(id) {
    // 实际应该调用API更新
    console.log('更新浏览次数:', id);
  },

  // 图片预览
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const { images } = this.data.spot;
    
    wx.previewImage({
      current: images[index],
      urls: images
    });
  },

  // 播放视频
  playVideo() {
    this.setData({ showVideoPlayer: true });
  },

  // 关闭视频
  closeVideo() {
    this.setData({ showVideoPlayer: false });
  },

  // 打开360度浏览
  open360Viewer() {
    this.setData({ show360Viewer: true });
      wx.showToast({
      title: '360度浏览功能开发中',
      icon: 'none'
    });
  },

  // 关闭360度浏览
  close360Viewer() {
    this.setData({ show360Viewer: false });
  },

  // 观看直播
  watchLiveStream() {
    wx.showToast({
      title: '云赏花直播功能开发中',
      icon: 'none'
    });
  },

  // 导航到此地
  navigateToSpot() {
    const { spot } = this.data;
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

  // 收藏
  toggleFavorite() {
    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    });
  },

  // 查看附近赏花点
  viewNearbySpot(e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/pages/flower/detail/detail?id=${id}`
    });
  },

  // 分享
  onShareAppMessage() {
    const { spot } = this.data;
    return {
      title: `${spot.name} - 华农赏花地图`,
      path: `/pages/flower/detail/detail?id=${spot.id}`,
      imageUrl: spot.images[0]
    };
  },

  // 检查用户打卡状态
  checkUserCheckinStatus(spotId) {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || { id: 1 };

    flowerApi.getUserCheckinStatus(userInfo.id, spotId)
      .then(res => {
        if (res.code === 0 && res.data.hasCheckedIn) {
          const checkin = res.data.checkin;
          this.setData({
            checkInStatus: {
              time: new Date(checkin.created_at).toLocaleString('zh-CN'),
              image: checkin.images[0] || null
            }
          });
        }
      })
      .catch(err => {
        console.error('获取打卡状态失败:', err);
      });
  },

  // 加载打卡状态（已废弃，改用服务器数据）
  loadCheckInStatus(spotId) {
    // 从本地存储读取打卡记录
    const checkInKey = `checkin_${spotId}`;
    const checkInStatus = wx.getStorageSync(checkInKey);
    if (checkInStatus) {
      this.setData({ checkInStatus });
    }
  },

  // 打卡
  checkIn() {
    const { spot } = this.data;

    // 选择照片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];

        wx.showLoading({ title: '上传中...' });

        // 上传图片到服务器
        flowerApi.uploadCheckinImage(tempFilePath)
          .then(uploadRes => {
            const imageUrl = uploadRes.data.url;

            // 获取用户信息（简化处理，实际应从登录状态获取）
            const userInfo = wx.getStorageSync('userInfo') || { id: 1 };

            // 创建打卡记录
            return flowerApi.createCheckin({
              userId: userInfo.id,
              spotId: spot.id,
              images: [imageUrl],
              comment: '',
              rating: 5
            });
          })
          .then(() => {
            wx.hideLoading();

            // 保存打卡状态到本地（用于快速显示）
            const checkInStatus = {
              time: new Date().toLocaleString('zh-CN'),
              image: null // 服务器图片暂不缓存到本地
            };
            const checkInKey = `checkin_${spot.id}`;
            wx.setStorageSync(checkInKey, checkInStatus);

            this.setData({ checkInStatus });

            wx.showToast({
              title: '打卡成功！',
              icon: 'success'
            });

            // 重新加载详情（更新打卡次数）
            this.loadSpotDetail(spot.id);
          })
          .catch(err => {
            wx.hideLoading();
            console.error('打卡失败:', err);
            wx.showToast({
              title: err.message || '打卡失败',
              icon: 'none'
            });
          });
      }
    });
  },

  // 查看打卡照片
  viewCheckInImage() {
    const { checkInStatus } = this.data;
    if (checkInStatus && checkInStatus.image) {
      wx.previewImage({
        urls: [checkInStatus.image],
        current: checkInStatus.image
      });
    }
  }
});
