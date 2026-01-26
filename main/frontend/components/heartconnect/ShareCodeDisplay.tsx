import React, { useState } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import { QRCodeGenerator } from './QRCodeGenerator';
import { WarmMessagesList } from './WarmMessagesList';
import { logger } from '../../utils/logger';
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
  const [showMessages, setShowMessages] = useState(false);
  
  const shareUrl = `${window.location.origin}/share/${shareConfig.shareCode}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('复制失败:', err);
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
      logger.error('重新生成共享码失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-secondary, #1f2937)',
        borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
      }}
    >
      <h3 
        className="font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        分享链接
      </h3>
      
      {/* 共享码 */}
      <div className="mb-4">
        <label 
          className="block text-sm mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          共享码
        </label>
        <div className="flex items-center gap-2">
          <div 
            className="flex-1 px-4 py-2 border rounded-lg font-mono text-lg"
            style={{
              backgroundColor: 'var(--bg-primary, #111827)',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
              color: 'var(--text-primary)',
            }}
          >
            {shareConfig.shareCode}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
            }}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
      
      {/* 分享链接 */}
      <div className="mb-4">
        <label 
          className="block text-sm mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          分享链接
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-2 border rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--bg-primary, #111827)',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
            }}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>
      
      {/* 二维码 */}
      <div className="mb-4">
        <label 
          className="block text-sm mb-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          二维码
        </label>
        <div 
          className="flex justify-center p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-card, #ffffff)' }}
        >
          <QRCodeGenerator text={shareUrl} size={200} />
        </div>
        <p 
          className="text-center text-xs mt-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          扫描二维码快速访问
        </p>
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {shareConfig.viewCount}
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            查看次数
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {shareConfig.requestCount}
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            请求次数
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {shareConfig.approvedCount}
          </div>
          <div 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            已批准
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-primary, #a855f7)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #9333ea)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary, #a855f7)';
          }}
        >
          <span>💌</span>
          <span>{showMessages ? '隐藏留言' : '查看留言'}</span>
        </button>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--bg-secondary, #374151)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, #4b5563)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #374151)';
          }}
        >
          {loading ? '生成中...' : '重新生成共享码'}
        </button>
      </div>

      {/* 留言列表 */}
      {showMessages && (
        <div 
          className="mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <WarmMessagesList
            shareConfigId={shareConfig.id}
            onClose={() => setShowMessages(false)}
          />
        </div>
      )}
    </div>
  );
};

