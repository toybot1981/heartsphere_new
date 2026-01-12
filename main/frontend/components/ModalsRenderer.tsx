/**
 * Modal 渲染组件
 * 统一管理所有 Modal 的渲染逻辑
 */

import React from 'react';
import { SettingsModal } from './SettingsModal';
import { EraConstructorModal } from './EraConstructorModal';
import { CharacterConstructorModal } from './CharacterConstructorModal';
import { MainStoryEditor } from './MainStoryEditor';
import { MailboxModal } from './MailboxModal';
import { EraMemoryModal } from './EraMemoryModal';
import { RecycleBinModal } from './RecycleBinModal';
import { MembershipModal } from './MembershipModal';
import { LoginModal } from './LoginModal';
import { GameState, Character, WorldScene } from '../types';
import { worldApi, eraApi, characterApi } from '../services/api';

interface ModalsRendererProps {
  // Modal 状态
  showSettingsModal: boolean;
  showEraCreator: boolean;
  showCharacterCreator: boolean;
  showMainStoryEditor: boolean;
  showMailbox: boolean;
  showEraMemory: boolean;
  showRecycleBin: boolean;
  showMembershipModal: boolean;
  showLoginModal: boolean;
  
  // 编辑状态
  editingScene: WorldScene | null;
  editingCharacter: Character | null;
  editingMainStory: Character | null;
  editingMainStorySceneId: string | null;
  memoryScene: WorldScene | null;
  currentMembership: any;
  
  // 游戏状态
  gameState: GameState;
  currentScenes: WorldScene[];
  
  // 回调函数
  onCloseSettingsModal: () => void;
  onCloseEraCreator: () => void;
  onCloseCharacterCreator: () => void;
  onCloseMainStoryEditor: () => void;
  onCloseMailbox: () => void;
  onCloseEraMemory: () => void;
  onCloseRecycleBin: () => void;
  onCloseMembershipModal: () => void;
  onCloseLoginModal: () => void;
  
  // Handler 函数
  handleSaveEra: (scene: WorldScene) => void;
  handleDeleteEra: (sceneId: string) => void;
  handleSaveCharacter: (character: Character) => void;
  handleMarkMailRead: (mailId: string) => void;
  handleAddMemory: (sceneId: string, memory: string) => void;
  handleDeleteMemory: (sceneId: string, memoryId: string) => void;
  handleLoginSuccess: (token: string, user: any) => void;
  dispatch: any;
  
  // 辅助函数
  getEditingCharacterScene: () => WorldScene | undefined;
  pendingActionRef: React.MutableRefObject<() => void>;
}

export const ModalsRenderer: React.FC<ModalsRendererProps> = ({
  showSettingsModal,
  showEraCreator,
  showCharacterCreator,
  showMainStoryEditor,
  showMailbox,
  showEraMemory,
  showRecycleBin,
  showMembershipModal,
  showLoginModal,
  editingScene,
  editingCharacter,
  editingMainStory,
  editingMainStorySceneId,
  memoryScene,
  currentMembership,
  gameState,
  currentScenes,
  onCloseSettingsModal,
  onCloseEraCreator,
  onCloseCharacterCreator,
  onCloseMainStoryEditor,
  onCloseMailbox,
  onCloseEraMemory,
  onCloseRecycleBin,
  onCloseMembershipModal,
  onCloseLoginModal,
  handleSaveEra,
  handleDeleteEra,
  handleSaveCharacter,
  handleMarkMailRead,
  handleAddMemory,
  handleDeleteMemory,
  handleLoginSuccess,
  dispatch,
  getEditingCharacterScene,
  pendingActionRef,
}) => {
  return (
    <>
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => { onCloseLoginModal(); pendingActionRef.current = () => {}; }}
          initialNickname={
            gameState.userProfile?.isGuest 
              ? gameState.userProfile.nickname 
              : undefined
          }
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
          onClose={onCloseSettingsModal} 
          onBindAccount={() => { onCloseSettingsModal(); onCloseLoginModal(); }}
          onOpenRecycleBin={() => {}}
          onOpenMembershipModal={() => {}}
          gameState={gameState}
          dispatch={dispatch}
        />
      )}

      {showMembershipModal && gameState.userProfile && !gameState.userProfile.isGuest && (
        <MembershipModal
          isOpen={showMembershipModal}
          onClose={onCloseMembershipModal}
          currentMembership={currentMembership}
        />
      )}

      {showRecycleBin && gameState.userProfile && !gameState.userProfile.isGuest && (
        <RecycleBinModal
          token={localStorage.getItem('auth_token') || ''}
          onClose={onCloseRecycleBin}
          onRestore={async () => {
            // 恢复后刷新数据
            if (gameState.userProfile && !gameState.userProfile.isGuest) {
              const token = localStorage.getItem('auth_token');
              if (token) {
                try {
                  // 重新加载用户数据
                  const [worlds, eras, characters] = await Promise.all([
                    worldApi.getAllWorlds(token),
                    eraApi.getAllEras(token),
                    characterApi.getAllCharacters(token)
                  ]);
                  
                  // 更新游戏状态
                  const updatedUserWorldScenes = worlds.map(w => ({
                      id: `era_${w.id}`,
                      name: w.name,
                      description: w.description || '',
                      imageUrl: '',
                      characters: []
                  }));
                  const updatedCustomScenes = eras.map(e => ({
                      id: `era_${e.id}`,
                      name: e.name,
                      description: e.description || '',
                      imageUrl: e.imageUrl || '',
                      characters: []
                  }));
                  dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
                  dispatch({ type: 'SET_CUSTOM_SCENES', payload: updatedCustomScenes });
                  dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {} });
                } catch (error) {
                  console.error('刷新数据失败:', error);
                }
              }
            }
          }}
        />
      )}

      {showEraCreator && (
        <EraConstructorModal 
          initialScene={editingScene}
          onSave={handleSaveEra}
          onDelete={editingScene ? () => handleDeleteEra(editingScene.id) : undefined}
          onClose={onCloseEraCreator}
          worldStyle={gameState.worldStyle}
        />
      )}

      {showCharacterCreator && (
        <CharacterConstructorModal 
          scene={getEditingCharacterScene()}
          initialCharacter={editingCharacter}
          onSave={handleSaveCharacter}
          onClose={onCloseCharacterCreator}
          worldStyle={gameState.worldStyle}
        />
      )}

      {showMainStoryEditor && editingMainStory && editingMainStorySceneId && (() => {
        const editorScene = currentScenes.find(s => s.id === editingMainStorySceneId) || currentScenes[0];
        console.log('[MainStoryEditor] 渲染编辑器:', { 
          showMainStoryEditor, 
          editingMainStory: !!editingMainStory, 
          editingMainStorySceneId,
          editorScene: editorScene?.name 
        });
        if (!editorScene) {
          console.error('[MainStoryEditor] 无法找到场景:', editingMainStorySceneId);
          return null;
        }
        return (
          <MainStoryEditor
            scene={editorScene}
            initialMainStory={editingMainStory}
            onSave={handleSaveCharacter}
            onClose={onCloseMainStoryEditor}
            worldStyle={gameState.worldStyle}
          />
        );
      })()}

      {showMailbox && (
        <MailboxModal 
          mails={gameState.mailbox}
          onClose={onCloseMailbox}
          onMarkAsRead={handleMarkMailRead}
        />
      )}
      
      {showEraMemory && memoryScene && (
        <EraMemoryModal
          scene={memoryScene}
          memories={gameState.sceneMemories[memoryScene.id] || []}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          onClose={onCloseEraMemory}
        />
      )}
    </>
  );
};





