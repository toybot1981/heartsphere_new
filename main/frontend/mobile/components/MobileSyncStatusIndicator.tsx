import React, { useState, useEffect } from 'react';
import { syncService } from '../../services/sync/SyncService';

interface MobileSyncStatusIndicatorProps {
  className?: string;
}

/**
 * Mobile版本同步状态指示器组件
 * 显示数据同步状态和进度
 */
export const MobileSyncStatusIndicator: React.FC<MobileSyncStatusIndicatorProps> = ({
  className = '',
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 监听同步状态变化
    // 注意：syncService的isSyncing是私有属性，这里先显示基本状态
    // 可以通过监听同步事件来更新状态
    const checkSyncStatus = () => {
      // 可以通过自定义事件或其他方式获取同步状态
      // 目前先显示基本状态
      setSyncStatus('idle');
      setSyncMessage('');
    };

    // 监听同步事件（如果syncService支持）
    const handleSyncStart = () => {
      setSyncStatus('syncing');
      setSyncMessage('正在同步数据...');
    };

    const handleSyncSuccess = () => {
      setSyncStatus('success');
      setSyncMessage('同步成功');
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 2000);
    };

    const handleSyncError = () => {
      setSyncStatus('error');
      setSyncMessage('同步失败');
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 3000);
    };

    // 监听自定义事件（如果syncService会触发这些事件）
    window.addEventListener('sync:start', handleSyncStart);
    window.addEventListener('sync:success', handleSyncSuccess);
    window.addEventListener('sync:error', handleSyncError);

    checkSyncStatus();

    return () => {
      window.removeEventListener('sync:start', handleSyncStart);
      window.removeEventListener('sync:success', handleSyncSuccess);
      window.removeEventListener('sync:error', handleSyncError);
    };
  }, []);

  if (syncStatus === 'idle' && !showDetails) {
    return null;
  }

  return (
    <div className={`fixed bottom-16 left-0 right-0 z-40 px-4 ${className}`}>
      <div
        className={`bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 shadow-lg ${
          syncStatus === 'syncing' ? 'animate-pulse' : ''
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncStatus === 'syncing' && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {syncStatus === 'success' && (
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <span className="text-white text-sm font-medium">{syncMessage || '同步状态'}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="text-slate-400 hover:text-white text-xs"
          >
            {showDetails ? '收起' : '详情'}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
            <div>数据同步服务已启用</div>
            <div>状态: {syncStatus === 'syncing' ? '同步中' : syncStatus === 'success' ? '已同步' : syncStatus === 'error' ? '同步失败' : '空闲'}</div>
          </div>
        )}
      </div>
    </div>
  );
};
