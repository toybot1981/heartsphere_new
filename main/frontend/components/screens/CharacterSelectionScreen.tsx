/**
 * 角色选择页面组件
 * 显示场景的角色列表、主线故事和剧本分支
 */

import React, { useRef, useEffect } from 'react';
import { WorldScene, GameState, Character, CustomScenario } from '../../types';
import { Button } from '../Button';
import { CharacterCard } from '../CharacterCard';
import { showAlert } from '../../utils/dialog';
import { LazyImage } from '../LazyImage';
import { convertBackendScriptToScenario } from '../../utils/dataTransformers';

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
  // 筛选状态
  const [characterTypeFilter, setCharacterTypeFilter] = React.useState<string>('all');

  // 筛选后的角色列表
  const filteredCharacters = React.useMemo(() => {
    if (characterTypeFilter === 'all') {
      return sceneCharacters;
    }
    if (characterTypeFilter === '生活助手') {
      return sceneCharacters.filter(char => char.tags && char.tags.includes('生活助手'));
    }
    return sceneCharacters;
  }, [sceneCharacters, characterTypeFilter]);

  // 打印场景详情页面图片信息（详细日志）
  useEffect(() => {
    // 打印场景信息
    console.log('[CharacterSelectionScreen] 场景详情页面 - 场景信息', {
      componentName: 'CharacterSelectionScreen',
      pageType: '场景详情页面',
      sceneObject: {
        id: currentScene.id,
        name: currentScene.name,
        description: currentScene.description,
        imageUrl: currentScene.imageUrl,
        style: currentScene.style,
        charactersCount: currentScene.characters?.length || 0,
        hasMainStory: !!currentScene.mainStory,
        scriptsCount: currentScene.scripts?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });

    // 打印主线故事图片信息
    if (currentScene.mainStory) {
      if (currentScene.mainStory.backgroundUrl && currentScene.mainStory.backgroundUrl.trim()) {
        console.log('[CharacterSelectionScreen] 场景详情页面 - 主线故事背景图', {
          componentName: 'CharacterSelectionScreen',
          pageType: '场景详情页面',
          imageType: '主线故事背景图',
          imageUrl: currentScene.mainStory.backgroundUrl,
          sceneObject: {
            id: currentScene.id,
            name: currentScene.name,
          },
          mainStoryObject: {
            id: currentScene.mainStory.id,
            name: currentScene.mainStory.name,
            bio: currentScene.mainStory.bio,
            backgroundUrl: currentScene.mainStory.backgroundUrl,
            avatarUrl: currentScene.mainStory.avatarUrl,
          },
          displayPurpose: 'background',
          timestamp: new Date().toISOString(),
        });
      }

      if (currentScene.mainStory.avatarUrl && currentScene.mainStory.avatarUrl.trim()) {
        console.log('[CharacterSelectionScreen] 场景详情页面 - 主线故事头像', {
          componentName: 'CharacterSelectionScreen',
          pageType: '场景详情页面',
          imageType: '主线故事头像',
          imageUrl: currentScene.mainStory.avatarUrl,
          sceneObject: {
            id: currentScene.id,
            name: currentScene.name,
          },
          mainStoryObject: {
            id: currentScene.mainStory.id,
            name: currentScene.mainStory.name,
            bio: currentScene.mainStory.bio,
            backgroundUrl: currentScene.mainStory.backgroundUrl,
            avatarUrl: currentScene.mainStory.avatarUrl,
          },
          displayPurpose: 'detail',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [currentScene.id, currentScene.name, currentScene.mainStory?.id, currentScene.mainStory?.backgroundUrl, currentScene.mainStory?.avatarUrl]);

  return (
    <div 
      className="h-full flex flex-col p-8"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="!p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h2 
            className="text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentScene.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => requireAuth(onAddCharacter)} className="text-sm">
            + 新增角色
          </Button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-3 mb-6">
        <span 
          className="text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          角色类型：
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCharacterTypeFilter('all')}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: characterTypeFilter === 'all' ? 'var(--color-primary)' : 'var(--bg-card)',
              color: characterTypeFilter === 'all' ? 'white' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (characterTypeFilter !== 'all') {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (characterTypeFilter !== 'all') {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }
            }}
          >
            全部
          </button>
          <button
            onClick={() => setCharacterTypeFilter('生活助手')}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: characterTypeFilter === '生活助手' ? 'var(--color-primary)' : 'var(--bg-card)',
              color: characterTypeFilter === '生活助手' ? 'white' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (characterTypeFilter !== '生活助手') {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (characterTypeFilter !== '生活助手') {
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }
            }}
          >
            生活助手
          </button>
        </div>
        {characterTypeFilter !== 'all' && (
          <span 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            （共 {filteredCharacters.length} 个角色）
          </span>
        )}
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

          return (
            <div 
              key={`main-story-${currentScene.mainStory.id}-${currentScene.id}`} 
              className="mb-10 p-1 rounded-3xl"
              style={{
                background: 'var(--gradient-primary)',
              }}
            >
              <div 
                className="rounded-[22px] overflow-hidden relative group"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                {currentScene.mainStory.backgroundUrl && currentScene.mainStory.backgroundUrl.trim() ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: `url(${currentScene.mainStory.backgroundUrl})` }}
                  />
                ) : null}
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="inline-block px-3 py-1 text-xs font-bold rounded-full"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        主线剧情
                      </div>
                      {isUserOwned && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requireAuth(() => onEditMainStory(currentScene.mainStory!, currentScene.id));
                            }}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="编辑"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              requireAuth(() => onDeleteMainStory(currentScene.mainStory!, currentScene.id));
                            }}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
                              e.currentTarget.style.color = '#FCA5A5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            title="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 
                      className="text-3xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {currentScene.mainStory.name}
                    </h3>
                    <p 
                      className="leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {currentScene.mainStory.bio}
                    </p>
                    <Button
                      onClick={() => {
                        onCharacterSelect(currentScene.mainStory!);
                      }}
                      className="mt-4 px-8"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      }}
                    >
                      开始故事
                    </Button>
                  </div>
                  <div 
                    className="w-48 h-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 rotate-3 transition-transform group-hover:rotate-0"
                    style={{ borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
                  >
                    {currentScene.mainStory.avatarUrl && currentScene.mainStory.avatarUrl.trim() ? (
                      <LazyImage
                        src={currentScene.mainStory.avatarUrl}
                        alt={`${currentScene.mainStory.name} - 故事封面`}
                        purpose="detail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: 'var(--gradient-primary)',
                          opacity: 0.2,
                        }}
                      >
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
        <h3 
          className="text-xl font-bold mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          登场人物
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCharacters.map(char => {
            // 判断是否是用户拥有的角色
            const customCharsForScene = gameState.customCharacters[currentScene.id] || [];
            const isNumericId = /^\d+$/.test(char.id);
            const isInCustomChars = customCharsForScene.some(c => c.id === char.id);
            const isUserOwned = isNumericId || isInCustomChars;

            return (
              <CharacterCard
                key={char.id}
                character={char}
                customAvatarUrl={gameState.customAvatars[char.id]}
                isGenerating={gameState.generatingAvatarId === char.id}
                onSelect={(c) => {
                  onCharacterSelect(c);
                }}
                onGenerate={(c) => {
                  requireAuth(() => onGenerateAvatar(c));
                }}
                onEdit={isUserOwned ? (c) => {
                  requireAuth(() => onEditCharacter(c));
                } : undefined}
                onDelete={isUserOwned ? (c) => {
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
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-secondary)' }}
            >
              剧本分支
            </h3>
            <Button onClick={() => requireAuth(onCreateScript)} variant="secondary" className="text-xs">
              + 创建剧本
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 合并显示剧本：优先显示本地缓存的，然后显示服务器端的 */}
            {(() => {
              const localScenarios = gameState.customScenarios.filter(s => s.sceneId === currentScene.id);
              const localScenarioIds = new Set(localScenarios.map(s => String(s.id)));
              // 确保 scripts 存在，避免 undefined 错误
              const sceneScripts = Array.isArray(currentScene.scripts) ? currentScene.scripts : [];
              const serverScripts = sceneScripts.filter(script => {
                return script && script.id && !localScenarioIds.has(String(script.id));
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
                    <div 
                      key={`local-${scenario.id}-${index}`} 
                      className="group relative rounded-2xl p-6 border transition-all cursor-pointer hover:-translate-y-1" 
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--bg-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bg-secondary)';
                      }}
                      onClick={() => onPlayScenario(scenario)}
                    >
                      <h4 
                        className="text-lg font-bold mb-2 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                      >
                        {scenario.title}
                      </h4>
                      <p 
                        className="text-sm line-clamp-3 mb-4"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {scenario.description}
                      </p>
                      <div 
                        className="flex justify-between items-center text-xs pt-3 border-t"
                        style={{
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border-color-overlay)',
                        }}
                      >
                        <span>By {scenario.author}</span>
                        <span>{Object.keys(scenario.nodes || {}).length} 个节点</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); requireAuth(() => onEditScenario(scenario, e)); }} 
                          className="p-1.5 rounded transition-colors pointer-events-auto" 
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="编辑"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteScenario(scenario.id, e); }} 
                          className="p-1.5 rounded transition-colors pointer-events-auto" 
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
                            e.currentTarget.style.color = '#FCA5A5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="删除"
                        >
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
                    <div 
                      key={`server-${script.id}-${index}`} 
                      className="group relative rounded-2xl p-6 border transition-all cursor-pointer hover:-translate-y-1" 
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color-overlay)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                      }}
                      onClick={() => {
                  try {
                    if (!script.content) {
                      showAlert('剧本内容为空，无法播放', '错误', 'error');
                      return;
                    }
                    // 使用统一的转换函数确保 nodes 格式正确
                    const customScenario = convertBackendScriptToScenario(script, currentScene.id);
                    onPlayScenario(customScenario);
                  } catch (error) {
                    console.error('[CharacterSelectionScreen] 解析剧本内容失败:', error);
                    showAlert('剧本格式错误，无法播放', '错误', 'error');
                  }
                }}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 
                      className="font-bold flex-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {script.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 'var(--bg-info-alpha)',
                          color: 'var(--color-info)',
                          borderColor: 'var(--border-info-alpha)',
                        }}
                      >
                        用户
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditScript(script, e); }} 
                          className="p-1.5 rounded transition-colors pointer-events-auto" 
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="编辑"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteScript(script, e); }} 
                          className="p-1.5 rounded transition-colors pointer-events-auto" 
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-error-alpha)';
                            e.currentTarget.style.color = 'var(--color-error)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="删除"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p 
                    className="text-xs line-clamp-3 mb-4 mt-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {script.title}
                  </p>
                  <div 
                    className="flex justify-between items-center text-xs pt-3 border-t"
                    style={{
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color-overlay)',
                    }}
                  >
                    <span>用户创建</span>
                    <span>{script.sceneCount || 0} 个场景</span>
                  </div>
                </div>
                );
              });

              return mappedItems.filter((item): item is React.ReactElement => item !== null);
            })()}
            {/* 如果没有剧本，显示提示 */}
            {(!Array.isArray(currentScene.scripts) || currentScene.scripts.length === 0) &&
             gameState.customScenarios.filter(s => s.sceneId === currentScene.id).length === 0 && (
              <div 
                className="col-span-full text-center py-12"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <p className="text-sm">暂无剧本，点击上方按钮创建第一个剧本</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

