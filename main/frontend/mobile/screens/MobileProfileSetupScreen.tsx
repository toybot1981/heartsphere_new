/**
 * Mobile版本欢迎/登录页面组件
 * 参照PC版本的ProfileSetupScreen，但保持Mobile UI独立
 */

import React, { useState, memo } from 'react';
import { MobileTouchableButton } from '../components/MobileTouchableButton';

interface MobileProfileSetupScreenProps {
  onGuestEnter: (nickname: string) => void;
  onLogin: () => void;
}

/**
 * Mobile版本个人档案设置页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileProfileSetupScreen: React.FC<MobileProfileSetupScreenProps> = memo(({
  onGuestEnter,
  onLogin,
}) => {
  const [showGuestNicknameModal, setShowGuestNicknameModal] = useState(false);
  const [profileNickname, setProfileNickname] = useState('');

  const handleProfileSubmit = () => {
    if (profileNickname.trim()) {
      onGuestEnter(profileNickname.trim());
      setShowGuestNicknameModal(false);
      setProfileNickname('');
    }
  };

  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center p-6 space-y-6"
      style={{ backgroundColor: 'var(--bg-primary, #020617)' }}
    >
      <h1 
        className="text-3xl font-bold"
        style={{
          background: 'var(--gradient-text-primary, linear-gradient(to right, var(--color-primary, #818cf8), var(--color-primary, #c084fc)))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        HeartSphere Mobile
      </h1>
      <p 
        className="text-center text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        选择你的进入方式
      </p>
      <div className="w-full space-y-3">
        <MobileTouchableButton 
          onClick={() => setShowGuestNicknameModal(true)}
          variant="primary"
          size="lg"
          fullWidth
        >
          以访客身份进入
        </MobileTouchableButton>
        <MobileTouchableButton 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLogin();
          }}
          variant="primary"
          size="lg"
          fullWidth
        >
          登录账户
        </MobileTouchableButton>
      </div>
      <p 
        className="text-xs text-center mt-4 leading-relaxed"
        style={{ color: 'var(--text-tertiary)' }}
      >
        访客模式可快速体验，登录账户可同步数据。
      </p>
      
      {/* 访客昵称输入对话框 */}
      {showGuestNicknameModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))' }}
        >
          <div 
            className="rounded-2xl border p-6 max-w-sm w-full shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card, #0f172a)',
              borderColor: 'var(--bg-overlay, rgba(51, 65, 85, 1))',
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              访客体验
            </h3>
            <p 
              className="text-sm mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              输入你的昵称，以访客身份进入体验
            </p>
            <input 
              type="text"
              value={profileNickname}
              onChange={(e) => setProfileNickname(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && profileNickname.trim()) {
                  handleProfileSubmit();
                }
              }}
              placeholder="请输入昵称"
              className="w-full min-h-[44px] backdrop-blur-sm border rounded-lg px-4 py-3 focus:ring-2 outline-none mb-4 text-base transition-all duration-200 touch-manipulation"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.8))',
                borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.boxShadow = 'none';
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <MobileTouchableButton
                onClick={handleProfileSubmit}
                disabled={!profileNickname.trim()}
                variant="primary"
                size="md"
                className="flex-1"
                style={{
                  background: 'var(--bg-primary-button, var(--color-primary, #6366f1))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-primary-button-hover, var(--color-primary, #4f46e5))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-primary-button, var(--color-primary, #6366f1))';
                }}
              >
                进入
              </MobileTouchableButton>
              <MobileTouchableButton
                onClick={() => {
                  setShowGuestNicknameModal(false);
                  setProfileNickname('');
                }}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                取消
              </MobileTouchableButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MobileProfileSetupScreen.displayName = 'MobileProfileSetupScreen';
