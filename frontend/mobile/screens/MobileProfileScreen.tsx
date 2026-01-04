
import React, { useRef, useState, memo } from 'react';
import { UserProfile, JournalEntry, Character, Mail } from '../../types';
import { constructUserAvatarPrompt } from '../../utils/promptConstructors';
import { showAlert } from '../../utils/dialog';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { ShareConfigModal } from '../../components/heartconnect/ShareConfigModal';

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
      <MobileSmoothScroll className="flex-1 pb-32">
      {/* Header Profile Card */}
      <div className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/40 rounded-b-3xl shadow-2xl border-b border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-[2px]">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                   {userProfile.avatarUrl ? (
                     <MobileLazyImage src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-2xl font-bold text-white">{userProfile.nickname[0]}</span>
                   )}
                 </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1.5 border border-white/10 shadow-lg cursor-pointer">
                  <span className="text-xs">📷</span>
              </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{userProfile.nickname}</h2>
            <p className="text-sm text-gray-400">
               {userProfile.isGuest ? '访客身份 (未绑定)' : '已连接至心域网络'}
            </p>
            <div className="flex gap-2 mt-2">
                {userProfile.isGuest && (
                <MobileTouchableButton
                    onClick={onOpenSettings}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-pink-600/20 text-pink-400 border-pink-600/30"
                >
                    绑定账号
                </MobileTouchableButton>
                )}
                <MobileTouchableButton
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-indigo-600/20 text-indigo-400 border-indigo-600/30"
                >
                    复制头像 Prompt
                </MobileTouchableButton>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <div className="text-xl font-bold text-pink-400">{journalEntries.length}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">日记碎片</div>
           </div>
           <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <div className="text-xl font-bold text-indigo-400">{charactersMetCount}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">遇见灵魂</div>
           </div>
           <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 relative">
              {unreadMailCount > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              <div className="text-xl font-bold text-emerald-400">{mailbox.length}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">时光信件</div>
           </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">系统选项</h3>
        
        <div className="space-y-2">
            <MobileTouchableButton
              onClick={onOpenSettings}
              variant="secondary"
              size="md"
              fullWidth
              className="bg-gray-900 border-gray-800 p-4 justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                  <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">⚙️</span>
                  <span className="text-gray-200 font-medium">设置与模型配置</span>
              </div>
              <span className="text-gray-600">→</span>
            </MobileTouchableButton>
            
            <MobileTouchableButton
              onClick={() => setShowShareConfigModal(true)}
              variant="secondary"
              size="md"
              fullWidth
              className="bg-gray-900 border-gray-800 p-4 justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                  <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">🔗</span>
                  <span className="text-gray-200 font-medium">心域共享</span>
              </div>
              <span className="text-gray-600">→</span>
            </MobileTouchableButton>
            
            <MobileTouchableButton
              disabled
              variant="secondary"
              size="md"
              fullWidth
              className="bg-gray-900 border-gray-800 p-4 justify-between opacity-50"
            >
              <div className="flex items-center gap-3 flex-1">
                  <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">📊</span>
                  <span className="text-gray-200 font-medium">心域数据分析 (WIP)</span>
              </div>
              <span className="text-gray-600">→</span>
            </MobileTouchableButton>
            
            <MobileTouchableButton
              disabled
              variant="secondary"
              size="md"
              fullWidth
              className="bg-gray-900 border-gray-800 p-4 justify-between opacity-50"
            >
              <div className="flex items-center gap-3 flex-1">
                  <span className="p-2 bg-amber-500/10 rounded-lg text-amber-400">🧡</span>
                  <span className="text-gray-200 font-medium">关于我们</span>
              </div>
              <span className="text-gray-600">→</span>
            </MobileTouchableButton>
        </div>

        <div className="pt-6 relative z-50">
            <MobileTouchableButton
              onClick={(e) => {
                  e.stopPropagation();
                  console.log("Logout clicked");
                  onLogout();
              }}
              variant="danger"
              size="lg"
              fullWidth
              className="py-4 text-red-500/80 bg-red-900/10 border-red-900/20"
            >
                退出登录
            </MobileTouchableButton>
            <p className="text-center text-[10px] text-gray-700 mt-4">
                HeartSphere Mobile v1.0.3
            </p>
        </div>
        </div>
      </MobileSmoothScroll>
      
      {/* 共享配置模态框 */}
      <ShareConfigModal
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