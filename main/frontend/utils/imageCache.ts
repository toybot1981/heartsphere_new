/**
 * 图片本地缓存服务
 * 用于缓存手工生成的character头像（不包含预置头像）
 */
class ImageCacheService {
  private dbName = 'heartsphere-image-cache';
  private storeName = 'images';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * 初始化IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('无法打开IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 检查URL是否为预置头像或占位符
   * 预置头像通常以特定路径开头（如 /api/images/files/avatar/ 或包含 system_resources）
   * 占位符包括 picsum.photos 等
   */
  private isPresetAvatar(url: string): boolean {
    if (!url) return false;
    
    // 预置头像或占位符的特征：
    // 1. 包含 system_resources 或 avatar 路径
    // 2. 来自服务器静态资源路径
    // 3. 包含 placeholder 路径
    // 4. 使用 picsum.photos 占位符服务
    const presetPatterns = [
      /\/api\/images\/files\/avatar\//,
      /system_resources/,
      /placeholder:\/\/avatar\//,
      /picsum\.photos/i,  // 占位符图片服务
    ];
    
    return presetPatterns.some(pattern => pattern.test(url));
  }

  /**
   * 将图片URL缓存到本地
   * @param imageUrl 图片URL（可以是远程URL或base64）
   * @param characterId 角色ID（可选，用于关联）
   * @returns 本地缓存URL（blob URL）
   */
  async cacheImage(imageUrl: string, characterId?: string): Promise<string> {
    // 如果是预置头像，不缓存，直接返回原URL
    if (this.isPresetAvatar(imageUrl)) {
      return imageUrl;
    }

    // 如果已经是blob URL，说明已经缓存过
    if (imageUrl.startsWith('blob:')) {
      return imageUrl;
    }

    await this.init();

    if (!this.db) {
      throw new Error('IndexedDB未初始化');
    }

    // 检查是否已缓存
    const existing = await this.getCachedImage(imageUrl);
    if (existing) {
      return existing.blobUrl;
    }

    try {
      // 下载图片
      let blob: Blob;
      if (imageUrl.startsWith('data:')) {
        // Base64图片
        const response = await fetch(imageUrl);
        blob = await response.blob();
      } else {
        // 远程URL - 尝试直接fetch
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`下载图片失败: ${response.statusText}`);
          }
          blob = await response.blob();
        } catch (fetchError: any) {
          // 如果是CORS错误，尝试通过后端代理下载
          if (fetchError.name === 'TypeError' && (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch'))) {
            console.warn('[ImageCache] 遇到CORS限制，尝试通过后端代理下载:', imageUrl);
            try {
              // 通过后端代理下载
              const { imageApi } = await import('../services/api');
              const proxyResult = await imageApi.proxyDownload(imageUrl);
              
              if (proxyResult.success && proxyResult.dataUrl) {
                // 将 data URL 转换为 blob
                const response = await fetch(proxyResult.dataUrl);
                blob = await response.blob();
                console.log('[ImageCache] 通过后端代理下载成功，大小:', proxyResult.size, 'bytes');
              } else {
                throw new Error(proxyResult.error || '后端代理下载失败');
              }
            } catch (proxyError: any) {
              // 代理也失败，尝试使用canvas API作为最后手段
              console.warn('[ImageCache] 后端代理下载失败，尝试使用canvas API:', proxyError.message);
              try {
                blob = await this.loadImageViaCanvas(imageUrl);
              } catch (canvasError: any) {
                // Canvas也失败（通常是Tainted canvas错误），说明服务器完全没有CORS支持
                // 对于这种情况，直接返回原始URL，不缓存
                console.warn('[ImageCache] Canvas加载也失败，返回原始URL（不缓存）:', canvasError.message);
                return imageUrl;
              }
            }
          } else {
            throw fetchError;
          }
        }
      }

      // 创建blob URL
      const blobUrl = URL.createObjectURL(blob);

      // 保存到IndexedDB
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          url: imageUrl,
          blob: blob,
          blobUrl: blobUrl,
          characterId: characterId,
          timestamp: Date.now(),
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('[ImageCache] 图片已缓存:', imageUrl);
      return blobUrl;
    } catch (error) {
      console.error('[ImageCache] 缓存图片失败:', error);
      // 如果缓存失败，返回原URL
      return imageUrl;
    }
  }

  /**
   * 获取缓存的图片
   */
  private async getCachedImage(url: string): Promise<{ blobUrl: string; timestamp: number } | null> {
    await this.init();

    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // 如果blob URL已失效，重新创建
          if (!this.isBlobUrlValid(result.blobUrl)) {
            const blobUrl = URL.createObjectURL(result.blob);
            // 更新blob URL
            const updateTransaction = this.db!.transaction([this.storeName], 'readwrite');
            const updateStore = updateTransaction.objectStore(this.storeName);
            result.blobUrl = blobUrl;
            updateStore.put(result);
          }
          resolve({
            blobUrl: result.blobUrl,
            timestamp: result.timestamp,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 检查blob URL是否有效
   */
  private isBlobUrlValid(blobUrl: string): boolean {
    try {
      // 尝试创建一个Image对象来测试blob URL
      const img = new Image();
      img.src = blobUrl;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 使用canvas API加载图片（绕过CORS限制）
   * 注意：这要求图片服务器允许跨域加载（通过img标签），但不要求CORS headers
   */
  private async loadImageViaCanvas(imageUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 尝试使用CORS，如果不支持会回退
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('无法获取canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('无法将canvas转换为blob'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('无法加载图片'));
      };

      // 如果设置了crossOrigin但服务器不支持CORS，可能会失败
      // 在这种情况下，移除crossOrigin属性重试
      if (img.complete && img.naturalWidth === 0) {
        img.crossOrigin = undefined;
        img.src = imageUrl;
      } else {
        img.src = imageUrl;
      }
    });
  }

  /**
   * 获取缓存的图片URL（如果已缓存）
   */
  async getCachedUrl(originalUrl: string): Promise<string | null> {
    // 如果是预置头像，直接返回原URL
    if (this.isPresetAvatar(originalUrl)) {
      return originalUrl;
    }

    // 如果已经是blob URL，直接返回
    if (originalUrl.startsWith('blob:')) {
      return originalUrl;
    }

    const cached = await this.getCachedImage(originalUrl);
    return cached ? cached.blobUrl : null;
  }

  /**
   * 清理旧的缓存（保留最近30天的）
   */
  async cleanupOldCache(daysToKeep: number = 30): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          // 释放旧的blob URL
          URL.revokeObjectURL(cursor.value.blobUrl);
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * 删除特定图片的缓存
   */
  async removeCache(url: string): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    // 获取缓存的blob URL并释放
    const cached = await this.getCachedImage(url);
    if (cached) {
      URL.revokeObjectURL(cached.blobUrl);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 上传图片到服务器并缓存本地URL
   * 如果上传失败，使用本地缓存
   */
  async uploadAndCache(
    imageUrl: string,
    characterId: string,
    uploadFn: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  ): Promise<string> {
    // 如果是预置头像，直接返回原URL
    if (this.isPresetAvatar(imageUrl)) {
      return imageUrl;
    }

    try {
      // 先缓存到本地
      const cachedUrl = await this.cacheImage(imageUrl, characterId);

      // 尝试上传到服务器
      try {
        // 从blob URL获取blob
        const response = await fetch(cachedUrl);
        const blob = await response.blob();
        const file = new File([blob], `character-${characterId}-avatar.png`, { type: blob.type });

        const uploadResult = await uploadFn(file);
        if (uploadResult.success && uploadResult.url) {
          console.log('[ImageCache] 图片已上传到服务器:', uploadResult.url);
          // 使用服务器URL，但仍保留本地缓存
          return uploadResult.url;
        }
      } catch (uploadError) {
        console.warn('[ImageCache] 上传失败，使用本地缓存:', uploadError);
      }

      // 上传失败或未上传，返回本地缓存URL
      return cachedUrl;
    } catch (error) {
      console.error('[ImageCache] 缓存失败，使用原URL:', error);
      return imageUrl;
    }
  }
}

// 单例
export const imageCacheService = new ImageCacheService();

