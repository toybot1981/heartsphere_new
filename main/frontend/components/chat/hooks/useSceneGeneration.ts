/**
 * 场景生成 Hook
 * 处理故事模式下的场景自动生成
 */

import { useState, useEffect, useCallback } from 'react';
import { Message, AppSettings, WorldStyle } from '../../../types';
import { aiService } from '../../../services/ai';
import { WORLD_STYLE_DESCRIPTIONS } from '../../../types';

interface UseSceneGenerationProps {
  isStoryMode: boolean;
  autoGenerate: boolean;
  lastMessage: Message | undefined;
  defaultBackgroundUrl: string | null;
  sceneStyle?: WorldStyle; // 场景风格，用于生成场景图片
}

/**
 * 场景生成 Hook
 * 在故事模式下，根据最后一条消息自动生成场景图片
 */
export const useSceneGeneration = ({
  isStoryMode,
  autoGenerate,
  lastMessage,
  defaultBackgroundUrl,
  sceneStyle = 'realistic', // 默认写实风格
}: UseSceneGenerationProps) => {
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(defaultBackgroundUrl);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);

  // 当默认背景URL变化时更新
  useEffect(() => {
    if (defaultBackgroundUrl) {
      setSceneImageUrl(defaultBackgroundUrl);
    }
  }, [defaultBackgroundUrl]);

  // 场景生成逻辑
  useEffect(() => {
    if (!isStoryMode || !autoGenerate) return;

    if (!lastMessage || lastMessage.role !== 'model' || isGeneratingScene) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsGeneratingScene(true);
      try {
        const desc = await aiService.generateSceneDescription([lastMessage]);
        if (desc) {
          // 使用场景风格生成图片
          const stylePrompt = WORLD_STYLE_DESCRIPTIONS[sceneStyle]?.promptSuffix || WORLD_STYLE_DESCRIPTIONS.realistic.promptSuffix;
          const prompt = `${desc}. ${stylePrompt} High Quality, Cinematic Lighting, Vibrant Colors. Aspect Ratio: 16:9.`;
          const img = await aiService.generateImageFromPrompt(prompt, '16:9');
          if (img) {
            setSceneImageUrl(img);
          }
        }
      } catch (e) {
        console.error('[useSceneGeneration] Scene generation error:', e);
      } finally {
        setIsGeneratingScene(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [lastMessage?.id, isStoryMode, autoGenerate, isGeneratingScene, sceneStyle]);

  const resetSceneImage = useCallback(() => {
    setSceneImageUrl(defaultBackgroundUrl);
  }, [defaultBackgroundUrl]);

  return {
    sceneImageUrl,
    isGeneratingScene,
    setSceneImageUrl,
    resetSceneImage,
  };
};


