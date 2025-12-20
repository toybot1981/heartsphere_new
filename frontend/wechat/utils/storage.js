// utils/storage.js
// 存储服务

export const storageService = {
  // 保存状态
  saveState(state) {
    try {
      wx.setStorageSync('gameState', state);
      return Promise.resolve();
    } catch (e) {
      console.error('保存状态失败:', e);
      return Promise.reject(e);
    }
  },

  // 加载状态
  loadState() {
    try {
      const state = wx.getStorageSync('gameState');
      return Promise.resolve(state || null);
    } catch (e) {
      console.error('加载状态失败:', e);
      return Promise.resolve(null);
    }
  },

  // 保存 token
  saveToken(token) {
    try {
      wx.setStorageSync('auth_token', token);
    } catch (e) {
      console.error('保存token失败:', e);
    }
  },

  // 获取 token
  getToken() {
    try {
      return wx.getStorageSync('auth_token') || null;
    } catch (e) {
      return null;
    }
  },

  // 清除所有数据
  clearAll() {
    try {
      wx.clearStorageSync();
    } catch (e) {
      console.error('清除存储失败:', e);
    }
  }
};







