/**
 * Mobile版本共享配置步骤2：权限和描述设置
 */

import React, { memo } from 'react';
import { MobileFormField } from '../MobileFormField';
import { MobileInputStyles, MobileColors, MobileTypography, MobileSpacing, MobileCardStyles } from '../MobileStyleGuide';
import type { AccessPermission, ShareType, ShareScope } from '../../hooks/useShareConfig';

interface MobileShareConfigStep2Props {
  accessPermission: AccessPermission;
  setAccessPermission: (permission: AccessPermission) => void;
  description: string;
  setDescription: (description: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  shareType: ShareType;
  selectedScopes: ShareScope[];
}

/**
 * Mobile版本权限和描述设置步骤
 */
export const MobileShareConfigStep2: React.FC<MobileShareConfigStep2Props> = memo(({
  accessPermission,
  setAccessPermission,
  description,
  setDescription,
  coverImageUrl,
  setCoverImageUrl,
  shareType,
  selectedScopes,
}) => {
  const handlePermissionChange = (permission: AccessPermission) => {
    setAccessPermission(permission);
  };

  return (
    <div className={`space-y-6 ${MobileSpacing.padding.md}`}>
      <h3 className={`${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary} mb-4`}>
        权限和描述设置
      </h3>

      {/* 连接权限 */}
      <div>
        <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary} mb-3`}>
          连接权限
        </label>
        <div className="space-y-3">
          {/* 需要审批 */}
          <div
            className={`${MobileCardStyles.default} p-4 cursor-pointer transition-all ${MobileCardStyles.interactive}`}
            style={{
              borderColor: accessPermission === 'approval'
                ? 'var(--color-primary, rgba(168, 85, 247, 0.5))'
                : 'var(--border-color-overlay)',
              backgroundColor: accessPermission === 'approval'
                ? 'var(--color-primary, rgba(168, 85, 247, 0.1))'
                : undefined,
            }}
            onClick={() => handlePermissionChange('approval')}
            role="button"
            aria-label="需要我审批"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePermissionChange('approval');
              }
            }}
            onMouseEnter={(e) => {
              if (accessPermission !== 'approval') {
                e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.3))';
              }
            }}
            onMouseLeave={(e) => {
              if (accessPermission !== 'approval') {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all"
                style={{
                  borderColor: accessPermission === 'approval' 
                    ? 'var(--color-primary, #a855f7)' 
                    : 'var(--border-color-overlay, #475569)',
                  backgroundColor: accessPermission === 'approval' 
                    ? 'var(--color-primary, #a855f7)' 
                    : 'transparent',
                }}
              >
                {accessPermission === 'approval' && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                    需要我审批（推荐）
                  </span>
                </div>
                <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1`}>
                  其他人需要请求，我同意后才能进入
                </p>
              </div>
            </div>
          </div>

          {/* 自由连接 */}
          <div
            className={`${MobileCardStyles.default} p-4 cursor-pointer transition-all ${MobileCardStyles.interactive}`}
            style={{
              borderColor: accessPermission === 'free'
                ? 'var(--color-primary, rgba(168, 85, 247, 0.5))'
                : 'var(--border-color-overlay)',
              backgroundColor: accessPermission === 'free'
                ? 'var(--color-primary, rgba(168, 85, 247, 0.1))'
                : undefined,
            }}
            onClick={() => handlePermissionChange('free')}
            role="button"
            aria-label="自由连接"
            onMouseEnter={(e) => {
              if (accessPermission !== 'free') {
                e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.3))';
              }
            }}
            onMouseLeave={(e) => {
              if (accessPermission !== 'free') {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }
            }}
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePermissionChange('free');
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all"
                style={{
                  borderColor: accessPermission === 'free' 
                    ? 'var(--color-primary)' 
                    : 'var(--border-color-overlay)',
                  backgroundColor: accessPermission === 'free' 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                }}
              >
                {accessPermission === 'free' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                    自由连接
                  </span>
                </div>
                <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1`}>
                  任何人可以直接进入，无需审批
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 共享描述 */}
      <MobileFormField
        label="共享描述（可选）"
        hint="介绍一下你的心域，最多200字"
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="介绍一下你的心域..."
          maxLength={200}
          rows={4}
          className={`${MobileInputStyles} resize-none`}
          aria-label="共享描述"
        />
        <div className={`text-right ${MobileTypography.fontSize.xs} ${MobileColors.text.muted} mt-1`}>
          {description.length}/200 字
        </div>
      </MobileFormField>

      {/* 封面图片URL */}
      <MobileFormField
        label="封面图片URL（可选）"
        hint="输入图片URL作为共享封面"
      >
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={MobileInputStyles}
          aria-label="封面图片URL"
        />
      </MobileFormField>

      {/* 预览 */}
      <div className={`${MobileCardStyles.default} p-4 ${MobileSpacing.margin.top.md}`}>
        <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary} mb-3`}>
          预览效果
        </label>
        <div 
          className={`${MobileCardStyles.default} p-4`}
          style={{
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mb-2`}>
            共享范围：{shareType === 'all' ? '全部' : `${selectedScopes.filter(s => s.scopeType === shareType).length}个${shareType === 'world' ? '世界' : '场景'}`}
          </div>
          <div className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mb-2`}>
            连接权限：{accessPermission === 'approval' ? '需要审批' : '自由连接'}
          </div>
          {description && (
            <div className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary} mt-3 pt-3 border-t border-white/10`}>
              {description}
            </div>
          )}
          {coverImageUrl && (
            <div className="mt-3">
              <img
                src={coverImageUrl}
                alt="封面预览"
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MobileShareConfigStep2.displayName = 'MobileShareConfigStep2';
