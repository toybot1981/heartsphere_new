
import React, { useRef } from 'react';
import { UserProfile, JournalEntry, Character, Mail } from '../types';
import { constructUserAvatarPrompt } from '../utils/promptConstructors';
import { showAlert } from '../utils/dialog';

interface MobileProfileProps {
  userProfile: UserProfile;
  journalEntries: JournalEntry[];
  mailbox: Mail[];
  history: Record<string, any[]>;
  onOpenSettings: () => void;
  onLogout: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({ 
  userProfile, 
  journalEntries, 
  mailbox,
  history,
  onOpenSettings,
  onLogout,
  onUpdateProfile
}) => {
  const charactersMetCount = Object.keys(history).length;
  const unreadMailCount = mailbox.filter(m => !m.isRead).length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onUpdateProfile) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateProfile({ ...userProfile, avatarUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCopyPrompt = async () => {
      const prompt = constructUserAvatarPrompt(userProfile.nickname);
      try {
          await navigator.clipboard.writeText(prompt);
          showAlert("提示词已复制！", "提示", "success");
      } catch (e) {
          showAlert("复制失败", "错误", "error");
      }
  };

  return (
    <div 
      className="h-full pb-32 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
    >
      {/* Header Profile Card */}
      <div 
        className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] rounded-b-3xl shadow-2xl border-b"
        style={{
          background: 'linear-gradient(to bottom right, var(--bg-secondary, rgba(17, 24, 39, 1)), var(--bg-secondary, rgba(17, 24, 39, 1)), var(--bg-info-alpha, rgba(30, 58, 138, 0.4)))',
          borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.05))',
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div 
                className="w-20 h-20 rounded-full p-[2px]"
                style={{
                  background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-pink, #ec4899), var(--color-primary, #9333ea)))',
                }}
              >
                 <div 
                   className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                   style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
                 >
                   {userProfile.avatarUrl ? (
                     <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <span 
                       className="text-2xl font-bold"
                       style={{ color: 'var(--text-primary)' }}
                     >
                       {userProfile.nickname[0]}
                     </span>
                   )}
                 </div>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 rounded-full p-1.5 border shadow-lg cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card, rgba(31, 41, 55, 1))',
                  borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                }}
              >
                  <span className="text-xs">📷</span>
              </div>
          </div>
          <div className="flex-1">
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {userProfile.nickname}
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
               {userProfile.isGuest ? '访客身份 (未绑定)' : '已连接至心域网络'}
            </p>
            <div className="flex gap-2 mt-2">
                {userProfile.isGuest && (
                <button 
                  onClick={onOpenSettings} 
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: 'var(--bg-pink-alpha, rgba(219, 39, 119, 0.2))',
                    color: 'var(--color-pink, #ec4899)',
                    borderColor: 'var(--border-pink-alpha, rgba(219, 39, 119, 0.3))',
                  }}
                >
                    绑定账号
                </button>
                )}
                <button 
                  onClick={handleCopyPrompt} 
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.2))',
                    color: 'var(--color-info, #818cf8)',
                    borderColor: 'var(--border-info-alpha, rgba(99, 102, 241, 0.3))',
                  }}
                >
                    复制头像 Prompt
                </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           <div 
             className="rounded-2xl p-3 text-center border"
             style={{
               backgroundColor: 'var(--bg-overlay-alpha, rgba(255, 255, 255, 0.05))',
               borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.05))',
             }}
           >
              <div 
                className="text-xl font-bold"
                style={{ color: 'var(--color-pink, #ec4899)' }}
              >
                {journalEntries.length}
              </div>
              <div 
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-disabled)' }}
              >
                日记碎片
              </div>
           </div>
           <div 
             className="rounded-2xl p-3 text-center border"
             style={{
               backgroundColor: 'var(--bg-overlay-alpha, rgba(255, 255, 255, 0.05))',
               borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.05))',
             }}
           >
              <div 
                className="text-xl font-bold"
                style={{ color: 'var(--color-info, #818cf8)' }}
              >
                {charactersMetCount}
              </div>
              <div 
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-disabled)' }}
              >
                遇见灵魂
              </div>
           </div>
           <div 
             className="rounded-2xl p-3 text-center border relative"
             style={{
               backgroundColor: 'var(--bg-overlay-alpha, rgba(255, 255, 255, 0.05))',
               borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.05))',
             }}
           >
              {unreadMailCount > 0 && (
                <span 
                  className="absolute top-1 right-2 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-error, #ef4444)' }}
                />
              )}
              <div 
                className="text-xl font-bold"
                style={{ color: 'var(--color-success, #34d399)' }}
              >
                {mailbox.length}
              </div>
              <div 
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-disabled)' }}
              >
                时光信件
              </div>
           </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-6 space-y-4">
        <h3 
          className="text-xs font-bold uppercase tracking-widest px-1"
          style={{ color: 'var(--text-disabled)' }}
        >
          系统选项
        </h3>
        
        <div className="space-y-2">
            <button 
              onClick={onOpenSettings} 
              className="w-full border p-4 rounded-xl flex items-center justify-between group active:scale-95 transition-all"
              style={{
                backgroundColor: 'var(--bg-card, rgba(17, 24, 39, 1))',
                borderColor: 'var(--border-color-overlay, rgba(31, 41, 55, 1))',
              }}
            >
                <div className="flex items-center gap-3">
                    <span 
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-info-alpha, rgba(99, 102, 241, 0.1))',
                        color: 'var(--color-info, #818cf8)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-info, #6366f1)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-info-alpha, rgba(99, 102, 241, 0.1))';
                        e.currentTarget.style.color = 'var(--color-info, #818cf8)';
                      }}
                    >
                      ⚙️
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      设置与模型配置
                    </span>
                </div>
                <span style={{ color: 'var(--text-disabled)' }}>→</span>
            </button>
            
            <button 
              className="w-full border p-4 rounded-xl flex items-center justify-between group active:scale-95 transition-all opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bg-card, rgba(17, 24, 39, 1))',
                borderColor: 'var(--border-color-overlay, rgba(31, 41, 55, 1))',
              }}
            >
                <div className="flex items-center gap-3">
                    <span 
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-success-alpha, rgba(16, 185, 129, 0.1))',
                        color: 'var(--color-success, #34d399)',
                      }}
                    >
                      📊
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      心域数据分析 (WIP)
                    </span>
                </div>
                <span style={{ color: 'var(--text-disabled)' }}>→</span>
            </button>
            
             <button 
               className="w-full border p-4 rounded-xl flex items-center justify-between group active:scale-95 transition-all opacity-50 cursor-not-allowed"
               style={{
                 backgroundColor: 'var(--bg-card, rgba(17, 24, 39, 1))',
                 borderColor: 'var(--border-color-overlay, rgba(31, 41, 55, 1))',
               }}
             >
                <div className="flex items-center gap-3">
                    <span 
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-warning-alpha, rgba(245, 158, 11, 0.1))',
                        color: 'var(--color-warning, #fbbf24)',
                      }}
                    >
                      🧡
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      关于我们
                    </span>
                </div>
                <span style={{ color: 'var(--text-disabled)' }}>→</span>
            </button>
        </div>

        <div className="pt-6 relative z-50">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                }} 
                className="w-full py-4 font-bold text-sm rounded-xl border active:scale-95 transition-all cursor-pointer"
                style={{
                  color: 'var(--color-error, rgba(239, 68, 68, 0.8))',
                  backgroundColor: 'var(--bg-error-alpha, rgba(127, 29, 29, 0.1))',
                  borderColor: 'var(--border-error-alpha, rgba(127, 29, 29, 0.2))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-error-alpha, rgba(127, 29, 29, 0.2))';
                  e.currentTarget.style.color = 'var(--color-error, #f87171)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-error-alpha, rgba(127, 29, 29, 0.1))';
                  e.currentTarget.style.color = 'var(--color-error, rgba(239, 68, 68, 0.8))';
                }}
            >
                退出登录
            </button>
            <p 
              className="text-center text-[10px] mt-4"
              style={{ color: 'var(--text-disabled)' }}
            >
                HeartSphere Mobile v1.0.3
            </p>
        </div>
      </div>
    </div>
  );
};
