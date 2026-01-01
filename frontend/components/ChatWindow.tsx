
import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, CustomScenario, AppSettings, StoryNode, StoryOption, UserProfile, JournalEcho, DialogueStyle } from '../types';
import { ChatWindowProps, ScenarioState, ScenarioStateUpdates } from '../types/chat';
import { aiService } from '../services/ai';
import { AIConfigManager } from '../services/ai/config';
import { Button } from './Button';
import { showAlert } from '../utils/dialog';
import { createScenarioContext } from '../constants';
import { useTemperatureEngine } from '../services/temperature-engine';
import { useEmotionSystem } from '../services/emotion-system';
import { useMemorySystem } from '../services/memory-system';
import { EmotionMemoryFusion } from '../services/emotion-memory-fusion';
import { MemorySource } from '../services/memory-system/types/MemoryTypes';
import { useCompanionSystem } from '../services/companion-system/hooks/useCompanionSystem';
import { useGrowthSystem } from '../services/growth-system/hooks/useGrowthSystem';
import { useCompanionMemorySystem } from '../services/companion-memory/hooks/useCompanionMemorySystem';
import { CareMessageNotification } from './companion/CareMessageNotification';
import { EmojiPicker } from './emoji/EmojiPicker';
import { CardMaker } from './card/CardMaker';
import { RichTextRenderer } from './chat/RichTextRenderer';
import { MessageBubble } from './chat/MessageBubble';
import { VoiceModeUI } from './chat/VoiceModeUI';
import { ScenarioChoices } from './chat/ScenarioChoices';
import { HeaderBar } from './chat/HeaderBar';
import { BackgroundLayer } from './chat/BackgroundLayer';
import { CharacterAvatar } from './chat/CharacterAvatar';
import { useImagePreload } from './chat/hooks/useImagePreload';
import { decodeBase64ToBytes, decodeAudioData } from '../utils/audio';
import { useUIState } from './chat/hooks/useUIState';
import { useAudioPlayback } from './chat/hooks/useAudioPlayback';
import { useVoiceInput } from './chat/hooks/useVoiceInput';
import { useHistoryInitialization } from './chat/hooks/useHistoryInitialization';
import { useSceneGeneration } from './chat/hooks/useSceneGeneration';
import { useStreamResponse } from './chat/hooks/useStreamResponse';
import { useSystemIntegration } from './chat/hooks/useSystemIntegration';
import { buildSystemInstruction, getDialogueStyleInstruction } from '../utils/chat/systemInstruction';
import { createErrorMessage, getErrorMessage } from '../utils/chat/errorHandling';
import { applyOptionEffects, processRandomEvents, checkOptionConditions } from '../utils/chat/scenarioHelpers';
import { generateAIResponse } from './chat/utils/generateAIResponse';
import { logger } from '../utils/logger';
import { getToken } from '../services/api/base/tokenStorage';
import { mailboxApi } from '../services/api/mailbox';

// 类型定义已移至 types/chat.ts
// 音频解码函数已移至 utils/audio.ts
// RichTextRenderer 组件已移至 components/chat/RichTextRenderer.tsx
// 状态管理Hooks已移至 components/chat/hooks/

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  character, customScenario, history, scenarioState, settings, userProfile, activeJournalEntryId, onUpdateHistory, onUpdateScenarioState, onUpdateScenarioStateData, onBack, participatingCharacters 
}) => {
  // 防御性检查：确保history是数组
  const safeHistory = Array.isArray(history) ? history : [];
  
  // 调试日志：检查history数据（仅在开发环境）
  useEffect(() => {
    logger.debug('[ChatWindow] history prop变化:', {
      historyLength: history?.length || 0,
      historyType: typeof history,
      isArray: Array.isArray(history),
      safeHistoryLength: safeHistory.length,
    });
  }, [history?.length]);
  
  // 基础状态
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // UI状态管理（使用自定义Hook）
  const uiState = useUIState();
  
  // 音频播放状态管理（使用自定义Hook）
  const audioPlayback = useAudioPlayback();
  
  // 语音输入状态管理（使用自定义Hook）
  const voiceInput = useVoiceInput();
  
  // 记忆结晶状态
  const [isCrystalizing, setIsCrystalizing] = useState(false);
  const [generatedEcho, setGeneratedEcho] = useState<JournalEcho | undefined>(undefined);
  
  // E-SOUL发邮件测试状态
  const [isTriggeringLetter, setIsTriggeringLetter] = useState(false);
  
  // 触发E-SOUL来信（测试用）
  const handleTriggerESoulLetter = async () => {
    const token = getToken();
    if (!token) {
      showAlert('请先登录', '需要登录才能发送E-SOUL来信');
      return;
    }

    setIsTriggeringLetter(true);
    try {
      const result = await mailboxApi.triggerESoulLetter(token);
      
      if (result.success) {
        showAlert(
          'E-SOUL来信已发送',
          `来信已成功发送到您的信箱！\n消息ID: ${result.messageId || 'N/A'}\n\n请前往信箱查看。`,
          'success'
        );
      } else {
        showAlert(
          '发送失败',
          result.message || '未满足触发条件或没有可用角色',
          'error'
        );
      }
    } catch (error: any) {
      console.error('触发E-SOUL来信失败:', error);
      showAlert(
        '发送失败',
        error.message || '发送E-SOUL来信时发生错误，请稍后重试',
        'error'
      );
    } finally {
      setIsTriggeringLetter(false);
    }
  };
  
  // DOM引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 温度感引擎集成
  const { engine, state: engineState, isReady: engineReady } = useTemperatureEngine({
    enabled: true,
    plugins: {
      enabled: ['greeting', 'expression', 'dialogue'],
    },
  });

  // 情绪感知系统集成
  const emotionSystem = useEmotionSystem({
    enabled: true,
    fusionEnabled: true,
    storageEnabled: true,
    autoAnalysis: true,
    userId: userProfile?.id || 0,
  });

  // 记忆系统集成
  const memorySystem = useMemorySystem({
    enabled: true,
    autoExtraction: true,
    userId: userProfile?.id || 0,
  });

  // 情绪记忆融合系统
  const [emotionMemoryFusion, setEmotionMemoryFusion] = React.useState<EmotionMemoryFusion | null>(null);

  React.useEffect(() => {
    if (emotionSystem.system && memorySystem.system) {
      const fusion = new EmotionMemoryFusion(
        emotionSystem.system,
        memorySystem.system
      );
      setEmotionMemoryFusion(fusion);
    }
  }, [emotionSystem.system, memorySystem.system]);

  // 陪伴式交互系统集成
  const companionSystem = useCompanionSystem({
    enabled: true,
    proactiveCare: {
      enabled: true,
      scheduledGreeting: {
        type: 'scheduled_greeting',
        timeSlots: [
          { hour: 7, minute: 0, greetingType: 'morning', enabled: true },
          { hour: 12, minute: 0, greetingType: 'afternoon', enabled: true },
          { hour: 18, minute: 0, greetingType: 'evening', enabled: true },
          { hour: 21, minute: 0, greetingType: 'night', enabled: true },
        ],
      },
      inactivity: {
        type: 'inactivity',
        thresholds: [
          { duration: 24, careLevel: 'gentle', messageTemplate: '好久不见，想你了～' },
          { duration: 72, careLevel: 'moderate', messageTemplate: '好几天没见了，最近还好吗？' },
          { duration: 168, careLevel: 'strong', messageTemplate: '一周没见了，想和你聊聊～' },
        ],
      },
      specialTime: {
        type: 'special_time',
        specialTimes: [
          { timeRange: [23, 6], careType: 'late_night', messageTemplate: '这么晚了还在呀，要注意休息哦 💙' },
          { timeRange: [0, 24], dayOfWeek: [0, 6], careType: 'weekend', messageTemplate: '周末愉快！有什么计划吗？' },
          { timeRange: [22, 2], careType: 'lonely_hour', messageTemplate: '夜深了，如果你感到孤单，我在这里陪着你 🌙' },
        ],
      },
      negativeEmotion: {
        type: 'negative_emotion',
        emotionTypes: ['sad', 'anxious', 'angry', 'lonely', 'tired', 'confused'],
        intensityThreshold: 'moderate',
        durationThreshold: 1,
        careInterval: 2,
      },
    },
    userId: userProfile?.id || 0,
  });

  // 从陪伴系统中解构关怀消息
  const { careMessages, markAsRead: markCareMessageAsRead } = companionSystem;

  // 处理关怀消息关闭
  const handleDismissCareMessage = (messageId: string) => {
    markCareMessageAsRead(messageId);
  };

  // 成长记录系统集成
  const growthSystem = useGrowthSystem({
    enabled: true,
    userId: userProfile?.id || 0,
    autoRecord: true,
  });

  // 陪伴记忆系统集成
  const companionMemorySystem = useCompanionMemorySystem({
    enabled: true,
    userId: userProfile?.id || 0,
    autoRecord: true,
    recordConversations: true,
    recordMilestones: true,
    recordEmotions: true,
  });

  // 系统集成Hook（统一处理温度感、情绪、记忆、陪伴、成长等系统）
  const systemIntegration = useSystemIntegration({
    engine,
    engineReady,
    emotionSystem,
    memorySystem,
    companionSystem,
    companionMemorySystem,
    growthSystem,
    emotionMemoryFusion,
    scenarioState,
    safeHistory,
  });
  
  // 场景生成状态管理（使用自定义Hook）
  const sceneGeneration = useSceneGeneration({
    isStoryMode: !!customScenario || (character?.id?.startsWith('story_') ?? false),
    autoGenerate: settings.autoGenerateStoryScenes || false,
    lastMessage: safeHistory[safeHistory.length - 1],
    defaultBackgroundUrl: character?.backgroundUrl || null,
  });

  // 流式响应处理（使用自定义Hook）
  const streamResponse = useStreamResponse({
    onUpdateHistory,
    onLoadingChange: setIsLoading,
  });

  // Determine mode
  const isStoryMode = !!customScenario || (character?.id?.startsWith('story_') ?? false);
  const isScenarioMode = !!customScenario; // Specifically for Node-based scenarios

  // 滚动到底部（使用useCallback优化）
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [safeHistory.length, uiState.isCinematic, scrollToBottom]); 

  // Note: Session reset is no longer needed with unified AI service
  // The aiService handles context management automatically

  // 场景转换处理函数（需要在useHistoryInitialization之前定义）
  const handleScenarioTransition = React.useCallback(async (node: StoryNode, choiceText: string | null) => {
    setIsLoading(true);
    const tempBotId = `bot_${Date.now()}`;
    
    let currentHistory = [...safeHistory];
    if (choiceText) {
       const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: choiceText, timestamp: Date.now() };
       currentHistory.push(userMsg);
       onUpdateHistory(currentHistory);
    }

    try {
      // 处理随机事件
      if (node.randomEvents && node.randomEvents.length > 0 && onUpdateScenarioStateData && scenarioState) {
        const randomUpdates = processRandomEvents(node, scenarioState);
        if (randomUpdates) {
          onUpdateScenarioStateData(randomUpdates);
        }
      }

      // 更新已访问节点（通过onUpdateScenarioState实现，因为visitedNodes需要特殊处理）

      // 检查节点类型：ai-dynamic = AI动态生成，fixed 或 undefined = 固定内容，ending = 结局节点
      const nodeType = node.nodeType || 'fixed';
      
      // 处理多角色对话
      if (node.multiCharacterDialogue && node.multiCharacterDialogue.length > 0) {
        const sortedDialogue = [...node.multiCharacterDialogue].sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const dialogue of sortedDialogue) {
          const char = participatingCharacters?.find(c => c.id === dialogue.characterId);
          const charName = char?.name || dialogue.characterId;
          const dialogueText = `${charName}: ${dialogue.content}`;
          const dialogueMsg: Message = {
            id: `dialogue_${Date.now()}_${dialogue.characterId}`,
            role: 'model',
            text: dialogueText,
            timestamp: Date.now()
          };
          currentHistory.push(dialogueMsg);
          onUpdateHistory([...currentHistory]);
          // 添加小延迟以显示对话顺序
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        currentHistory = [...safeHistory]; // 更新当前历史
      }
      
      if (nodeType === 'ai-dynamic') {
        // AI动态生成模式：使用AI根据节点prompt生成内容
        logger.debug('[ChatWindow] AI动态节点生成:', { nodeId: node.id, prompt: node.prompt });
        
        // 检查当前配置模式
        const config = await AIConfigManager.getUserConfig();
        
        // 获取节点涉及的角色信息
        let focusedCharacter = character; // 默认使用主角色
        if (node.focusCharacterId && participatingCharacters) {
          const foundChar = participatingCharacters.find(c => c.id === node.focusCharacterId);
          if (foundChar) {
            focusedCharacter = foundChar;
          }
        }
        
        // 构建系统指令
        const systemInstruction = buildSystemInstruction(
          focusedCharacter,
          settings,
          userProfile,
          customScenario ? `\n\n[当前场景上下文]\n剧本标题：${customScenario.title}${customScenario.description ? `\n剧本描述：${customScenario.description}` : ''}\n\n[场景节点说明]\n${node.prompt || node.title}\n\n请根据上述场景描述，生成符合角色性格的对话内容和旁白。` : undefined
        );
        
        // 转换消息历史（不包含当前节点的内容）
        const historyMessages = currentHistory.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant' | 'system',
          content: msg.text,
        }));
        
        // 使用AI生成内容（流式生成）
        const currentRequestId = tempBotId;
        let requestFullResponseText = '';
        let hasAddedBotMessage = false;
        
        if (config.mode === 'unified') {
          await aiService.generateTextStream(
            {
              prompt: node.prompt || node.title || '请生成这个场景的内容',
              systemInstruction: systemInstruction,
              messages: historyMessages,
              temperature: 0.7,
              maxTokens: 2048,
            },
            (chunk) => {
              try {
                if (!chunk.done && chunk.content) {
                  requestFullResponseText += chunk.content;
                  const msg = { id: currentRequestId, role: 'model' as const, text: requestFullResponseText, timestamp: Date.now() };
                  
                  onUpdateHistory(prevHistory => {
                    try {
                      if (typeof prevHistory === 'function' || !Array.isArray(prevHistory)) {
                        return [];
                      }
                      
                      const lastMsg = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
                      const isLastMsgOurs = lastMsg && lastMsg.id === currentRequestId && lastMsg.role === 'model';
                      
                      if (!hasAddedBotMessage && !isLastMsgOurs) {
                        hasAddedBotMessage = true;
                        return [...prevHistory, msg];
                      } else if (isLastMsgOurs) {
                        hasAddedBotMessage = true;
                        return [...prevHistory.slice(0, -1), msg];
                      } else {
                        hasAddedBotMessage = true;
                        return [...prevHistory, msg];
                      }
                    } catch (error) {
                      logger.error('[ChatWindow] AI动态节点更新history错误:', error);
                      return Array.isArray(prevHistory) && typeof prevHistory !== 'function' ? prevHistory : [];
                    }
                  });
                } else if (chunk.done) {
                  setIsLoading(false);
                }
              } catch (error) {
                logger.error('[ChatWindow] AI动态节点处理chunk错误:', error);
                setIsLoading(false);
              }
            }
          );
        } else {
          // 本地配置模式：使用非流式生成（简化实现）
          try {
            const response = await aiService.generateText({
              prompt: node.prompt || node.title || '请生成这个场景的内容',
              systemInstruction: systemInstruction,
              messages: historyMessages,
              temperature: 0.7,
              maxTokens: 2048,
            });
            
            const nodeContent = response.content || node.prompt || '【场景内容】';
            const botMsg: Message = {
              id: tempBotId,
              role: 'model',
              text: nodeContent,
              timestamp: Date.now()
            };
            
            onUpdateHistory(prevHistory => {
              if (typeof prevHistory === 'function' || !Array.isArray(prevHistory)) {
                return [botMsg];
              }
              return [...prevHistory, botMsg];
            });
          } catch (error) {
            logger.error('[ChatWindow] AI动态节点生成失败（本地模式）:', error);
            // 如果AI生成失败，回退到使用prompt内容
            const nodeContent = node.prompt || node.title || '【场景内容】';
            const botMsg: Message = {
              id: tempBotId,
              role: 'model',
              text: nodeContent,
              timestamp: Date.now()
            };
            onUpdateHistory(prevHistory => {
              if (typeof prevHistory === 'function' || !Array.isArray(prevHistory)) {
                return [botMsg];
              }
              return [...prevHistory, botMsg];
            });
          }
        }
      } else if (nodeType === 'ending') {
        // 结局节点：显示结局内容
        const endingContent = node.prompt || node.title || '【结局】';
        const botMsg: Message = { 
          id: tempBotId, 
          role: 'model', 
          text: `【结局】\n${endingContent}`, 
          timestamp: Date.now() 
        };
        currentHistory = [...currentHistory, botMsg];
        onUpdateHistory(currentHistory);
      } else {
        // 固定内容模式：直接使用节点预设的prompt内容
        const nodeContent = node.prompt || node.title || '【场景内容】';
        const botMsg: Message = { 
          id: tempBotId, 
          role: 'model', 
          text: nodeContent, 
          timestamp: Date.now() 
        };
        currentHistory = [...currentHistory, botMsg];
        onUpdateHistory(currentHistory);
      }
       
      // 更新时间（如果节点有timeLimit，从进入节点开始计时）
      if (onUpdateScenarioStateData && scenarioState) {
        const currentTime = scenarioState.currentTime || 0;
        // 这里可以增加时间，或者如果有timeLimit，开始计时
        // 时间系统可以由外部管理，这里只是追踪
      }
       
      // 更新场景状态到当前节点（包括visitedNodes）
      if (onUpdateScenarioState) {
        onUpdateScenarioState(node.id);
      }
      // 更新已访问节点
      if (onUpdateScenarioStateData && scenarioState) {
        const visitedNodes = scenarioState.visitedNodes || [];
        if (!visitedNodes.includes(node.id)) {
          onUpdateScenarioStateData({ visitedNodes: [node.id] });
        }
      }
       
      // 如果节点有timeLimit，设置超时处理
      if (node.timeLimit && node.timeoutNodeId) {
        setTimeout(() => {
          if (scenarioState?.currentNodeId === node.id) {
            // 如果还在当前节点，说明超时了，跳转到超时节点
            const timeoutNode = customScenario?.nodes[node.timeoutNodeId];
            if (timeoutNode) {
              handleScenarioTransition(timeoutNode, null);
            }
          }
        }, node.timeLimit * 1000);
      }
       
       // 节点处理完成，等待用户选择（如果有选项的话）
       // renderChoices 函数会根据 scenarioState.currentNodeId 和 node.options 来显示选项
       
    } catch (e) {
        logger.error("Scenario transition failed", e);
        onUpdateHistory((prevHistory) => {
          if (typeof prevHistory === 'function' || !Array.isArray(prevHistory)) {
            return [{id: tempBotId, role: 'model', text: "【系统错误：剧本执行失败，请稍后重试】", timestamp: Date.now()}];
          }
          return [...prevHistory, {id: tempBotId, role: 'model', text: "【系统错误：剧本执行失败，请稍后重试】", timestamp: Date.now()}];
        });
    } finally {
        setIsLoading(false);
    }
  }, [safeHistory, onUpdateHistory, onUpdateScenarioState, onUpdateScenarioStateData, scenarioState, customScenario, character, settings, userProfile, participatingCharacters]);

  // 历史记录初始化（使用自定义Hook）
  useHistoryInitialization({
    character,
    customScenario,
    scenarioState,
    safeHistory,
    isStoryMode,
    onUpdateHistory,
    onUpdateScenarioState,
    handleScenarioTransition,
  });

  // 音频播放处理（使用audioPlayback Hook的状态）
  const handlePlayAudio = React.useCallback(async (msgId: string, text: string) => {
    if (audioPlayback.playingMessageId === msgId) {
      audioPlayback.stopAudio();
      return;
    }
    audioPlayback.stopAudio();
    audioPlayback.setLoadingMessageId(msgId);

    try {
      if (!audioPlayback.audioContextRef.current) {
        audioPlayback.audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      const ctx = audioPlayback.audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const base64Audio = await aiService.generateSpeech(text, character.voiceName || 'Kore');
      if (!base64Audio) throw new Error("No audio data generated");

      const audioBytes = decodeBase64ToBytes(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        audioPlayback.setPlayingMessageId(null);
      };
      
      audioPlayback.sourceNodeRef.current = source;
      source.start();
      
      audioPlayback.setPlayingMessageId(msgId);
    } catch (e) {
      logger.error("Audio playback failed", e);
      showAlert("语音播放失败，请检查网络或稍后重试", "错误", "error");
    } finally {
      audioPlayback.setLoadingMessageId(null);
    }
  }, [audioPlayback, character.voiceName]);

  // 音频清理Effect（修复依赖项）
  useEffect(() => {
    return () => {
      audioPlayback.stopAudio();
      if (audioPlayback.audioContextRef.current && audioPlayback.audioContextRef.current.state !== 'closed') {
        audioPlayback.audioContextRef.current.close();
      }
    };
  }, [audioPlayback.stopAudio]);

  const handleOptionClick = (optionId: string) => {
      // 如果正在加载，阻止处理
      if (isLoading) {
          return;
      }
      
      if (!customScenario || !scenarioState) {
          logger.error('[ChatWindow] 缺少 customScenario 或 scenarioState');
          return;
      }
      
      const currentNodeId = scenarioState.currentNodeId;
      if (!currentNodeId) {
          logger.error('[ChatWindow] scenarioState.currentNodeId 为空');
          return;
      }
      
      const currentNode = customScenario.nodes[currentNodeId];
      if (!currentNode) {
          logger.error('[ChatWindow] 找不到当前节点:', currentNodeId);
          return;
      }
      
      const option = currentNode.options?.find(o => o.id === optionId);
      if (!option) {
          logger.error('[ChatWindow] 找不到选项:', optionId);
          return;
      }
      
      if (!option.nextNodeId) {
          return;
      }
      
      const nextNode = customScenario.nodes[option.nextNodeId];
      if (!nextNode) {
          logger.error('[ChatWindow] 找不到下一个节点:', option.nextNodeId);
          return;
      }
      
      // 应用选项的状态影响
      if (option.effects && option.effects.length > 0 && onUpdateScenarioStateData) {
          const favorabilityUpdates: Record<string, number> = {};
          const newEvents: string[] = [];
          const newItems: string[] = [];
          
          option.effects.forEach(effect => {
              if (effect.type === 'favorability') {
                  // 好感度变化
                  const currentFavorability = scenarioState.favorability?.[effect.target] || 0;
                  const change = effect.value || 0;
                  const newValue = Math.max(0, Math.min(100, currentFavorability + change)); // 限制在 0-100 之间
                  favorabilityUpdates[effect.target] = newValue;
                  logger.debug(`[ChatWindow] 好感度变化: ${effect.target} ${currentFavorability} -> ${newValue} (${change >= 0 ? '+' : ''}${change})`);
              } else if (effect.type === 'event') {
                  // 触发事件（去重）
                  if (!scenarioState.events?.includes(effect.target)) {
                      newEvents.push(effect.target);
                      logger.debug(`[ChatWindow] 触发事件: ${effect.target}`);
                  }
              } else if (effect.type === 'item') {
                  // 收集物品（去重）
                  if (!scenarioState.items?.includes(effect.target)) {
                      newItems.push(effect.target);
                      logger.debug(`[ChatWindow] 收集物品: ${effect.target}`);
                  }
              }
          });
          
          // 更新状态
          const updates: { favorability?: Record<string, number>; events?: string[]; items?: string[] } = {};
          if (Object.keys(favorabilityUpdates).length > 0) {
              updates.favorability = favorabilityUpdates;
          }
          if (newEvents.length > 0) {
              updates.events = newEvents;
          }
          if (newItems.length > 0) {
              updates.items = newItems;
          }
          
          if (Object.keys(updates).length > 0) {
              onUpdateScenarioStateData(updates);
          }
      }
      
      // 调用场景转换
      handleScenarioTransition(nextNode, option.text || optionId);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isScenarioMode) return;
    
    // 防止并发请求：如果已有请求在进行，忽略新的请求
    if (isLoading) {
      logger.warn('[ChatWindow] 已有请求在进行中，忽略新请求');
      return;
    }
    
    const userText = input.trim();
    setInput('');
    setIsLoading(true);
    
    // 先创建用户消息对象（需要在系统集成之前创建，因为记忆系统需要userMsg.id）
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
    const tempBotId = `bot_${Date.now()}`;
    
    // 系统集成：分析用户输入并集成各个系统（使用统一的Hook）
    await systemIntegration.analyzeAndIntegrate(userText, userMsg.id);
    
    // 使用函数式更新，确保获取最新的history状态
    // 注意：用户消息需要立即添加到history，这样后续的响应才能正确追加
    
    // 先构建包含用户消息的完整历史，用于后续AI调用
    // 这样可以确保AI调用时包含用户消息，即使prop还没更新
    const historyWithUserMsg = [...safeHistory, userMsg];
    
    // 使用函数式更新，确保获取最新的history状态（即使prop还没更新）
    onUpdateHistory(prevHistory => {
      // 防御性检查：确保prevHistory不是函数，且是数组
      if (typeof prevHistory === 'function') {
        console.error('[ChatWindow] prevHistory是函数，这是错误的:', prevHistory);
        return [userMsg];
      }
      const prev = Array.isArray(prevHistory) ? prevHistory : [];
      
      // 检查用户消息是否已经存在（防止重复添加）
      const userMsgExists = prev.some(m => m.id === userMsg.id);
      if (userMsgExists) {
        return prev;
      }
      
      const newHistory = [...prev, userMsg];
      return newHistory;
    });
    
    try {
      // 检查当前配置模式
      const config = await AIConfigManager.getUserConfig();
      
      console.log('[ChatWindow] 大模型连接模式检测:', {
        mode: config.mode,
        textProvider: config.textProvider,
        textModel: config.textModel,
        hasApiKeys: {
          gemini: !!AIConfigManager.getLocalApiKeys().gemini,
          openai: !!AIConfigManager.getLocalApiKeys().openai,
          qwen: !!AIConfigManager.getLocalApiKeys().qwen,
          doubao: !!AIConfigManager.getLocalApiKeys().doubao,
        }
      });
      
      // 统一模式和本地模式都使用相同的AI响应生成逻辑
      // 统一模式：获取相关记忆用于上下文
      let relevantMemories: any[] = [];
      if (config.mode === 'unified') {
        console.log('[ChatWindow] 使用统一接入模式调用大模型');
        
        // 温度感引擎：计算温度感（使用系统集成Hook）
        const currentTemperature = await systemIntegration.calculateTemperature(userText);
        
        // 获取相关记忆用于上下文（使用系统集成Hook）
        relevantMemories = await systemIntegration.getRelevantMemories(userText, 3);
      } else {
        console.log('[ChatWindow] 使用本地配置模式调用大模型', {
          provider: config.textProvider || 'gemini',
          model: config.textModel,
          hasProviderConfig: {
            gemini: !!AIConfigManager.getLocalApiKeys().gemini,
            openai: !!AIConfigManager.getLocalApiKeys().openai,
            qwen: !!AIConfigManager.getLocalApiKeys().qwen,
            doubao: !!AIConfigManager.getLocalApiKeys().doubao,
          }
        });
      }
      
      // 使用统一的AI响应生成函数
      await generateAIResponse({
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
        relevantMemories,
      });
    } catch (error) { 
        logger.error('[ChatWindow] AI服务调用失败:', error);
        const errorMsg = createErrorMessage(error as Error, tempBotId);
        onUpdateHistory(prevHistory => [...prevHistory, errorMsg]);
        showAlert(getErrorMessage(error as Error), "错误", "error");
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  
  // 自动播放音频（使用audioPlayback Hook）- 需要在handleVoiceSend之前定义
  const autoPlayAudio = React.useCallback(async (text: string, msgId: string) => {
    try {
      if (!audioPlayback.audioContextRef.current) {
        audioPlayback.audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      const ctx = audioPlayback.audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const base64Audio = await aiService.generateSpeech(text, character.voiceName || 'Kore');
      if (!base64Audio) return;
      
      const audioBytes = decodeBase64ToBytes(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        audioPlayback.setPlayingMessageId(null);
      };
      
      audioPlayback.sourceNodeRef.current = source;
      source.start();
      audioPlayback.setPlayingMessageId(msgId);
    } catch (error) {
      console.error('Auto play audio failed:', error);
      audioPlayback.setPlayingMessageId(null);
    }
  }, [audioPlayback, character.voiceName]);

  // 语音模式下自动发送消息（需要在startSpeechRecognition之前定义）
  const handleVoiceSend = React.useCallback(async (text: string) => {
    if (!text.trim() || isLoading || isScenarioMode) return;
    
    voiceInput.setIsWaitingForResponse(true);
    voiceInput.stopListening(); // 发送前停止识别
    
    const userText = text.trim();
    setIsLoading(true);
    
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
    const tempBotId = `bot_${Date.now()}`;
    
    // 使用函数式更新获取最新历史记录
    let currentHistory: Message[] = [];
    onUpdateHistory((prev) => {
      const updated = [...prev, userMsg];
      currentHistory = updated;
      return updated;
    });
    
    try {
      // 构建系统指令
      const systemInstruction = buildSystemInstruction(character, settings, userProfile);
      
      // 使用最新的历史记录生成AI回复
      const response = await aiService.generateText({
        prompt: userText,
        systemInstruction: systemInstruction,
        messages: currentHistory.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user' as const,
          content: msg.text,
        })),
        temperature: 0.8,
        maxTokens: 500
      });
      
      const botText = response.content || "抱歉，我无法理解。";
      const botMsg: Message = { 
        id: tempBotId, 
        role: 'model', 
        text: botText, 
        timestamp: Date.now() 
      };
      
      onUpdateHistory((prev) => [...prev, botMsg]);
      voiceInput.lastBotMessageIdRef.current = tempBotId;
      
      // 自动播放AI回复的语音
      await autoPlayAudio(botText, tempBotId);
      
    } catch (error) {
      logger.error("Voice send failed", error);
      const errorMsg = createErrorMessage(error as Error, `error_${Date.now()}`);
      onUpdateHistory((prev) => [...prev, errorMsg]);
      voiceInput.setIsWaitingForResponse(false);
      showAlert(getErrorMessage(error as Error), "错误", "error");
    } finally {
      setIsLoading(false);
      voiceInput.setIsWaitingForResponse(false);
      
      // 语音模式下，等待一段时间后重新开始识别
      // 使用ref来避免循环依赖
      if (voiceInput.isVoiceMode) {
        setTimeout(() => {
          if (voiceInput.isVoiceMode && !isLoading) {
            startSpeechRecognitionRef.current?.(true);
          }
        }, 1000);
      }
    }
  }, [isLoading, isScenarioMode, voiceInput, character, settings, userProfile, onUpdateHistory, autoPlayAudio]);

  // 使用ref存储startSpeechRecognition函数，避免循环依赖
  const startSpeechRecognitionRef = useRef<((autoSend?: boolean) => void) | null>(null);

  // 语音输入功能（使用voiceInput Hook）
  const startSpeechRecognition = React.useCallback((autoSend: boolean = false) => {
    voiceInput.setError(null);
    
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      voiceInput.setError("您的浏览器不支持语音输入，建议使用 Chrome 浏览器。");
      if (!voiceInput.isVoiceMode) {
        showAlert("您的浏览器不支持语音输入，建议使用 Chrome 浏览器。", "提示", "warning");
      }
      return;
    }
    
    // 如果已经在识别中，先停止旧的
    const currentRecognition = voiceInput.getRecognition();
    if (currentRecognition) {
      try {
        currentRecognition.stop();
      } catch (e) {
        // 忽略错误
      }
    }
    
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN'; // 设置语言为中文
      recognition.interimResults = true; // 返回中间结果
      recognition.continuous = voiceInput.isVoiceMode; // 语音模式下连续识别
      
      recognition.onstart = () => {
        voiceInput.startListening();
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          if (autoSend && voiceInput.isVoiceMode) {
            // 语音模式下自动发送
            handleVoiceSend(finalTranscript);
          } else {
            // 普通模式下追加到输入框
            setInput(prev => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
            });
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        voiceInput.stopListening();
        
        // 语音模式下，某些错误不显示提示，而是自动重启识别
        if (voiceInput.isVoiceMode && (event.error === 'no-speech' || event.error === 'aborted')) {
          setTimeout(() => {
            if (voiceInput.isVoiceMode && !voiceInput.isWaitingForResponse) {
              startSpeechRecognitionRef.current?.(true);
            }
          }, 500);
          return;
        }
        
        let errorMsg = '语音识别失败';
        if (event.error === 'no-speech') {
          errorMsg = '未检测到语音，请重试';
        } else if (event.error === 'audio-capture') {
          errorMsg = '无法访问麦克风，请检查权限';
        } else if (event.error === 'not-allowed') {
          errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许访问';
          voiceInput.setIsVoiceMode(false); // 权限被拒绝时退出语音模式
        }
        
        voiceInput.setError(errorMsg);
        if (!voiceInput.isVoiceMode) {
          showAlert(errorMsg, "语音识别错误", "error");
        }
      };
      
      recognition.onend = () => {
        voiceInput.stopListening();
        
        // 语音模式下，如果不是在等待响应，自动重启识别
        if (voiceInput.isVoiceMode && !voiceInput.isWaitingForResponse && voiceInput.getRecognition()) {
          setTimeout(() => {
            if (voiceInput.isVoiceMode && !voiceInput.isWaitingForResponse) {
              startSpeechRecognitionRef.current?.(true);
            }
          }, 300);
        }
      };
      
      voiceInput.setRecognition(recognition);
      recognition.start();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      voiceInput.setError('启动语音识别失败');
      voiceInput.stopListening();
      if (!voiceInput.isVoiceMode) {
        showAlert('启动语音识别失败，请重试', "错误", "error");
      }
    }
  }, [voiceInput, handleVoiceSend]);

  // 更新ref
  useEffect(() => {
    startSpeechRecognitionRef.current = startSpeechRecognition;
  }, [startSpeechRecognition]);
  
  // 切换语音模式（使用voiceInput Hook）
  const toggleVoiceMode = React.useCallback(() => {
    const newVoiceMode = !voiceInput.isVoiceMode;
    voiceInput.setIsVoiceMode(newVoiceMode);
    
    if (newVoiceMode) {
      // 进入语音模式：停止当前音频播放，开始语音识别
      audioPlayback.stopAudio();
      voiceInput.setIsWaitingForResponse(false);
      setTimeout(() => {
        startSpeechRecognitionRef.current?.(true);
      }, 500);
    } else {
      // 退出语音模式：停止语音识别
      voiceInput.stopListening();
      audioPlayback.stopAudio();
      voiceInput.setIsWaitingForResponse(false);
    }
  }, [voiceInput, audioPlayback]);
  
  // 组件卸载时清理语音识别（已在useVoiceInput Hook中处理）

  const handleCrystalizeMemory = async () => {
    if (!activeJournalEntryId || safeHistory.length < 2 || isCrystalizing) return;
    setIsCrystalizing(true);
    try {
        const wisdom = await aiService.generateWisdomEcho(history, character.name);
        if (wisdom) {
            setGeneratedEcho({
                characterName: character.name,
                text: wisdom,
                timestamp: Date.now()
            });
        }
    } catch (e) {
        console.error("Failed to crystalize memory", e);
    } finally {
        setIsCrystalizing(false);
    }
  };

  const handleBackClick = () => {
    onBack(generatedEcho);
  };
  
  // 检查选项条件是否满足
  const checkOptionConditions = (option: StoryOption): boolean => {
    if (!option.conditions || option.conditions.length === 0) {
      return true; // 没有条件，默认显示
    }
    
    if (!scenarioState) {
      return false;
    }
    
    // 所有条件都需要满足（AND逻辑）
    return option.conditions.every(condition => {
      if (condition.type === 'favorability') {
        const currentFavorability = scenarioState.favorability?.[condition.target] || 0;
        const conditionValue = typeof condition.value === 'number' ? condition.value : 0;
        
        switch (condition.operator) {
          case '>=': return currentFavorability >= conditionValue;
          case '<=': return currentFavorability <= conditionValue;
          case '>': return currentFavorability > conditionValue;
          case '<': return currentFavorability < conditionValue;
          case '==': return currentFavorability === conditionValue;
          case '!=': return currentFavorability !== conditionValue;
          default: return true;
        }
      } else if (condition.type === 'event') {
        const hasEvent = scenarioState.events?.includes(condition.target) || false;
        return condition.operator === 'has' ? hasEvent : !hasEvent;
      } else if (condition.type === 'item') {
        const hasItem = scenarioState.items?.includes(condition.target) || false;
        return condition.operator === 'has' ? hasItem : !hasItem;
      } else if (condition.type === 'time') {
        // 时间条件检查（如果需要）
        const currentTime = scenarioState.currentTime || 0;
        const conditionValue = typeof condition.value === 'number' ? condition.value : 0;
        switch (condition.operator) {
          case '>=': return currentTime >= conditionValue;
          case '<=': return currentTime <= conditionValue;
          case '>': return currentTime > conditionValue;
          case '<': return currentTime < conditionValue;
          default: return true;
        }
      }
      return true;
    });
  };

  // 获取当前节点的选项（用于ScenarioChoices组件）
  const currentOptions = React.useMemo(() => {
    if (!customScenario || !scenarioState) {
      return [];
    }

    const currentNodeId = scenarioState.currentNodeId;
    if (!currentNodeId) {
      return [];
    }

    const currentNode = customScenario.nodes[currentNodeId];
    if (!currentNode?.options || !Array.isArray(currentNode.options)) {
      return [];
    }

    // 验证并处理选项
    return currentNode.options
      .map((opt, index) => {
        if (!opt || typeof opt !== 'object') {
          return null;
        }
        if (!opt.id) {
          return { ...opt, id: `temp-option-${currentNode.id}-${index}` };
        }
        return opt;
      })
      .filter((opt): opt is NonNullable<typeof opt> => opt !== null);
  }, [customScenario, scenarioState]);
  
  if (!character) {
    return null;
  }

  // 背景图片预加载
  const backgroundImage = React.useMemo(() => {
    return isStoryMode && sceneGeneration.sceneImageUrl ? sceneGeneration.sceneImageUrl : character.backgroundUrl;
  }, [isStoryMode, sceneGeneration.sceneImageUrl, character.backgroundUrl]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white font-sans">
      <BackgroundLayer
        backgroundImage={backgroundImage}
        character={character}
        isStoryMode={isStoryMode}
        isCinematic={uiState.isCinematic}
      />
      
      <CharacterAvatar
        character={character}
        isStoryMode={isStoryMode}
        isCinematic={uiState.isCinematic}
      />

      {/* Header Bar */}
      <HeaderBar
        character={character}
        customScenario={customScenario}
        isCinematic={uiState.isCinematic}
        isVoiceMode={voiceInput.isVoiceMode}
        isListening={voiceInput.isListening}
        isWaitingForResponse={voiceInput.isWaitingForResponse}
        isGeneratingScene={sceneGeneration.isGeneratingScene}
        isPlayingAudio={audioPlayback.isPlaying}
        isCrystalizing={isCrystalizing}
        generatedEcho={generatedEcho}
        onBack={handleBackClick}
        onToggleVoiceMode={toggleVoiceMode}
        onToggleCinematic={() => uiState.setIsCinematic(true)}
        onCrystalize={activeJournalEntryId ? handleCrystalizeMemory : undefined}
        onTriggerESoulLetter={handleTriggerESoulLetter}
        isTriggeringLetter={isTriggeringLetter}
      />

      {uiState.isCinematic && (
        <button 
          onClick={() => uiState.setIsCinematic(false)}
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/50 hover:text-white transition-all backdrop-blur-md"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-3.65-3.65m3.65 3.65F5.183 2.16 20.632 17.608M14.25 12a2.25 2.25 0 0 1-2.25 2.25" />
           </svg>
        </button>
      )}

      {/* 关怀消息通知 */}
      {careMessages.map((message) => (
        <CareMessageNotification
          key={message.id}
          message={message}
          onDismiss={handleDismissCareMessage}
        />
      ))}

      {/* Main Chat Area */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ${uiState.isCinematic ? 'h-[40vh] bg-gradient-to-t from-black via-black/50 to-transparent' : 'h-[65vh]'}`}>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 scrollbar-hide" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}>
          {safeHistory.length === 0 && isLoading && isStoryMode && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 border-4 border-t-indigo-500 border-white/20 rounded-full animate-spin" />
                  <p className="text-indigo-300 font-bold text-lg animate-pulse">正在生成故事...</p>
              </div>
          )}
          {safeHistory.length === 0 && !isLoading && (
            <div className="text-white/50 text-center py-4">
              <p>暂无消息</p>
              <p className="text-xs mt-2 opacity-50">history类型: {typeof history}, 是否为数组: {Array.isArray(history) ? '是' : '否'}, 长度: {safeHistory.length}</p>
            </div>
          )}
          {safeHistory
            .filter(msg => msg && msg.text)
            .map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.role === 'user'}
                isCinematic={uiState.isCinematic}
                colorAccent={character.colorAccent}
                onPlayAudio={handlePlayAudio}
                audioLoadingId={audioPlayback.loadingMessageId}
                playingMessageId={audioPlayback.playingMessageId}
                showAudioButton={!uiState.isCinematic}
              />
            ))}
          {isLoading && safeHistory.length > 0 && (<div className="flex justify-start w-full"><div className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border border-white/10 flex items-center space-x-2" style={{ backgroundColor: `${character.colorAccent}1A` }}><div className="w-2 h-2 bg-white/70 rounded-full typing-dot" /><div className="w-2 h-2 bg-white/70 rounded-full typing-dot" /><div className="w-2 h-2 bg-white/70 rounded-full typing-dot" /></div></div>)}
          <div ref={messagesEndRef} />
        </div>

        <div 
          className="px-4 sm:px-8 mt-2 max-w-4xl mx-auto w-full pb-6 min-h-[80px]"
          style={{ 
            zIndex: 1000,
            position: 'relative',
            pointerEvents: 'auto'
          }}
        >
            {isScenarioMode && scenarioState && (
              <ScenarioChoices
                options={currentOptions}
                scenarioState={scenarioState}
                isLoading={isLoading}
                isCinematic={uiState.isCinematic}
                onOptionClick={handleOptionClick}
              />
            )}
            
            {!isScenarioMode && !uiState.isCinematic && (
                <>
                  {/* 语音模式UI */}
                  {voiceInput.isVoiceMode ? (
                    <VoiceModeUI
                      isListening={voiceInput.isListening}
                      isWaitingForResponse={voiceInput.isWaitingForResponse}
                      isPlayingAudio={audioPlayback.isPlaying}
                      onExit={toggleVoiceMode}
                    />
                  ) : (
                    /* 普通文本输入模式 */
                    <div className="relative flex items-center bg-black/90 rounded-2xl p-2 border border-white/10 animate-fade-in w-full">
                       {/* 表情按钮 */}
                       <button
                         onClick={() => uiState.setShowEmojiPicker(true)}
                         disabled={isLoading}
                         className="mr-2 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         title="选择表情"
                       >
                         <svg
                           xmlns="http://www.w3.org/2000/svg"
                           className="h-5 w-5"
                           fill="none"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                         >
                           <path
                             strokeLinecap="round"
                             strokeLinejoin="round"
                             strokeWidth={2}
                             d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                           />
                         </svg>
                       </button>
                       <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="输入你的消息..." className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 resize-none max-h-24 py-3 px-3 scrollbar-hide text-base" rows={1} disabled={isLoading} />
                       
                       {/* 语音输入按钮 */}
                       <button
                         onClick={voiceInput.isListening ? voiceInput.stopListening : () => startSpeechRecognition(false)}
                         disabled={isLoading}
                         className={`ml-2 p-2 rounded-lg transition-all ${
                           voiceInput.isListening 
                             ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse' 
                             : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                         } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                         title={voiceInput.isListening ? '停止语音输入' : '开始语音输入'}
                       >
                         {voiceInput.isListening ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M6 6h12v12H6z"/>
                           </svg>
                         ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                           </svg>
                         )}
                       </button>
                       
                       <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="ml-2 !rounded-xl !px-6 !py-2 shadow-lg" style={{ backgroundColor: character.colorAccent }}>发送</Button>
                    </div>
                  )}
                </>
            )}
        </div>
      </div>

      {/* 表情选择器 */}
      {uiState.showEmojiPicker && (
        <EmojiPicker
          userId={typeof userProfile?.id === 'number' ? userProfile.id : 0}
          onSelect={(emoji) => {
            setInput((prev) => prev + emoji.code);
            uiState.setShowEmojiPicker(false);
          }}
          onClose={() => uiState.setShowEmojiPicker(false)}
        />
      )}

      {/* 卡片制作工具 */}
      {uiState.showCardMaker && (
        <CardMaker
          userId={typeof userProfile?.id === 'number' ? userProfile.id : 0}
          onSave={(card) => {
            console.log('保存的卡片:', card);
            uiState.setShowCardMaker(false);
          }}
          onSend={(card, recipientId) => {
            console.log('发送卡片:', card, '给用户:', recipientId);
            uiState.setShowCardMaker(false);
          }}
          onClose={() => uiState.setShowCardMaker(false)}
        />
      )}

      {/* 评论列表已移除，可在留言板测试 */}
    </div>
  );
};