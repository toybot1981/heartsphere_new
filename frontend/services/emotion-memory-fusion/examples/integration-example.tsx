/**
 * 情绪感知与记忆系统集成示例
 * 展示如何在ChatWindow中集成使用
 */

import React, { useEffect, useState } from 'react';
import { useEmotionSystem } from '../../emotion-system/hooks/useEmotionSystem';
import { useMemorySystem } from '../../memory-system/hooks/useMemorySystem';
import { EmotionMemoryFusion } from '../EmotionMemoryFusion';
import { EmotionType } from '../../emotion-system/types/EmotionTypes';
import { MemorySource } from '../../memory-system/types/MemoryTypes';

/**
 * 集成示例组件
 */
export const EmotionMemoryIntegration: React.FC<{ userId: number }> = ({ userId }) => {
  // 初始化情绪系统
  const emotionSystem = useEmotionSystem({
    enabled: true,
    fusionEnabled: true,
    storageEnabled: true,
    autoAnalysis: true,
    userId,
  });

  // 初始化记忆系统
  const memorySystem = useMemorySystem({
    enabled: true,
    autoExtraction: true,
    userId,
  });

  // 初始化融合系统
  const [fusion, setFusion] = useState<EmotionMemoryFusion | null>(null);

  useEffect(() => {
    if (emotionSystem.system && memorySystem.system) {
      const fusionSystem = new EmotionMemoryFusion(
        emotionSystem.system,
        memorySystem.system
      );
      setFusion(fusionSystem);
    }
  }, [emotionSystem.system, memorySystem.system]);

  // 处理用户消息
  const handleUserMessage = async (message: string) => {
    if (!emotionSystem.isReady || !memorySystem.isReady) {
      return;
    }

    // 1. 分析情绪
    const emotion = await emotionSystem.analyzeEmotion(message, 'conversation');
    console.log('情绪分析:', emotion);

    // 2. 提取记忆
    const memories = await memorySystem.extractAndSave(
      message,
      MemorySource.CONVERSATION
    );
    console.log('提取的记忆:', memories);

    // 3. 生成个性化回应
    if (fusion) {
      const response = await fusion.generatePersonalizedResponse(
        emotion.primaryEmotion,
        message,
        {
          userId,
          currentEmotion: emotion.primaryEmotion,
        }
      );
      console.log('个性化回应:', response);
      return response;
    }

    return null;
  };

  // 生成问候语
  const generateGreeting = async () => {
    if (!fusion) return '你好';
    
    return await fusion.generatePersonalizedGreeting({
      userId,
      userProfile: { id: userId },
    });
  };

  return {
    emotionSystem,
    memorySystem,
    fusion,
    handleUserMessage,
    generateGreeting,
  };
};

/**
 * 在ChatWindow中的使用示例
 */
/*
import { EmotionMemoryIntegration } from './services/emotion-memory-fusion/examples/integration-example';

function ChatWindow() {
  const { handleUserMessage, generateGreeting } = EmotionMemoryIntegration({ userId: 1 });

  useEffect(() => {
    // 生成个性化问候
    generateGreeting().then(greeting => {
      console.log('问候语:', greeting);
    });
  }, []);

  const handleSend = async (message: string) => {
    // 处理用户消息（自动分析情绪和提取记忆）
    const response = await handleUserMessage(message);
    // 使用response作为AI回应的参考
  };

  return <div>...</div>;
}
*/

