/**
 * 角色选择页面组件
 * 显示场景的角色列表、主线故事和剧本分支
 */

import React, { useRef } from 'react';
import { WorldScene, GameState, Character, CustomScenario } from '../../types';
import { Button } from '../Button';
import { CharacterCard } from '../CharacterCard';
import { showAlert } from '../../utils/dialog';

interface CharacterSelectionScreenProps {
  gameState: GameState;
  currentScene: WorldScene;
  sceneCharacters: Character[];
  scrollRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
  onEditMainStory: (mainStory: Character, sceneId: string) => void;
  onDeleteMainStory: (mainStory: Character, sceneId: string) => void;
  onAddCharacter: () => void;
  onEditCharacter: (character: Character) => void;
  onDeleteCharacter: (character: Character) => void;
  onGenerateAvatar: (character: Character) => void;
  onPlayScenario: (scenario: CustomScenario) => void;
  onEditScenario: (scenario: CustomScenario, e: React.MouseEvent) => void;
  onDeleteScenario: (scenarioId: string, e: React.MouseEvent) => void;
  onEditScript: (script: any, e: React.MouseEvent) => void;
  onDeleteScript: (script: any, e: React.MouseEvent) => void;
  onCreateScript: () => void;
  requireAuth: (callback: () => void) => void;
  dispatch: (action: any) => void;
}

export const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({
  gameState,
  currentScene,
  sceneCharacters,
  scrollRef,
  onBack,
  onCharacterSelect,
  onEditMainStory,
  onDeleteMainStory,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onGenerateAvatar,
  onPlayScenario,
  onEditScenario,
  onDeleteScenario,
  onEditScript,
  onDeleteScript,
  onCreateScript,
  requireAuth,
  dispatch,
}) => {
  return (
    <div className="h-full flex flex-col p-8 bg-gray-900">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="!p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h2 className="text-3xl font-bold text-white">{currentScene.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => requireAuth(onAddCharacter)} className="text-sm">
            + 新增角色
          </Button>
        </div>
      </div>

      {/* 滚动容器 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-4 custom-scrollbar"
        style={{ scrollBehavior: 'auto', willChange: 'scroll-position' }}
      >
        {/* 主线故事卡片 */}
        {currentScene.mainStory && (() => {
          // 判断主线故事是否是用户自有的
          const isNumericId = /^\d+$/.test(currentScene.mainStory.id);
          const isUserOwned = isNumericId; // 如果是数字ID，说明是从后端获取的用户数据

          console.log('[CharacterSelectionScreen] 渲染主线故事卡片:', {
            mainStoryId: currentScene.mainStory.id,
            mainStoryName: currentScene.mainStory.name,
            isNumericId,
            isUserOwned,
            hasEditButton: isUserOwned,
            hasDeleteButton: isUserOwned,
            sceneId: currentScene.id,
            mainStoryObject: currentScene.mainStory
          });

          return (
            <div key={`main-story-${currentScene.mainStory.id}-${currentScene.id}`} className="mb-10 p-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              <div className="bg-gray-900 rounded-[22px] overflow-hidden relative group">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${currentScene.mainStory.backgroundUrl})` }}
                />
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">主线剧情</div>
                      {isUserOwned && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[CharacterSelectionScreen] 点击主线故事编辑按钮:', {
                                mainStory: currentScene.mainStory,
                                sceneId: currentScene.id,
                                timestamp: new Date().toISOString()
                              });
                              requireAuth(() => onEditMainStory(currentScene.mainStory!, currentScene.id));
                            }}
                            className="p-1.5 hover:bg-white/10 rounded text-white"
                            title="编辑"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[CharacterSelectionScreen] 点击主线故事删除按钮:', {
                                mainStory: currentScene.mainStory,
                                sceneId: currentScene.id,
                                timestamp: new Date().toISOString()
                              });
                              requireAuth(() => onDeleteMainStory(currentScene.mainStory!, currentScene.id));
                            }}
                            className="p-1.5 hover:bg-red-900/50 rounded text-white hover:text-red-400"
                            title="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold text-white">{currentScene.mainStory.name}</h3>
                    <p className="text-gray-300 leading-relaxed">{currentScene.mainStory.bio}</p>
                    <Button
                      onClick={() => {
                        console.log('[CharacterSelectionScreen] 点击"开始故事"按钮:', {
                          mainStory: currentScene.mainStory,
                          sceneId: currentScene.id,
                          timestamp: new Date().toISOString()
                        });
                        onCharacterSelect(currentScene.mainStory!);
                      }}
                      className="bg-white text-black hover:bg-gray-200 mt-4 px-8"
                    >
                      开始故事
                    </Button>
                  </div>
                  <div className="w-48 h-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-3 transition-transform group-hover:rotate-0">
                    {currentScene.mainStory.avatarUrl && currentScene.mainStory.avatarUrl.trim() ? (
                      <img src={currentScene.mainStory.avatarUrl} className="w-full h-full object-cover" alt="Story Cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                        <div className="text-4xl opacity-50">📖</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TODO: 角色列表部分 - 将在第二步添加 */}
        {/* TODO: 剧本分支部分 - 将在第三步添加 */}
      </div>
    </div>
  );
};

