/**
 * Mobile版本入口点/主页组件
 * 参照PC版本的EntryPoint，但保持Mobile UI独立
 */

import React, { useState, memo } from 'react';
import { WorldStyle, WORLD_STYLE_DESCRIPTIONS } from '../../types';
import { MobileLoginScreen } from './MobileLoginScreen';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { MobileColors, MobileCardStyles } from '../components/MobileStyleGuide';

interface MobileEntryPointScreenProps {
  onNavigate: (screen: 'realWorld' | 'sceneSelection' | 'profile') => void;
  onOpenSettings: () => void;
  nickname: string;
  avatarUrl?: string;
  currentStyle: WorldStyle;
  onStyleChange: (style: WorldStyle) => void;
  onLoginSuccess?: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  isGuest?: boolean;
  onGuestEnter?: (nickname: string) => void;
}

/**
 * Mobile版本入口点/主页组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileEntryPointScreen: React.FC<MobileEntryPointScreenProps> = memo(({
  onNavigate,
  onOpenSettings,
  nickname,
  avatarUrl,
  currentStyle,
  onStyleChange,
  onLoginSuccess,
  isGuest = false,
  onGuestEnter,
}) => {
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        background: 'var(--gradient-bg)',
      }}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, var(--bg-primary) 70%, transparent)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, var(--color-primary) 30%, var(--bg-secondary) 50%, var(--bg-primary))',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* Avatar */}
        {avatarUrl && (
          <div className="mb-6 flex justify-center">
            <MobileLazyImage
              src={avatarUrl}
              alt={nickname}
              className={`w-24 h-24 rounded-full border-4 ${MobileColors.border.accent} ${MobileCardStyles.shadow}`}
            />
          </div>
        )}

        {/* Greeting */}
        <h1 className={`text-4xl font-bold mb-4 text-transparent bg-clip-text ${MobileColors.primary.gradientText}`}>
          {isGuest ? `你好，${nickname}` : `欢迎回来，${nickname}`}
        </h1>
        <p className={`${MobileColors.text.muted} mb-8 text-sm`}>
          {isGuest ? '以访客身份体验心域' : '继续你的心域之旅'}
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-3 mb-6">
          <MobileTouchableButton
            onClick={() => onNavigate('realWorld')}
            variant="primary"
            size="lg"
            fullWidth
            className={MobileCardStyles.shadow}
            aria-label="进入现实记录"
          >
            📝 现实记录
          </MobileTouchableButton>
          <MobileTouchableButton
            onClick={() => onNavigate('sceneSelection')}
            variant="primary"
            size="lg"
            fullWidth
            className={`${MobileCardStyles.shadow} ${MobileColors.primary.gradient} ${MobileColors.primary.gradientHover}`}
            aria-label="进入心域"
          >
            🌍 进入心域
          </MobileTouchableButton>
          <MobileTouchableButton
            onClick={() => onNavigate('profile')}
            variant="secondary"
            size="lg"
            fullWidth
            aria-label="查看个人资料"
          >
            👤 我的资料
          </MobileTouchableButton>
        </div>

        {/* Guest Login Prompt */}
        {isGuest && (
          <div className={`mt-6 p-4 ${MobileCardStyles.default}`}>
            <p className={`${MobileColors.text.muted} text-sm mb-3`}>登录账户可同步数据</p>
            <MobileTouchableButton
              onClick={() => setShowLoginScreen(true)}
              variant="primary"
              size="md"
              fullWidth
              aria-label="登录账户"
            >
              登录账户
            </MobileTouchableButton>
          </div>
        )}

        {/* Settings Button */}
        <MobileTouchableButton
          onClick={onOpenSettings}
          variant="ghost"
          size="sm"
          className="mt-4"
          aria-label="打开设置"
        >
          设置
        </MobileTouchableButton>
      </div>

      {/* Login Screen */}
      {showLoginScreen && (
        <MobileLoginScreen
          onLoginSuccess={(method, identifier, isFirstLogin, worlds) => {
            setShowLoginScreen(false);
            onLoginSuccess?.(method, identifier, isFirstLogin, worlds);
          }}
          onCancel={() => setShowLoginScreen(false)}
        />
      )}
    </div>
  );
});

MobileEntryPointScreen.displayName = 'MobileEntryPointScreen';
