import { useCallback } from 'react';
import { authApi, worldApi } from '../services/api';
import { showAlert } from '../utils/dialog';

/**
 * 认证相关Hook
 * 封装了登录、注册、用户信息获取等逻辑
 */
export const useAuth = () => {
  // 处理登录成功
  const handleLoginSuccess = useCallback(async (
    method: 'password' | 'wechat',
    identifier: string,
    isFirstLogin?: boolean,
    worlds?: any[]
  ): Promise<{
    userInfo?: any;
    token: string | null;
    shouldShowWizard: boolean;
    initializationData?: { token: string; userId: number; worldId: number };
  }> => {
    const token = localStorage.getItem('auth_token');
    console.log('登录成功:', method, identifier, '首次登录:', isFirstLogin);
    
    if (!token) {
      return {
        token: null,
        shouldShowWizard: false,
      };
    }

    try {
      // 使用token获取完整用户信息
      const userInfo = await authApi.getCurrentUser(token);
      
      // 如果是首次登录，准备初始化向导数据
      let initializationData: { token: string; userId: number; worldId: number } | undefined;
      if (isFirstLogin) {
        const remoteWorlds = worlds || await worldApi.getAllWorlds(token);
        let userWorldId: number | null = null;
        
        if (remoteWorlds && remoteWorlds.length > 0) {
          userWorldId = remoteWorlds[0].id;
        } else {
          try {
            const worldName = `${userInfo.nickname || userInfo.username}的世界`;
            const newWorld = await worldApi.createWorld(worldName, '', token);
            userWorldId = newWorld.id;
          } catch (error) {
            console.error('创建世界失败:', error);
            showAlert('无法创建世界，请刷新重试');
            return {
              userInfo,
              token,
              shouldShowWizard: false,
            };
          }
        }
        
        if (userWorldId) {
          initializationData = {
            token: token,
            userId: userInfo.id,
            worldId: userWorldId
          };
        }
      }

      return {
        userInfo,
        token,
        shouldShowWizard: !!isFirstLogin && !!initializationData,
        initializationData,
      };
    } catch (err) {
      console.error('获取用户信息失败:', err);
      return {
        token,
        shouldShowWizard: false,
      };
    }
  }, []);

  // 处理登出
  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    window.location.reload();
  }, []);

  return {
    handleLoginSuccess,
    handleLogout,
  };
};


