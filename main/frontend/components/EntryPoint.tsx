
import React, { useState } from 'react';
import { Button } from './Button';
import { LoginModal } from './LoginModal';
import { Footer } from './Footer';

interface EntryPointProps {
  onNavigate: (screen: 'realWorld' | 'sceneSelection' | 'profile') => void;
  onOpenSettings: () => void;
  nickname: string;
  avatarUrl?: string; // 添加头像URL
  onSwitchToMobile: () => void;
  onLoginSuccess?: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  isGuest?: boolean;
  onGuestEnter?: (nickname: string) => void;
}

export const EntryPoint: React.FC<EntryPointProps> = ({ 
  onNavigate, 
  onOpenSettings, 
  nickname,
  avatarUrl,
  onSwitchToMobile,
  onLoginSuccess,
  isGuest = false,
  onGuestEnter
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestNickname, setGuestNickname] = useState('');

  const handleGuestSubmit = () => {
    if (!guestNickname.trim()) return;
    if (onGuestEnter) {
      onGuestEnter(guestNickname.trim());
      setShowGuestInput(false);
      setGuestNickname('');
    }
  };
  
  return (
    <div 
      className="relative h-full w-full flex flex-col items-center justify-center p-4 pb-32 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `var(--gradient-bg)`,
          }}
        />
      </div>

      {/* Admin Access (Top Left) */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => window.open('/admin.html', '_blank')}
          className="p-3 rounded-full transition-all opacity-50 hover:opacity-100 group backdrop-blur-sm"
          style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444'; // red-400
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
          }}
          title="系统管理 System Admin"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
           </svg>
        </button>
      </div>

      {/* Top Right Buttons Container */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Mobile Switch Button */}
        <button
          onClick={onSwitchToMobile}
          className="p-3 backdrop-blur-md rounded-full transition-all border shadow-lg hover:scale-105 flex items-center gap-2 px-4"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          title="切换手机版 Switch to Mobile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          <span className="text-sm font-bold hidden sm:inline">手机版 Mobile</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-3 backdrop-blur-md rounded-full transition-all border shadow-lg hover:rotate-90"
          style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          title="设置 Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-fade-in mb-32">
        <div className="space-y-2">
            <h1 
              className="text-6xl md:text-8xl font-black tracking-tighter"
              style={{
                color: 'var(--text-primary)',
                textShadow: '0 0 30px rgba(0, 0, 0, 0.3), 0 2px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
            HEARTSPHERE
            </h1>
            <p 
              className="text-sm md:text-base tracking-[0.5em] uppercase font-light"
              style={{ color: 'var(--text-secondary)' }}
            >
            Digital Soul Interface
            </p>
        </div>

        <div 
          className="w-16 h-1 opacity-50"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
          }}
        />

        <div className="space-y-2">
            {isGuest ? (
              <>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="relative group"
                    title="个人资料"
                  >
                    {avatarUrl ? (
                      <div 
                        className="w-12 h-12 rounded-full p-[2px] hover:scale-110 transition-transform cursor-pointer gradient-button"
                        style={{ padding: '2px' }}
                      >
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-primary)' }}
                        >
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full p-[2px] hover:scale-110 transition-transform cursor-pointer flex items-center justify-center gradient-button"
                        style={{ padding: '2px' }}
                      >
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--bg-primary)' }}
                        >
                          <span 
                            className="text-xl font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {nickname?.[0]?.toUpperCase() || 'G'}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* 提示文字 */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-card)',
                        }}
                      >
                        个人资料
                      </span>
                    </div>
                  </button>
                  <p 
                    className="text-xl font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    欢迎，{nickname || '访客'}
                  </p>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  以游客身份体验，或登录账户同步数据
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="relative group"
                    title="个人资料"
                  >
                    {avatarUrl ? (
                      <div 
                        className="w-12 h-12 rounded-full p-[2px] hover:scale-110 transition-transform cursor-pointer gradient-button"
                        style={{ padding: '2px' }}
                      >
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-primary)' }}
                        >
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full p-[2px] hover:scale-110 transition-transform cursor-pointer flex items-center justify-center gradient-button"
                        style={{ padding: '2px' }}
                      >
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--bg-primary)' }}
                        >
                          <span 
                            className="text-xl font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {nickname?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* 提示文字 */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-card)',
                        }}
                      >
                        个人资料
                      </span>
                    </div>
                  </button>
                  <p 
                    className="text-xl font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    欢迎回来，{nickname}
                  </p>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                    系统已就绪，等待神经链接... 
                    <span className="block sm:inline opacity-60 text-xs ml-0 sm:ml-2">System Ready. Waiting for Neural Link...</span>
                </p>
              </>
            )}
        </div>

        {/* 登录/游客入口 - 仅在没有昵称时显示（访客已登录后不显示） */}
        {!nickname && (
          <div className="flex gap-3 mt-4 animate-fade-in">
            {onLoginSuccess && (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 text-sm rounded-full"
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
            )}
            {onGuestEnter && (
              <Button
                onClick={() => setShowGuestInput(true)}
                variant="secondary"
                className="px-6 py-2 text-sm rounded-full"
                style={{
                  borderColor: 'var(--border-color-overlay)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                游客体验
              </Button>
            )}
          </div>
        )}

        {/* 游客昵称输入弹窗 */}
        {showGuestInput && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
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
                游客体验
              </h3>
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                输入你的昵称，以游客身份进入体验
              </p>
              <input
                type="text"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuestSubmit()}
                placeholder="请输入昵称"
                className="w-full border rounded-lg px-4 py-3 outline-none mb-4"
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
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleGuestSubmit}
                  disabled={!guestNickname.trim()}
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
                    setShowGuestInput(false);
                    setGuestNickname('');
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

        {/* 导航按钮 - 仅在已有昵称时显示（已登录或已输入游客昵称） */}
        {nickname && (
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in">
              <Button 
                  onClick={() => onNavigate('realWorld')} 
                  className="group relative px-10 py-4 text-lg transition-all transform hover:-translate-y-1 rounded-full font-bold tracking-wider overflow-hidden"
                  style={{
                    backgroundColor: 'white',
                    color: '#0a1f3b',  // 深灰黑色，确保在白色背景上清晰
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
              >
                  <div className="relative z-10 flex flex-col items-center leading-none gap-1">
                      <span>进入现实</span>
                      <span className="text-[10px] font-normal tracking-widest opacity-60">ENTER REALITY</span>
                  </div>
              </Button>
              
              <Button 
                  onClick={() => onNavigate('sceneSelection')} 
                  variant="secondary"
                  className="group relative px-10 py-4 text-lg rounded-full font-bold tracking-wider backdrop-blur-md overflow-hidden"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
              >
                  <div className="relative z-10 flex flex-col items-center leading-none gap-1">
                      <span>潜入心域</span>
                      <span className="text-[10px] font-normal tracking-widest opacity-60">DIVE DEEP</span>
                  </div>
              </Button>
          </div>
        )}

        {/* 登录弹窗 */}
        {showLoginModal && onLoginSuccess && (
          <LoginModal
            onLoginSuccess={(method, identifier, isFirstLogin, worlds) => {
              onLoginSuccess(method, identifier, isFirstLogin, worlds);
              setShowLoginModal(false);
            }}
            onCancel={() => setShowLoginModal(false)}
            initialNickname={isGuest ? nickname : undefined}
          />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Footer />
      </div>
      
      {/* Footer Decoration - 调整位置避免与Footer重叠 */}
      <div 
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-[10px] tracking-widest font-mono z-10 px-3 py-1 rounded backdrop-blur-sm"
        style={{ 
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.1))',
        }}
      >
        SYSTEM VERSION 2.5.0 // CONNECTED // 已连接
      </div>
    </div>
  );
};
