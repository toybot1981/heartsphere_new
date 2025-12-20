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
  requireAuth,
  dispatch,
}) => {
  return (
    <div className="h-full flex flex-col p-8 bg-gradient-to-br from-gray-900 to-black">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onEnterNexus} className="!p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              {APP_TITLE}
            </h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              选择一个场景切片进行连接
              {gameState.userProfile?.isGuest && (
                <span className="text-[10px] bg-gray-700 px-1 rounded text-gray-300">GUEST MODE</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' })}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/30 text-blue-200 hover:text-white hover:border-blue-400 transition-all shadow-lg hover:shadow-blue-500/20"
          >
            <span className="animate-pulse">✨</span> 心域连接
          </button>

          <button
            onClick={onOpenMailbox}
            className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
          >
            <span className="text-xl">📬</span>
            {gameState.mailbox.some(m => !m.isRead) && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
            )}
          </button>
          <Button
            onClick={() => {
              requireAuth(() => {
                onOpenEraCreator();
              });
            }}
            className="text-sm bg-pink-600 hover:bg-pink-500"
          >
            + 创造新场景
          </Button>
        </div>
      </div>

      {gameState.activeJournalEntryId && (
        <div className="mb-6 p-4 bg-indigo-900/40 border border-indigo-500/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎒</span>
            <div>
              <p className="text-indigo-200 font-bold text-sm">你正在带着问题旅行</p>
              <p className="text-white text-xs opacity-80 truncate max-w-md">
                {gameState.journalEntries.find(e => e.id === gameState.activeJournalEntryId)?.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_JOURNAL_ENTRY_ID', payload: null })}
            className="text-xs text-indigo-300 hover:text-white underline"
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
                className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white hover:bg-pink-600 hover:border-pink-400 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
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

