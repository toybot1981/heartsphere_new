/**
 * 写信/创建消息模态框组件
 * 
 * 用于用户创建新的消息（如用户反馈、E-SOUL消息等）
 */

import React, { useState, useEffect } from 'react';
import { MessageCategory, MessageType, SenderType, CreateMessageRequest } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';
import { eraApi } from '../../services/api/scene/era';
import { characterApi } from '../../services/api/character/character';
import type { UserEra } from '../../services/api/scene/types';
import type { UserCharacter } from '../../services/api/character/types';

interface ComposeMessageModalProps {
  token: string;
  currentUserId: number;
  onClose: () => void;
  onSuccess?: () => void;
  defaultReceiverId?: number; // 默认接收者ID（如管理员）
}

interface ReceiverOption {
  id: string; // 'admin' 或角色ID字符串
  name: string;
  type: 'admin' | 'character';
  characterId?: number;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  token,
  currentUserId,
  onClose,
  onSuccess,
  defaultReceiverId,
}) => {
  const [messageType, setMessageType] = useState<MessageType>(MessageType.SYSTEM_FEEDBACK);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState<string>('admin');
  const [eras, setEras] = useState<UserEra[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<UserCharacter[]>([]);
  const [receiverOptions, setReceiverOptions] = useState<ReceiverOption[]>([]);
  const [isLoadingReceivers, setIsLoadingReceivers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载场景列表
  useEffect(() => {
    const loadEras = async () => {
      try {
        const allEras = await eraApi.getAllEras(token);
        setEras(allEras);
        if (allEras.length > 0) {
          setSelectedEraId(allEras[0].id);
        }
      } catch (err) {
        console.error('加载场景列表失败:', err);
      }
    };
    loadEras();
  }, [token]);

  // 当选择场景后，加载该场景的角色列表
  useEffect(() => {
    if (selectedEraId) {
      const loadCharacters = async () => {
        try {
          setIsLoadingReceivers(true);
          const chars = await characterApi.getCharactersByEraId(selectedEraId, token);
          setCharacters(chars);
          
          // 更新收件人选项
          const options: ReceiverOption[] = chars.map(char => ({
            id: `character_${char.id}`,
            name: char.name,
            type: 'character',
            characterId: char.id,
          }));
          setReceiverOptions(options);
          
          // 如果有角色，默认选择第一个
          if (options.length > 0 && !selectedReceiver.startsWith('character_')) {
            setSelectedReceiver(options[0].id);
          }
        } catch (err) {
          console.error('加载角色列表失败:', err);
          setCharacters([]);
          setReceiverOptions([]);
        } finally {
          setIsLoadingReceivers(false);
        }
      };
      loadCharacters();
    }
  }, [selectedEraId, token]);

  // 当消息类型改变时，更新收件人选项
  useEffect(() => {
    if (messageType === MessageType.SYSTEM_FEEDBACK) {
      // 系统反馈：只有管理员选项
      setReceiverOptions([{ id: 'admin', name: '系统管理员', type: 'admin' }]);
      setSelectedReceiver('admin');
    } else if ([
      MessageType.ESOUL_GREETING,
      MessageType.ESOUL_CARE,
      MessageType.ESOUL_SHARE,
      MessageType.ESOUL_REMINDER
    ].includes(messageType)) {
      // E-SOUL消息：显示角色列表
      const options: ReceiverOption[] = characters.map(char => ({
        id: `character_${char.id}`,
        name: char.name,
        type: 'character',
        characterId: char.id,
      }));
      setReceiverOptions(options);
      if (options.length > 0) {
        setSelectedReceiver(options[0].id);
      }
    }
  }, [messageType, characters]);

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('请填写主题和内容');
      return;
    }

    if (!selectedReceiver) {
      setError('请选择收件人');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // 根据收件人类型确定receiverId
      let receiverId: number;
      let relatedId: number | undefined;
      let relatedType: string | undefined;
      
      if (selectedReceiver === 'admin') {
        receiverId = 1; // 管理员ID
      } else if (selectedReceiver.startsWith('character_')) {
        const characterId = parseInt(selectedReceiver.replace('character_', ''));
        // 对于E-SOUL消息，用户写给角色，消息应该发送给用户自己
        // 角色ID存储在relatedId中
        receiverId = currentUserId; // 发送给自己
        relatedId = characterId; // 关联的角色ID
        relatedType = 'character';
      } else {
        receiverId = defaultReceiverId || currentUserId;
      }

      // 根据消息类型确定分类
      let messageCategory: MessageCategory;
      if (messageType === MessageType.SYSTEM_FEEDBACK) {
        messageCategory = MessageCategory.SYSTEM;
      } else if ([
        MessageType.ESOUL_GREETING,
        MessageType.ESOUL_CARE,
        MessageType.ESOUL_SHARE,
        MessageType.ESOUL_REMINDER
      ].includes(messageType)) {
        messageCategory = MessageCategory.ESOUL_LETTER;
      } else {
        messageCategory = MessageCategory.USER_MESSAGE;
      }

      const request: CreateMessageRequest = {
        receiverId: receiverId,
        senderType: SenderType.USER,
        senderId: currentUserId,
        messageType: messageType,
        messageCategory: messageCategory,
        title: subject.trim(),
        content: content.trim(),
        isRead: false,
        isImportant: false,
        isStarred: false,
        relatedId: relatedId,
        relatedType: relatedType,
        // 如果是角色消息，在contentData中存储角色ID（用于后端处理）
        contentData: selectedReceiver.startsWith('character_') 
          ? JSON.stringify({ characterId: parseInt(selectedReceiver.replace('character_', '')) })
          : undefined,
      };

      await mailboxApi.createMessage(request, token);
      
      setSubject('');
      setContent('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('发送消息失败:', err);
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            ✉️ 写信
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 消息类型选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              消息类型
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              disabled={isSending}
            >
              <option value={MessageType.SYSTEM_FEEDBACK}>系统反馈</option>
              <option value={MessageType.ESOUL_GREETING}>E-SOUL问候</option>
              <option value={MessageType.ESOUL_CARE}>E-SOUL关怀</option>
              <option value={MessageType.ESOUL_SHARE}>E-SOUL分享</option>
              <option value={MessageType.ESOUL_REMINDER}>E-SOUL提醒</option>
            </select>
          </div>

          {/* 收件人选择 */}
          {messageType === MessageType.SYSTEM_FEEDBACK ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                收件人
              </label>
              <select
                value={selectedReceiver}
                onChange={(e) => setSelectedReceiver(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                disabled={isSending}
              >
                <option value="admin">系统管理员 (admin)</option>
              </select>
            </div>
          ) : (
            <>
              {/* 场景选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  场景
                </label>
                <select
                  value={selectedEraId || ''}
                  onChange={(e) => setSelectedEraId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  disabled={isSending || isLoadingReceivers}
                >
                  <option value="">请选择场景</option>
                  {eras.map(era => (
                    <option key={era.id} value={era.id}>{era.name}</option>
                  ))}
                </select>
              </div>

              {/* 角色选择 */}
              {selectedEraId && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    收件人（角色）
                  </label>
                  {isLoadingReceivers ? (
                    <div className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-slate-400 text-center">
                      加载中...
                    </div>
                  ) : receiverOptions.length > 0 ? (
                    <select
                      value={selectedReceiver}
                      onChange={(e) => setSelectedReceiver(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      disabled={isSending}
                    >
                      {receiverOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-slate-400 text-center">
                      该场景暂无角色
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              主题
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="请输入主题..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              disabled={isSending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入内容..."
              rows={6}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              disabled={isSending}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSending}
              className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSending || !subject.trim() || !content.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  发送中...
                </span>
              ) : (
                '发送'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


