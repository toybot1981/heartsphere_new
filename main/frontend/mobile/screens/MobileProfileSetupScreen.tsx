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
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
        HeartSphere Mobile
      </h1>
      <p className="text-slate-400 text-center text-sm">选择你的进入方式</p>
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
            console.log('[MobileProfileSetup] 登录按钮被点击');
            onLogin();
          }}
          variant="primary"
          size="lg"
          fullWidth
        >
          登录账户
        </MobileTouchableButton>
      </div>
      <p className="text-xs text-slate-500 text-center mt-4 leading-relaxed">
        访客模式可快速体验，登录账户可同步数据。
      </p>
      
      {/* 访客昵称输入对话框 */}
      {showGuestNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">访客体验</h3>
            <p className="text-sm text-slate-400 mb-6">输入你的昵称，以访客身份进入体验</p>
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
              className="w-full min-h-[44px] bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none mb-4 text-base transition-all duration-200 touch-manipulation"
              autoFocus
            />
            <div className="flex gap-3">
              <MobileTouchableButton
                onClick={handleProfileSubmit}
                disabled={!profileNickname.trim()}
                variant="primary"
                size="md"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500"
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
