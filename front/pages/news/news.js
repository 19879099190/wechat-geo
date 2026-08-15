// pages/news/news.js
Page({
  data: {
    newsList: [
      {
        id: 1,
        title: '华农校园导航小程序正式上线',
        time: '2026-12-31',
        content: '为方便师生校园出行，华南农业大学推出全新校园导航小程序。主要功能包括：校园地图导航、POI信息查询、充电桩服务、校巴时刻表等。'
      },
      {
        id: 2,
        title: '新增充电桩投入使用',
        time: '2027-01-31',
        content: '学校在多个区域新增50个智能充电桩，分布在学生宿舍区、教学区、图书馆周边和体育场馆。所有充电桩均支持扫码支付，可通过小程序查看实时状态并预约使用。'
      },
      {
        id: 3,
        title: '春季学术讲座周活动通知',
        time: '2027-02-20',
        content: '本学期学术讲座周将于3月15日-20日举行，包括人工智能与农业现代化、生态文明建设、大数据应用等主题讲座。'
      },
      {
        id: 4,
        title: '校园文化艺术节即将开幕',
        time: '2027-02-22',
        content: '第十五届校园文化艺术节将于4月1日在大礼堂盛大开幕，包括话剧表演、歌手大赛、书画摄影展、舞蹈大赛等活动。'
      },
      {
        id: 5,
        title: '图书馆开放时间调整通知',
        time: '2027-02-18',
        content: '图书馆从3月1日起延长开放时间。周一至周五：7:00-23:00，周六至周日：8:00-22:00，自习室24小时开放。'
      }
    ]
  },

  onLoad() {
    console.log('校园动态页面加载');
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.newsList.find(news => news.id === id);
    
    if (item) {
      wx.navigateTo({
        url: `/pages/news/detail/detail?id=${id}&title=${encodeURIComponent(item.title)}&time=${item.time}&content=${encodeURIComponent(item.content)}`
      });
    }
  }
});
