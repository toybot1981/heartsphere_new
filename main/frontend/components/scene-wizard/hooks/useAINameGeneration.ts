/**
 * AI生成名称的Hook
 */

import { useState } from 'react';
import { aiService } from '../../../services/ai';
import { showAlert } from '../../../utils/dialog';

export const useAINameGeneration = () => {
  const [generating, setGenerating] = useState(false);

  const generateName = async (
    type: 'character' | 'script' | 'era' | 'mainStory',
    originalName: string,
    context?: string
  ): Promise<string> => {
    try {
      setGenerating(true);
      const prompt = type === 'character'
        ? `请为这个角色生成一个符合其特点的中文名字。角色信息：${context || originalName}。只返回名字，不要其他内容。`
        : type === 'era'
        ? `请为这个场景生成一个符合其特点的中文名字。场景信息：${context || originalName}。只返回名字，不要其他内容。`
        : type === 'mainStory'
        ? `请为这个主线剧情生成一个符合其特点的中文名字。主线剧情信息：${context || originalName}。只返回名字，不要其他内容。`
        : `请为这个剧本生成一个更有吸引力的中文标题。原标题：${originalName}。只返回标题，不要其他内容。`;
      
      const response = await aiService.generateTextString(prompt, '你是一个专业的命名助手，擅长为角色和故事起名。');
      const name = response.trim();
      return name.trim().replace(/["'"]/g, '');
    } catch (error) {
      console.error('AI生成名字失败:', error);
      showAlert('AI生成名字失败，请手动输入');
      return '';
    } finally {
      setGenerating(false);
    }
  };

  return { generateName, generating };
};
