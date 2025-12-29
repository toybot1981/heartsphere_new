import { useState, useEffect } from 'react';
import type { ShareConfig } from '../services/api/heartconnect/types';

interface ExperienceModeState {
  isActive: boolean;
  shareConfig: ShareConfig | null;
  visitorId: number | null;
  startTime: number | null;
}

/**
 * 体验模式Hook
 * 管理访问他人心域时的体验模式状态
 */
export const useExperienceMode = () => {
  const [state, setState] = useState<ExperienceModeState>({
    isActive: false,
    shareConfig: null,
    visitorId: null,
    startTime: null,
  });
  
  /**
   * 进入体验模式
   */
  const enterExperienceMode = (shareConfig: ShareConfig, visitorId: number) => {
    setState({
      isActive: true,
      shareConfig,
      visitorId,
      startTime: Date.now(),
    });
    
    // 保存到sessionStorage（体验模式数据不持久化）
    sessionStorage.setItem('experience_mode', JSON.stringify({
      shareConfigId: shareConfig.id,
      visitorId,
      startTime: Date.now(),
    }));
  };
  
  /**
   * 离开体验模式
   */
  const leaveExperienceMode = () => {
    setState({
      isActive: false,
      shareConfig: null,
      visitorId: null,
      startTime: null,
    });
    
    // 清除sessionStorage
    sessionStorage.removeItem('experience_mode');
  };
  
  /**
   * 初始化（从sessionStorage恢复）
   */
  useEffect(() => {
    const saved = sessionStorage.getItem('experience_mode');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // 这里可以重新加载shareConfig
        // 暂时只恢复基本状态
        setState(prev => ({
          ...prev,
          isActive: true,
          visitorId: data.visitorId,
          startTime: data.startTime,
        }));
      } catch (err) {
        console.error('恢复体验模式状态失败:', err);
      }
    }
  }, []);
  
  /**
   * 获取体验时长（秒）
   */
  const getExperienceDuration = (): number => {
    if (!state.startTime) return 0;
    return Math.floor((Date.now() - state.startTime) / 1000);
  };
  
  return {
    ...state,
    enterExperienceMode,
    leaveExperienceMode,
    getExperienceDuration,
  };
};

