/**
 * 传送门预览卡片组件
 * 显示目标心域的信息预览
 */

import React from 'react';
import type { PortalPreview } from '../../services/api/portal/types';

interface PortalPreviewCardProps {
  preview: PortalPreview;
  onTeleport?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * 传送门预览卡片
 * 显示目标心域的封面、名称、主人等信息
 */
export const PortalPreviewCard: React.FC<PortalPreviewCardProps> = ({
  preview,
  onTeleport,
  onCancel,
  className = '',
}) => {
  const canAccess = preview.canAccess !== false;

  return (
    <div
      className={`portal-preview-card border rounded-xl p-6 shadow-2xl max-w-md ${className}`}
      style={{
        backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.9))',
        borderColor: 'var(--bg-overlay, rgba(75, 85, 99, 1))',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 封面图片 */}
      {preview.targetCoverImageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={preview.targetCoverImageUrl}
            alt={preview.targetHeartsphereName || '目标心域'}
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 心域信息 */}
      <div className="mb-4">
        <h3 
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {preview.targetHeartsphereName || '未知心域'}
        </h3>
        {preview.targetOwnerName && (
          <p 
            className="text-sm mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            主人：{preview.targetOwnerName}
          </p>
        )}
        {preview.targetDescription && (
          <p 
            className="text-sm mt-2 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {preview.targetDescription}
          </p>
        )}
      </div>

      {/* 统计信息 */}
      <div 
        className="flex gap-4 mb-4 text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {preview.targetCharacterCount !== undefined && (
          <span>角色: {preview.targetCharacterCount}</span>
        )}
        {preview.targetSceneCount !== undefined && (
          <span>场景: {preview.targetSceneCount}</span>
        )}
      </div>

      {/* 访问权限提示 */}
      {!canAccess && preview.cannotAccessReason && (
        <div 
          className="mb-4 p-3 border rounded-lg"
          style={{
            backgroundColor: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
            borderColor: 'var(--color-warning, rgba(234, 179, 8, 0.5))',
          }}
        >
          <p 
            className="text-sm"
            style={{ color: 'var(--color-warning, #fcd34d)' }}
          >
            ⚠️ {preview.cannotAccessReason}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary, #374151)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, #4b5563)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #374151)';
            }}
          >
            取消
          </button>
        )}
        {canAccess && onTeleport && (
          <button
            onClick={onTeleport}
            className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: 'var(--color-primary, #4f46e5)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #4338ca)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
            }}
          >
            传送
          </button>
        )}
        {!canAccess && (
          <button
            disabled
            className="flex-1 px-4 py-2 rounded-lg cursor-not-allowed"
            style={{
              backgroundColor: 'var(--bg-secondary, #4b5563)',
              color: 'var(--text-disabled)',
            }}
          >
            无法访问
          </button>
        )}
      </div>
    </div>
  );
};
