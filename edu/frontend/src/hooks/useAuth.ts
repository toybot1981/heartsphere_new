// 用户认证 Hook

import { useState, useEffect } from 'react';
import { getCurrentUserId, getCurrentUserRole, isAuthenticated, getCurrentUserIdSync } from '../utils/auth';

interface AuthInfo {
  userId: number | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 获取当前用户认证信息的 Hook
 * @returns 用户认证信息
 */
export const useAuth = (): AuthInfo => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    userId: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const loadAuthInfo = async () => {
      try {
        const [userId, role, authenticated] = await Promise.all([
          getCurrentUserId(),
          getCurrentUserRole(),
          isAuthenticated(),
        ]);

        setAuthInfo({
          userId,
          role,
          isAuthenticated: authenticated,
          isLoading: false,
        });
      } catch (error) {
        console.error('加载认证信息失败:', error);
        setAuthInfo({
          userId: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadAuthInfo();

    // 可选：监听 token 变化，重新加载认证信息
    const interval = setInterval(loadAuthInfo, 60000); // 每分钟检查一次
    return () => clearInterval(interval);
  }, []);

  return authInfo;
};

/**
 * 获取当前用户ID的 Hook（简化版）
 * @param fallbackId 如果无法获取用户ID时使用的默认ID
 * @returns 用户ID
 */
export const useCurrentUserId = (fallbackId: number = 1): number => {
  const [userId, setUserId] = useState<number>(fallbackId);
  
  useEffect(() => {
    // 先尝试同步获取（避免闪烁）
    const syncUserId = getCurrentUserIdSync();
    if (syncUserId) {
      setUserId(syncUserId);
      return;
    }
    
    // 如果同步获取失败，尝试异步获取
    getCurrentUserId().then(id => {
      if (id) {
        setUserId(id);
      }
    });
  }, []);
  
  return userId;
};
