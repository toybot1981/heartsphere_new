/**
 * 错误状态组件
 */
import React from 'react';
import { Button } from '../../../../components/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '加载失败',
  message = '数据加载失败，请稍后重试',
  onRetry,
  retryLabel = '重试',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
      <p className="text-slate-400 text-center max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};



