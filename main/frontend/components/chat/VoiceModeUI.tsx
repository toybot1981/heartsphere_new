/**
 * 语音模式UI组件
 * 提取语音模式的UI渲染逻辑
 */

import React, { memo, useMemo } from 'react';

interface VoiceModeUIProps {
  isListening: boolean;
  isWaitingForResponse: boolean;
  isPlayingAudio: boolean;
  onExit: () => void;
}

/**
 * 语音模式状态类型
 */
type VoiceStatus = 'listening' | 'waiting' | 'playing' | 'idle';

/**
 * 语音模式UI组件
 * 使用memo优化，避免不必要的重渲染
 */
export const VoiceModeUI = memo<VoiceModeUIProps>(({
  isListening,
  isWaitingForResponse,
  isPlayingAudio,
  onExit,
}) => {
  // 计算当前状态
  const status: VoiceStatus = useMemo(() => {
    if (isListening) return 'listening';
    if (isWaitingForResponse) return 'waiting';
    if (isPlayingAudio) return 'playing';
    return 'idle';
  }, [isListening, isWaitingForResponse, isPlayingAudio]);

  // 状态配置
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'listening':
        return {
          circleClass: 'border-4 animate-pulse',
          circleStyle: {
            backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
            borderColor: 'var(--color-error, #f87171)',
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-error, #f87171)' }}>
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ),
          message: '正在聆听...',
          subMessage: '请说话',
        };
      case 'waiting':
        return {
          circleClass: 'border-4',
          circleStyle: {
            backgroundColor: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
            borderColor: 'var(--color-warning, #fbbf24)',
          },
          icon: (
            <div 
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-warning, #fbbf24)' }}
            />
          ),
          message: '正在处理...',
          subMessage: 'AI正在思考',
        };
      case 'playing':
        return {
          circleClass: 'border-4',
          circleStyle: {
            backgroundColor: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
            borderColor: 'var(--color-warning, #fbbf24)',
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-warning, #fbbf24)' }}>
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06Z"/>
            </svg>
          ),
          message: '正在播放回复...',
          subMessage: '请稍候',
        };
      default:
        return {
          circleClass: 'border-4',
          circleStyle: {
            backgroundColor: 'var(--color-success, rgba(34, 197, 94, 0.2))',
            borderColor: 'var(--color-success, #4ade80)',
          },
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-success, #4ade80)' }}>
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ),
          message: '语音模式',
          subMessage: '点击顶部按钮退出语音模式',
        };
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="relative">
        <div 
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${statusConfig.circleClass}`}
          style={statusConfig.circleStyle}
        >
          {statusConfig.icon}
        </div>
      </div>
      <div className="text-center">
        <p 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {statusConfig.message}
        </p>
        <p 
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {statusConfig.subMessage}
        </p>
      </div>
      <button
        onClick={onExit}
        className="mt-4 text-sm transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        退出语音模式
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.isListening === nextProps.isListening &&
    prevProps.isWaitingForResponse === nextProps.isWaitingForResponse &&
    prevProps.isPlayingAudio === nextProps.isPlayingAudio
  );
});

VoiceModeUI.displayName = 'VoiceModeUI';
