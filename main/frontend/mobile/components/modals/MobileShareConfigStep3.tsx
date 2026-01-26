/**
 * Mobile版本共享配置步骤3：分享预览
 */

import React, { memo, useState } from 'react';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileCardStyles, MobileColors, MobileTypography, MobileSpacing, MobileRadius, MobileInputStyles } from '../MobileStyleGuide';
import { ShareCodeDisplay } from '../../../components/heartconnect/ShareCodeDisplay';
import { showConfirm } from '../../../utils/dialog';
import type { ShareConfig } from '../../../services/api/heartconnect/types';

interface MobileShareConfigStep3Props {
  shareConfig: ShareConfig | null;
  onRegenerate: () => Promise<void>;
  onClose: () => void;
}

/**
 * Mobile版本分享预览步骤
 */
export const MobileShareConfigStep3: React.FC<MobileShareConfigStep3Props> = memo(({
  shareConfig,
  onRegenerate,
  onClose,
}) => {
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegenerateClick = async () => {
    const confirmed = await showConfirm(
      '重新生成共享码后，旧的共享码将失效。确定要继续吗？',
      '重新生成共享码',
      'warning'
    );
    if (!confirmed) return;

    setRegenerating(true);
    try {
      await onRegenerate();
    } catch (err) {
      console.error('[MobileShareConfigStep3] 重新生成共享码失败:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[MobileShareConfigStep3] 复制失败:', err);
    }
  };

  if (!shareConfig) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${MobileSpacing.padding.md}`}>
        <MobileLoadingSpinner size="large" text="加载配置中..." />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/share/${shareConfig.shareCode}`;

  return (
    <div className={`space-y-6 ${MobileSpacing.padding.md}`}>
      {/* 成功提示 */}
      <div className="text-center">
        <div className={`text-6xl mb-4 ${MobileSpacing.margin.top.md}`}>✅</div>
        <h3 className={`${MobileTypography.fontSize['2xl']} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary} mb-2`}>
          共享配置已{shareConfig.shareCode ? '创建' : '更新'}成功！
        </h3>
        <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary}`}>
          现在你可以分享你的心域了
        </p>
      </div>

      {/* 共享码显示 */}
      <div className={`${MobileCardStyles.default} p-4`}>
        <h4 className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary} mb-4`}>
          分享链接
        </h4>

        {/* 共享码 */}
        <div className="mb-4">
          <label className={`block ${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mb-2`}>
            共享码
          </label>
          <div className="flex items-center gap-2">
            <div 
              className={`flex-1 px-4 py-3 border ${MobileRadius.md} ${MobileTypography.fontSize.base} font-mono`}
              style={{
                backgroundColor: 'var(--bg-primary, #0f172a)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
            >
              {shareConfig.shareCode}
            </div>
            <MobileTouchableButton
              variant="secondary"
              size="md"
              onClick={() => handleCopy(shareConfig.shareCode)}
              aria-label="复制共享码"
            >
              {copied ? '已复制' : '复制'}
            </MobileTouchableButton>
          </div>
        </div>

        {/* 分享链接 */}
        <div className="mb-4">
          <label className={`block ${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mb-2`}>
            分享链接
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className={`flex-1 ${MobileInputStyles} text-sm`}
              aria-label="分享链接"
            />
            <MobileTouchableButton
              variant="secondary"
              size="md"
              onClick={() => handleCopy(shareUrl)}
              aria-label="复制分享链接"
            >
              {copied ? '已复制' : '复制'}
            </MobileTouchableButton>
          </div>
        </div>

        {/* 统计信息 */}
        <div className={`grid grid-cols-3 gap-4 mt-4 pt-4 border-t ${MobileColors.border.default}`}>
          <div className="text-center">
            <div className={`${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary}`}>
              {shareConfig.viewCount || 0}
            </div>
            <div className={`${MobileTypography.fontSize.xs} ${MobileColors.text.muted} mt-1`}>
              查看次数
            </div>
          </div>
          <div className="text-center">
            <div className={`${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary}`}>
              {shareConfig.requestCount || 0}
            </div>
            <div className={`${MobileTypography.fontSize.xs} ${MobileColors.text.muted} mt-1`}>
              请求次数
            </div>
          </div>
          <div className="text-center">
            <div className={`${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary}`}>
              {shareConfig.approvedCount || 0}
            </div>
            <div className={`${MobileTypography.fontSize.xs} ${MobileColors.text.muted} mt-1`}>
              已批准
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <MobileTouchableButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={onClose}
          aria-label="完成"
        >
          完成
        </MobileTouchableButton>
        <MobileTouchableButton
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleRegenerateClick}
          disabled={regenerating}
          loading={regenerating}
          aria-label="重新生成共享码"
        >
          重新生成共享码
        </MobileTouchableButton>
      </div>

      {/* 使用PC版本的ShareCodeDisplay（如果需要的完整功能） */}
      <details className={`${MobileCardStyles.default} p-4 mt-4`}>
        <summary className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} cursor-pointer`}>
          查看完整分享选项（二维码、留言等）
        </summary>
        <div className="mt-4">
          <ShareCodeDisplay shareConfig={shareConfig} onRegenerate={handleRegenerateClick} />
        </div>
      </details>
    </div>
  );
});

MobileShareConfigStep3.displayName = 'MobileShareConfigStep3';
