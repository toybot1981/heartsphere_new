/**
 * 场景创建向导主组件
 * 参照 InitializationWizard 实现，支持批量创建场景并选择角色、主线剧情和剧本
 */

import React, { useState, useEffect } from 'react';
import { eraApi } from '../services/api';
import { Button } from './Button';
import { showAlert } from '../utils/dialog';
import { SceneSelectionStep } from './scene-wizard/SceneSelectionStep';
import { CharacterSelectionStep } from './scene-wizard/CharacterSelectionStep';
import { MainStorySelectionStep } from './scene-wizard/MainStorySelectionStep';
import { ScriptSelectionStep } from './scene-wizard/ScriptSelectionStep';
import type {
  PresetEra,
  PresetCharacter,
  PresetMainStory,
  PresetScript,
  SelectedItem,
} from './scene-wizard/types';

interface SceneCreationWizardProps {
  token: string;
  worldId: number;
  onComplete: () => void;
  onCancel: () => void;
  onOpenEraCreator?: () => void; // 可选：打开创建新场景的模态框
}

export const SceneCreationWizard: React.FC<SceneCreationWizardProps> = ({
  token,
  worldId,
  onComplete,
  onCancel,
  onOpenEraCreator
}) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0); // 0 是初始选择步骤
  const [loading, setLoading] = useState(false);
  
  // 步骤1：场景选择（支持多选）
  const [presetEras, setPresetEras] = useState<PresetEra[]>([]);
  const [selectedEras, setSelectedEras] = useState<Map<number, SelectedItem>>(new Map());
  const [existingEraSystemIds, setExistingEraSystemIds] = useState<Set<number>>(new Set()); // 已存在的 systemEraId
  
  // 步骤2：角色选择（按场景分组）
  const [presetCharacters, setPresetCharacters] = useState<Map<number, PresetCharacter[]>>(new Map());
  const [selectedCharacters, setSelectedCharacters] = useState<Map<number, SelectedItem>>(new Map());
  
  // 步骤3：主线剧情选择（按场景分组）
  const [presetMainStories, setPresetMainStories] = useState<Map<number, PresetMainStory>>(new Map());
  const [selectedMainStories, setSelectedMainStories] = useState<Map<number, SelectedItem>>(new Map());
  
  // 步骤4：剧本选择（按场景分组）
  const [presetScripts, setPresetScripts] = useState<Map<number, PresetScript[]>>(new Map());
  const [selectedScripts, setSelectedScripts] = useState<Map<number, SelectedItem>>(new Map());

  // 加载用户已有的场景，用于过滤已添加的预置场景
  useEffect(() => {
    const loadExistingEras = async () => {
      try {
        const userEras = await eraApi.getErasByWorldId(worldId, token);
        // 提取所有已存在的 systemEraId（非空的）
        const systemIds = new Set<number>();
        userEras.forEach(era => {
          if (era.systemEraId != null) {
            systemIds.add(era.systemEraId);
          }
        });
        setExistingEraSystemIds(systemIds);
      } catch (error) {
        console.error('[SceneCreationWizard] 加载已有场景失败:', error);
        // 不影响继续操作，只是无法过滤已存在的场景
      }
    };
    loadExistingEras();
  }, [worldId, token]);

  // 加载预置场景
  useEffect(() => {
    const loadPresetEras = async () => {
      try {
        setLoading(true);
        const eras = await eraApi.getSystemEras();
        setPresetEras(eras);
      } catch (error) {
        console.error('[SceneCreationWizard] 加载预置场景失败:', error);
        showAlert('加载预置场景失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };
    loadPresetEras();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.9))' }}
    >
      <div 
        className="border rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card, #1f2937)',
          borderColor: 'var(--bg-overlay, #374151)',
        }}
      >
        <div className="mb-6">
          <h2 
            className="text-2xl font-bold mb-2"
            style={{
              background: 'var(--gradient-text, linear-gradient(to right, #818cf8, #f472b6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            创建场景 🌟
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {step === 0 
              ? '选择创建场景的方式'
              : '选择预置场景、角色、主线剧情和剧本，快速创建你的心域场景'}
          </p>
        </div>

        {/* 进度指示器 - 只在批量创建流程中显示 */}
        {step > 0 && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: step >= 1 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                  color: step >= 1 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                1
              </div>
              <div 
                className="w-16 h-1"
                style={{
                  backgroundColor: step >= 2 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                }}
              />
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: step >= 2 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                  color: step >= 2 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                2
              </div>
              <div 
                className="w-16 h-1"
                style={{
                  backgroundColor: step >= 3 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                }}
              />
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: step >= 3 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                  color: step >= 3 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                3
              </div>
              <div 
                className="w-16 h-1"
                style={{
                  backgroundColor: step >= 4 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                }}
              />
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: step >= 4 ? 'var(--color-primary, #ec4899)' : 'var(--bg-secondary, #374151)',
                  color: step >= 4 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                4
              </div>
            </div>
          </div>
        )}

        {/* 步骤0：初始选择 */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 选项1：批量选择预置场景 */}
              <div
                onClick={() => setStep(1)}
                className="p-6 rounded-lg border-2 cursor-pointer transition-all"
                style={{
                  borderColor: 'var(--bg-overlay, #374151)',
                  backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(17, 24, 39, 0.5))';
                }}
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  批量选择预置场景
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  从预置场景库中选择多个场景，并批量添加角色、主线剧情和剧本
                </p>
              </div>

              {/* 选项2：创建新场景 */}
              <div
                onClick={() => {
                  // 清除所有已选择的状态
                  setSelectedEras(new Map());
                  setSelectedCharacters(new Map());
                  setSelectedMainStories(new Map());
                  setSelectedScripts(new Map());
                  setPresetCharacters(new Map());
                  setPresetMainStories(new Map());
                  setPresetScripts(new Map());
                  
                  if (onOpenEraCreator) {
                    onOpenEraCreator();
                    onCancel(); // 关闭向导
                  } else {
                    showAlert('创建新场景功能暂不可用');
                  }
                }}
                className="p-6 rounded-lg border-2 cursor-pointer transition-all"
                style={{
                  borderColor: 'var(--bg-overlay, #374151)',
                  backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(17, 24, 39, 0.5))';
                }}
              >
                <div className="text-4xl mb-3">✨</div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  创建新场景
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  自定义创建全新的场景，完全由你设计场景的名称、描述和图片
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={onCancel}>
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 步骤1：场景选择 */}
        {step === 1 && (
          <SceneSelectionStep
            presetEras={presetEras}
            selectedEras={selectedEras}
            onErasChange={setSelectedEras}
            onNext={() => setStep(2)}
            onCancel={onCancel}
            loading={loading}
            existingEraSystemIds={existingEraSystemIds}
          />
        )}

        {/* 步骤2：角色选择 */}
        {step === 2 && (
          <CharacterSelectionStep
            selectedEras={selectedEras}
            presetCharacters={presetCharacters}
            selectedCharacters={selectedCharacters}
            onCharactersChange={setPresetCharacters}
            onSelectedCharactersChange={setSelectedCharacters}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* 步骤3：主线剧情选择 */}
        {step === 3 && (
          <MainStorySelectionStep
            selectedEras={selectedEras}
            presetMainStories={presetMainStories}
            selectedMainStories={selectedMainStories}
            onMainStoriesChange={setPresetMainStories}
            onSelectedMainStoriesChange={setSelectedMainStories}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* 步骤4：剧本选择 */}
        {step === 4 && (
          <ScriptSelectionStep
            selectedEras={selectedEras}
            presetScripts={presetScripts}
            selectedScripts={selectedScripts}
            onScriptsChange={setPresetScripts}
            onSelectedScriptsChange={setSelectedScripts}
            onBack={() => setStep(3)}
            onComplete={onComplete}
            token={token}
            worldId={worldId}
            presetCharacters={presetCharacters}
            selectedCharacters={selectedCharacters}
            selectedMainStories={selectedMainStories}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
};
