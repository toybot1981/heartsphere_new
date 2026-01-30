/**
 * 图片内存缓存服务
 * 用于在页面回退时快速显示已加载的图片，避免重新加载
 * 使用简单的 Map 存储已加载的图片 URL
 */

class ImageMemoryCache {
  private cache: Map<string, boolean> = new Map();
  private maxSize: number = 1000; // 最大缓存数量

  /**
   * 检查图片是否已加载过
   */
  has(url: string): boolean {
    if (!url) return false;
    return this.cache.has(url);
  }

  /**
   * 标记图片为已加载
   */
  set(url: string): void {
    if (!url) return;
    
    // 如果缓存已满，删除最旧的条目（简单策略：删除第一个）
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(url, true);
  }

  /**
   * 删除缓存
   */
  delete(url: string): void {
    if (!url) return;
    this.cache.delete(url);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }
}

// 单例
export const imageMemoryCache = new ImageMemoryCache();
