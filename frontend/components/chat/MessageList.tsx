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
      <div className="text-white/50 text-center py-4">
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
              className={`
                max-w-[85%] sm:max-w-[70%] rounded-2xl overflow-hidden backdrop-blur-md shadow-lg text-sm sm:text-base leading-relaxed 
                ${isUserMsg ? 'bg-white/10 text-white border border-white/20 rounded-br-none' : 'text-white rounded-bl-none'}
                ${isCinematic ? '!bg-black/60 !border-none !text-lg !font-medium !text-center !w-full !max-w-2xl !mx-auto !rounded-xl' : ''} 
              `}
              style={!isCinematic && !isUserMsg ? {
                backgroundColor: `${character.colorAccent}33`,
                borderColor: `${character.colorAccent}4D`,
                borderWidth: '1px',
              } : {}}
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
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white hover:scale-110 active:scale-95"
                      >
                        {audioLoadingId === msg.id ? (
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-4 h-4 ${playingMessageId === msg.id ? 'text-pink-300 animate-pulse' : ''}`}
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
            className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border border-white/10 flex items-center space-x-2"
            style={{ backgroundColor: `${character.colorAccent}1A` }}
          >
            <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}
    </>
  );
});

MessageList.displayName = 'MessageList';
