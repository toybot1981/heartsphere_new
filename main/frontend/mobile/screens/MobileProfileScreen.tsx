
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
    <div 
      className="h-full flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
    >
      <MobileSmoothScroll className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* Header Profile Card */}
      <div 
        className="p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] rounded-b-3xl shadow-2xl border-b"
        style={{
          background: 'linear-gradient(to bottom right, var(--bg-secondary, #0f172a), var(--bg-secondary, #0f172a), rgba(99, 102, 241, 0.4))',
          borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
        }}
      >
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
              <div 
                className="w-20 h-20 rounded-full p-[2px] shadow-lg"
                style={{
                  background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-primary, #6366f1), var(--color-primary, #9333ea)))',
                  boxShadow: 'var(--shadow-primary-light, 0 10px 15px -3px rgba(168, 85, 247, 0.3))',
                }}
              >
                 <div 
                   className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                   style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
                 >
                   {userProfile.avatarUrl ? (
                     <MobileLazyImage src={userProfile.avatarUrl} alt={`${userProfile.nickname}的头像`} className="w-full h-full object-cover" />
                   ) : (
                     <span 
                       className="text-2xl font-bold" 
                       aria-hidden="true"
                       style={{ color: 'var(--text-primary)' }}
                     >
                       {userProfile.nickname[0]}
                     </span>
                   )}
                 </div>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 rounded-full p-1.5 border shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-secondary, #1e293b)',
                  borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                }}
              >
                  <span className="text-xs" aria-hidden="true">📷</span>
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
           <div
             className="backdrop-blur-md rounded-xl p-3 text-center border shadow-lg"
             style={{
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-color-overlay)',
               boxShadow: 'var(--shadow-lg)',
             }}
           >
              <div 
                className="text-xl font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                {journalEntries.length}
              </div>
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)' }}
              >
                日记碎片
              </div>
           </div>
           <div
             className="backdrop-blur-md rounded-xl p-3 text-center border shadow-lg"
             style={{
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-color-overlay)',
               boxShadow: 'var(--shadow-lg)',
             }}
           >
              <div 
                className="text-xl font-bold"
                style={{ color: 'var(--color-info)' }}
              >
                {charactersMetCount}
              </div>
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)' }}
              >
                遇见灵魂
              </div>
           </div>
           <div
             className="backdrop-blur-md rounded-xl p-3 text-center border shadow-lg relative"
             style={{
               backgroundColor: 'var(--bg-card)',
               borderColor: 'var(--border-color-overlay)',
               boxShadow: 'var(--shadow-lg)',
             }}
           >
              {unreadMailCount > 0 && (
                <span 
                  className="absolute top-1 right-2 w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: 'var(--color-error)' }}
                  aria-label={`${unreadMailCount} 条未读消息`}
                  role="status"
                />
              )}
              <div 
                className="text-xl font-bold"
                style={{ color: 'var(--color-success)' }}
              >
                {mailbox.length}
              </div>
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)' }}
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
            style={{ color: 'var(--text-tertiary)' }}
          >
            系统选项
          </h3>
          
          <div className="space-y-2">
              <MobileTouchableButton
                onClick={onOpenSettings}
                variant="secondary"
                size="md"
                fullWidth
                className="backdrop-blur-md border p-4 justify-between"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.8))',
                  borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                }}
                aria-label="设置与模型配置"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span 
                      className="p-2 rounded-lg" 
                      style={{
                        backgroundColor: 'var(--bg-info-alpha)',
                        color: 'var(--color-info)',
                      }}
                      aria-hidden="true"
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
                <span
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-hidden="true"
                >
                  →
                </span>
              </MobileTouchableButton>
              
              <MobileTouchableButton
                onClick={() => setShowShareConfigModal(true)}
                variant="secondary"
                size="md"
                fullWidth
                className="backdrop-blur-md border p-4 justify-between"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.8))',
                  borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                }}
                aria-label="心域共享"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span 
                      className="p-2 rounded-lg" 
                      style={{
                        backgroundColor: 'var(--bg-secondary-alpha)',
                        color: 'var(--color-primary)',
                      }}
                      aria-hidden="true"
                    >
                      🔗
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      心域共享
                    </span>
                </div>
                <span
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-hidden="true"
                >
                  →
                </span>
              </MobileTouchableButton>
              
              <MobileTouchableButton
                disabled
                variant="secondary"
                size="md"
                fullWidth
                className="backdrop-blur-md border p-4 justify-between opacity-50"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color-overlay)',
                }}
                aria-label="心域数据分析 (开发中)"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span 
                      className="p-2 rounded-lg" 
                      style={{
                        backgroundColor: 'var(--bg-success-alpha)',
                        color: 'var(--color-success)',
                      }}
                      aria-hidden="true"
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
                <span
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-hidden="true"
                >
                  →
                </span>
              </MobileTouchableButton>
              
              <MobileTouchableButton
                disabled
                variant="secondary"
                size="md"
                fullWidth
                className="backdrop-blur-md border p-4 justify-between opacity-50"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color-overlay)',
                }}
                aria-label="关于我们 (开发中)"
              >
                <div className="flex items-center gap-3 flex-1">
                    <span 
                      className="p-2 rounded-lg" 
                      style={{
                        backgroundColor: 'var(--bg-warning-alpha)',
                        color: 'var(--color-warning)',
                      }}
                      aria-hidden="true"
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
                <span
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-hidden="true"
                >
                  →
                </span>
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
              <p
                className="text-center text-[10px] mt-4"
                style={{ color: 'var(--text-tertiary)' }}
              >
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