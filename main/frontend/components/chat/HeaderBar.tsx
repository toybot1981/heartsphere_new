/**
 * 头部栏组件
 * 提取ChatWindow的头部栏逻辑
 */

import React, { memo } from 'react';
import { Character, CustomScenario } from '../../types';
import { Button } from '../Button';

interface HeaderBarProps {
  character: Character;
  customScenario: CustomScenario | undefined;
  isCinematic: boolean;
  isVoiceMode: boolean;
  isListening: boolean;
  isWaitingForResponse: boolean;
  isGeneratingScene: boolean;
  isPlayingAudio: boolean;
  isCrystalizing?: boolean;
  generatedEcho?: boolean;
  onBack: () => void;
  onToggleVoiceMode: () => void;
  onToggleCinematic: () => void;
  onCrystalize?: () => void;
  onTriggerESoulLetter?: () => void;
  isTriggeringLetter?: boolean;
  onToggleSkillDebug?: () => void;
  isSkillDebugVisible?: boolean;
}

/**
 * 头部栏组件
 * 使用memo优化，避免不必要的重渲染
 */
export const HeaderBar = memo<HeaderBarProps>(({
  character,
  customScenario,
  isCinematic,
  isVoiceMode,
  isListening,
  isWaitingForResponse,
  isGeneratingScene,
  isPlayingAudio,
  isCrystalizing = false,
  generatedEcho,
  onBack,
  onToggleVoiceMode,
  onToggleCinematic,
  onCrystalize,
  onTriggerESoulLetter,
  isTriggeringLetter = false,
  onToggleSkillDebug,
  isSkillDebugVisible = false,
}) => {
  if (isCinematic) {
    return null;
  }

  return (
    <div 
      className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center transition-opacity duration-500"
      style={{
        background: 'linear-gradient(to bottom, var(--bg-overlay, rgba(0, 0, 0, 0.8)), transparent)'
      }}
    >
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack} className="!p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className="flex items-center gap-2">
          <h2 
            className="text-xl font-bold tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            {customScenario ? customScenario.title : character.name}
          </h2>
          {/* 生活助手标识 */}
          {character.tags && character.tags.includes('生活助手') && (
            <span
              className="px-2 py-1 text-xs font-bold rounded-full border"
              style={{
                backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.2))',
                color: 'var(--color-info, #60a5fa)',
                borderColor: 'var(--color-info, rgba(59, 130, 246, 0.3))',
              }}
            >
              生活助手
            </span>
          )}
          <span
            className="px-2 py-1 text-xs font-bold rounded-full border"
            style={{
              backgroundColor: 'var(--bg-info-alpha)',
              color: 'var(--color-info)',
              borderColor: 'var(--border-info-alpha)',
            }}
          >
            {customScenario ? '原创剧本' : '已连接'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* 语音模式切换 */}
        <button
          onClick={onToggleVoiceMode}
          className="p-2 rounded-full transition-all border"
          style={{
            backgroundColor: isVoiceMode 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            borderColor: isVoiceMode 
              ? 'rgba(248, 113, 113, 0.5)' 
              : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            color: isVoiceMode 
              ? '#f87171' 
              : 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            if (!isVoiceMode) {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isVoiceMode) {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
          title={isVoiceMode ? '退出语音模式' : '进入语音模式（纯语音对话）'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>

        {/* 沉浸模式切换 */}
        <button
          onClick={onToggleCinematic}
          className="p-2 rounded-full transition-all border"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
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
          title="进入沉浸模式"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>

        {/* E-SOUL发邮件测试按钮（仅开发/测试环境） */}
        {onTriggerESoulLetter && process.env.NODE_ENV === 'development' && (
          <button
            onClick={onTriggerESoulLetter}
            disabled={isTriggeringLetter}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all text-xs font-bold"
            style={{
              background: isTriggeringLetter
                ? 'rgba(168, 85, 247, 0.5)'
                : 'var(--gradient-primary, linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8)))',
              borderColor: isTriggeringLetter
                ? 'rgba(196, 181, 253, 0.5)'
                : 'rgba(196, 181, 253, 0.5)',
              color: isTriggeringLetter
                ? 'var(--text-secondary)'
                : 'var(--text-primary)',
              cursor: isTriggeringLetter ? 'not-allowed' : 'pointer',
              boxShadow: isTriggeringLetter ? 'none' : '0 0 10px rgba(168, 85, 247, 0.4)',
            }}
            title="测试：触发E-SOUL来信"
          >
            {isTriggeringLetter ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>发送中...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>E-SOUL来信</span>
              </>
            )}
          </button>
        )}

        {/* 记忆结晶按钮 */}
        {onCrystalize && (
          <button
            onClick={onCrystalize}
            disabled={isCrystalizing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all text-xs font-bold"
            style={{
              backgroundColor: generatedEcho
                ? 'rgba(99, 102, 241, 0.8)'
                : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
              borderColor: generatedEcho
                ? 'rgba(129, 140, 248, 1)'
                : 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
              color: generatedEcho
                ? 'var(--text-primary)'
                : 'var(--color-primary, #818cf8)',
              boxShadow: generatedEcho ? '0 0 15px rgba(99, 102, 241, 0.5)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!generatedEcho) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!generatedEcho) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.color = 'var(--color-primary, #818cf8)';
              }
            }}
            title="记忆结晶"
          >
            {isCrystalizing ? '凝结中...' : generatedEcho ? '记忆已凝结' : '凝结记忆'}
          </button>
        )}

        {/* 技能调试按钮 */}
        {onToggleSkillDebug && (
          <button
            onClick={onToggleSkillDebug}
            className="p-2 rounded-full transition-all border"
            style={{
              backgroundColor: isSkillDebugVisible
                ? 'rgba(34, 197, 94, 0.2)'
                : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
              borderColor: isSkillDebugVisible
                ? 'rgba(74, 222, 128, 0.5)'
                : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
              color: isSkillDebugVisible
                ? '#4ade80'
                : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (!isSkillDebugVisible) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSkillDebugVisible) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            title="技能调试面板 (Ctrl+Shift+S)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
            </svg>
          </button>
        )}

        {/* 状态指示器 */}
        <div 
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
          }}
        >
          {isVoiceMode && (
            <div className="flex items-center space-x-2 mr-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isListening
                    ? 'var(--color-error, #f87171)'
                    : isWaitingForResponse
                    ? 'var(--color-warning, #fbbf24)'
                    : 'var(--color-success, #4ade80)',
                  animation: (isListening || isWaitingForResponse) ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                }}
              />
              <span 
                className="text-xs font-mono"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isListening
                  ? '正在聆听'
                  : isWaitingForResponse
                  ? '等待回复'
                  : isPlayingAudio
                  ? '播放中'
                  : '待机'}
              </span>
            </div>
          )}
          {!isVoiceMode && (
            <>
              {isGeneratingScene && (
                <span 
                  className="text-xs animate-pulse mr-2"
                  style={{ color: 'var(--color-warning, #f59e0b)' }}
                >
                  正在生成场景...
                </span>
              )}
              {isPlayingAudio && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse mr-1"
                  style={{ backgroundColor: 'var(--color-success, #10b981)' }}
                />
              )}
              <span 
                className="text-xs font-mono"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isPlayingAudio ? '正在播放' : '待机'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.character.id === nextProps.character.id &&
    prevProps.customScenario?.id === nextProps.customScenario?.id &&
    prevProps.isCinematic === nextProps.isCinematic &&
    prevProps.isVoiceMode === nextProps.isVoiceMode &&
    prevProps.isListening === nextProps.isListening &&
    prevProps.isWaitingForResponse === nextProps.isWaitingForResponse &&
    prevProps.isGeneratingScene === nextProps.isGeneratingScene &&
    prevProps.isPlayingAudio === nextProps.isPlayingAudio &&
    prevProps.isCrystalizing === nextProps.isCrystalizing &&
    prevProps.generatedEcho === nextProps.generatedEcho &&
    prevProps.isTriggeringLetter === nextProps.isTriggeringLetter &&
    prevProps.isSkillDebugVisible === nextProps.isSkillDebugVisible
  );
});

HeaderBar.displayName = 'HeaderBar';
