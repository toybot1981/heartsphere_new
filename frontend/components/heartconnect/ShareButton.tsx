import React, { useState } from 'react';
import { ShareConfigModal } from './ShareConfigModal';
import { ShareCodeDisplay } from './ShareCodeDisplay';
import { ConnectionRequestList } from './ConnectionRequestList';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { ShareConfig } from '../../services/api/heartconnect/types';

interface ShareButtonProps {
  className?: string;
  variant?: 'button' | 'icon' | 'text';
}

/**
 * 共享心域按钮组件
 * 可以放在个人中心、场景管理等位置
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showShareDisplay, setShowShareDisplay] = useState(false);
  const [shareConfig, setShareConfig] = useState<ShareConfig | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleOpenShare = async (e?: React.MouseEvent) => {
    // 阻止事件冒泡
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    console.log('ShareButton clicked, loading share config...');
    setLoading(true);
    try {
      const config = await heartConnectApi.getMyShareConfig();
      console.log('Share config loaded:', config);
      setShareConfig(config);
      setShowShareDisplay(true);
    } catch (err: any) {
      console.error('加载共享配置失败:', err);
      // 检查错误响应 - 如果共享配置不存在，打开创建界面
      const errorMessage = err?.message || '';
      const status = err?.response?.status || err?.status || (errorMessage.includes('404') ? 404 : null);
      
      // 检查是否是"共享配置不存在"的错误（404或相关错误消息）
      if (
        status === 404 || 
        errorMessage === 'Not Found' ||
        errorMessage.includes('共享配置不存在') ||
        errorMessage.includes('不存在')
      ) {
        // 没有配置，打开创建界面
        console.log('No share config found, opening create modal');
        setShowConfigModal(true);
      } else {
        console.error('加载共享配置失败:', err);
        // 显示错误提示
        alert('加载共享配置失败: ' + errorMessage || '请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfigSuccess = async () => {
    // 重新加载配置
    try {
      const config = await heartConnectApi.getMyShareConfig();
      setShareConfig(config);
      setShowShareDisplay(true);
      setShowConfigModal(false);
    } catch (err) {
      console.error('加载共享配置失败:', err);
    }
  };
  
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={(e) => {
            console.log('ShareButton icon clicked');
            handleOpenShare(e);
          }}
          disabled={loading}
          className={`p-2 rounded-lg hover:bg-gray-700 transition-colors ${className}`}
          title="共享心域"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        
        <ShareConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSuccess={handleConfigSuccess}
        />
        
        {showShareDisplay && shareConfig && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowShareDisplay(false)}
          >
            <div
              className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">我的共享配置</h2>
                  <button
                    onClick={() => setShowShareDisplay(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ShareCodeDisplay shareConfig={shareConfig} onRegenerate={handleConfigSuccess} />
                <ConnectionRequestList shareConfigId={shareConfig.id} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  if (variant === 'text') {
    return (
      <>
        <button
          onClick={(e) => handleOpenShare(e)}
          disabled={loading}
          className={`text-blue-400 hover:text-blue-300 transition-colors ${className}`}
        >
          {loading ? '加载中...' : '共享心域'}
        </button>
        
        <ShareConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSuccess={handleConfigSuccess}
        />
        
        {showShareDisplay && shareConfig && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowShareDisplay(false)}
          >
            <div
              className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">我的共享配置</h2>
                  <button
                    onClick={() => setShowShareDisplay(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ShareCodeDisplay shareConfig={shareConfig} onRegenerate={handleConfigSuccess} />
                <ConnectionRequestList shareConfigId={shareConfig.id} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  return (
    <>
      <button
        onClick={(e) => {
          console.log('ShareButton clicked, variant:', variant);
          handleOpenShare(e);
        }}
        disabled={loading}
        className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? '加载中...' : '共享心域'}
      </button>
      
      <ShareConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSuccess={handleConfigSuccess}
      />
      
      {showShareDisplay && shareConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowShareDisplay(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">我的共享配置</h2>
                <button
                  onClick={() => setShowShareDisplay(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ShareCodeDisplay shareConfig={shareConfig} onRegenerate={handleConfigSuccess} />
              <ConnectionRequestList shareConfigId={shareConfig.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

