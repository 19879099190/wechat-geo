// pages/news/detail/detail.js
Page({
  data: {
    newsDetail: null
  },

  onLoad(options) {
    if (options.id && options.title && options.time && options.content) {
      this.setData({
        newsDetail: {
          id: options.id,
          title: decodeURIComponent(options.title),
          time: options.time,
          content: decodeURIComponent(options.content)
        }
      });
    }
  }
});
