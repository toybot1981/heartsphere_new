
import React, { useRef, useState, memo } from 'react';
import { UserProfile, JournalEntry, Character, Mail } from '../../types';
import { constructUserAvatarPrompt } from '../../utils/promptConstructors';
import { showAlert } from '../../utils/dialog';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { MobileShareConfigModal } from '../components/modals/MobileShareConfigModal';

interface MobileProfileProps {
  userProfile: UserProfile;
  journalEntries: JournalEntry[];
  mailbox: Mail[];
  history: Record<string, any[]>;
  onOpenSettings: () => void;
  onLogout: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

/**
 * Mobile版本个人档案页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileProfile: React.FC<MobileProfileProps> = memo(({ 
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
  const [showShareConfigModal, setShowShareConfigModal] = useState(false);

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
    <div className="h-full bg-black flex flex-col">
      <MobileSmoothScroll className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* Header Profile Card */}
      <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/40 rounded-b-3xl shadow-2xl border-b border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="relative group cursor-pointer active:scale-95 transition-transform duration-150 touch-manipulation" 
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="更换头像"
          >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" aria-label="上传头像" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-purple-500/30">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                   {userProfile.avatarUrl ? (
                     <MobileLazyImage src={userProfile.avatarUrl} alt={`${userProfile.nickname}的头像`} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-2xl font-bold text-white" aria-hidden="true">{userProfile.nickname[0]}</span>
                   )}
                 </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full p-1.5 border border-white/10 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <span className="text-xs" aria-hidden="true">📷</span>
              </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{userProfile.nickname}</h2>
            <p className="text-sm text-slate-400">
               {userProfile.isGuest ? '访客身份 (未绑定)' : '已连接至心域网络'}
            </p>
            <div className="flex gap-2 mt-2">
                {userProfile.isGuest && (
                <MobileTouchableButton
                    onClick={onOpenSettings}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    aria-label="绑定账号"
                >
                    绑定账号
                </MobileTouchableButton>
                )}
                <MobileTouchableButton
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    aria-label="复制头像提示词"
                >
                    复制头像 Prompt
                </MobileTouchableButton>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 shadow-lg shadow-purple-500/10">
              <div className="text-xl font-bold text-purple-400">{journalEntries.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">日记碎片</div>
           </div>
           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 shadow-lg shadow-purple-500/10">
              <div className="text-xl font-bold text-indigo-400">{charactersMetCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">遇见灵魂</div>
           </div>
           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 shadow-lg shadow-purple-500/10 relative">
              {unreadMailCount > 0 && (
                <span 
                  className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" 
                  aria-label={`${unreadMailCount} 条未读消息`}
                  role="status"
                />
              )}
              <div className="text-xl font-bold text-emerald-400">{mailbox.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">时光信件</div>
           </div>
        </div>
      </div>

        {/* Menu Options */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">系统选项</h3>
          
          <div className="space-y-2">
              <MobileTouchableButton
                onClick={onOpenSettings}
                variant="secondary"
                size="md"
                fullWidth
                className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-4 justify-between"
                aria-label="设置与模型配置"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400" aria-hidden="true">⚙️</span>
                    <span className="text-slate-200 font-medium">设置与模型配置</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">→</span>
              </MobileTouchableButton>
              
              <MobileTouchableButton
                onClick={() => setShowShareConfigModal(true)}
                variant="secondary"
                size="md"
                fullWidth
                className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-4 justify-between"
                aria-label="心域共享"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400" aria-hidden="true">🔗</span>
                    <span className="text-slate-200 font-medium">心域共享</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">→</span>
              </MobileTouchableButton>
              
              <MobileTouchableButton
                disabled
                variant="secondary"
                size="md"
                fullWidth
                className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-4 justify-between opacity-50"
                aria-label="心域数据分析 (开发中)"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400" aria-hidden="true">📊</span>
                    <span className="text-slate-200 font-medium">心域数据分析 (WIP)</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">→</span>
              </MobileTouchableButton>
              
              <MobileTouchableButton
                disabled
                variant="secondary"
                size="md"
                fullWidth
                className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-4 justify-between opacity-50"
                aria-label="关于我们 (开发中)"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span className="p-2 bg-amber-500/10 rounded-lg text-amber-400" aria-hidden="true">🧡</span>
                    <span className="text-slate-200 font-medium">关于我们</span>
                </div>
                <span className="text-slate-500" aria-hidden="true">→</span>
              </MobileTouchableButton>
          </div>

          <div className="pt-6 relative z-50">
              <MobileTouchableButton
                onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                }}
                variant="danger"
                size="lg"
                fullWidth
                className="py-4"
                aria-label="退出登录"
              >
                  退出登录
              </MobileTouchableButton>
              <p className="text-center text-[10px] text-slate-600 mt-4">
                  HeartSphere Mobile v1.0.3
              </p>
          </div>
        </div>
      </MobileSmoothScroll>
      
      {/* 共享配置模态框 */}
      <MobileShareConfigModal
        isOpen={showShareConfigModal}
        onClose={() => setShowShareConfigModal(false)}
        onSuccess={() => {
          setShowShareConfigModal(false);
        }}
      />
    </div>
  );
});

MobileProfile.displayName = 'MobileProfile';