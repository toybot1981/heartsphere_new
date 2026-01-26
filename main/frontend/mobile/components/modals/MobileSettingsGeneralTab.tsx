/**
 * Mobile版本设置-通用设置标签页
 * 包含用户资料、基础设置、对话风格等
 */

import React, { memo, useRef } from 'react';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileFormField } from '../MobileFormField';
import { MobileInputStyles, MobileColors, MobileTypography, MobileSpacing, MobileCardStyles } from '../MobileStyleGuide';
import { MobileThemeSelector } from '../MobileThemeSelector';
import type { AppSettings, UserProfile, DialogueStyle, GameState } from '../../../types';
import { showAlert } from '../../../utils/dialog';
import { constructUserAvatarPrompt } from '../../../utils/promptConstructors';

interface MobileSettingsGeneralTabProps {
  settings: AppSettings;
  gameState: GameState;
  onSettingsChange: (newSettings: AppSettings) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  onLogout: () => void;
  onBindAccount: () => void;
  onOpenRecycleBin?: () => void;
  onOpenMembership?: () => void;
}

/**
 * Mobile版本通用设置标签页
 */
export const MobileSettingsGeneralTab: React.FC<MobileSettingsGeneralTabProps> = memo(({
  settings,
  gameState,
  onSettingsChange,
  onUpdateProfile,
  onLogout,
  onBindAccount,
  onOpenRecycleBin,
  onOpenMembership,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameState.userProfile || !onUpdateProfile) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ ...gameState.userProfile!, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetAvatarPrompt = async () => {
    if (!gameState.userProfile) return;
    const prompt = constructUserAvatarPrompt(gameState.userProfile.nickname);
    try {
      await navigator.clipboard.writeText(prompt);
      showAlert('头像提示词已复制！', '提示', 'success');
    } catch (e) {
      showAlert('复制失败: ' + prompt, '错误', 'error');
    }
  };

  return (
    <div className={`space-y-4 ${MobileSpacing.padding.md}`}>
      {/* 用户资料卡片 */}
      <div className={`${MobileCardStyles.default} p-4`}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="上传头像"
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                avatarInputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
              aria-label="选择头像图片"
            />
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center ${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} overflow-hidden border-2 ${MobileCardStyles.shadow}`}
              style={{
                background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-info, #6366f1), var(--color-primary, #9333ea)))',
                borderColor: 'var(--border-color-accent, rgba(168, 85, 247, 0.5))',
                color: 'var(--text-primary)',
              }}
            >
              {gameState.userProfile?.avatarUrl ? (
                <img src={gameState.userProfile.avatarUrl} className="w-full h-full object-cover" alt="用户头像" />
              ) : (
                gameState.userProfile?.nickname?.[0] || 'G'
              )}
            </div>
            <div 
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))' }}
            >
              <span 
                className={`${MobileTypography.fontSize.xs}`}
                style={{ color: 'var(--text-primary)' }}
              >
                上传
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className={`${MobileTypography.fontSize.lg} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary}`}>
              {gameState.userProfile?.nickname || '访客'}
            </p>
            <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.secondary} mt-1`}>
              {gameState.userProfile?.isGuest ? '访客身份 (未绑定)' : `已登录 (${gameState.userProfile?.phoneNumber || 'WeChat'})`}
            </p>
            <button
              onClick={handleGetAvatarPrompt}
              className={`${MobileTypography.fontSize.xs} ${MobileColors.text.accent} hover:underline mt-1`}
              aria-label="复制AI头像提示词"
            >
              📋 复制 AI 头像提示词
            </button>
          </div>
        </div>

        {/* 账户操作按钮 */}
        <div 
          className="flex flex-col gap-2 pt-4 border-t"
          style={{ borderTopColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
        >
          {gameState.userProfile && !gameState.userProfile.isGuest && onOpenMembership && (
            <MobileTouchableButton
              variant="secondary"
              size="md"
              onClick={() => {
                onOpenMembership();
              }}
              aria-label="会员管理"
            >
              💎 会员管理
            </MobileTouchableButton>
          )}
          {gameState.userProfile && !gameState.userProfile.isGuest && onOpenRecycleBin && (
            <MobileTouchableButton
              variant="secondary"
              size="md"
              onClick={() => {
                onOpenRecycleBin();
              }}
              aria-label="回收站"
            >
              🗑️ 回收站
            </MobileTouchableButton>
          )}
          {gameState.userProfile?.isGuest && (
            <MobileTouchableButton
              variant="primary"
              size="md"
              onClick={onBindAccount}
              aria-label="绑定账号"
            >
              绑定账号
            </MobileTouchableButton>
          )}
          <MobileTouchableButton
            variant="danger"
            size="md"
            onClick={onLogout}
            aria-label="退出登录"
          >
            退出登录
          </MobileTouchableButton>
        </div>
      </div>

      {/* 开关设置 */}
      <div className="space-y-3">
        <Toggle
          label="自动生成首页形象"
          description="开启后，进入选择页会自动为角色生成新的AI形象。关闭可节省Token。"
          enabled={settings.autoGenerateAvatars}
          onChange={(enabled) => onSettingsChange({ ...settings, autoGenerateAvatars: enabled })}
        />
        <Toggle
          label="自动生成故事场景"
          description="开启后，在故事模式中会自动生成与情节匹配的背景图片。关闭可节省Token。"
          enabled={settings.autoGenerateStoryScenes}
          onChange={(enabled) => onSettingsChange({ ...settings, autoGenerateStoryScenes: enabled })}
        />
        <Toggle
          label="自动生成日记配图"
          description="开启后，保存日记时会自动分析情绪并生成抽象配图。关闭可节省Token。"
          enabled={settings.autoGenerateJournalImages}
          onChange={(enabled) => onSettingsChange({ ...settings, autoGenerateJournalImages: enabled })}
        />
        <Toggle
          label="显示笔记同步按钮"
          description="开启后，在日记页面显示笔记同步按钮，可以将日记同步到 Notion 等外部平台。"
          enabled={settings.showNoteSync ?? false}
          onChange={(enabled) => onSettingsChange({ ...settings, showNoteSync: enabled })}
        />
        <Toggle
          label="开发者调试模式"
          description="在屏幕底部显示实时 AI 请求/响应日志。"
          enabled={settings.debugMode}
          onChange={(enabled) => onSettingsChange({ ...settings, debugMode: enabled })}
        />
      </div>

      {/* 对话风格配置 */}
      <div className={`${MobileCardStyles.default} p-4`}>
        <MobileFormField
          label="对话风格"
          hint="选择 AI 角色的回复风格，影响回复长度、语气和格式"
        >
          <select
            value={settings.dialogueStyle || 'mobile-chat'}
            onChange={(e) => onSettingsChange({ ...settings, dialogueStyle: e.target.value as DialogueStyle })}
            className={`${MobileInputStyles} w-full`}
            aria-label="对话风格"
          >
            <option value="mobile-chat">📱 即时网聊 (Mobile Chat)</option>
            <option value="visual-novel">📖 沉浸小说 (Visual Novel)</option>
            <option value="stage-script">🎭 剧本独白 (Stage Script)</option>
            <option value="poetic">📜 诗意留白 (Poetic)</option>
          </select>
        </MobileFormField>
        <div 
          className={`mt-3 p-3 rounded-lg ${MobileTypography.fontSize.xs}`}
          style={{
            backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))',
            color: 'var(--text-secondary)',
          }}
        >
          {(!settings.dialogueStyle || settings.dialogueStyle === 'mobile-chat') && (
            <p>短句、Emoji、动作用 *action*，像微信聊天，快节奏。</p>
          )}
          {settings.dialogueStyle === 'visual-novel' && (
            <p>侧重心理描写、环境渲染，辞藻优美，更有代入感，像读轻小说。</p>
          )}
          {settings.dialogueStyle === 'stage-script' && (
            <p>格式严格，[动作] 台词，干脆利落，适合以此为大纲进行二次创作。</p>
          )}
          {settings.dialogueStyle === 'poetic' && (
            <p>极简、隐晦、富有哲理，像《主要还是看气质》或《光遇》的风格。</p>
          )}
        </div>
      </div>

      {/* 主题选择器 */}
      <MobileThemeSelector />
    </div>
  );
});

MobileSettingsGeneralTab.displayName = 'MobileSettingsGeneralTab';

/**
 * Toggle开关组件
 */
interface ToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, description, enabled, onChange }) => (
  <div className={`${MobileCardStyles.default} p-4 flex justify-between items-center`}>
    <div className="flex-1 mr-4">
      <h4 className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary} mb-1`}>
        {label}
      </h4>
      <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.secondary}`}>
        {description}
      </p>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none touch-manipulation"
      style={{
        backgroundColor: enabled ? 'var(--color-primary, #a855f7)' : 'var(--bg-card, rgba(71, 85, 105, 1))',
      }}
      aria-label={enabled ? `关闭${label}` : `开启${label}`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ${
          enabled ? 'transform translate-x-6' : ''
        }`}
        style={{ backgroundColor: 'var(--text-primary)' }}
      />
    </button>
  </div>
);
