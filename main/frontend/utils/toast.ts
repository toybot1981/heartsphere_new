/**
 * Toast 提示工具
 */

/**
 * 显示同步错误提示
 */
export const showSyncErrorToast = (operation: string): void => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 z-50 bg-red-600/90 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-400/50 max-w-md animate-fade-in';
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="text-2xl">⚠️</div>
      <div class="flex-1">
        <div class="font-bold text-lg mb-1">远程同步失败</div>
        <div class="text-sm text-red-100">${operation}已保存到本地，但未能同步到服务器。请检查网络连接后重试。</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white text-xl leading-none">×</button>
    </div>
  `;
  document.body.appendChild(toast);
  
  // 5秒后自动消失
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
};

