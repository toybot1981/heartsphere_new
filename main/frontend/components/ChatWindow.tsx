
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { SkillPromptButtons } from './chat/SkillPromptButtons';
import { isDailyLifeAssistant } from '../constants/skillPrompts';
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
import { MemoryDebugPanel, MemoryDebugInfo } from './chat/debug/MemoryDebugPanel';
import { SkillDebugPanel } from './chat/debug/SkillDebugPanel';
import { useSkillDebug } from '../hooks/useSkillDebug';
import { getToken } from '../services/api/base/tokenStorage';
import { mailboxApi } from '../services/api/mailbox';
import { browserNotificationService } from '../services/mailbox/BrowserNotificationService';
import { useGameState } from '../contexts/GameStateContext';
import { generateVariantUrl, type ImageVariants } from '../utils/imageResolution';
import { memoryApi } from '../services/api/memory/memory';

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
    logger.info('[ChatWindow] history prop变化:', {
      historyLength: history?.length || 0,
      historyType: typeof history,
      isArray: Array.isArray(history),
      safeHistoryLength: safeHistory.length,
    });
  }, [history?.length]);
  
  // 基础状态
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 记忆调试信息
  const [memoryDebugInfo, setMemoryDebugInfo] = useState<MemoryDebugInfo | null>(null);
  
  // 技能调试面板可见性
  const [skillDebugVisible, setSkillDebugVisible] = useState(false);
  
  // 会话ID：基于角色ID和用户ID
  const sessionId = `chat_${character?.id || 'unknown'}_${userProfile?.id || 'guest'}`;
  
  // 技能调试 Hook
  // 注意：conversationId 是可选的，如果没有 conversationId，将只显示基于 userId 的统计数据
  // 技能调试面板可以在没有 conversationId 的情况下显示用户统计数据
  const conversationIdForSkill = undefined; // 可选：如果有会话ID，可以传入
  const skillDebug = useSkillDebug({
    conversationId: conversationIdForSkill,
    userId: userProfile?.id,
    autoRefresh: false,
  });

  // 快捷键支持：Ctrl+Shift+S 切换技能调试面板
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+S (Windows/Linux) 或 Cmd+Shift+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        setSkillDebugVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // 历史消息加载状态
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const historyLoadedRef = useRef(false);
  
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
        // 显示浏览器通知
        try {
          await browserNotificationService.notifyNewMessage(
            '📧 收到E-SOUL来信',
            `${character.name}给您发送了一封来信，快去信箱查看吧！`,
            character.avatarUrl || '/favicon.ico',
            result.messageId
          );
        } catch (notifError) {
          console.warn('浏览器通知失败:', notifError);
        }
        
        // 触发未读数量刷新事件（通知其他组件刷新）
        window.dispatchEvent(new CustomEvent('mailbox:unread-updated'));
        
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
  const { engine, state: engineState, isReady: engineReady, isRunning: engineRunning } = useTemperatureEngine({
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
    engineRunning,
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
  // 注意：场景风格应该从场景对象中获取，但目前场景信息不在 props 中
  // 暂时使用默认的写实风格，后续可以优化为从场景中获取
  // 从角色对象中获取场景风格（如果角色有 sceneStyle 属性）
  // 否则使用默认的写实风格
  const sceneStyle = (character as any)?.sceneStyle || 'realistic';

  const sceneGeneration = useSceneGeneration({
    isStoryMode: !!customScenario || (character?.id?.startsWith('story_') ?? false),
    autoGenerate: settings.autoGenerateStoryScenes || false,
    lastMessage: safeHistory[safeHistory.length - 1],
    defaultBackgroundUrl: character?.backgroundUrl || null,
    sceneStyle: sceneStyle,
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
  
  // 加载历史消息（初始加载最近100条）
  useEffect(() => {
    const loadHistory = async () => {
      // 检查 sessionId 是否变化，如果变化则重置加载标记
      if (historyLoadedRef.current === sessionId) {
        logger.info('[ChatWindow] 历史消息已加载，跳过重复加载', { sessionId });
        return;
      }
      
      if (!userProfile?.id || !character?.id) {
        logger.info('[ChatWindow] 缺少必要信息，跳过历史消息加载', {
          hasUserId: !!userProfile?.id,
          hasCharacterId: !!character?.id,
        });
        return;
      }
      
      try {
        const token = getToken();
        if (!token) {
          logger.warn('[ChatWindow] 未登录，跳过历史消息加载');
          return;
        }
        
        setIsLoadingHistory(true);
        
        // 记录加载开始
        logger.info('[ChatWindow] 开始加载历史消息', {
          sessionId,
          userId: userProfile.id,
          characterId: character?.id,
        });
        
        logger.info('[ChatWindow] ========== 开始加载历史消息 ==========');
        logger.info('[ChatWindow] 加载前检查: sessionId={}, userId={}, characterId={}, limit=100', 
          sessionId, userProfile?.id, character?.id);
        
        const messages = await memoryApi.getChatMessages(sessionId, token, 100); // 增加到100条，确保加载所有消息
        
        // 记录加载结果
        logger.info('[ChatWindow] 历史消息加载完成', {
          sessionId,
          messageCount: Array.isArray(messages) ? messages.length : 0,
          messages: Array.isArray(messages) ? messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            contentLength: m.content?.length || 0,
            timestamp: m.timestamp,
          })) : [],
        });
        
        // 确保 messages 是数组
        if (Array.isArray(messages) && messages.length > 0) {
          // 转换为前端 Message 格式
          const formattedMessages: Message[] = messages.map((msg: any) => ({
            id: msg.id || `msg_${msg.timestamp}_${Math.random()}`,
            role: msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'model' : 'user',
            text: msg.content || '',
            timestamp: msg.timestamp || Date.now(),
          }));
          
          // 按时间戳排序（从旧到新）
          formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
          
          // 统计消息类型
          const userMessages = formattedMessages.filter(m => m.role === 'user').length;
          const assistantMessages = formattedMessages.filter(m => m.role === 'model').length;
          
          logger.info('[ChatWindow] ✅ 历史消息格式化完成', {
            sessionId,
            totalMessages: formattedMessages.length,
            userMessages,
            assistantMessages,
            messageIds: formattedMessages.map(m => m.id),
          });
          
          // 更新历史
          logger.info('[ChatWindow] 更新历史消息到界面');
          onUpdateHistory(formattedMessages);
          historyLoadedRef.current = sessionId; // 使用 sessionId 作为标记，而不是简单的 true
          
          // 如果有10条消息，可能还有更多
          setHasMoreHistory(messages.length >= 10);
          logger.info('[ChatWindow] ========== 加载历史消息完成 ==========');
          
          // 滚动到底部
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        } else {
          logger.info('[ChatWindow] 没有历史消息或消息为空', {
            sessionId,
            messagesType: typeof messages,
            isArray: Array.isArray(messages),
            length: Array.isArray(messages) ? messages.length : 'N/A',
          });
          setHasMoreHistory(false);
          logger.info('[ChatWindow] ========== 加载历史消息完成（无消息） ==========');
        }
      } catch (error) {
        // 改进错误处理，显示更详细的错误信息
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        } : error;
        
        logger.error('[ChatWindow] 加载历史消息失败:', {
          error: errorMessage,
          details: errorDetails,
          sessionId,
          userId: userProfile?.id,
        });
        
        // 如果是404或空响应，说明没有历史消息，这是正常的
        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          logger.info('[ChatWindow] 没有历史消息（这是正常的）');
          setHasMoreHistory(false);
        } else {
          // 其他错误，也设置为没有更多历史，避免重复请求
          setHasMoreHistory(false);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, userProfile?.id, character?.id]);
  
  // 加载更多历史消息（下拉加载）
  const loadMoreHistory = useCallback(async () => {
    if (isLoadingHistory || !hasMoreHistory || !userProfile?.id) {
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        return;
      }
      
      // 获取最早的消息时间戳
      const earliestMessage = safeHistory[0];
      if (!earliestMessage || !earliestMessage.timestamp) {
        setHasMoreHistory(false);
        return;
      }
      
      setIsLoadingHistory(true);
      const messages = await memoryApi.getChatMessages(
        sessionId,
        token,
        10,
        earliestMessage.timestamp
      );
      
      if (messages && messages.length > 0) {
        // 转换为前端 Message 格式
        const formattedMessages: Message[] = messages.map((msg: any) => ({
          id: msg.id || `msg_${msg.timestamp}_${Math.random()}`,
          role: msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'model' : 'user',
          text: msg.content || '',
          timestamp: msg.timestamp || Date.now(),
        }));
        
        // 按时间戳排序（从旧到新）
        formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
        
        // 添加到历史前面
        onUpdateHistory((prev: Message[]) => {
          const existing = Array.isArray(prev) ? prev : [];
          // 合并并去重
          const merged = [...formattedMessages, ...existing];
          const unique = merged.filter((msg, idx, arr) => 
            arr.findIndex(m => m.id === msg.id) === idx
          );
          return unique;
        });
        
        // 如果返回的消息少于10条，说明没有更多了
        setHasMoreHistory(messages.length >= 10);
      } else {
        setHasMoreHistory(false);
      }
    } catch (error) {
      logger.error('[ChatWindow] 加载更多历史消息失败:', error);
      setHasMoreHistory(false);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isLoadingHistory, hasMoreHistory, sessionId, userProfile?.id, safeHistory, onUpdateHistory]);

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
        logger.info('[ChatWindow] AI动态节点生成:', { nodeId: node.id, prompt: node.prompt });
        
        // 获取节点涉及的角色信息
        let focusedCharacter = character; // 默认使用主角色
        if (node.focusCharacterId && participatingCharacters) {
          const foundChar = participatingCharacters.find(c => c.id === node.focusCharacterId);
          if (foundChar) {
            focusedCharacter = foundChar;
          }
        }
        
        // 构建场景上下文（添加到系统指令中）
        const scenarioContext = customScenario 
          ? `\n\n[当前场景上下文]\n剧本标题：${customScenario.title}${customScenario.description ? `\n剧本描述：${customScenario.description}` : ''}\n\n[场景节点说明]\n${node.prompt || node.title}\n\n请根据上述场景描述，生成符合角色性格的对话内容和旁白。`
          : undefined;
        
        // 创建虚拟用户消息（用于generateAIResponse）
        const scenarioUserMsg: Message = {
          id: `scenario_${node.id}_${Date.now()}`,
          role: 'user',
          text: node.prompt || node.title || '请生成这个场景的内容',
          timestamp: Date.now(),
        };
        
        // 使用generateAIResponse统一处理AI调用（场景模式）
        // 注意：场景模式不使用记忆系统和温度感引擎
        await generateAIResponse({
          userText: node.prompt || node.title || '请生成这个场景的内容',
          userMsg: scenarioUserMsg,
          historyWithUserMsg: currentHistory, // 使用当前历史（不包含虚拟用户消息）
          character: focusedCharacter,
          settings,
          userProfile,
          tempBotId,
          onUpdateHistory,
          setIsLoading,
          engine: undefined, // 场景模式不使用温度感引擎
          engineReady: false,
          memorySystem: undefined, // 场景模式不使用记忆系统
          relevantMemories: [], // 场景模式不获取记忆
          customSystemInstructionSuffix: scenarioContext, // 添加场景上下文
          sessionId, // 传入会话ID，用于保存消息
        });
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
      if (node.timeLimit && node.timeoutNodeId && customScenario?.nodes) {
        setTimeout(() => {
          if (scenarioState?.currentNodeId === node.id) {
            // 如果还在当前节点，说明超时了，跳转到超时节点
            const timeoutNode = customScenario.nodes[node.timeoutNodeId];
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
      // 检查浏览器是否支持 AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("浏览器不支持 AudioContext");
      }
      
      // 初始化 AudioContext
      if (!audioPlayback.audioContextRef.current) {
        try {
          audioPlayback.audioContextRef.current = new AudioContextClass({sampleRate: 24000});
        } catch (error) {
          throw new Error(`创建 AudioContext 失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      const ctx = audioPlayback.audioContextRef.current;
      if (!ctx) {
        throw new Error("AudioContext 未初始化");
      }
      
      // 恢复 AudioContext（如果被暂停）
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (error) {
          throw new Error(`恢复 AudioContext 失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // 生成语音
      const base64Audio = await aiService.generateSpeech(text, character.voiceName || 'Kore');
      if (!base64Audio) {
        throw new Error("No audio data generated");
      }

      // 解码音频数据
      const audioBytes = decodeBase64ToBytes(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      if (!audioBuffer) {
        throw new Error("音频解码失败");
      }

      // 创建音频源节点
      const source = ctx.createBufferSource();
      if (!source) {
        throw new Error("无法创建音频源节点");
      }
      
      // 验证 source 是否有必要的方法
      if (typeof source.start !== 'function') {
        throw new Error("音频源节点缺少 start 方法");
      }
      
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        audioPlayback.setPlayingMessageId(null);
      };
      
      audioPlayback.sourceNodeRef.current = source;
      
      // 调用 start 方法
      try {
        source.start();
        audioPlayback.setPlayingMessageId(msgId);
        logger.info('[ChatWindow] ✅ 手动播放音频成功', { msgId, textLength: text.length });
      } catch (error) {
        throw new Error(`启动音频播放失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      const errorDetails = e instanceof Error ? {
        name: e.name,
        message: e.message,
        stack: e.stack,
      } : e;
      logger.error("Audio playback failed", {
        error: errorMessage,
        details: errorDetails,
        msgId,
        characterId: character?.id,
        voiceName: character?.voiceName,
      });
      showAlert(`语音播放失败: ${errorMessage || '未知错误'}`, "错误", "error");
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
      
      // 确保 customScenario.nodes 存在
      if (!customScenario?.nodes || typeof customScenario.nodes !== 'object') {
          logger.error('[ChatWindow] customScenario.nodes 不存在或格式错误:', {
              hasNodes: !!customScenario?.nodes,
              nodesType: typeof customScenario?.nodes,
          });
          return;
      }
      
      const currentNode = customScenario.nodes[currentNodeId];
      if (!currentNode) {
          logger.error('[ChatWindow] 找不到当前节点:', {
              currentNodeId,
              availableNodes: Object.keys(customScenario.nodes),
          });
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
          logger.error('[ChatWindow] 找不到下一个节点:', {
              nextNodeId: option.nextNodeId,
              availableNodes: Object.keys(customScenario.nodes),
          });
          return;
      }
      
      // 应用选项的状态影响（使用统一的工具函数）
      if (option.effects && option.effects.length > 0 && onUpdateScenarioStateData && scenarioState) {
          const updates = applyOptionEffects(option.effects, scenarioState);
          
          // 检查是否有任何更新
          const hasUpdates =
              (updates.events && updates.events.length > 0) ||
              (updates.items && updates.items.length > 0) ||
              (updates.favorability && Object.keys(updates.favorability).length > 0);
          
          if (hasUpdates) {
              // 记录调试信息
              if (updates.favorability && Object.keys(updates.favorability).length > 0) {
                  Object.entries(updates.favorability).forEach(([target, newValue]) => {
                      const current = scenarioState.favorability?.[target] || 0;
                      const change = newValue - current;
                      logger.info(`[ChatWindow] 好感度变化: ${target} ${current} -> ${newValue} (${change >= 0 ? '+' : ''}${change})`);
                  });
              }
              if (updates.events && updates.events.length > 0) {
                  updates.events.forEach(event => {
                      logger.info(`[ChatWindow] 触发事件: ${event}`);
                  });
              }
              if (updates.items && updates.items.length > 0) {
                  updates.items.forEach(item => {
                      logger.info(`[ChatWindow] 收集物品: ${item}`);
                  });
              }
              
              onUpdateScenarioStateData(updates);
          }
      }
      
      // 调用场景转换
      handleScenarioTransition(nextNode, option.text || optionId);
  };

  // 使用指定文本发送消息（用于预设话术）
  const handleSendWithText = async (text?: string) => {
    const textToSend = text || input.trim();
    if (!textToSend || isLoading || isScenarioMode) return;
    
    // 防止并发请求：如果已有请求在进行，忽略新的请求
    if (isLoading) {
      logger.warn('[ChatWindow] 已有请求在进行中，忽略新请求');
      return;
    }
    
    const userText = textToSend.trim();
    if (!text) {
      setInput('');
    }
    setIsLoading(true);
    
    // 先创建用户消息对象（需要在系统集成之前创建，因为记忆系统需要userMsg.id）
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
    const tempBotId = `bot_${Date.now()}`;
    
    // 保存用户消息到数据库（异步，不阻塞主流程，但记录结果）
    if (userProfile?.id && sessionId) {
      const token = getToken();
      if (token) {
        memoryApi.saveChatMessage(
          sessionId,
          'USER',
          userText,
          token,
          { characterId: character?.id },
          undefined
        ).then((savedMessage) => {
          logger.info('[ChatWindow] ✅ 用户消息已成功保存到数据库', {
            sessionId,
            messageId: savedMessage?.id,
            messageLength: userText.length,
            timestamp: savedMessage?.timestamp,
          });
        }).catch((error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('[ChatWindow] ❌ 保存用户消息失败:', {
            sessionId,
            error: errorMessage,
            details: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack?.split('\n').slice(0, 5).join('\n'),
            } : error,
          });
        });
      } else {
        logger.warn('[ChatWindow] ⚠️ 未登录或 token 无效，跳过保存用户消息', {
          sessionId,
          userId: userProfile.id,
          hasToken: !!token,
          characterId: character?.id,
        });
        logger.info('[ChatWindow] ========== 跳过保存用户消息（无token） ==========');
      }
    } else {
      logger.warn('[ChatWindow] ⚠️ 跳过保存用户消息（缺少必要参数）', {
        hasUserId: !!userProfile?.id,
        hasSessionId: !!sessionId,
        sessionId,
        userId: userProfile?.id,
        characterId: character?.id,
      });
      logger.info('[ChatWindow] ========== 跳过保存用户消息（缺少参数） ==========');
    }
    
    // 系统集成：分析用户输入并集成各个系统（使用统一的Hook）
    try {
      await systemIntegration.analyzeAndIntegrate(userText, userMsg.id);
      // 系统集成分析完成
    } catch (error) {
      // 系统集成分析失败，继续执行（不影响主流程）
      // 系统集成失败不影响主流程，继续执行
    }
    
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
      
      // 统一模式和本地模式都使用相同的AI响应生成逻辑
      // 统一模式：获取相关记忆用于上下文
      let relevantMemories: any[] = [];
      if (config.mode === 'unified') {
        // 温度感引擎：计算温度感（使用系统集成Hook）
        try {
          await systemIntegration.calculateTemperature(userText);
        } catch (error) {
          // 温度感计算失败不影响主流程，继续执行
        }
        
        // 获取相关记忆用于上下文（使用系统集成Hook）
        try {
          // 创建调试信息收集函数
          const debugInfoCollector: MemoryDebugInfo = {};
          
          relevantMemories = await systemIntegration.getRelevantMemories(
            userText,
            5, // 增加到5条记忆
            character?.id,  // 🆕 传入角色ID用于检索通用资产
            (retrievalInfo) => {
              debugInfoCollector.retrieval = retrievalInfo.retrieval;
              setMemoryDebugInfo({ ...debugInfoCollector });
            }
          );
        } catch (error) {
          // 获取相关记忆失败，继续执行（不使用记忆）
          relevantMemories = []; // 失败时使用空数组
          // 记忆获取失败不影响主流程，继续执行
        }
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
        sessionId, // 传入会话ID，用于保存消息
        onDebugInfo: (info) => {
          setMemoryDebugInfo((prev) => ({
            ...prev,
            ...info,
          }));
        },
      });
    } catch (error) { 
        // 提取详细的错误信息用于日志记录
        let errorInfo: any = {};
        
        if (error instanceof Error) {
          errorInfo = {
            message: error.message,
            name: error.name,
            stack: error.stack?.split('\n').slice(0, 10).join('\n'),
            cause: (error as any).cause,
          };
          
          // 如果是 AIServiceException，提取额外属性
          if ((error as any).provider) {
            errorInfo.provider = (error as any).provider;
          }
          if ((error as any).model) {
            errorInfo.model = (error as any).model;
          }
          if ((error as any).errorCode) {
            errorInfo.errorCode = (error as any).errorCode;
          }
        } else if (error && typeof error === 'object') {
          // 尝试提取对象的所有属性
          try {
            errorInfo = {
              type: typeof error,
              constructor: error?.constructor?.name,
              keys: Object.keys(error),
              ...Object.fromEntries(
                Object.entries(error).map(([key, value]) => [
                  key,
                  typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value)
                ])
              ),
            };
          } catch (e) {
            errorInfo = {
              type: typeof error,
              stringified: String(error),
            };
          }
        } else {
          errorInfo = {
            type: typeof error,
            value: String(error),
          };
        }
        
        logger.error('[ChatWindow] AI服务调用失败:', errorInfo);
        console.error('[ChatWindow] 原始错误对象:', error);
        console.error('[ChatWindow] 错误类型:', typeof error);
        console.error('[ChatWindow] 错误详细信息:', {
          error,
          errorString: String(error),
          errorJSON: JSON.stringify(error, null, 2),
        });
        
        const errorMsg = createErrorMessage(error instanceof Error ? error : new Error(String(error || '未知错误')), tempBotId);
        onUpdateHistory(prevHistory => [...prevHistory, errorMsg]);
        showAlert(getErrorMessage(error instanceof Error ? error : new Error(String(error || '未知错误'))), "错误", "error");
    } finally { 
        setIsLoading(false); 
    }
  };

  // 原始 handleSend 函数（保持向后兼容）
  const handleSend = async () => {
    await handleSendWithText();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  
  // 自动播放音频（使用audioPlayback Hook）- 需要在handleVoiceSend之前定义
  const autoPlayAudio = React.useCallback(async (text: string, msgId: string) => {
    try {
      // 检查浏览器是否支持 AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        logger.warn('[ChatWindow] 浏览器不支持 AudioContext，跳过自动播放音频');
        return;
      }
      
      // 初始化 AudioContext
      if (!audioPlayback.audioContextRef.current) {
        try {
          audioPlayback.audioContextRef.current = new AudioContextClass({sampleRate: 24000});
        } catch (error) {
          logger.error('[ChatWindow] 创建 AudioContext 失败:', error);
          return;
        }
      }
      
      const ctx = audioPlayback.audioContextRef.current;
      if (!ctx) {
        logger.error('[ChatWindow] AudioContext 未初始化');
        return;
      }
      
      // 恢复 AudioContext（如果被暂停）
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (error) {
          logger.error('[ChatWindow] 恢复 AudioContext 失败:', error);
          return;
        }
      }
      
      // 生成语音
      const base64Audio = await aiService.generateSpeech(text, character.voiceName || 'Kore');
      if (!base64Audio) {
        logger.warn('[ChatWindow] 语音生成失败，跳过自动播放');
        return;
      }
      
      // 解码音频数据
      const audioBytes = decodeBase64ToBytes(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      if (!audioBuffer) {
        logger.error('[ChatWindow] 音频解码失败');
        return;
      }
      
      // 创建音频源节点
      const source = ctx.createBufferSource();
      if (!source) {
        logger.error('[ChatWindow] 无法创建音频源节点');
        audioPlayback.setPlayingMessageId(null);
        return;
      }
      
      // 验证 source 是否有必要的方法
      if (typeof source.start !== 'function') {
        logger.error('[ChatWindow] 音频源节点缺少 start 方法');
        audioPlayback.setPlayingMessageId(null);
        return;
      }
      
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        audioPlayback.setPlayingMessageId(null);
      };
      
      audioPlayback.sourceNodeRef.current = source;
      
      // 调用 start 方法
      try {
        source.start();
        audioPlayback.setPlayingMessageId(msgId);
        logger.info('[ChatWindow] ✅ 自动播放音频成功', { msgId, textLength: text.length });
      } catch (error) {
        logger.error('[ChatWindow] ❌ 启动音频播放失败:', error);
        audioPlayback.setPlayingMessageId(null);
      }
    } catch (error) {
      logger.error('[ChatWindow] ❌ 自动播放音频失败:', error);
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
      
      // 验证 recognition 对象是否创建成功
      if (!recognition) {
        throw new Error('SpeechRecognition 对象创建失败');
      }
      
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
      
      // 确保 recognition 存在且有 start 方法
      if (recognition && typeof recognition.start === 'function') {
        recognition.start();
      } else {
        throw new Error('SpeechRecognition 对象无效或缺少 start 方法');
      }
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
    try {
      if (!customScenario || !scenarioState) {
        return [];
      }

      const currentNodeId = scenarioState.currentNodeId;
      if (!currentNodeId) {
        return [];
      }

      // 确保 customScenario.nodes 存在
      if (!customScenario.nodes || typeof customScenario.nodes !== 'object') {
        logger.warn('[ChatWindow] customScenario.nodes 不存在或格式错误', {
          hasNodes: !!customScenario.nodes,
          nodesType: typeof customScenario.nodes,
          customScenarioId: customScenario.id,
          customScenarioTitle: customScenario.title,
          customScenarioKeys: Object.keys(customScenario),
        });
        // 尝试修复：如果 nodes 不存在，初始化为空对象
        if (!customScenario.nodes) {
          (customScenario as any).nodes = {};
        }
        return [];
      }

      const currentNode = customScenario.nodes[currentNodeId];
      if (!currentNode) {
        logger.warn('[ChatWindow] 找不到当前节点', {
          currentNodeId,
          availableNodes: Object.keys(customScenario.nodes),
        });
        return [];
      }

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
            return { ...opt, id: `temp-option-${currentNode.id || currentNodeId}-${index}` };
          }
          return opt;
        })
        .filter((opt): opt is NonNullable<typeof opt> => opt !== null);
    } catch (error) {
      logger.error('[ChatWindow] currentOptions useMemo 执行失败', error);
      return [];
    }
  }, [customScenario, scenarioState]);
  
  if (!character) {
    return null;
  }

  // 获取当前场景信息（用于回退到场景背景图）
  const { state: gameState } = useGameState();
  const currentScene = React.useMemo(() => {
    if (!gameState.selectedSceneId) return null;
    const allScenes = [...(gameState.userWorldScenes || []), ...(gameState.customScenes || [])];
    return allScenes.find(scene => scene.id === gameState.selectedSceneId) || null;
  }, [gameState.selectedSceneId, gameState.userWorldScenes, gameState.customScenes]);

  // 主线剧情模式下，如果没有旁白者图片，使用第一位角色的头像
  const displayCharacter = React.useMemo(() => {
    // 判断是否是主线剧情模式（旁白者）
    // 1. 检查是否是主线剧情角色（role 为 '叙事者' 或 id 匹配场景的 mainStory.id）
    // 2. 或者 id 以 'story_' 开头（旧版剧本模式）
    const isMainStoryNarrator = 
      isStoryMode && (
        character?.role === '叙事者' ||
        character?.id?.startsWith('story_') ||
        (currentScene?.mainStory && character?.id === currentScene.mainStory.id.toString())
      );
    
    // 如果是主线剧情模式且没有头像，尝试使用第一位角色的头像
    if (isMainStoryNarrator && (!character.avatarUrl || !character.avatarUrl.trim())) {
      const firstCharacter = currentScene?.characters?.[0];
      if (firstCharacter?.avatarUrl && firstCharacter.avatarUrl.trim()) {
        return {
          ...character,
          avatarUrl: firstCharacter.avatarUrl,
        };
      }
    }
    
    return character;
  }, [character, isStoryMode, currentScene]);

  // 背景图片选择逻辑：优先使用角色背景图，如果没有则使用场景背景图
  const backgroundImage = React.useMemo(() => {
    // 故事模式下，优先使用生成的场景图
    if (isStoryMode && sceneGeneration.sceneImageUrl) {
      return sceneGeneration.sceneImageUrl;
    }
    // 优先使用角色设置的背景图
    if (character.backgroundUrl && character.backgroundUrl.trim()) {
      return character.backgroundUrl;
    }
    // 如果没有角色背景图，使用场景的背景图（imageUrl）
    if (currentScene?.imageUrl && currentScene.imageUrl.trim()) {
      return currentScene.imageUrl;
    }
    return null;
  }, [isStoryMode, sceneGeneration.sceneImageUrl, character.backgroundUrl, currentScene?.imageUrl]);

  // 生成背景图的多分辨率版本
  const backgroundVariants: ImageVariants | undefined = React.useMemo(() => {
    if (!backgroundImage || !backgroundImage.trim()) return undefined;
    
    return {
      original: backgroundImage,
      thumbnail: generateVariantUrl(backgroundImage, 200, 200),
      medium: generateVariantUrl(backgroundImage, 800, 600),
      highQuality: generateVariantUrl(backgroundImage, 1920, 1080),
    };
  }, [backgroundImage]);

  // 生成头像的多分辨率版本（用于背景显示）
  const avatarVariants: ImageVariants | undefined = React.useMemo(() => {
    if (!character.avatarUrl || !character.avatarUrl.trim()) return undefined;
    
    return {
      original: character.avatarUrl,
      thumbnail: generateVariantUrl(character.avatarUrl, 200, 200),
      medium: generateVariantUrl(character.avatarUrl, 800, 800),
      highQuality: generateVariantUrl(character.avatarUrl, 1920, 1920),
    };
  }, [character.avatarUrl]);

  return (
    <div 
      className="relative h-screen w-full overflow-hidden font-sans"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <BackgroundLayer
        backgroundImage={backgroundImage}
        character={character}
        isStoryMode={isStoryMode}
        isCinematic={uiState.isCinematic}
        backgroundVariants={backgroundVariants}
        useAvatarAsBackground={true}
        avatarVariants={avatarVariants}
      />
      
      {/* 不再显示单独的头像，头像已作为背景显示 */}

      {/* Header Bar */}
      <HeaderBar
        character={character}
        customScenario={customScenario}
        isCinematic={uiState.isCinematic}
        onToggleSkillDebug={() => setSkillDebugVisible(prev => !prev)}
        isSkillDebugVisible={skillDebugVisible}
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
          className="absolute top-4 right-4 z-50 p-3 rounded-full transition-all backdrop-blur-md"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.4))',
            color: 'var(--text-tertiary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(0, 0, 0, 0.6))';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(0, 0, 0, 0.4))';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
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
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-4 transition-all duration-500 ${uiState.isCinematic ? 'h-[40vh]' : 'h-[65vh]'}`}
        style={{
          background: uiState.isCinematic
            ? 'linear-gradient(to top, var(--bg-primary, #000000) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)'
            : 'linear-gradient(to top, var(--bg-primary, #000000) 0%, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.5) 75%, transparent 100%)',
        }}
      >
        
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 scrollbar-hide" 
          style={{ 
            maskImage: 'linear-gradient(to bottom, transparent, var(--bg-primary, #000000) 15%)' 
          }}
          onScroll={(e) => {
            const target = e.currentTarget;
            // 当滚动到顶部附近时，加载更多历史消息
            if (target.scrollTop < 100 && hasMoreHistory && !isLoadingHistory) {
              loadMoreHistory();
            }
          }}
        >
          {/* 加载更多历史消息提示 */}
          {isLoadingHistory && (
            <div className="text-center py-2 text-sm opacity-70">
              加载历史消息中...
            </div>
          )}
          
          {/* 加载更多按钮（如果没有自动触发） */}
          {hasMoreHistory && !isLoadingHistory && safeHistory.length > 0 && (
            <div className="text-center py-2">
              <button
                onClick={loadMoreHistory}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                }}
              >
                ⬆️ 加载更多历史消息
              </button>
            </div>
          )}
          {safeHistory.length === 0 && isLoading && isStoryMode && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 animate-fade-in">
                  <div 
                    className="w-16 h-16 border-4 border-t-indigo-500 rounded-full animate-spin"
                    style={{ borderColor: 'var(--color-primary, #6366f1) var(--bg-overlay, rgba(255, 255, 255, 0.2))' }}
                  />
                  <p 
                    className="font-bold text-lg animate-pulse"
                    style={{ color: 'var(--color-primary-light, #a5b4fc)' }}
                  >
                    正在生成故事...
                  </p>
              </div>
          )}
          {safeHistory.length === 0 && !isLoading && (
            <div 
              className="text-center py-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <p>暂无消息</p>
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
          {isLoading && safeHistory.length > 0 && (
            <div className="flex justify-start w-full">
              <div 
                className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border flex items-center space-x-2" 
                style={{ 
                  backgroundColor: `${character.colorAccent}1A`,
                  borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{ backgroundColor: 'var(--text-secondary, rgba(255, 255, 255, 0.7))' }}
                />
                <div 
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{ backgroundColor: 'var(--text-secondary, rgba(255, 255, 255, 0.7))' }}
                />
                <div 
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{ backgroundColor: 'var(--text-secondary, rgba(255, 255, 255, 0.7))' }}
                />
              </div>
            </div>
          )}
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
                  {/* 技能预设话术按钮（仅限生活助手角色） */}
                  {isDailyLifeAssistant(character.name) && !voiceInput.isVoiceMode && (
                    <SkillPromptButtons
                      character={character}
                      onSelectPrompt={(text) => {
                        // 直接使用指定文本发送消息（不填充输入框）
                        handleSendWithText(text);
                      }}
                      disabled={isLoading}
                    />
                  )}
                  
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
                    <div 
                      className="relative flex items-center rounded-2xl p-2 border animate-fade-in w-full"
                      style={{
                        backgroundColor: 'var(--bg-card, rgba(0, 0, 0, 0.9))',
                        borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                      }}
                    >
                       {/* 表情按钮 */}
                       <button
                         onClick={() => uiState.setShowEmojiPicker(true)}
                         disabled={isLoading}
                         className="mr-2 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{
                           backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                           color: 'var(--text-secondary)',
                         }}
                         onMouseEnter={(e) => {
                           if (!isLoading) {
                             e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                             e.currentTarget.style.color = 'var(--text-primary)';
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (!isLoading) {
                             e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                             e.currentTarget.style.color = 'var(--text-secondary)';
                           }
                         }}
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
                       <textarea 
                         value={input} 
                         onChange={(e) => setInput(e.target.value)} 
                         onKeyDown={handleKeyDown} 
                         placeholder="输入你的消息..." 
                         className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-24 py-3 px-3 scrollbar-hide text-base" 
                         rows={1} 
                         disabled={isLoading}
                         style={{
                           color: 'var(--text-primary)',
                         }}
                       />
                       
                       {/* 语音输入按钮 */}
                       <button
                         onClick={voiceInput.isListening ? voiceInput.stopListening : () => startSpeechRecognition(false)}
                         disabled={isLoading}
                         className={`ml-2 p-2 rounded-lg transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                         style={{
                           backgroundColor: voiceInput.isListening 
                             ? 'rgba(239, 68, 68, 0.2)' 
                             : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                           color: voiceInput.isListening 
                             ? '#f87171' 
                             : 'var(--text-secondary)',
                         }}
                         onMouseEnter={(e) => {
                           if (!isLoading && !voiceInput.isListening) {
                             e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                             e.currentTarget.style.color = 'var(--text-primary)';
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (!isLoading && !voiceInput.isListening) {
                             e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                             e.currentTarget.style.color = 'var(--text-secondary)';
                           }
                         }}
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
                       
                       <Button onClick={() => handleSendWithText()} disabled={isLoading || !input.trim()} className="ml-2 !rounded-xl !px-6 !py-2 shadow-lg" style={{ backgroundColor: character.colorAccent }}>发送</Button>
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
            uiState.setShowCardMaker(false);
          }}
          onSend={(card, recipientId) => {
            uiState.setShowCardMaker(false);
          }}
          onClose={() => uiState.setShowCardMaker(false)}
        />
      )}

      {/* 评论列表已移除，可在留言板测试 */}
      
      {/* 记忆调试面板 */}
      <MemoryDebugPanel
        debugInfo={memoryDebugInfo}
        onClose={() => setMemoryDebugInfo(null)}
      />
      
      {/* 技能调试面板 */}
      <SkillDebugPanel
        debugInfo={skillDebug.debugInfo}
        conversationId={conversationIdForSkill}
        isVisible={skillDebugVisible}
        onClose={() => setSkillDebugVisible(false)}
        onRefresh={skillDebug.refresh}
      />
    </div>
  );
};