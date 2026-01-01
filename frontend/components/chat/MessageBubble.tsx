/**
 * 消息气泡组件
 * 提取消息渲染逻辑，优化性能和可维护性
 */

import React, { memo, useMemo } from 'react';
import { Message } from '../../types';
import { RichTextRenderer } from './RichTextRenderer';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  isCinematic: boolean;
  colorAccent: string;
  onPlayAudio?: (msgId: string, text: string) => void;
  audioLoadingId?: string | null;
  playingMessageId?: string | null;
  showAudioButton?: boolean;
}

/**
 * 消息气泡组件
 * 使用memo优化，避免不必要的重渲染
 */
export const MessageBubble = memo<MessageBubbleProps>(({
  message,
  isUser,
  isCinematic,
  colorAccent,
  onPlayAudio,
  audioLoadingId,
  playingMessageId,
  showAudioButton = false,
}) => {
  // 使用useMemo优化className计算
  const bubbleClasses = useMemo(() => {
    const base = 'max-w-[85%] sm:max-w-[70%] rounded-2xl overflow-hidden backdrop-blur-md shadow-lg text-sm sm:text-base leading-relaxed';
    const user = isUser ? 'bg-white/10 text-white border border-white/20 rounded-br-none' : 'text-white rounded-bl-none';
    const cinematic = isCinematic ? '!bg-black/60 !border-none !text-lg !font-medium !text-center !w-full !max-w-2xl !mx-auto !rounded-xl' : '';
    return `${base} ${user} ${cinematic}`;
  }, [isUser, isCinematic]);

  // 使用useMemo优化样式计算
  const bubbleStyle = useMemo(() => {
    if (isCinematic || isUser) return {};
    return {
      backgroundColor: `${colorAccent}33`,
      borderColor: `${colorAccent}4D`,
      borderWidth: '1px',
    };
  }, [isCinematic, isUser, colorAccent]);

  const willBeHidden = isCinematic && isUser;

  if (willBeHidden) {
    return (
      <div
        className="flex w-full justify-end"
        style={{ opacity: 0, height: 0, overflow: 'hidden' }}
      />
    );
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={bubbleClasses} style={bubbleStyle}>
        {message.image ? (
          <div className="p-1">
            <img
              src={message.image}
              alt="Generated"
              className="w-full h-auto rounded-xl shadow-inner"
              loading="lazy"
            />
          </div>
        ) : (
          <div className={`px-5 py-3 flex flex-col ${isCinematic ? 'items-center' : 'items-start'}`}>
            <RichTextRenderer text={message.text} colorAccent={colorAccent} />
            {message.role === 'model' && !isCinematic && showAudioButton && onPlayAudio && (
              <div className="mt-2 w-full flex justify-end">
                <button
                  onClick={() => onPlayAudio(message.id, message.text)}
                  disabled={audioLoadingId === message.id}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white hover:scale-110 active:scale-95 disabled:opacity-50"
                  title={playingMessageId === message.id ? '停止播放' : '播放语音'}
                >
                  {audioLoadingId === message.id ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`w-4 h-4 ${playingMessageId === message.id ? 'text-pink-300 animate-pulse' : ''}`}
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
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化重渲染
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.image === nextProps.message.image &&
    prevProps.isCinematic === nextProps.isCinematic &&
    prevProps.audioLoadingId === nextProps.audioLoadingId &&
    prevProps.playingMessageId === nextProps.playingMessageId
  );
});

MessageBubble.displayName = 'MessageBubble';
