/**
 * 场景选择页面组件
 * 显示所有可用的场景，允许用户选择进入
 */

import React from 'react';
import { WorldScene, GameState } from '../../types';
import { Button } from '../Button';
import { SceneCard } from '../SceneCard';
import { APP_TITLE } from '../../constants';

interface SceneSelectionScreenProps {
  gameState: GameState;
  currentScenes: WorldScene[];
  onEnterNexus: () => void;
  onSceneSelect: (sceneId: string) => void;
  onEditScene: (scene: WorldScene) => void;
  onDeleteScene: (sceneId: string) => void;
  onOpenMemoryModal: (e: React.MouseEvent<HTMLButtonElement>, scene: WorldScene) => void;
  onOpenMailbox: () => void;
  onOpenEraCreator: () => void;
  onOpenSceneCreationWizard?: () => void;
  requireAuth: (callback: () => void) => void;
  dispatch: (action: any) => void;
}

export const SceneSelectionScreen: React.FC<SceneSelectionScreenProps> = ({
  gameState,
  currentScenes,
  onEnterNexus,
  onSceneSelect,
  onEditScene,
  onDeleteScene,
  onOpenMemoryModal,
  onOpenMailbox,
  onOpenEraCreator,
  onOpenSceneCreationWizard,
  requireAuth,
  dispatch,
}) => {
  return (
    <div 
      className="h-full flex flex-col p-8"
      style={{
        background: 'var(--gradient-bg)',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onEnterNexus} className="!p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h2 
              className="text-3xl font-bold"
              style={{
                color: 'var(--text-primary)',
              }}
            >
              {APP_TITLE}
            </h2>
            <p 
              className="text-sm flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              选择一个场景切片进行连接
              {gameState.userProfile?.isGuest && (
                <span 
                  className="text-[10px] px-1 rounded"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  GUEST MODE
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' })}
            className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-lg"
            style={{
              background: 'var(--gradient-primary)',
              borderColor: 'var(--color-primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-light)';
              e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <span className="animate-pulse">✨</span> 查看共享心域
          </button>

          <button
            onClick={onOpenMailbox}
            className="relative p-3 rounded-full border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <span className="text-xl">📬</span>
            {gameState.mailbox.some(m => !m.isRead) && (
              <span
                className="absolute top-0 right-0 w-3 h-3 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--color-error)' }}
              />
            )}
          </button>
          {onOpenSceneCreationWizard && (
            <Button
              onClick={() => {
                requireAuth(() => {
                  onOpenSceneCreationWizard();
                });
              }}
              className="text-sm"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              ➕ 创建场景
            </Button>
          )}
        </div>
      </div>

      {gameState.activeJournalEntryId && (
        <div 
          className="mb-6 p-4 border rounded-xl flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--color-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎒</span>
            <div>
              <p 
                className="font-bold text-sm"
                style={{ color: 'var(--color-primary)' }}
              >
                你正在带着问题旅行
              </p>
              <p 
                className="text-xs opacity-80 truncate max-w-md"
                style={{ color: 'var(--text-primary)' }}
              >
                {gameState.journalEntries.find(e => e.id === gameState.activeJournalEntryId)?.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_JOURNAL_ENTRY_ID', payload: null })}
            className="text-xs underline transition-colors"
            style={{ color: 'var(--color-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
          >
            放下问题
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 scrollbar-hide">
        {currentScenes.map(scene => {
          // 判断是否是用户拥有的场景
          // 1. 如果ID是 era_数字 格式，说明是从后端获取的用户数据
          // 2. 如果在 customScenes 或 userWorldScenes 中，说明是用户的数据
          const isEraId = /^era_\d+$/.test(scene.id);
          const isCustom = gameState.customScenes.some(s => s.id === scene.id);
          const isUserWorld = gameState.userWorldScenes.some(s => s.id === scene.id);
          const isUserOwned = isEraId || isCustom || isUserWorld;

          return (
            <div key={scene.id} className="relative group">
              <SceneCard
                scene={scene}
                onSelect={() => onSceneSelect(scene.id)}
                onEdit={isUserOwned ? (s) => requireAuth(() => onEditScene(s)) : undefined}
                onDelete={isUserOwned ? (s) => requireAuth(() => onDeleteScene(s.id)) : undefined}
                isUserOwned={isUserOwned}
              />

              <button
                onClick={(e) => onOpenMemoryModal(e, scene)}
                className="absolute bottom-4 right-4 z-20 px-3 py-1 backdrop-blur-md rounded-full border text-xs font-bold transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <span>📷</span> 我的回忆
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

