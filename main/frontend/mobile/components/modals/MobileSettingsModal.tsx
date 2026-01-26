/**
 * Mobile版本设置模态框主组件
 * 使用useSettings hook复用PC业务逻辑，UI独立
 */

import React, { memo, useState } from 'react';
import { MobileModalContainer } from '../MobileModalContainer';
import { MobileSettingsGeneralTab } from './MobileSettingsGeneralTab';
import { MobileColors, MobileTypography, MobileSpacing } from '../MobileStyleGuide';
import { useSettings, type UseSettingsOptions } from '../../hooks/useSettings';
import type { AppSettings, GameState } from '../../../types';

interface MobileSettingsModalProps {
  settings: AppSettings;
  gameState: GameState;
  onSettingsChange: (newSettings: AppSettings) => void;
  onUpdateProfile?: (profile: any) => void;
  onClose: () => void;
  onLogout: () => void;
  onBindAccount: () => void;
  onOpenRecycleBin?: () => void;
  onOpenMembership?: () => void;
}

/**
 * Mobile版本设置模态框
 * 参照PC版本SettingsModal，按照Mobile风格重新设计
 * 使用useSettings hook复用业务逻辑
 */
export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = memo(({
  settings,
  gameState,
  onSettingsChange,
  onUpdateProfile,
  onClose,
  onLogout,
  onBindAccount,
  onOpenRecycleBin,
  onOpenMembership,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'models' | 'backup'>('general');

  // 使用公共逻辑hook（如果需要的话，可以在hook中添加更多逻辑）
  // 目前主要逻辑都在组件内部，后续可以逐步迁移

  return (
    <MobileModalContainer
      isOpen={true}
      onClose={onClose}
      title="系统设置"
      size="lg"
      closeOnBackdrop={true}
    >
      <div className="flex flex-col min-h-0 max-h-[calc(90vh-8rem)]">
        {/* 标签页导航 */}
        <div 
          className="flex border-b mb-4"
          style={{ borderColor: 'var(--border-color-overlay)' }}
          role="tablist"
        >
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 pb-3 ${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} transition-colors border-b-2`}
            style={{
              color: activeTab === 'general' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'general' ? 'var(--color-primary, #a855f7)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'general') {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'general') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            aria-label="通用设置"
            aria-selected={activeTab === 'general'}
            role="tab"
          >
            通用设置
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`flex-1 pb-3 ${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} transition-colors border-b-2`}
            style={{
              color: activeTab === 'models' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'models' ? 'var(--color-primary, #a855f7)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'models') {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'models') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            aria-label="AI模型配置"
            aria-selected={activeTab === 'models'}
            role="tab"
          >
            AI 模型
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 pb-3 ${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} transition-colors border-b-2`}
            style={{
              color: activeTab === 'backup' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottomColor: activeTab === 'backup' ? 'var(--color-primary, #a855f7)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'backup') {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'backup') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            aria-label="记忆备份"
            aria-selected={activeTab === 'backup'}
            role="tab"
          >
            记忆备份
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'general' && (
            <MobileSettingsGeneralTab
              settings={settings}
              gameState={gameState}
              onSettingsChange={onSettingsChange}
              onUpdateProfile={onUpdateProfile}
              onLogout={onLogout}
              onBindAccount={onBindAccount}
              onOpenRecycleBin={onOpenRecycleBin}
              onOpenMembership={onOpenMembership}
            />
          )}

          {activeTab === 'models' && (
            <div className={`${MobileSpacing.padding.md} text-center py-12`}>
              <p className={`${MobileTypography.fontSize.base} ${MobileColors.text.secondary}`}>
                AI模型配置功能开发中...
              </p>
              <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.muted} mt-2`}>
                此功能将在后续版本中添加
              </p>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className={`${MobileSpacing.padding.md} text-center py-12`}>
              <p className={`${MobileTypography.fontSize.base} ${MobileColors.text.secondary}`}>
                记忆备份功能开发中...
              </p>
              <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.muted} mt-2`}>
                此功能将在后续版本中添加
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileModalContainer>
  );
});

MobileSettingsModal.displayName = 'MobileSettingsModal';
