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
}) => {
  if (isCinematic) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center transition-opacity duration-500">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack} className="!p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-wider">
            {customScenario ? customScenario.title : character.name}
          </h2>
          <span
            className="text-xs uppercase tracking-widest opacity-80"
            style={{ color: character.colorAccent }}
          >
            {customScenario ? '原创剧本' : '已连接'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* 语音模式切换 */}
        <button
          onClick={onToggleVoiceMode}
          className={`p-2 rounded-full transition-all border ${
            isVoiceMode
              ? 'bg-red-500/20 hover:bg-red-500/30 border-red-400/50 text-red-400'
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white/70 hover:text-white'
          }`}
          title={isVoiceMode ? '退出语音模式' : '进入语音模式（纯语音对话）'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>

        {/* 沉浸模式切换 */}
        <button
          onClick={onToggleCinematic}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white/70 hover:text-white"
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all text-xs font-bold ${
              isTriggeringLetter
                ? 'bg-purple-500/50 border-purple-400/50 text-white/70 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-purple-400/50 text-white hover:from-purple-500 hover:to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
            }`}
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all text-xs font-bold ${
              generatedEcho
                ? 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'bg-white/10 border-white/20 text-indigo-300 hover:bg-white/20 hover:text-white'
            }`}
            title="记忆结晶"
          >
            {isCrystalizing ? '凝结中...' : generatedEcho ? '记忆已凝结' : '凝结记忆'}
          </button>
        )}

        {/* 状态指示器 */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
          {isVoiceMode && (
            <div className="flex items-center space-x-2 mr-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? 'bg-red-400 animate-pulse'
                    : isWaitingForResponse
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-green-400'
                }`}
              />
              <span className="text-xs font-mono">
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
                <span className="text-xs text-orange-400 animate-pulse mr-2">正在生成场景...</span>
              )}
              {isPlayingAudio && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />}
              <span className="text-xs font-mono">{isPlayingAudio ? '正在播放' : '待机'}</span>
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
    prevProps.isTriggeringLetter === nextProps.isTriggeringLetter
  );
});

HeaderBar.displayName = 'HeaderBar';
