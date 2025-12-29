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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">发送卡片</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 卡片预览 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">卡片预览</h4>
            <CardPreview card={card} className="max-w-md mx-auto" />
          </div>

          {/* 收件人选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">发送给</label>
            <div className="relative">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-white hover:border-pink-400 transition-colors"
              >
                {recipientId
                  ? users.find((u) => u.id === recipientId)?.name || `用户 ${recipientId}`
                  : '选择收件人...'}
              </button>
              {showUserList && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setRecipientId(user.id);
                        setShowUserList(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-pink-50 transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">附加消息（可选）</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="输入附加消息..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* 底部操作 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={!recipientId}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

