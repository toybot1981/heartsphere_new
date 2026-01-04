// app.js
App({
  onLaunch() {
    console.log('[WeChat MiniProgram] 小程序启动');
    
    // 检查小程序版本更新
    this.checkUpdate();
    
    // 获取系统信息
    this.getSystemInfo();
  },

  onShow() {
    console.log('[WeChat MiniProgram] 小程序显示');
  },

  onHide() {
    console.log('[WeChat MiniProgram] 小程序隐藏');
  },

  onError(msg) {
    console.error('[WeChat MiniProgram] 小程序错误:', msg);
  },

  /**
   * 检查小程序更新
   */
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('[WeChat MiniProgram] 发现新版本');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.error('[WeChat MiniProgram] 新版本下载失败');
      });
    }
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('[WeChat MiniProgram] 系统信息:', res);
      }
    });
  },

  globalData: {
    systemInfo: null,
    mobileUrl: 'http://heartsphere.cn' // Mobile版本地址
  }
});
