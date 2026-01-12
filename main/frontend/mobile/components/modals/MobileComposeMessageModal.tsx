/**
 * Mobile版本写信/创建消息模态框组件
 * 参照PC版本ComposeMessageModal，按照Mobile风格重新设计
 */

import React, { useState, useEffect, memo } from 'react';
import { MessageCategory, MessageType, SenderType, CreateMessageRequest } from '../../../types/mailbox';
import { mailboxApi } from '../../../services/api/mailbox';
import { eraApi } from '../../../services/api/scene/era';
import { characterApi } from '../../../services/api/character/character';
import type { UserEra } from '../../../services/api/scene/types';
import type { UserCharacter } from '../../../services/api/character/types';
import { MobileModalContainer } from '../MobileModalContainer';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileFormField } from '../MobileFormField';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileStatusStyles, MobileColors, MobileTypography, MobileSpacing, MobileInputStyles } from '../MobileStyleGuide';

interface MobileComposeMessageModalProps {
  token: string;
  currentUserId: number;
  onClose: () => void;
  onSuccess?: () => void;
  defaultReceiverId?: number;
}

interface ReceiverOption {
  id: string;
  name: string;
  type: 'admin' | 'character';
  characterId?: number;
}

/**
 * Mobile版本写信模态框
 */
export const MobileComposeMessageModal: React.FC<MobileComposeMessageModalProps> = memo(({
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
        console.error('[MobileComposeMessageModal] 加载场景列表失败:', err);
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
          
          const options: ReceiverOption[] = chars.map(char => ({
            id: `character_${char.id}`,
            name: char.name,
            type: 'character',
            characterId: char.id,
          }));
          setReceiverOptions(options);
          
          if (options.length > 0 && !selectedReceiver.startsWith('character_')) {
            setSelectedReceiver(options[0].id);
          }
        } catch (err) {
          console.error('[MobileComposeMessageModal] 加载角色列表失败:', err);
          setCharacters([]);
          setReceiverOptions([]);
        } finally {
          setIsLoadingReceivers(false);
        }
      };
      loadCharacters();
    }
  }, [selectedEraId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // 当消息类型改变时，更新收件人选项
  useEffect(() => {
    if (messageType === MessageType.SYSTEM_FEEDBACK) {
      setReceiverOptions([{ id: 'admin', name: '系统管理员', type: 'admin' }]);
      setSelectedReceiver('admin');
    } else if ([
      MessageType.ESOUL_GREETING,
      MessageType.ESOUL_CARE,
      MessageType.ESOUL_SHARE,
      MessageType.ESOUL_REMINDER
    ].includes(messageType)) {
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
      let receiverId: number;
      let relatedId: number | undefined;
      let relatedType: string | undefined;
      
      if (selectedReceiver === 'admin') {
        receiverId = 1;
      } else if (selectedReceiver.startsWith('character_')) {
        const characterId = parseInt(selectedReceiver.replace('character_', ''));
        receiverId = currentUserId;
        relatedId = characterId;
        relatedType = 'character';
      } else {
        receiverId = defaultReceiverId || currentUserId;
      }

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
      console.error('[MobileComposeMessageModal] 发送消息失败:', err);
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MobileModalContainer
      isOpen={true}
      onClose={onClose}
      title="✉️ 写信"
      size="lg"
      closeOnBackdrop={!isSending}
    >
      <div className="flex flex-col min-h-0 max-h-[calc(90vh-8rem)]">
        {/* 错误提示 */}
        {error && (
          <div className={`${MobileStatusStyles.error.container} ${MobileSpacing.margin.bottom.md}`} role="alert">
            <p className={MobileStatusStyles.error.text}>{error}</p>
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className={`space-y-4 ${MobileSpacing.padding.md}`}>
            <MobileFormField label="消息类型" required>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as MessageType)}
                className={MobileInputStyles}
                disabled={isSending}
                aria-label="消息类型"
              >
                <option value={MessageType.SYSTEM_FEEDBACK}>系统反馈</option>
                <option value={MessageType.ESOUL_GREETING}>E-SOUL问候</option>
                <option value={MessageType.ESOUL_CARE}>E-SOUL关怀</option>
                <option value={MessageType.ESOUL_SHARE}>E-SOUL分享</option>
                <option value={MessageType.ESOUL_REMINDER}>E-SOUL提醒</option>
              </select>
            </MobileFormField>

            {/* 收件人选择 */}
            {messageType === MessageType.SYSTEM_FEEDBACK ? (
              <MobileFormField label="收件人" required>
                <select
                  value={selectedReceiver}
                  onChange={(e) => setSelectedReceiver(e.target.value)}
                  className={MobileInputStyles}
                  disabled={isSending}
                  aria-label="收件人"
                >
                  <option value="admin">系统管理员</option>
                </select>
              </MobileFormField>
            ) : (
              <>
                <MobileFormField label="场景" required>
                  <select
                    value={selectedEraId || ''}
                    onChange={(e) => setSelectedEraId(e.target.value ? parseInt(e.target.value) : null)}
                    className={MobileInputStyles}
                    disabled={isSending || isLoadingReceivers}
                    aria-label="场景"
                  >
                    <option value="">请选择场景</option>
                    {eras.map(era => (
                      <option key={era.id} value={era.id}>{era.name}</option>
                    ))}
                  </select>
                </MobileFormField>

                {selectedEraId && (
                  <MobileFormField label="收件人（角色）" required>
                    {isLoadingReceivers ? (
                      <div className="flex items-center justify-center py-4">
                        <MobileLoadingSpinner size="md" />
                      </div>
                    ) : receiverOptions.length > 0 ? (
                      <select
                        value={selectedReceiver}
                        onChange={(e) => setSelectedReceiver(e.target.value)}
                        className={MobileInputStyles}
                        disabled={isSending}
                        aria-label="收件人（角色）"
                      >
                        {receiverOptions.map(option => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className={`${MobileInputStyles} text-center ${MobileColors.text.muted}`}>
                        该场景暂无角色
                      </div>
                    )}
                  </MobileFormField>
                )}
              </>
            )}

            <MobileFormField label="主题" required>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="请输入主题..."
                className={MobileInputStyles}
                disabled={isSending}
                aria-label="主题"
              />
            </MobileFormField>

            <MobileFormField label="内容" required>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入内容..."
                rows={6}
                className={`${MobileInputStyles} resize-none`}
                disabled={isSending}
                aria-label="内容"
              />
            </MobileFormField>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className={`flex items-center gap-3 ${MobileSpacing.padding.md} border-t ${MobileColors.border.default} mt-4 pt-4 shrink-0`}>
          <MobileTouchableButton
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSending}
            aria-label="取消"
          >
            取消
          </MobileTouchableButton>
          <MobileTouchableButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSending || !subject.trim() || !content.trim()}
            loading={isSending}
            aria-label="发送"
          >
            发送
          </MobileTouchableButton>
        </div>
      </div>
    </MobileModalContainer>
  );
});

MobileComposeMessageModal.displayName = 'MobileComposeMessageModal';
