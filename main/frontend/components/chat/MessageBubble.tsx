/**
 * 消息气泡组件
 * 提取消息渲染逻辑，优化性能和可维护性
 */

import React, { memo, useMemo } from 'react';
import { Message } from '../../types';
import { RichTextRenderer } from './RichTextRenderer';
import { SkillUsageBadges } from './SkillUsageBadge';

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
    const user = isUser ? 'rounded-br-none' : 'rounded-bl-none';
    const cinematic = isCinematic ? '!border-none !text-lg !font-medium !text-center !w-full !max-w-2xl !mx-auto !rounded-xl' : '';
    return `${base} ${user} ${cinematic}`;
  }, [isUser, isCinematic]);

  // 使用useMemo优化样式计算
  const bubbleStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      color: 'var(--text-primary)',
    };
    
    if (isCinematic) {
      return {
        ...baseStyle,
        backgroundColor: 'var(--bg-overlay-alpha, rgba(0, 0, 0, 0.85))',
        backdropFilter: 'blur(16px) saturate(180%)',  // 毛玻璃效果 + 饱和度增强
        borderWidth: '1px',
        borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',  // 内外阴影增强深度
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.3)',  // 文字阴影增强可读性
      };
    }
    
    if (isUser) {
      return {
        ...baseStyle,
        backgroundColor: 'var(--bg-secondary-alpha, rgba(30, 41, 59, 0.6))',
        borderColor: 'var(--border-color-overlay)',
        borderWidth: '1px',
        backdropFilter: 'blur(12px)',
      };
    }
    
    return {
      ...baseStyle,
      backgroundColor: `${colorAccent}66`,  // 从不透明度33增加到66，增强背景
      borderColor: `${colorAccent}80`,  // 增强边框
      borderWidth: '1px',
      backdropFilter: 'blur(12px)',  // 添加毛玻璃效果
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
            <RichTextRenderer 
              text={message.text} 
              colorAccent={colorAccent}
              skillName={message.skillName}
            />
            {/* 技能使用标记 */}
            {message.role === 'model' && !isCinematic && message.metadata?.skillApplications?.appliedSkills && (
              <SkillUsageBadges
                skills={message.metadata.skillApplications.appliedSkills.map((skill: any) => ({
                  skillId: skill.skillId || skill.id,
                  skillName: skill.skillName || skill.name,
                  score: skill.score || skill.compositeScore,
                }))}
              />
            )}
            {message.role === 'model' && !isCinematic && showAudioButton && onPlayAudio && (
              <div className="mt-2 w-full flex justify-end">
                <button
                  onClick={() => onPlayAudio(message.id, message.text)}
                  disabled={audioLoadingId === message.id}
                  className="p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-secondary-alpha)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  title={playingMessageId === message.id ? '停止播放' : '播放语音'}
                >
                  {audioLoadingId === message.id ? (
                    <div 
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: 'var(--border-color-overlay)',
                        borderTopColor: 'var(--color-primary)',
                      }}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`w-4 h-4 ${playingMessageId === message.id ? 'animate-pulse' : ''}`}
                      style={{
                        color: playingMessageId === message.id 
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
}, (prevProps, nextProps) => {
  // 自定义比较函数，优化重渲染
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.image === nextProps.message.image &&
    prevProps.message.skillId === nextProps.message.skillId &&
    prevProps.message.skillName === nextProps.message.skillName &&
    prevProps.isCinematic === nextProps.isCinematic &&
    prevProps.audioLoadingId === nextProps.audioLoadingId &&
    prevProps.playingMessageId === nextProps.playingMessageId
  );
});

MessageBubble.displayName = 'MessageBubble';
