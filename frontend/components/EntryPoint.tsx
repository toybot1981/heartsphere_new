
import React, { useState } from 'react';
import { Button } from './Button';
import { WorldStyle, WORLD_STYLE_DESCRIPTIONS } from '../types';
import { LoginModal } from './LoginModal';
import { Footer } from './Footer';

interface EntryPointProps {
  onNavigate: (screen: 'realWorld' | 'sceneSelection' | 'admin') => void;
  onOpenSettings: () => void;
  nickname: string;
  onSwitchToMobile: () => void;
  currentStyle: WorldStyle;
  onStyleChange: (style: WorldStyle) => void;
  onLoginSuccess?: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  isGuest?: boolean;
  onGuestEnter?: (nickname: string) => void;
}

export const EntryPoint: React.FC<EntryPointProps> = ({ 
  onNavigate, 
  onOpenSettings, 
  nickname, 
  onSwitchToMobile,
  currentStyle,
  onStyleChange,
  onLoginSuccess,
  isGuest = false,
  onGuestEnter
}) => {
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestNickname, setGuestNickname] = useState('');
  
  const styles: WorldStyle[] = ['anime', 'realistic', 'cyberpunk', 'fantasy', 'steampunk', 'minimalist', 'watercolor', 'oil-painting'];

  const handleGuestSubmit = () => {
    if (!guestNickname.trim()) return;
    if (onGuestEnter) {
      onGuestEnter(guestNickname.trim());
      setShowGuestInput(false);
      setGuestNickname('');
    }
  };
  
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center p-4 pb-24 bg-slate-950 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900/50 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
      </div>

      {/* Admin Access (Top Left) */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => window.open('/admin.html', '_blank')}
          className="p-3 text-slate-400 hover:text-red-400 bg-slate-900/30 hover:bg-slate-800/50 rounded-full transition-all opacity-50 hover:opacity-100 group backdrop-blur-sm"
          title="系统管理 System Admin"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
           </svg>
        </button>
      </div>

      {/* Top Right Buttons Container */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Style Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowStyleSelector(!showStyleSelector)}
            className="p-3 text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-md rounded-full transition-all border border-white/20 hover:border-white/40 shadow-lg hover:scale-105 flex items-center gap-2 px-4"
            title="世界风格 World Style"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
            <span className="text-sm font-bold hidden sm:inline">{WORLD_STYLE_DESCRIPTIONS[currentStyle].name}</span>
          </button>
          
          {/* Style Selector Dropdown */}
          {showStyleSelector && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 z-30 animate-fade-in">
              <div className="text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">选择世界风格</div>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                {styles.map((style) => {
                  const styleInfo = WORLD_STYLE_DESCRIPTIONS[style];
                  const isSelected = currentStyle === style;
                  return (
                    <button
                      key={style}
                      onClick={() => {
                        onStyleChange(style);
                        setShowStyleSelector(false);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-left group ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                          {styleInfo.name}
                        </span>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        {styleInfo.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500 text-center">
                风格将影响所有AI生成的内容
              </div>
            </div>
          )}
        </div>

        {/* Mobile Switch Button */}
        <button
          onClick={onSwitchToMobile}
          className="p-3 text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-md rounded-full transition-all border border-white/20 hover:border-white/40 shadow-lg hover:scale-105 flex items-center gap-2 px-4"
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
          className="p-3 text-slate-300 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all border border-white/10 hover:border-white/30 shadow-lg hover:rotate-90"
          title="设置 Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-fade-in">
        <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            HEARTSPHERE
            </h1>
            <p className="text-sm md:text-base text-indigo-300/80 tracking-[0.5em] uppercase font-light">
            Digital Soul Interface
            </p>
        </div>

        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

        <div className="space-y-2">
            {isGuest ? (
              <>
                <p className="text-xl text-white font-medium">欢迎，{nickname || '访客'}</p>
                <p className="text-sm text-slate-300">
                  以游客身份体验，或登录账户同步数据
                </p>
              </>
            ) : (
              <>
            <p className="text-xl text-white font-medium">欢迎回来，{nickname}</p>
            <p className="text-sm text-slate-400">
                系统已就绪，等待神经链接... 
                <span className="block sm:inline opacity-60 text-xs ml-0 sm:ml-2">System Ready. Waiting for Neural Link...</span>
            </p>
              </>
            )}
        </div>

        {/* 登录/游客入口 - 仅在没有昵称时显示（访客已登录后不显示） */}
        {!nickname && (
          <div className="flex gap-3 mt-4">
            {onLoginSuccess && (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-full"
              >
                登录账户
              </Button>
            )}
            {onGuestEnter && (
              <Button
                onClick={() => setShowGuestInput(true)}
                variant="secondary"
                className="px-6 py-2 text-sm border-white/20 hover:bg-white/10 rounded-full"
              >
                游客体验
              </Button>
            )}
          </div>
        )}

        {/* 游客昵称输入弹窗 */}
        {showGuestInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">游客体验</h3>
              <p className="text-sm text-slate-400 mb-6">输入你的昵称，以游客身份进入体验</p>
              <input
                type="text"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuestSubmit()}
                placeholder="请输入昵称"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleGuestSubmit}
                  disabled={!guestNickname.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
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

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button 
                onClick={() => onNavigate('realWorld')} 
                className="group relative px-10 py-4 text-lg bg-white text-black hover:bg-indigo-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1 rounded-full font-bold tracking-wider overflow-hidden"
            >
                <div className="relative z-10 flex flex-col items-center leading-none gap-1">
                    <span>进入现实</span>
                    <span className="text-[10px] font-normal tracking-widest opacity-60">ENTER REALITY</span>
                </div>
            </Button>
            
            <Button 
                onClick={() => onNavigate('sceneSelection')} 
                variant="secondary"
                className="group relative px-10 py-4 text-lg border-white/20 hover:bg-white/10 hover:border-white/40 rounded-full font-bold tracking-wider backdrop-blur-md overflow-hidden"
            >
                <div className="relative z-10 flex flex-col items-center leading-none gap-1">
                    <span>潜入心域</span>
                    <span className="text-[10px] font-normal tracking-widest opacity-60">DIVE DEEP</span>
                </div>
            </Button>
        </div>

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
      
      {/* Footer Decoration */}
      <div className="absolute bottom-20 text-[10px] text-white/30 tracking-widest font-mono">
        SYSTEM VERSION 2.5.0 // CONNECTED // 已连接
      </div>
    </div>
  );
};
