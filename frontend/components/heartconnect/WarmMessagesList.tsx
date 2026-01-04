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
        <h3 className="text-lg font-semibold text-white">暖心留言</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : error ? (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">💌</div>
          <p>还没有收到留言</p>
          <p className="text-sm mt-1">当访问者离开你的共享心域时，可以留下暖心留言</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                    {message.visitorName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-white font-medium">{message.visitorName || '匿名用户'}</span>
                </div>
                <span className="text-gray-400 text-xs">{formatDate(message.createdAt)}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && messages.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          共收到 {messages.length} 条留言
        </div>
      )}
    </div>
  );
};
