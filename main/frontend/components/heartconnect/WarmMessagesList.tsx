import React, { useState, useEffect } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import { logger } from '../../utils/logger';

interface WarmMessage {
  id: number;
  shareConfigId: number;
  visitorId: number;
  visitorName: string;
  message: string;
  createdAt: number;
}

interface WarmMessagesListProps {
  shareConfigId: number;
  onClose?: () => void;
}

/**
 * 暖心留言列表组件
 * 显示共享心域收到的所有留言
 */
export const WarmMessagesList: React.FC<WarmMessagesListProps> = ({
  shareConfigId,
  onClose,
}) => {
  const [messages, setMessages] = useState<WarmMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [shareConfigId]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await heartConnectApi.getWarmMessages(shareConfigId);
      setMessages(data || []);
    } catch (err: unknown) {
      logger.error('加载留言失败:', err);
      setError('加载留言失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          暖心留言
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div 
          className="text-center py-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          加载中...
        </div>
      ) : error ? (
        <div 
          className="p-4 border rounded-lg"
          style={{
            backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
            borderColor: 'var(--color-error, rgba(239, 68, 68, 0.5))',
            color: 'var(--color-error, #fca5a5)',
          }}
        >
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div 
          className="text-center py-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <div className="text-4xl mb-2">💌</div>
          <p>还没有收到留言</p>
          <p className="text-sm mt-1">当访问者离开你的共享心域时，可以留下暖心留言</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-4 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-hover, #4b5563)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                    style={{
                      backgroundColor: 'var(--color-primary, rgba(59, 130, 246, 0.2))',
                      color: 'var(--color-primary, #60a5fa)',
                    }}
                  >
                    {message.visitorName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span 
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {message.visitorName || '匿名用户'}
                  </span>
                </div>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <p 
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {message.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && messages.length > 0 && (
        <div 
          className="text-center text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          共收到 {messages.length} 条留言
        </div>
      )}
    </div>
  );
};
