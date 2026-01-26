/**
 * 卡片发送组件
 */

import React, { useState } from 'react';
import { Card } from '../../services/card-system/types/CardTypes';
import { CardPreview } from './CardPreview';

interface CardSenderProps {
  card: Card;
  userId: number;
  onSend: (card: Card, recipientId: number, message?: string) => void;
  onClose: () => void;
}

export const CardSender: React.FC<CardSenderProps> = ({ card, userId, onSend, onClose }) => {
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  // TODO: 从用户系统获取用户列表
  const users = [
    { id: 1, name: '用户1' },
    { id: 2, name: '用户2' },
    { id: 3, name: '用户3' },
  ];

  const handleSend = () => {
    if (recipientId) {
      onSend(card, recipientId, message);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.5))' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--bg-modal, #ffffff)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-color-overlay, #e5e7eb)' }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            发送卡片
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 卡片预览 */}
          <div className="mb-6">
            <h4 
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              卡片预览
            </h4>
            <CardPreview card={card} className="max-w-md mx-auto" />
          </div>

          {/* 收件人选择 */}
          <div className="mb-4">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              发送给
            </label>
            <div className="relative">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="w-full px-4 py-2 border rounded-lg text-left transition-colors"
                style={{
                  borderColor: 'var(--border-color-overlay, #d1d5db)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay, #d1d5db)';
                }}
              >
                {recipientId
                  ? users.find((u) => u.id === recipientId)?.name || `用户 ${recipientId}`
                  : '选择收件人...'}
              </button>
              {showUserList && (
                <div 
                  className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--bg-modal, #ffffff)',
                    borderColor: 'var(--border-color-overlay, #d1d5db)',
                  }}
                >
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setRecipientId(user.id);
                        setShowUserList(false);
                      }}
                      className="w-full px-4 py-2 text-left transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.1))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 附加消息 */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              附加消息（可选）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入附加消息..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg transition-colors resize-none"
              style={{
                borderColor: 'var(--border-color-overlay, #d1d5db)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #d1d5db)';
              }}
            />
          </div>
        </div>

        {/* 底部操作 */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--border-color-overlay, #e5e7eb)' }}
        >
          <button
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-card, rgba(243, 244, 246, 1))',
              color: 'var(--text-primary)',
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(229, 231, 235, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(243, 244, 246, 1))';
            }}
          >
            取消
          </button>
          <button
            className="px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: !recipientId
                ? 'var(--bg-disabled, #d1d5db)'
                : 'var(--color-primary, #ec4899)',
              color: 'var(--text-primary)',
            }}
            onClick={handleSend}
            disabled={!recipientId}
            onMouseEnter={(e) => {
              if (recipientId) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
              }
            }}
            onMouseLeave={(e) => {
              if (recipientId) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary, #ec4899)';
              }
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};




