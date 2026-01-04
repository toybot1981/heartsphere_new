// pages/webview/webview.js
// 使用 web-view 组件嵌入 mobile 版本

Page({
  data: {
    url: '', // H5 页面地址
    loadError: false // 加载错误标志
  },

  onLoad(options) {
    // 获取要加载的 H5 页面地址
    // 注意：生产环境必须使用 HTTPS，且需要在微信公众平台配置业务域名
    let h5Url = options.url || 'https://heartsphere.cn';
    
    // 如果是生产环境，确保使用 HTTPS
    if (h5Url.includes('heartsphere.cn') && !h5Url.startsWith('https://')) {
      h5Url = h5Url.replace('http://', 'https://');
    }
    
    this.setData({
      url: decodeURIComponent(h5Url)
    });
  },

  onError(e) {
    // web-view 加载失败
    console.error('web-view 加载失败:', e);
    this.setData({
      loadError: true
    });
    
    wx.showModal({
      title: '加载失败',
      content: '页面加载失败，请检查：\n1. 域名是否已配置为业务域名\n2. 是否使用 HTTPS 协议\n3. 网络连接是否正常',
      showCancel: true,
      cancelText: '重试',
      confirmText: '确定',
      success: (res) => {
        if (res.cancel) {
          // 重试加载
          this.setData({
            loadError: false,
            url: this.data.url + '?t=' + Date.now() // 添加时间戳强制刷新
          });
        }
      }
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





