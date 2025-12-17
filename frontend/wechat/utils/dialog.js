// utils/dialog.js
// 对话框工具函数

// 显示提示
export function showAlert(message, title = '提示', type = 'info') {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: message,
      showCancel: false,
      confirmText: '确定',
      success: () => {
        resolve();
      }
    });
  });
}

// 显示确认对话框
export function showConfirm(message, title = '确认') {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: message,
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          reject(false);
        }
      }
    });
  });
}

// 显示加载提示
export function showLoading(message = '加载中...') {
  wx.showLoading({
    title: message,
    mask: true
  });
}

// 隐藏加载提示
export function hideLoading() {
  wx.hideLoading();
}

// 显示成功提示
export function showSuccess(message) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  });
}

// 显示错误提示
export function showError(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}




