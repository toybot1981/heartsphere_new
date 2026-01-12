// pages/index/index.js
// 入口页面 - 直接跳转到 web-view

Page({
  data: {
    // 注意：微信小程序 web-view 必须使用 HTTPS 协议
    // 并且需要在微信公众平台配置业务域名
    h5Url: 'http://localhost:3000/mobile.html' // H5 页面地址，生产环境地址（必须 HTTPS）
  },

  onLoad() {
    // // 直接跳转到 web-view 页面
     const h5Url = this.data.h5Url;
    
    // // 检查 URL 是否为 HTTPS（生产环境要求）
    // if (!h5Url.startsWith('https://') && !h5Url.startsWith('http://localhost')) {
    //   wx.showModal({
    //     title: '配置错误',
    //     content: '生产环境必须使用 HTTPS 协议，请将 URL 改为 https://heartsphere.cn',
    //     showCancel: false
    //   });
    //   return;
    // }
    
    wx.redirectTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(h5Url)}`
    });
  }
});
