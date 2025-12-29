import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExperienceModeBanner } from './ExperienceModeBanner';
import { WarmMessageModal } from './WarmMessageModal';
import { useExperienceMode } from '../../hooks/useExperienceMode';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { ShareConfig } from '../../services/api/heartconnect/types';

interface ExperienceModeContextType {
  isActive: boolean;
  shareConfig: ShareConfig | null;
  enterExperienceMode: (shareConfig: ShareConfig, visitorId: number) => void;
  leaveExperienceMode: () => void;
}

const ExperienceModeContext = createContext<ExperienceModeContextType | null>(null);

/**
 * 体验模式Provider
 * 提供体验模式状态管理
 */
export const ExperienceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isActive,
    shareConfig,
    enterExperienceMode,
    leaveExperienceMode,
  } = useExperienceMode();
  
  const [showWarmMessageModal, setShowWarmMessageModal] = useState(false);
  
  const handleLeave = () => {
    setShowWarmMessageModal(true);
  };
  
  const handleWarmMessageSubmit = async (message: string) => {
    if (shareConfig) {
      try {
        await heartConnectApi.createWarmMessage(shareConfig.id, message);
      } catch (err) {
        console.error('发送暖心留言失败:', err);
      }
    }
    leaveExperienceMode();
    setShowWarmMessageModal(false);
  };
  
  const handleSkipWarmMessage = () => {
    leaveExperienceMode();
    setShowWarmMessageModal(false);
  };
  
  return (
    <ExperienceModeContext.Provider
      value={{
        isActive,
        shareConfig,
        enterExperienceMode,
        leaveExperienceMode,
      }}
    >
      {isActive && shareConfig && (
        <ExperienceModeBanner
          heartSphereName={shareConfig.shareCode} // 可以使用心域名称
          onLeave={handleLeave}
        />
      )}
      
      <WarmMessageModal
        isOpen={showWarmMessageModal}
        onClose={handleSkipWarmMessage}
        onSubmit={handleWarmMessageSubmit}
      />
      
      {children}
    </ExperienceModeContext.Provider>
  );
};

/**
 * 使用体验模式Hook
 */
export const useExperienceModeContext = () => {
  const context = useContext(ExperienceModeContext);
  if (!context) {
    throw new Error('useExperienceModeContext must be used within ExperienceModeProvider');
  }
  return context;
};

