// pages/index/index.js
// 入口页面 - 直接跳转到 web-view

Page({
  data: {
    h5Url: 'http://localhost:3000' // H5 页面地址，可以修改为生产环境地址
  },

  onLoad() {
    // 直接跳转到 web-view 页面
    const h5Url = this.data.h5Url;
    wx.redirectTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(h5Url)}`
    });
  }
});
