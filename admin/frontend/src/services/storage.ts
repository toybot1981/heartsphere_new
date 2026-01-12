/**
 * 存储服务占位符 - Admin 前端版本
 * 简化版本，仅提供必要的功能
 */

export const storageService = {
  /**
   * 加载状态（简化版本，使用 localStorage）
   */
  async loadState(): Promise<any | null> {
    try {
      const savedState = localStorage.getItem('heartsphere_game_state');
      if (savedState) {
        return JSON.parse(savedState);
      }
      return null;
    } catch (error) {
      console.error('[storageService] 加载状态失败:', error);
      return null;
    }
  },

  /**
   * 保存状态（简化版本，使用 localStorage）
   */
  async saveState(state: any): Promise<void> {
    try {
      localStorage.setItem('heartsphere_game_state', JSON.stringify(state));
    } catch (error) {
      console.error('[storageService] 保存状态失败:', error);
      throw error;
    }
  },
};
