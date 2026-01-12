import React, { memo } from 'react';
import { MobileTouchableButton } from './MobileTouchableButton';

interface MobileEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Mobile版本空状态组件
 * 用于显示列表为空时的友好提示
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileEmptyState: React.FC<MobileEmptyStateProps> = memo(({
  icon = '📭',
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2 text-center">{title}</h3>
      {description && (
        <p className="text-slate-400 text-sm text-center mb-6 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <MobileTouchableButton
          onClick={action.onClick}
          variant="primary"
          size="md"
          className="min-w-[120px]"
        >
          {action.label}
        </MobileTouchableButton>
      )}
    </div>
  );
});

MobileEmptyState.displayName = 'MobileEmptyState';
