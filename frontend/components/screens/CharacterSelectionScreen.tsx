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
  scrollRef: React.RefObject<HTMLDivElement | null>;
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

        {/* 角色列表部分 */}
        <h3 className="text-xl font-bold text-gray-400 mb-4">登场人物</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sceneCharacters.map(char => {
            // 判断是否是用户拥有的角色
            const customCharsForScene = gameState.customCharacters[currentScene.id] || [];
            const isNumericId = /^\d+$/.test(char.id);
            const isInCustomChars = customCharsForScene.some(c => c.id === char.id);
            const isUserOwned = isNumericId || isInCustomChars;

            console.log('[CharacterSelectionScreen] 渲染角色卡片:', {
              characterId: char.id,
              characterName: char.name,
              isNumericId,
              isInCustomChars,
              isUserOwned,
              hasEditButton: isUserOwned,
              hasDeleteButton: isUserOwned
            });

            return (
              <CharacterCard
                key={char.id}
                character={char}
                customAvatarUrl={gameState.customAvatars[char.id]}
                isGenerating={gameState.generatingAvatarId === char.id}
                onSelect={(c) => {
                  console.log('[CharacterSelectionScreen] 点击角色卡片选择:', {
                    characterId: c.id,
                    characterName: c.name,
                    sceneId: currentScene.id,
                    timestamp: new Date().toISOString()
                  });
                  onCharacterSelect(c);
                }}
                onGenerate={(c) => {
                  console.log('[CharacterSelectionScreen] 点击生成角色头像:', {
                    characterId: c.id,
                    characterName: c.name,
                    timestamp: new Date().toISOString()
                  });
                  requireAuth(() => onGenerateAvatar(c));
                }}
                onEdit={isUserOwned ? (c) => {
                  console.log('[CharacterSelectionScreen] 点击角色编辑按钮:', {
                    characterId: c.id,
                    characterName: c.name,
                    sceneId: currentScene.id,
                    timestamp: new Date().toISOString()
                  });
                  requireAuth(() => onEditCharacter(c));
                } : undefined}
                onDelete={isUserOwned ? (c) => {
                  console.log('[CharacterSelectionScreen] 点击角色删除按钮:', {
                    characterId: c.id,
                    characterName: c.name,
                    sceneId: currentScene.id,
                    timestamp: new Date().toISOString()
                  });
                  requireAuth(() => onDeleteCharacter(c));
                } : undefined}
                isUserCreated={isUserOwned}
              />
            );
          })}
        </div>

        {/* 剧本分支部分 */}
        <div className="mt-12 mb-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-400">剧本分支</h3>
            <Button onClick={() => requireAuth(onCreateScript)} variant="secondary" className="text-xs">
              + 创建剧本
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 合并显示剧本：优先显示本地缓存的，然后显示服务器端的 */}
            {(() => {
              const localScenarios = gameState.customScenarios.filter(s => s.sceneId === currentScene.id);
              const localScenarioIds = new Set(localScenarios.map(s => String(s.id)));
              const serverScripts = (currentScene.scripts || []).filter(script => {
                return !localScenarioIds.has(String(script.id));
              });

              const allItems: Array<{ type: 'local' | 'server', data: any }> = [
                ...localScenarios.map(scenario => ({ type: 'local' as const, data: scenario })),
                ...serverScripts.map(script => ({ type: 'server' as const, data: script }))
              ];

              const mappedItems = allItems.map((item, index): React.ReactNode => {
                if (item.type === 'local') {
                  const scenario = item.data;
                  if (!scenario || scenario.id === undefined || scenario.id === null) {
                    return null;
                  }

                  return (
                    <div key={`local-${scenario.id}-${index}`} className="group relative bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer hover:-translate-y-1" onClick={() => onPlayScenario(scenario)}>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400">{scenario.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-3 mb-4">{scenario.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700 pt-3">
                        <span>By {scenario.author}</span>
                        <span>{Object.keys(scenario.nodes || {}).length} 个节点</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <button onClick={(e) => { e.stopPropagation(); requireAuth(() => onEditScenario(scenario, e)); }} className="p-1.5 hover:bg-white/10 rounded text-gray-300 pointer-events-auto" title="编辑">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteScenario(scenario.id, e); }} className="p-1.5 hover:bg-red-900/50 rounded text-gray-300 hover:text-red-400 pointer-events-auto" title="删除">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                }

                // 服务器端剧本
                const script = item.data;
                if (!script || script.id === undefined || script.id === null) {
                  return null;
                }

                return (
                  <div key={`server-${script.id}-${index}`} className="group relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer hover:-translate-y-1" onClick={() => {
                  try {
                    if (!script.content) {
                      showAlert('剧本内容为空，无法播放', '错误', 'error');
                      return;
                    }
                    const scenarioContent = JSON.parse(script.content);
                    const customScenario: CustomScenario = {
                      id: String(script.id),
                      sceneId: currentScene.id,
                      title: script.title || '未命名剧本',
                      description: script.title || '未命名剧本',
                      nodes: scenarioContent.nodes || {},
                      startNodeId: scenarioContent.startNodeId || Object.keys(scenarioContent.nodes || {})[0] || '',
                      author: '用户'
                    };
                    onPlayScenario(customScenario);
                  } catch (error) {
                    console.error('[CharacterSelectionScreen] 解析剧本内容失败:', error);
                    showAlert('剧本格式错误，无法播放', '错误', 'error');
                  }
                }}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-indigo-200 font-bold flex-1">{script.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">用户</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onEditScript(script, e); }} className="p-1.5 hover:bg-white/10 rounded text-indigo-300 pointer-events-auto" title="编辑">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteScript(script, e); }} className="p-1.5 hover:bg-red-900/50 rounded text-indigo-300 hover:text-red-400 pointer-events-auto" title="删除">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-3 mb-4 mt-2">{script.title}</p>
                  <div className="flex justify-between items-center text-xs text-indigo-400/60 border-t border-indigo-500/20 pt-3">
                    <span>用户创建</span>
                    <span>{script.sceneCount || 0} 个场景</span>
                  </div>
                </div>
                );
              });

              return mappedItems.filter((item): item is React.ReactElement => item !== null);
            })()}
            {/* 如果没有剧本，显示提示 */}
            {(!currentScene.scripts || currentScene.scripts.length === 0) &&
             gameState.customScenarios.filter(s => s.sceneId === currentScene.id).length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-sm">暂无剧本，点击上方按钮创建第一个剧本</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

