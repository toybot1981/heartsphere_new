// pages/webview/index.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: '', // webview加载的URL
    loading: true,
    error: false,
    errorMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('[WebView Page] 页面加载', options);
    
    // 获取要加载的URL
    let url = app.globalData.mobileUrl;
    
    // 如果URL参数中有url，使用参数中的URL
    if (options.url) {
      url = decodeURIComponent(options.url);
    }
    
    // 添加必要的参数
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}from=miniprogram&timestamp=${Date.now()}`;
    
    console.log('[WebView Page] 加载URL:', url);
    
    this.setData({
      url: url,
      loading: true,
      error: false
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('[WebView Page] 页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('[WebView Page] 页面显示');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('[WebView Page] 页面隐藏');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('[WebView Page] 页面卸载');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('[WebView Page] 下拉刷新');
    // 重新加载webview
    this.reloadWebView();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('[WebView Page] 上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '心域 - 探索你的内心世界',
      path: '/pages/webview/index',
      imageUrl: ''
    };
  },

  /**
   * WebView加载完成
   */
  onWebViewLoad(e) {
    console.log('[WebView Page] WebView加载完成', e);
    this.setData({
      loading: false,
      error: false
    });
  },

  /**
   * WebView加载错误
   */
  onWebViewError(e) {
    console.error('[WebView Page] WebView加载错误', e);
    this.setData({
      loading: false,
      error: true,
      errorMessage: '页面加载失败，请检查网络连接'
    });
  },

  /**
   * 接收WebView消息
   */
  onWebViewMessage(e) {
    console.log('[WebView Page] 收到WebView消息', e.detail.data);
    // 可以在这里处理来自WebView的消息
    // 例如：页面跳转、数据同步等
  },

  /**
   * 重新加载WebView
   */
  reloadWebView() {
    console.log('[WebView Page] 重新加载WebView');
    const url = this.data.url.split('&timestamp=')[0];
    const separator = url.includes('?') ? '&' : '?';
    const newUrl = `${url}${separator}from=miniprogram&timestamp=${Date.now()}`;
    
    this.setData({
      url: newUrl,
      loading: true,
      error: false
    });
  },

  /**
   * 返回按钮点击
   */
  onBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        // 如果无法返回，则重新加载
        this.reloadWebView();
      }
    });
  }
});
