/**
 * 用户配置页面组件
 * 显示欢迎界面，允许用户选择访客模式或登录
 */

import React, { useState } from 'react';
import { Button } from '../Button';
import { APP_TITLE } from '../../constants';

interface ProfileSetupScreenProps {
  onGuestEnter: (nickname: string) => void | Promise<void>;
  onLogin: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onGuestEnter,
  onLogin,
}) => {
  const [profileNickname, setProfileNickname] = useState('');
  const [showGuestNicknameModal, setShowGuestNicknameModal] = useState(false);

  const handleGuestSubmit = async () => {
    const trimmedNickname = profileNickname.trim();
    console.log('[ProfileSetupScreen] handleGuestSubmit 被调用');
    console.log('[ProfileSetupScreen] 昵称:', trimmedNickname);
    console.log('[ProfileSetupScreen] 昵称是否有效:', !!trimmedNickname);
    
    if (trimmedNickname) {
      console.log('[ProfileSetupScreen] 调用 onGuestEnter 回调，昵称:', trimmedNickname);
      setShowGuestNicknameModal(false);
      setProfileNickname('');
      
      // 调用 onGuestEnter（可能是异步的）
      const result = onGuestEnter(trimmedNickname);
      if (result instanceof Promise) {
        await result;
      }
      console.log('[ProfileSetupScreen] onGuestEnter 调用完成，模态框已关闭');
    } else {
      console.warn('[ProfileSetupScreen] 昵称为空，不调用 onGuestEnter');
    }
  };

  return (
    <>
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="max-w-md w-full text-center space-y-8">
          <h1 
            className="text-4xl font-bold"
            style={{
              background: 'var(--gradient-text)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome to {APP_TITLE}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>选择你的进入方式</p>
          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => setShowGuestNicknameModal(true)}
              className="gradient-button"
              style={{ color: 'white' }}
            >
              以访客身份进入
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={onLogin}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              登录账户
            </Button>
          </div>
          <p 
            className="text-xs mt-4"
            style={{ color: 'var(--text-tertiary)' }}
          >
            访客模式可快速体验，登录账户可同步数据。
          </p>
        </div>
      </div>

      {/* 访客昵称输入对话框 */}
      {showGuestNicknameModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div 
            className="rounded-2xl border p-8 max-w-md w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-lg)',
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
              style={{ color: 'var(--text-secondary)' }}
            >
              输入你的昵称，以访客身份进入体验
            </p>
            <input
              type="text"
              value={profileNickname}
              onChange={(e) => setProfileNickname(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && profileNickname.trim()) {
                  handleGuestSubmit();
                }
              }}
              placeholder="请输入昵称"
              className="w-full rounded-lg px-4 py-3 outline-none mb-4"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-secondary)';
              }}
              placeholder="请输入昵称"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={handleGuestSubmit}
                disabled={!profileNickname.trim()}
                className="flex-1 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }}
              >
                进入
              </Button>
              <Button
                onClick={() => {
                  setShowGuestNicknameModal(false);
                  setProfileNickname('');
                }}
                variant="ghost"
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};





