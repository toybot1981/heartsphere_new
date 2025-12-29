import React, { useState } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import { QRCodeGenerator } from './QRCodeGenerator';
import type { ShareConfig } from '../../services/api/heartconnect/types';

interface ShareCodeDisplayProps {
  shareConfig: ShareConfig;
  onRegenerate?: () => void;
}

/**
 * 共享码显示组件
 */
export const ShareCodeDisplay: React.FC<ShareCodeDisplayProps> = ({
  shareConfig,
  onRegenerate,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/share/${shareConfig.shareCode}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };
  
  const handleRegenerate = async () => {
    if (!confirm('重新生成共享码后，旧的共享码将失效。确定要继续吗？')) {
      return;
    }
    
    setLoading(true);
    try {
      await heartConnectApi.regenerateShareCode(shareConfig.id);
      onRegenerate?.();
    } catch (err) {
      console.error('重新生成共享码失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-white font-semibold mb-4">分享链接</h3>
      
      {/* 共享码 */}
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2">共享码</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-lg">
            {shareConfig.shareCode}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
      
      {/* 分享链接 */}
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2">分享链接</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
      
      {/* 二维码 */}
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2">二维码</label>
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeGenerator text={shareUrl} size={200} />
        </div>
        <p className="text-center text-gray-400 text-xs mt-2">扫描二维码快速访问</p>
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{shareConfig.viewCount}</div>
          <div className="text-sm text-gray-400">查看次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{shareConfig.requestCount}</div>
          <div className="text-sm text-gray-400">请求次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{shareConfig.approvedCount}</div>
          <div className="text-sm text-gray-400">已批准</div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          {loading ? '生成中...' : '重新生成共享码'}
        </button>
      </div>
    </div>
  );
};

