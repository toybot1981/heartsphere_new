/**
 * 角色选择步骤组件
 */

import React, { useEffect } from 'react';
import { characterApi } from '../../services/api';
import { Button } from '../Button';
import { showAlert } from '../../utils/dialog';
import { CharacterAvatarImage } from './CharacterAvatarImage';
import { useAINameGeneration } from './hooks/useAINameGeneration';
import type { PresetCharacter, SelectedItem } from './types';

interface CharacterSelectionStepProps {
  selectedEras: Map<number, SelectedItem>;
  presetCharacters: Map<number, PresetCharacter[]>;
  selectedCharacters: Map<number, SelectedItem>;
  onCharactersChange: (characters: Map<number, PresetCharacter[]>) => void;
  onSelectedCharactersChange: (characters: Map<number, SelectedItem>) => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const CharacterSelectionStep: React.FC<CharacterSelectionStepProps> = ({
  selectedEras,
  presetCharacters,
  selectedCharacters,
  onCharactersChange,
  onSelectedCharactersChange,
  onBack,
  onNext,
  loading,
  setLoading,
}) => {
  const { generateName, generating } = useAINameGeneration();

  // 当选择场景后，加载所有选中场景的角色
  useEffect(() => {
    if (selectedEras.size > 0) {
      const loadCharacters = async () => {
        try {
          setLoading(true);
          const charactersMap = new Map<number, PresetCharacter[]>();
          
          for (const [eraId] of selectedEras) {
            try {
              const characters = await characterApi.getSystemCharacters(eraId);
              charactersMap.set(eraId, characters);
            } catch (error) {
              console.error(`加载场景 ${eraId} 的角色失败:`, error);
            }
          }
          
          onCharactersChange(charactersMap);
          // 重置角色选择（只保留仍然有效的角色）
          const newSelected = new Map<number, SelectedItem>();
          for (const [charId, charItem] of selectedCharacters) {
            let found = false;
            for (const [, chars] of charactersMap) {
              if (chars.some(c => c.id === charId)) {
                found = true;
                break;
              }
            }
            if (found) {
              newSelected.set(charId, charItem);
            }
          }
          onSelectedCharactersChange(newSelected);
        } catch (error) {
          console.error('加载预置角色失败:', error);
          showAlert('加载预置角色失败');
        } finally {
          setLoading(false);
        }
      };
      loadCharacters();
    } else {
      onCharactersChange(new Map());
      onSelectedCharactersChange(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEras]);

  // 处理角色选择/取消
  const handleCharacterToggle = (character: PresetCharacter) => {
    const newSelected = new Map(selectedCharacters);
    if (newSelected.has(character.id)) {
      newSelected.delete(character.id);
    } else {
      newSelected.set(character.id, {
        id: character.id,
        originalName: character.name,
        customName: character.name,
        data: character
      });
    }
    onSelectedCharactersChange(newSelected);
  };

  // 处理角色重命名
  const handleCharacterRename = async (characterId: number, type: 'manual' | 'ai') => {
    let character: PresetCharacter | null = null;
    for (const characters of presetCharacters.values()) {
      const found = characters.find(c => c.id === characterId);
      if (found) {
        character = found;
        break;
      }
    }
    if (!character) return;

    if (type === 'ai') {
      const context = `${character.role || ''}，${character.bio || ''}`;
      const aiName = await generateName('character', character.name, context);
      if (aiName) {
        const newSelected = new Map(selectedCharacters);
        const item = newSelected.get(characterId);
        if (item) {
          newSelected.set(characterId, { ...item, customName: aiName });
          onSelectedCharactersChange(newSelected);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 
        className="text-xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        选择角色
      </h3>
      <p 
        className="text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        你可以选择多个角色，并为它们自定义名称
      </p>
      
      {/* 按场景分组显示角色 */}
      {Array.from(presetCharacters.entries()).map(([eraId, characters]) => {
        const eraItem = selectedEras.get(eraId);
        if (!eraItem || characters.length === 0) return null;
        
        return (
          <div key={eraId} className="space-y-3">
            <h4 
              className="text-lg font-semibold border-b pb-2"
              style={{
                color: 'var(--color-primary, #f472b6)',
                borderColor: 'var(--bg-overlay, #374151)',
              }}
            >
              {eraItem.customName || eraItem.originalName}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {characters.map(character => {
                const isSelected = selectedCharacters.has(character.id);
                const selectedItem = selectedCharacters.get(character.id);
                
                return (
                  <div
                    key={character.id}
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected
                        ? 'var(--color-primary, #ec4899)'
                        : 'var(--bg-overlay, #374151)',
                      backgroundColor: isSelected
                        ? 'var(--color-primary, rgba(236, 72, 153, 0.1))'
                        : 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--bg-hover, #4b5563)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {character.avatarUrl && (
                        <CharacterAvatarImage
                          src={character.avatarUrl}
                          alt={character.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <h4 
                          className="font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {character.name}
                        </h4>
                        {character.role && (
                          <p 
                            className="text-xs"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {character.role}
                          </p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCharacterToggle(character)}
                        className="w-5 h-5"
                        style={{
                          accentColor: 'var(--color-primary, #ec4899)',
                        }}
                      />
                    </div>
                    
                    {character.bio && (
                      <p 
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {character.bio}
                      </p>
                    )}

                    {isSelected && (
                      <div 
                        className="mt-2 pt-2 border-t"
                        style={{ borderColor: 'var(--bg-overlay, #374151)' }}
                      >
                        <label 
                          className="block text-xs mb-1"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          自定义名称
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={selectedItem?.customName ?? character.name}
                            onChange={(e) => {
                              const newSelected = new Map(selectedCharacters);
                              const item = newSelected.get(character.id);
                              if (item) {
                                newSelected.set(character.id, { ...item, customName: e.target.value });
                                onSelectedCharactersChange(newSelected);
                              }
                            }}
                            placeholder={character.name}
                            className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #1f2937)',
                              borderColor: 'var(--bg-overlay, #374151)',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                            }}
                          />
                          <button
                            onClick={() => handleCharacterRename(character.id, 'ai')}
                            disabled={generating}
                            className="px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
                              color: 'var(--color-primary, #f472b6)',
                            }}
                            onMouseEnter={(e) => {
                              if (!generating) {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.3))';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!generating) {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.2))';
                              }
                            }}
                            title="AI生成名字"
                          >
                            ✨
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>
          上一步
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedCharacters.size === 0 || loading}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};
