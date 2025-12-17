// pages/webview/webview.js
// 使用 web-view 组件嵌入 mobile 版本

Page({
  data: {
    url: '' // H5 页面地址
  },

  onLoad(options) {
    // 获取要加载的 H5 页面地址
    // 可以是本地开发服务器或生产环境地址
    const h5Url = options.url || 'https://your-domain.com/mobile';
    
    this.setData({
      url: decodeURIComponent(h5Url)
    });
  },

  onMessage(e) {
    // 接收来自 H5 页面的消息
    console.log('收到 H5 消息:', e.detail.data);
    
    // 可以处理来自 H5 的消息，比如登录状态、数据同步等
    const data = e.detail.data[0];
    if (data && data.type === 'login') {
      // 处理登录逻辑
      wx.setStorageSync('auth_token', data.token);
    }
  }
});


