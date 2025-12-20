/**
 * 用户配置页面组件
 * 显示欢迎界面，允许用户选择访客模式或登录
 */

import React, { useState } from 'react';
import { Button } from '../Button';
import { APP_TITLE } from '../../constants';

interface ProfileSetupScreenProps {
  onGuestEnter: (nickname: string) => void;
  onLogin: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onGuestEnter,
  onLogin,
}) => {
  const [profileNickname, setProfileNickname] = useState('');
  const [showGuestNicknameModal, setShowGuestNicknameModal] = useState(false);

  const handleGuestSubmit = () => {
    if (profileNickname.trim()) {
      onGuestEnter(profileNickname.trim());
      setShowGuestNicknameModal(false);
      setProfileNickname('');
    }
  };

  return (
    <>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Welcome to {APP_TITLE}
          </h1>
          <p className="text-gray-400">选择你的进入方式</p>
          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => setShowGuestNicknameModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              以访客身份进入
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={onLogin}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              登录账户
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-4">访客模式可快速体验，登录账户可同步数据。</p>
        </div>
      </div>

      {/* 访客昵称输入对话框 */}
      {showGuestNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">访客体验</h3>
            <p className="text-sm text-slate-400 mb-6">输入你的昵称，以访客身份进入体验</p>
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
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={handleGuestSubmit}
                disabled={!profileNickname.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
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

