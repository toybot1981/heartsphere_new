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
      className={`portal-preview-card bg-slate-800/90 border border-slate-600 rounded-xl p-6 shadow-2xl max-w-md ${className}`}
      style={{
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
        <h3 className="text-xl font-bold text-white mb-2">
          {preview.targetHeartsphereName || '未知心域'}
        </h3>
        {preview.targetOwnerName && (
          <p className="text-sm text-slate-400 mb-1">
            主人：{preview.targetOwnerName}
          </p>
        )}
        {preview.targetDescription && (
          <p className="text-sm text-slate-300 mt-2 line-clamp-2">
            {preview.targetDescription}
          </p>
        )}
      </div>

      {/* 统计信息 */}
      <div className="flex gap-4 mb-4 text-sm text-slate-400">
        {preview.targetCharacterCount !== undefined && (
          <span>角色: {preview.targetCharacterCount}</span>
        )}
        {preview.targetSceneCount !== undefined && (
          <span>场景: {preview.targetSceneCount}</span>
        )}
      </div>

      {/* 访问权限提示 */}
      {!canAccess && preview.cannotAccessReason && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-300">
            ⚠️ {preview.cannotAccessReason}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
        )}
        {canAccess && onTeleport && (
          <button
            onClick={onTeleport}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            传送
          </button>
        )}
        {!canAccess && (
          <button
            disabled
            className="flex-1 px-4 py-2 bg-slate-600 text-slate-400 rounded-lg cursor-not-allowed"
          >
            无法访问
          </button>
        )}
      </div>
    </div>
  );
};
