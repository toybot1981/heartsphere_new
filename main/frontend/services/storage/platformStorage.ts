/**
 * 平台兼容的存储服务
 * 支持浏览器（localStorage）和微信小程序（wx.storage）
 */

import { isBrowser, isWeChatMiniProgram, safeLocalStorage } from '../../utils/platform';

/**
 * 存储接口
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * 浏览器localStorage适配器
 */
class BrowserStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor() {
    const storage = safeLocalStorage();
    if (!storage) {
      throw new Error('localStorage is not available');
    }
    this.storage = storage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error('[BrowserStorage] getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error('[BrowserStorage] setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('[BrowserStorage] removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('[BrowserStorage] clear error:', error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('[BrowserStorage] getAllKeys error:', error);
      return [];
    }
  }
}

/**
 * 微信小程序storage适配器
 */
class WeChatStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      if (typeof wx === 'undefined') {
        resolve(null);
        return;
      }
      wx.getStorage({
        key,
        success: (res) => {
          resolve(res.data || null);
        },
        fail: () => {
          resolve(null);
        },
      });
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined') {
        reject(new Error('wx is not available'));
        return;
      }
      wx.setStorage({
        key,
        data: value,
        success: () => {
          resolve();
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
  }

  async removeItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof wx === 'undefined') {
        resolve();
        return;
      }
      wx.removeStorage({
        key,
        success: () => {
          resolve();
        },
        fail: () => {
          resolve(); // 即使失败也resolve，因为key可能不存在
        },
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof wx === 'undefined') {
        resolve();
        return;
      }
      wx.clearStorage({
        success: () => {
          resolve();
        },
        fail: () => {
          resolve(); // 即使失败也resolve
        },
      });
    });
  }

  async getAllKeys(): Promise<string[]> {
    return new Promise((resolve) => {
      if (typeof wx === 'undefined') {
        resolve([]);
        return;
      }
      wx.getStorageInfo({
        success: (res) => {
          resolve(res.keys || []);
        },
        fail: () => {
          resolve([]);
        },
      });
    });
  }
}

/**
 * 创建存储适配器
 */
export const createStorageAdapter = (): StorageAdapter => {
  if (isWeChatMiniProgram) {
    return new WeChatStorageAdapter();
  }
  if (isBrowser) {
    return new BrowserStorageAdapter();
  }
  throw new Error('Unsupported platform');
};

/**
 * 平台存储实例
 */
export const platformStorage = createStorageAdapter();
