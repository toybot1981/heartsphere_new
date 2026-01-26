import React, { useState, useEffect } from 'react';
import { UnreadCount } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';

interface UnreadBadgeProps {
  token: string;
  className?: string;
  showNumber?: boolean;
  maxNumber?: number;
}

/**
 * 未读消息徽章组件
 */
export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ 
  token, 
  className = '',
  showNumber = true,
  maxNumber = 99
}) => {
  const [unreadCount, setUnreadCount] = useState<UnreadCount | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadUnreadCount();
      // 定期刷新未读数量（每30秒）
      const interval = setInterval(loadUnreadCount, 30000);
      
      // 监听未读数量更新事件
      const handleUnreadUpdate = () => {
        loadUnreadCount();
      };
      
      window.addEventListener('mailbox:unread-updated', handleUnreadUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('mailbox:unread-updated', handleUnreadUpdate);
      };
    }
  }, [token]);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const count = await mailboxApi.getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error('[UnreadBadge] 加载未读数量失败:', error);
      // 出错时设置为null，避免显示错误数据
      setUnreadCount(null);
    } finally {
      setLoading(false);
    }
  };

  const total = unreadCount?.totalUnread || unreadCount?.total || 0;

  if (total === 0) {
    return null;
  }

  const displayNumber = total > maxNumber ? `${maxNumber}+` : total.toString();

  return (
    <div className={`relative inline-block ${className}`}>
      {showNumber ? (
        <span 
          className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-error, #ef4444)',
            color: 'var(--text-primary)',
          }}
        >
          {displayNumber}
        </span>
      ) : (
        <span 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: 'var(--color-error, #ef4444)' }}
        />
      )}
    </div>
  );
};

/**
 * 分类未读徽章组件（用于分类标签）
 */
interface CategoryBadgeProps {
  category: 'esoul_letter' | 'resonance' | 'system' | 'user_message';
  unreadCount: UnreadCount;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  unreadCount,
  className = ''
}) => {
  // 从categoryUnread Map中获取，如果不存在则使用兼容字段
  const categoryMap = unreadCount.categoryUnread || {};
  let count = 0;
  
  if (category === 'esoul_letter') {
    count = categoryMap['ESOUL_LETTER'] || unreadCount.esoulLetter || 0;
  } else if (category === 'resonance') {
    count = categoryMap['RESONANCE'] || unreadCount.resonance || 0;
  } else if (category === 'system') {
    count = categoryMap['SYSTEM'] || unreadCount.system || 0;
  } else {
    count = categoryMap['USER_MESSAGE'] || unreadCount.userMessage || 0;
  }

  if (count === 0) {
    return null;
  }

  return (
    <span 
      className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${className}`}
      style={{
        backgroundColor: 'var(--color-error, #ef4444)',
        color: 'var(--text-primary)',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

