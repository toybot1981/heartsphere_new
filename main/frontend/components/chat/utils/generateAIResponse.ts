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
import { identifyMemoryType } from '../../../services/memory-system/utils/memoryTypeMapper';
import { MemoryDebugInfo } from '../debug/MemoryDebugPanel';

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
  onDebugInfo?: (info: MemoryDebugInfo) => void; // 调试信息回调
  sessionId?: string; // 会话ID，用于保存消息到数据库
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
  onDebugInfo,
  sessionId,
}: GenerateAIResponseOptions): Promise<void> => {
  // 构建系统指令（使用统一的工具函数）
  let systemInstruction = buildSystemInstruction(character, settings, userProfile);
  
  // 添加自定义系统指令后缀（用于场景节点等特殊场景）
  if (customSystemInstructionSuffix) {
    systemInstruction += customSystemInstructionSuffix;
  }
  
  // 将记忆添加到系统指令中（如果有）
  let formattedMemoryContext = '';
  if (relevantMemories.length > 0) {
    // 按类型分组记忆
    const memoriesByType = relevantMemories.reduce((acc, m) => {
      const type = m.type || 'general';
      if (!acc[type]) acc[type] = [];
      acc[type].push(m);
      return acc;
    }, {} as Record<string, typeof relevantMemories>);

    // 格式化记忆上下文（作为提示词）
    formattedMemoryContext = '\n\n[用户长期记忆]\n';
    formattedMemoryContext += '以下是用户的长期记忆信息，请在对话中自然地引用这些信息，让对话更加个性化和连贯：\n';
    
    Object.entries(memoriesByType).forEach(([type, memories]) => {
      const typeLabels: Record<string, string> = {
        'preference': '偏好',
        'habit': '习惯',
        'personal_info': '个人信息',
        'event': '重要事件',
        'asset': '资产信息',
        'work': '工作相关',
        'general': '通用记忆',
      };
      const typeLabel = typeLabels[type] || type;
      
      formattedMemoryContext += `\n【${typeLabel}】\n`;
      memories.forEach((m, idx) => {
        const content = m.summary || m.content || '';
        formattedMemoryContext += `${idx + 1}. ${content}\n`;
      });
    });
    
    formattedMemoryContext += '\n注意：以上记忆信息仅供参考，请根据对话上下文自然地使用，不要生硬地列举。';

    systemInstruction += formattedMemoryContext;

    // 记录调试信息（记忆注入）
    if (onDebugInfo) {
      onDebugInfo({
        injection: {
          memories: relevantMemories.map(m => ({
            id: m.id || '',
            type: m.type || 'general',
            content: m.content || '',
            summary: m.summary,
          })),
          formattedContext: formattedMemoryContext,
          tokenCount: formattedMemoryContext.length / 4, // 粗略估算
          timestamp: Date.now(),
        },
      });
    }
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
        const extractionStartTime = Date.now();
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
          
          logger.info('[generateAIResponse] 准备调用 HSMem 记忆提取', {
            userId: userProfile.id,
            tokenLength: token.length,
            messageCount: 2
          });

          // 构建包含用户消息和AI回复的完整对话
          // HSMem API 期望 content 为对象 {text: "..."}，而不是字符串
          const conversationMessages = [
            {
              role: 'user',
              content: { text: typeof userText === 'string' ? userText : userText || '' },
            },
            {
              role: 'assistant',
              content: { text: fullText },
            },
          ];

          // 识别记忆类型
          const identifiedTypes = [
            identifyMemoryType(userText),
            identifyMemoryType(fullText),
          ].filter((t, i, arr) => arr.indexOf(t) === i); // 去重

          // 调用 backend API 进行记忆化（后端会自动添加 user_id）
          const hsmemResult = await memoryApi.memorizeConversation({
            messages: conversationMessages,
            user_id: undefined, // 由后端自动从认证信息中提取
            agent_id: character?.id ? `character_${character.id}` : undefined,
          }, token);

          const extractionDuration = Date.now() - extractionStartTime;

          // 构建提取的记忆项（基于识别类型）
          const extractedMemories = identifiedTypes.map(type => ({
            type,
            content: type === identifyMemoryType(userText) ? userText : fullText,
            summary: (type === identifyMemoryType(userText) ? userText : fullText).substring(0, 100),
            confidence: 0.7,
          }));

          logger.info('[generateAIResponse] HSMem记忆提取成功', {
            resourceId: hsmemResult.resource_id,
            itemsCount: hsmemResult.items_count,
            categories: hsmemResult.categories,
            identifiedTypes,
          });

          // 记录调试信息（记忆提取）
          if (onDebugInfo) {
            onDebugInfo({
              extraction: {
                source: 'conversation',
                extracted: extractedMemories,
                hsmemResult: {
                  resourceId: hsmemResult.resource_id,
                  itemsCount: hsmemResult.items_count,
                  categories: hsmemResult.categories || [],
                },
                timestamp: Date.now(),
                duration: extractionDuration,
              },
            });
          }
        } catch (error) {
          const extractionDuration = Date.now() - extractionStartTime;
          // HSMem记忆提取失败不影响主流程，只记录错误
          logger.error('[generateAIResponse] HSMem记忆提取失败:', error);
          
          // 记录调试信息（错误情况）
          if (onDebugInfo) {
            onDebugInfo({
              extraction: {
                source: 'conversation',
                extracted: [],
                timestamp: Date.now(),
                duration: extractionDuration,
                error: error instanceof Error ? error.message : String(error),
              },
            });
          }
        }
      }

      // 保存AI回复消息到数据库（异步，不阻塞主流程）
      // 注意：即使 fullText 为空，也尝试保存，确保消息记录完整
      if (userProfile?.id) {
        if (!sessionId) {
          logger.error('[generateAIResponse] ❌ sessionId 缺失，无法保存AI回复消息', {
            userId: userProfile.id,
            characterId: character?.id,
            hasSessionId: !!sessionId,
            sessionIdValue: sessionId,
          });
        } else {
          try {
            const token = getToken();
            if (!token) {
              logger.warn('[generateAIResponse] 未登录或 token 无效，跳过保存AI回复消息', {
                sessionId,
                userId: userProfile.id,
                hasToken: !!token,
              });
            } else {
              // 确保 sessionId 有效
              if (!sessionId || sessionId.trim() === '') {
                logger.error('[generateAIResponse] sessionId 无效（空字符串），无法保存AI回复消息', {
                  sessionId,
                  userId: userProfile.id,
                  characterId: character?.id,
                });
              } else {
                // 即使 fullText 为空，也保存消息（确保消息记录完整）
                const contentToSave = fullText || '';
                logger.info('[generateAIResponse] ========== 开始保存AI回复消息 ==========');
                logger.info('[generateAIResponse] 保存前检查: sessionId={}, userId={}, characterId={}, contentLength={}, hasToken={}', 
                  sessionId, userProfile.id, character?.id, contentToSave.length, !!token);
                
                if (contentToSave.length === 0) {
                  logger.warn('[generateAIResponse] ⚠️ AI回复内容为空，但仍保存消息记录', {
                    sessionId,
                    userId: userProfile.id,
                    characterId: character?.id,
                  });
                }
                
                logger.info('[generateAIResponse] 准备调用 memoryApi.saveChatMessage: sessionId={}, role=ASSISTANT, contentLength={}, metadata={}', 
                  sessionId, contentToSave.length, { characterId: character?.id, requestId });
                
                const savedMessage = await memoryApi.saveChatMessage(
                  sessionId,
                  'ASSISTANT',
                  contentToSave,
                  token,
                  { characterId: character?.id, requestId },
                  undefined
                );
                
                logger.info('[generateAIResponse] ✅ AI回复消息已成功保存到数据库', {
                  sessionId,
                  messageId: savedMessage?.id,
                  userId: savedMessage?.userId,
                  messageLength: contentToSave.length,
                  timestamp: savedMessage?.timestamp,
                  characterId: character?.id,
                  requestId,
                });
                logger.info('[generateAIResponse] ========== 保存AI回复消息完成 ==========');
              
              // 🆕 资产升级检测（Phase 4）
              // 检测这次对话中是否有可以升级为角色通用资产的知识
              try {
                if (character?.id && userText.length > 50) {
                  // 构建对话内容用于资产升级检测
                  const conversationContent = `用户: ${userText}\n\nAI: ${fullText}`;
                  
                  // 调用后端的资产升级检测服务（当前简化实现）
                  // 实际应该由后端异步处理，这里仅作示意
                  logger.info('[generateAIResponse] 启动资产升级检测', {
                    characterId: character.id,
                    conversationLength: conversationContent.length,
                  });
                  
                  // 可选：向后端发送异步请求以检测和升级资产
                  // await fetch('/api/memory/v1/character/' + character.id + '/detect-and-promote-assets', {
                  //   method: 'POST',
                  //   headers: { Authorization: `Bearer ${token}` },
                  //   body: JSON.stringify({ conversationId: messageId, content: conversationContent })
                  // });
                }
              } catch (error) {
                logger.warn('[generateAIResponse] 资产升级检测异常（不影响主流程）:', error);
              }

              // 🆕 角色成长系统集成（Phase 2-5）
              // 在对话完成后，触发角色的自我成长、情感连接和情境感知
              if (character?.id && userProfile?.id) {
                try {
                  // 使用统一的ID映射工具
                  const { normalizeCharacterId, isValidCharacterId } = await import('../../../utils/characterIdMapper');
                  const characterIdNum = normalizeCharacterId(character.id);
                  
                  // 只有有效的角色ID（正数）才支持成长系统
                  if (!isValidCharacterId(character.id)) {
                    logger.info('[generateAIResponse] 跳过系统角色的成长系统集成:', { 
                      characterId: character.id, 
                      normalizedId: characterIdNum 
                    });
                    return;
                  }
                  
                  // 1. 检测学习机会（异步，不阻塞）
                  const conversationContent = `${userText}\n\n${fullText}`;
                  if (conversationContent.length > 50) {
                    // 调用后端API检测学习机会（后端会记录成长事件）
                    fetch(`/api/memory/v1/character/${characterIdNum}/growth/reflect?userId=${userProfile.id}&reflectionType=AUTO`, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }).catch((error) => {
                      logger.info('[generateAIResponse] 学习机会检测失败（不影响主流程）:', error);
                    });
                  }

                  // 2. 检测情感共鸣（异步，不阻塞）
                  // 通过分析对话内容检测情感共鸣
                  fetch(`/api/memory/v1/character/${characterIdNum}/context/analyze?userId=${userProfile.id}&userMessage=${encodeURIComponent(userText)}`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([userText, fullText]), // 对话历史
                  }).then(async (response) => {
                    if (response.ok) {
                      const context = await response.json();
                      // 如果检测到情感需求，可以触发情感共鸣记录
                      if (context.data?.hasEmotionalNeed) {
                        logger.info('[generateAIResponse] 检测到情感需求，可能触发情感共鸣');
                      }
                    }
                  }).catch((error) => {
                    logger.info('[generateAIResponse] 情境分析失败（不影响主流程）:', error);
                  });

                  // 3. 智能模式切换（异步，不阻塞）
                  // 根据对话情境推荐最佳响应模式
                  fetch(`/api/memory/v1/character/${characterIdNum}/mode/switch?userId=${userProfile.id}&userMessage=${encodeURIComponent(userText)}`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([userText]), // 对话历史
                  }).then(async (response) => {
                    if (response.ok) {
                      const result = await response.json();
                      if (result.data?.shouldSwitch) {
                        logger.info('[generateAIResponse] 推荐模式切换', {
                          currentMode: result.data.currentMode,
                          recommendedMode: result.data.recommendedMode,
                        });
                      }
                    }
                  }).catch((error) => {
                    logger.info('[generateAIResponse] 模式切换分析失败（不影响主流程）:', error);
                  });

                  logger.info('[generateAIResponse] 角色成长系统集成完成', {
                    characterId: character.id,
                    userId: userProfile.id,
                  });
                } catch (error) {
                  logger.warn('[generateAIResponse] 角色成长系统集成异常（不影响主流程）:', error);
                }
              }
              }
            }
          } catch (error) {
            // 增强错误日志，包含更多调试信息
            const errorDetails = {
              sessionId,
              userId: userProfile?.id,
              characterId: character?.id,
              messageLength: fullText.length,
              error: error instanceof Error ? {
                message: error.message,
                name: error.name,
                stack: error.stack?.split('\n').slice(0, 5).join('\n'),
              } : String(error),
            };
            logger.error('[generateAIResponse] ❌ 保存AI回复消息失败，详细信息:', errorDetails);
            
            // 在开发环境下，将错误显示在控制台以便调试
            if (process.env.NODE_ENV === 'development') {
              console.error('[generateAIResponse] 保存AI回复失败:', errorDetails);
            }
          }
        }
      } else {
        logger.warn('[generateAIResponse] 跳过保存AI回复消息（缺少必要参数）', {
          hasUserId: !!userProfile?.id,
          hasSessionId: !!sessionId,
          sessionId,
          userId: userProfile?.id,
          characterId: character?.id,
        });
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