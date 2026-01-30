/**
 * 场景选择步骤组件
 */

import React from 'react';
import { Button } from '../Button';
import { PresetEraImage } from './PresetEraImage';
import { useAINameGeneration } from './hooks/useAINameGeneration';
import { showAlert } from '../../utils/dialog';
import type { PresetEra, SelectedItem } from './types';

interface SceneSelectionStepProps {
  presetEras: PresetEra[];
  selectedEras: Map<number, SelectedItem>;
  onErasChange: (eras: Map<number, SelectedItem>) => void;
  onNext: () => void;
  onCancel: () => void;
  loading: boolean;
  existingEraSystemIds?: Set<number>; // 已存在的 systemEraId，用于过滤
}

export const SceneSelectionStep: React.FC<SceneSelectionStepProps> = ({
  presetEras,
  selectedEras,
  onErasChange,
  onNext,
  onCancel,
  loading,
  existingEraSystemIds = new Set(),
}) => {
  const { generateName, generating } = useAINameGeneration();

  // 处理场景选择/取消
  const handleEraToggle = (era: PresetEra) => {
    // 检查是否已经存在相同的 systemEraId
    if (existingEraSystemIds.has(era.id)) {
      showAlert('该预置场景已经添加过了，不能重复添加');
      return;
    }
    
    const newSelected = new Map(selectedEras);
    if (newSelected.has(era.id)) {
      newSelected.delete(era.id);
    } else {
      newSelected.set(era.id, {
        id: era.id,
        originalName: era.name,
        customName: era.name,
        data: era
      });
    }
    onErasChange(newSelected);
  };

  // 处理场景重命名
  const handleEraRename = async (eraId: number, type: 'manual' | 'ai') => {
    const eraItem = selectedEras.get(eraId);
    if (!eraItem) return;

    if (type === 'ai') {
      const era = eraItem.data as PresetEra;
      const aiName = await generateName('era', era.name, era.description);
      if (aiName) {
        const newSelected = new Map(selectedEras);
        newSelected.set(eraId, { ...eraItem, customName: aiName });
        onErasChange(newSelected);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 
        className="text-xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        选择场景（可多选）
      </h3>
      <p 
        className="text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        你可以选择多个场景，并为它们自定义名称
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {presetEras.map(era => {
          const isSelected = selectedEras.has(era.id);
          const selectedItem = selectedEras.get(era.id);
          const isAlreadyAdded = existingEraSystemIds.has(era.id); // 检查是否已添加
          
          return (
            <div
              key={era.id}
              className="p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: isAlreadyAdded
                  ? 'var(--bg-overlay, #4b5563)'
                  : isSelected
                  ? 'var(--color-primary, #ec4899)'
                  : 'var(--bg-overlay, #374151)',
                backgroundColor: isAlreadyAdded
                  ? 'var(--bg-overlay, rgba(31, 41, 55, 0.5))'
                  : isSelected
                  ? 'var(--color-primary, rgba(236, 72, 153, 0.1))'
                  : 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
                opacity: isAlreadyAdded ? 0.5 : 1,
                cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
              }}
              onClick={() => !isAlreadyAdded && handleEraToggle(era)}
              onMouseEnter={(e) => {
                if (!isAlreadyAdded && !isSelected) {
                  e.currentTarget.style.borderColor = 'var(--bg-hover, #4b5563)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAlreadyAdded && !isSelected) {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                }
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isAlreadyAdded}
                  onChange={() => handleEraToggle(era)}
                  className="w-5 h-5 mt-1 flex-shrink-0"
                  style={{
                    accentColor: 'var(--color-primary, #ec4899)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  {era.imageUrl && (
                    <div className="w-full h-32 rounded mb-2 overflow-hidden">
                      <PresetEraImage src={era.imageUrl} alt={era.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 
                      className="font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {era.name}
                    </h4>
                    {isAlreadyAdded && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          color: 'var(--text-disabled)',
                          backgroundColor: 'var(--bg-secondary, #374151)',
                        }}
                      >
                        已添加
                      </span>
                    )}
                  </div>
                  <p 
                    className="text-xs line-clamp-2 mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {era.description}
                  </p>
                </div>
              </div>
              
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
                      value={selectedItem?.customName ?? era.name}
                      onChange={(e) => {
                        const newSelected = new Map(selectedEras);
                        const item = newSelected.get(era.id);
                        if (item) {
                          newSelected.set(era.id, { ...item, customName: e.target.value });
                          onErasChange(newSelected);
                        }
                      }}
                      placeholder={era.name}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEraRename(era.id, 'ai');
                      }}
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

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedEras.size === 0 || loading}
        >
          下一步 ({selectedEras.size} 个场景)
        </Button>
      </div>
    </div>
  );
};
