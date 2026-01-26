/**
 * 消息列表组件
 * 可复用的消息列表渲染组件，与ChatWindow样式保持一致
 */

import React, { memo } from 'react';
import { Message, Character } from '../../types';
import { RichTextRenderer } from './RichTextRenderer';

interface MessageListProps {
  messages: Message[];
  character: Character;
  isLoading?: boolean;
  isCinematic?: boolean;
  onPlayAudio?: (msgId: string, text: string) => void;
  audioLoadingId?: string | null;
  playingMessageId?: string | null;
  showAudioButton?: boolean;
}

/**
 * 消息列表组件
 * 复用ChatWindow的消息渲染样式和逻辑
 */
export const MessageList = memo<MessageListProps>(({
  messages,
  character,
  isLoading = false,
  isCinematic = false,
  onPlayAudio,
  audioLoadingId,
  playingMessageId,
  showAudioButton = false,
}) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div 
        className="text-center py-4"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <p>暂无消息</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg, index) => {
        if (!msg || !msg.text) {
          return null;
        }

        const isUserMsg = msg.role === 'user';
        const willBeHidden = isCinematic && isUserMsg;

        return (
          <div
            key={`msg-${msg.id}-${index}`}
            className={`flex w-full ${isUserMsg ? 'justify-end' : 'justify-start'}`}
            style={willBeHidden ? { opacity: 0, height: 0, overflow: 'hidden' } : {}}
          >
            <div
              className="max-w-[85%] sm:max-w-[70%] rounded-2xl overflow-hidden backdrop-blur-md shadow-lg text-sm sm:text-base leading-relaxed"
              style={{
                ...(isUserMsg ? {
                  backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                  borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
                  borderWidth: '1px',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                } : {}),
                ...(isCinematic ? {
                  backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '32rem',
                  margin: '0 auto',
                  borderRadius: 'var(--radius-xl)',
                } : {}),
                ...(!isCinematic && !isUserMsg ? {
                  backgroundColor: `${character.colorAccent}33`,
                  borderColor: `${character.colorAccent}4D`,
                  borderWidth: '1px',
                  borderRadius: 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)',
                } : {}),
                color: 'var(--text-primary)',
              }}
            >
              {msg.image ? (
                <div className="p-1">
                  <img src={msg.image} alt="Generated" className="w-full h-auto rounded-xl shadow-inner" />
                </div>
              ) : (
                <div className={`px-5 py-3 flex flex-col ${isCinematic ? 'items-center' : 'items-start'}`}>
                  <RichTextRenderer text={msg.text} colorAccent={character.colorAccent} />
                  {msg.role === 'model' && !isCinematic && showAudioButton && onPlayAudio && (
                    <div className="mt-2 w-full flex justify-end">
                      <button
                        onClick={() => onPlayAudio(msg.id, msg.text)}
                        disabled={audioLoadingId === msg.id}
                        className="p-1.5 rounded-full transition-all hover:scale-110 active:scale-95"
                        style={{
                          backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                          color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {audioLoadingId === msg.id ? (
                          <div 
                            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                            style={{
                              borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.5))',
                              borderTopColor: 'var(--text-primary)',
                            }}
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-4 h-4 ${playingMessageId === msg.id ? 'animate-pulse' : ''}`}
                            style={{
                              color: playingMessageId === msg.id 
                                ? 'var(--color-primary, #f9a8d4)' 
                                : 'var(--text-primary)',
                            }}
                          >
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0 2.25 2.25 0 0 1 0 3.182.75.75 0 0 0 0-3.182.75.75 0 0 1 0-1.06Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {isLoading && messages.length > 0 && (
        <div className="flex justify-start w-full">
          <div
            className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border flex items-center space-x-2"
            style={{
              backgroundColor: `${character.colorAccent}1A`,
              borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
            }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
                animationDelay: '0s',
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
                animationDelay: '0.2s',
              }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
                animationDelay: '0.4s',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
});

MessageList.displayName = 'MessageList';
