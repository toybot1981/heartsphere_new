/**
 * Mobile版本入口点/主页组件
 * 参照PC版本的EntryPoint，但保持Mobile UI独立
 */

import React, { useState, memo } from 'react';
import { WorldStyle, WORLD_STYLE_DESCRIPTIONS } from '../../types';
import { LoginModal } from '../../components/LoginModal';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileLazyImage } from '../components/MobileLazyImage';

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
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900/50 to-slate-950" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* Avatar */}
        {avatarUrl && (
          <div className="mb-6 flex justify-center">
            <MobileLazyImage
              src={avatarUrl}
              alt={nickname}
              className="w-24 h-24 rounded-full border-4 border-purple-500/50 shadow-lg"
            />
          </div>
        )}

        {/* Greeting */}
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          {isGuest ? `你好，${nickname}` : `欢迎回来，${nickname}`}
        </h1>
        <p className="text-slate-400 mb-8 text-sm">
          {isGuest ? '以访客身份体验心域' : '继续你的心域之旅'}
        </p>

        {/* Navigation Buttons */}
        <div className="space-y-3 mb-6">
          <MobileTouchableButton
            onClick={() => onNavigate('realWorld')}
            variant="primary"
            size="lg"
            fullWidth
            className="shadow-lg"
          >
            📝 现实记录
          </MobileTouchableButton>
          <MobileTouchableButton
            onClick={() => onNavigate('sceneSelection')}
            variant="primary"
            size="lg"
            fullWidth
            className="shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
          >
            🌍 进入心域
          </MobileTouchableButton>
          <MobileTouchableButton
            onClick={() => onNavigate('profile')}
            variant="secondary"
            size="lg"
            fullWidth
          >
            👤 我的资料
          </MobileTouchableButton>
        </div>

        {/* Guest Login Prompt */}
        {isGuest && (
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm mb-3">登录账户可同步数据</p>
            <MobileTouchableButton
              onClick={() => setShowLoginModal(true)}
              variant="primary"
              size="md"
              fullWidth
              className="bg-indigo-600 hover:bg-indigo-500"
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
        >
          设置
        </MobileTouchableButton>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={(method, identifier, isFirstLogin, worlds) => {
            setShowLoginModal(false);
            onLoginSuccess?.(method, identifier, isFirstLogin, worlds);
          }}
          onCancel={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
});

MobileEntryPointScreen.displayName = 'MobileEntryPointScreen';
