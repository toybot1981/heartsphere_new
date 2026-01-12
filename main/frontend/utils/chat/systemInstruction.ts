/**
 * 系统指令构建工具
 * 统一构建AI对话的系统指令
 */

import { Character, AppSettings, UserProfile } from '../../types';
import { createScenarioContext } from '../../constants';

/**
 * 获取对话风格指令
 */
export const getDialogueStyleInstruction = (style: string): string => {
  const styleMap: Record<string, string> = {
    'mobile-chat': '\n对话风格：使用移动聊天风格，简洁、自然、贴近日常对话。',
    'formal': '\n对话风格：使用正式、礼貌的对话风格。',
    'casual': '\n对话风格：使用轻松、随意的对话风格。',
    'literary': '\n对话风格：使用文学性、富有诗意的对话风格。',
  };
  
  return styleMap[style] || styleMap['mobile-chat'];
};

/**
 * 构建系统指令
 * 统一构建AI对话的系统指令，避免代码重复
 */
export const buildSystemInstruction = (
  character: Character,
  settings?: AppSettings,
  userProfile?: UserProfile,
  additionalContext?: string
): string => {
  let instruction = character.systemInstruction || '';
  
  // 角色属性
  if (character.mbti) {
    instruction += `\nMBTI: ${character.mbti}`;
  }
  if (character.speechStyle) {
    instruction += `\nSpeaking Style: ${character.speechStyle}`;
  }
  if (character.catchphrases && character.catchphrases.length > 0) {
    instruction += `\nCommon Phrases: ${character.catchphrases.join(', ')}`;
  }
  if (character.secrets) {
    instruction += `\nSecrets: ${character.secrets}`;
  }
  
  // 对话风格
  const dialogueStyle = settings?.dialogueStyle || 'mobile-chat';
  instruction += getDialogueStyleInstruction(dialogueStyle);
  
  // 用户上下文
  if (userProfile) {
    const scenarioContext = createScenarioContext(userProfile);
    instruction = `${scenarioContext}\n\n${instruction}`;
  }
  
  // 额外上下文（如场景描述、节点说明等）
  if (additionalContext) {
    instruction += `\n\n${additionalContext}`;
  }
  
  return instruction;
};
