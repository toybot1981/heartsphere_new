/**
 * AI响应生成工具函数
 * 统一处理AI调用逻辑，消除统一模式和本地模式的重复代码
 */

import { Message, Character, AppSettings, UserProfile } from '../../../types';
import { aiService } from '../../../services/ai';
import { createStreamHandler } from './createStreamHandler';
import { buildSystemInstruction } from '../../../utils/chat/systemInstruction';
import { MemorySource } from '../../../services/memory-system/types/MemoryTypes';
import { skillService } from '../../../services/skill/SkillService';
import { FunctionDefinition, FunctionCall } from '../../../services/ai/types';
import { memoryApi } from '../../../services/api/memory/memory';
import { getToken } from '../../../services/api/base/tokenStorage';
import { logger } from '../../../utils/logger';

interface GenerateAIResponseOptions {
  userText: string;
  userMsg: Message;
  historyWithUserMsg: Message[];
  character: Character;
  settings: AppSettings;
  userProfile: UserProfile | null;
  tempBotId: string;
  onUpdateHistory: (updater: (prev: Message[]) => Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  engine?: any;
  engineReady?: boolean;
  memorySystem?: any;
  relevantMemories?: any[];
  onComplete?: (fullText: string, requestId: string) => void | Promise<void>;
  customSystemInstructionSuffix?: string; // 自定义系统指令后缀（用于场景节点等特殊场景）
}

/**
 * 生成AI响应
 * 统一处理统一模式和本地模式的AI调用逻辑
 */
export const generateAIResponse = async ({
  userText,
  userMsg,
  historyWithUserMsg,
  character,
  settings,
  userProfile,
  tempBotId,
  onUpdateHistory,
  setIsLoading,
  engine,
  engineReady,
  memorySystem,
  relevantMemories = [],
  onComplete,
  customSystemInstructionSuffix,
}: GenerateAIResponseOptions): Promise<void> => {
  // 构建系统指令（使用统一的工具函数）
  let systemInstruction = buildSystemInstruction(character, settings, userProfile);
  
  // 添加自定义系统指令后缀（用于场景节点等特殊场景）
  if (customSystemInstructionSuffix) {
    systemInstruction += customSystemInstructionSuffix;
  }
  
  // 将记忆添加到系统指令中（如果有）
  if (relevantMemories.length > 0) {
    const memoryContext = relevantMemories
      .map(m => `- ${m.content}`)
      .join('\n');
    systemInstruction += `\n\n[用户记忆]\n${memoryContext}`;
  }
  
  // 转换消息历史：使用包含用户消息的完整历史
  const historyMessages = historyWithUserMsg.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant' | 'system',
    content: msg.text,
  }));
  
  // 获取角色可用技能（用于 Function Calling 和提示词驱动）
  let functionDefinitions: FunctionDefinition[] = [];
  let promptDrivenSkills: Array<{ skillId: string; name: string; description: string }> = [];
  let onFunctionCall: ((functionCall: FunctionCall) => Promise<any>) | undefined;
  
  // 跟踪当前执行的技能信息（使用对象引用，以便在回调中更新）
  const skillInfoRef: { skillId?: string; skillName?: string } = {};
  
  if (character.id) {
    try {
      // 获取所有技能（包括Function Calling和提示词驱动）
      const allSkills = await skillService.getCharacterAllSkills(character.id);
      functionDefinitions = allSkills.functionCallingSkills || [];
      promptDrivenSkills = allSkills.promptDrivenSkills || [];
      
      
      // 设置 Function Call 回调
      onFunctionCall = async (functionCall: FunctionCall) => {
        try {
          
          // 解析参数
          const parameters = JSON.parse(functionCall.arguments);
          
          // 记录技能ID
          skillInfoRef.skillId = functionCall.name;
          
          // 获取技能名称（从functionDefinitions中查找）
          const skillDef = functionDefinitions.find(f => f.name === functionCall.name);
          if (skillDef) {
            skillInfoRef.skillName = skillDef.description || functionCall.name;
          } else {
            // 如果找不到，尝试从技能服务获取
            try {
              const skillDetail = await skillService.getSkillById(functionCall.name);
              skillInfoRef.skillName = skillDetail?.name || functionCall.name;
            } catch (e) {
              skillInfoRef.skillName = functionCall.name;
            }
          }
          
          // 执行技能
          const result = await skillService.executeSkill(
            functionCall.name,
            character.id!,
            parameters
          );
          
          
          // 返回结果（AI 会继续处理）
          return result;
        } catch (error) {
          console.error('[generateAIResponse] Function Call 执行失败:', error);
          return { error: error instanceof Error ? error.message : String(error) };
        }
      };
    } catch (error) {
      console.error('[generateAIResponse] 获取角色技能失败:', error);
      // 继续执行，不使用技能
    }
  }
  
  // 构建技能相关的系统指令（包括Function Calling和提示词驱动技能）
  if ((functionDefinitions.length > 0 || promptDrivenSkills.length > 0) && character.id) {
    let skillInstructionText = '\n\n[可用技能]';
    
    // Function Calling 技能（通过工具调用）
    if (functionDefinitions.length > 0) {
      const functionCallingList = functionDefinitions
        .map(f => `- ${f.name}: ${f.description || '无描述'}`)
        .join('\n');
      skillInstructionText += `\n\n【Function Calling 技能】（可通过工具自动调用）：\n${functionCallingList}\n\n对于以上技能，当用户的需求明确匹配某个技能的功能时，你必须调用对应的技能工具（Function Calling）来执行相应的操作。`;
    }
    
    // 提示词驱动技能（通过对话自然使用）
    if (promptDrivenSkills.length > 0) {
      const promptDrivenList = promptDrivenSkills
        .map(s => `- ${s.name}: ${s.description || '无描述'}`)
        .join('\n');
      skillInstructionText += `\n\n【提示词驱动技能】（通过对话自然使用）：\n${promptDrivenList}\n\n对于以上技能，你可以在对话中自然地使用它们，无需调用工具。这些技能主要通过你的专业知识和对话技巧来实现，根据用户的描述和需求灵活运用。`;
    }
    
    skillInstructionText += `\n\n重要提示：\n1. 仔细分析用户的意图，判断用户的请求是否匹配某个技能的功能\n2. 如果用户的需求与某个Function Calling技能的功能匹配，立即调用该技能工具\n3. 如果用户的需求可以通过提示词驱动技能解决，在对话中自然地使用该技能\n4. 技能的调用应该及时且准确，不要犹豫或询问用户是否要使用技能\n5. 例如：如果用户说"帮我分析时间使用情况"，你应该立即调用时间审计相关的技能工具\n\n请根据用户的意图和需求，智能判断是否需要使用技能，以及使用哪个技能。`;
    
    systemInstruction += skillInstructionText;
  }
  
  // 创建流式响应处理函数
  const streamHandler = createStreamHandler({
    requestId: tempBotId,
    userMsg,
    onUpdateHistory,
    onLoadingChange: setIsLoading,
    getSkillInfo: () => skillInfoRef, // 动态获取技能信息
    onComplete: async (fullText, requestId) => {
      // 温度感引擎：通知消息接收（异步处理，不阻塞）
      if (engine && engineReady) {
        engine.getPluginManager()?.dispatchEvent('messageReceived', {
          message: fullText,
          context: { character: character.name },
        }).catch((error) => {
          console.error('[generateAIResponse] 通知消息接收失败:', error);
        });
      }

      // 记忆系统：从AI回复中提取记忆
      if (memorySystem?.isReady) {
        memorySystem.extractAndSave(
          fullText,
          MemorySource.CONVERSATION,
          requestId
        ).catch((error) => {
          console.error('[generateAIResponse] 从AI回复提取记忆失败:', error);
        });
      }

      // HSMem记忆提取：将完整的对话（用户消息 + AI回复）提取到hsmem系统（通过 backend API）
      if (userProfile?.id) {
        try {
          const token = getToken();
          if (!token || !token.trim()) {
            logger.warn('[generateAIResponse] 未登录或 token 无效，跳过 HSMem 记忆提取', { 
              hasToken: !!token, 
              tokenLength: token?.length,
              userId: userProfile?.id 
            });
            return;
          }
          
          logger.debug('[generateAIResponse] 准备调用 HSMem 记忆提取', {
            userId: userProfile.id,
            tokenLength: token.length,
            messageCount: 2
          });

          // 构建包含用户消息和AI回复的完整对话
          const conversationMessages = [
            {
              role: 'user',
              content: typeof userText === 'string' ? userText : userText || '',
            },
            {
              role: 'assistant',
              content: fullText,
            },
          ];

          // 调用 backend API 进行记忆化（后端会自动添加 user_id）
          const hsmemResult = await memoryApi.memorizeConversation({
            messages: conversationMessages,
            user_id: undefined, // 由后端自动从认证信息中提取
            agent_id: character?.id ? `character_${character.id}` : undefined,
          }, token);

          logger.debug('[generateAIResponse] HSMem记忆提取成功', {
            resourceId: hsmemResult.resource_id,
            itemsCount: hsmemResult.items_count,
            categories: hsmemResult.categories,
          });
        } catch (error) {
          // HSMem记忆提取失败不影响主流程，只记录错误
          logger.error('[generateAIResponse] HSMem记忆提取失败:', error);
        }
      }

      // 调用外部onComplete回调（如果提供）
      if (onComplete) {
        try {
          await onComplete(fullText, requestId);
        } catch (error) {
          console.error('[generateAIResponse] 外部onComplete回调失败:', error);
        }
      }
    },
  });
  
  // 调用AI服务（根据配置自动选择统一模式或本地模式）
        try {
          // 输出系统指令中关于技能的部分（用于调试）
          if (systemInstruction.includes('[可用技能]')) {
            const skillSection = systemInstruction.split('[可用技能]')[1]?.split('\n\n')[0] || '';
          }
    
    await aiService.generateTextStream(
      {
        prompt: userText,
        systemInstruction: systemInstruction,
        messages: historyMessages,
        temperature: 0.7,
        maxTokens: 2048,
        functionDefinitions: functionDefinitions.length > 0 ? functionDefinitions : undefined,
        onFunctionCall: onFunctionCall,
      },
      streamHandler
    );
    
  } catch (error) {
    // 记录详细的错误信息
    const errorDetails: any = {
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      errorString: String(error),
    };
    
    if (error instanceof Error) {
      errorDetails.message = error.message;
      errorDetails.name = error.name;
      errorDetails.stack = error.stack;
      errorDetails.cause = (error as any).cause;
    } else if (error && typeof error === 'object') {
      try {
        errorDetails.keys = Object.keys(error);
        errorDetails.json = JSON.stringify(error, Object.getOwnPropertyNames(error));
      } catch (e) {
        errorDetails.jsonError = String(e);
      }
    }
    
    console.error('[generateAIResponse] AI服务调用失败:', errorDetails);
    console.error('[generateAIResponse] 原始错误对象:', error);
    
    // 确保抛出一个有意义的错误
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`AI服务调用失败: ${String(error || '未知错误')}`);
    }
  }
};