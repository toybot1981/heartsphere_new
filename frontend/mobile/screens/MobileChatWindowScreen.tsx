/**
 * Mobile版本聊天窗口组件
 * 独立的移动端实现，复用PC版本的业务逻辑Hooks
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { Character, Message, CustomScenario, AppSettings, UserProfile, JournalEcho, StoryNode } from '../../types';
import { ChatWindowProps, ScenarioState } from '../../types/chat';
import { aiService } from '../../services/ai';
import { showAlert } from '../../utils/dialog';
import { useTemperatureEngine } from '../../services/temperature-engine';
import { useEmotionSystem } from '../../services/emotion-system';
import { useMemorySystem } from '../../services/memory-system';
import { EmotionMemoryFusion } from '../../services/emotion-memory-fusion';
import { useCompanionSystem } from '../../services/companion-system/hooks/useCompanionSystem';
import { useGrowthSystem } from '../../services/growth-system/hooks/useGrowthSystem';
import { useCompanionMemorySystem } from '../../services/companion-memory/hooks/useCompanionMemorySystem';
import { CareMessageNotification } from '../../components/companion/CareMessageNotification';
import { EmojiPicker } from '../../components/emoji/EmojiPicker';
import { CardMaker } from '../../components/card/CardMaker';
import { RichTextRenderer } from '../../components/chat/RichTextRenderer';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { VoiceModeUI } from '../../components/chat/VoiceModeUI';
import { ScenarioChoices } from '../../components/chat/ScenarioChoices';
import { BackgroundLayer } from '../../components/chat/BackgroundLayer';
import { CharacterAvatar } from '../../components/chat/CharacterAvatar';
import { useImagePreload } from '../../components/chat/hooks/useImagePreload';
import { useUIState } from '../../components/chat/hooks/useUIState';
import { useAudioPlayback } from '../../components/chat/hooks/useAudioPlayback';
import { useVoiceInput } from '../../components/chat/hooks/useVoiceInput';
import { useHistoryInitialization } from '../../components/chat/hooks/useHistoryInitialization';
import { useSceneGeneration } from '../../components/chat/hooks/useSceneGeneration';
import { useStreamResponse } from '../../components/chat/hooks/useStreamResponse';
import { useSystemIntegration } from '../../components/chat/hooks/useSystemIntegration';
import { decodeBase64ToBytes, decodeAudioData } from '../../utils/audio';
import { AIConfigManager } from '../../services/ai/config';
import { buildSystemInstruction, getDialogueStyleInstruction } from '../../utils/chat/systemInstruction';
import { createErrorMessage, getErrorMessage } from '../../utils/chat/errorHandling';
import { applyOptionEffects, processRandomEvents, checkOptionConditions } from '../../utils/chat/scenarioHelpers';
import { generateAIResponse } from '../../components/chat/utils/generateAIResponse';
import { logger } from '../../utils/logger';
import { getToken } from '../../services/api/base/tokenStorage';
import { mailboxApi } from '../../services/api/mailbox';
import { browserNotificationService } from '../../services/mailbox/BrowserNotificationService';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileSafeAreaView } from '../components/MobileSafeAreaView';

interface MobileChatWindowScreenProps extends ChatWindowProps {
  onBack: () => void;
}

/**
 * Mobile版本聊天窗口页面组件
 * 复用PC版本的所有业务逻辑Hooks，但使用独立的移动端UI实现
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileChatWindowScreen: React.FC<MobileChatWindowScreenProps> = memo(({
  character,
  customScenario,
  history,
  scenarioState,
  settings,
  userProfile,
  activeJournalEntryId,
  onUpdateHistory,
  onUpdateScenarioState,
  onUpdateScenarioStateData,
  onBack,
  participatingCharacters,
}) => {
  // 防御性检查：确保history是数组
  const safeHistory = Array.isArray(history) ? history : [];

  // 基础状态
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // UI状态管理（复用PC版本的Hook）
  const uiState = useUIState();

  // 音频播放状态管理（复用PC版本的Hook）
  const audioPlayback = useAudioPlayback();

  // 语音输入状态管理（复用PC版本的Hook）
  const voiceInput = useVoiceInput();

  // 记忆结晶状态
  const [isCrystalizing, setIsCrystalizing] = useState(false);
  const [generatedEcho, setGeneratedEcho] = useState<JournalEcho | undefined>(undefined);

  // E-SOUL发邮件测试状态
  const [isTriggeringLetter, setIsTriggeringLetter] = useState(false);

  // DOM引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 内存管理优化：保存定时器ID以便清理
  const scenarioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 温度感引擎集成（复用PC版本的Hook）
  const { engine, state: engineState, isReady: engineReady, isRunning: engineRunning } = useTemperatureEngine({
    enabled: true,
    plugins: {
      enabled: ['greeting', 'expression', 'dialogue'],
    },
  });

  // 情绪感知系统集成（复用PC版本的Hook）
  const emotionSystem = useEmotionSystem({
    enabled: true,
    fusionEnabled: true,
    storageEnabled: true,
    autoAnalysis: true,
    userId: userProfile?.id || 0,
  });

  // 记忆系统集成（复用PC版本的Hook）
  const memorySystem = useMemorySystem({
    enabled: true,
    autoExtraction: true,
    userId: userProfile?.id || 0,
  });

  // 情绪记忆融合系统
  const [emotionMemoryFusion, setEmotionMemoryFusion] = React.useState<EmotionMemoryFusion | null>(null);

  // 情感记忆融合系统初始化（内存管理优化：添加清理函数）
  React.useEffect(() => {
    if (emotionSystem.system && memorySystem.system) {
      const fusion = new EmotionMemoryFusion(
        emotionSystem.system,
        memorySystem.system
      );
      setEmotionMemoryFusion(fusion);
      
      // 清理函数：组件卸载时清理融合系统
      return () => {
        setEmotionMemoryFusion(null);
      };
    }
  }, [emotionSystem.system, memorySystem.system]);

  // 陪伴式交互系统集成（复用PC版本的Hook）
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
    },
  });

  // 成长系统集成（复用PC版本的Hook）
  const growthSystem = useGrowthSystem({
    enabled: true,
    userId: userProfile?.id || 0,
  });

  // 陪伴记忆系统集成（复用PC版本的Hook）
  const companionMemorySystem = useCompanionMemorySystem({
    enabled: true,
    userId: userProfile?.id || 0,
  });

  // 系统集成（复用PC版本的Hook）
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

  // 判断是否为剧本模式（复用PC版本的逻辑）
  const isStoryMode = !!customScenario || (character?.id?.startsWith('story_') ?? false);
  const isScenarioMode = !!customScenario; // Specifically for Node-based scenarios

  // 场景生成状态管理（复用PC版本的Hook）
  const sceneGeneration = useSceneGeneration({
    isStoryMode,
    autoGenerate: settings.autoGenerateStoryScenes || false,
    lastMessage: safeHistory[safeHistory.length - 1],
    defaultBackgroundUrl: character?.backgroundUrl || null,
  });

  // 流式响应处理（复用PC版本的Hook）
  const streamResponse = useStreamResponse({
    onUpdateHistory,
    onLoadingChange: setIsLoading,
  });

  // 场景转换处理函数（复用PC版本的逻辑）
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

      const nodeType = node.nodeType || 'fixed';
      
      // 处理多角色对话
      if (node.multiCharacterDialogue && node.multiCharacterDialogue.length > 0) {
        // Phase 5: 类型安全增强 - 使用明确的类型定义
        interface DialogueItem {
          characterId: string;
          content: string;
          order?: number;
        }
        const sortedDialogue = [...(node.multiCharacterDialogue || [])].sort(
          (a: DialogueItem, b: DialogueItem) => (a.order || 0) - (b.order || 0)
        );
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
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        currentHistory = [...safeHistory];
      }
      
      if (nodeType === 'ai-dynamic') {
        // AI动态生成模式
        let focusedCharacter = character;
        if (node.focusCharacterId && participatingCharacters) {
          const foundChar = participatingCharacters.find(c => c.id === node.focusCharacterId);
          if (foundChar) {
            focusedCharacter = foundChar;
          }
        }
        
        const scenarioContext = customScenario 
          ? `\n\n[当前场景上下文]\n剧本标题：${customScenario.title}${customScenario.description ? `\n剧本描述：${customScenario.description}` : ''}\n\n[场景节点说明]\n${node.prompt || node.title}\n\n请根据上述场景描述，生成符合角色性格的对话内容和旁白。`
          : undefined;
        
        const scenarioUserMsg: Message = {
          id: `scenario_${node.id}_${Date.now()}`,
          role: 'user',
          text: node.prompt || node.title || '请生成这个场景的内容',
          timestamp: Date.now(),
        };
        
        await generateAIResponse({
          userText: node.prompt || node.title || '请生成这个场景的内容',
          userMsg: scenarioUserMsg,
          historyWithUserMsg: currentHistory,
          character: focusedCharacter,
          settings,
          userProfile,
          tempBotId,
          onUpdateHistory,
          setIsLoading,
          engine: undefined,
          engineReady: false,
          memorySystem: undefined,
          relevantMemories: [],
          customSystemInstructionSuffix: scenarioContext,
        });
      } else if (nodeType === 'ending') {
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
       
      if (onUpdateScenarioState) {
        onUpdateScenarioState(node.id);
      }
      if (onUpdateScenarioStateData && scenarioState) {
        const visitedNodes = scenarioState.visitedNodes || [];
        if (!visitedNodes.includes(node.id)) {
          onUpdateScenarioStateData({ visitedNodes: [node.id] });
        }
      }
       
      // 内存管理优化：清理之前的定时器
      if (scenarioTimeoutRef.current) {
        clearTimeout(scenarioTimeoutRef.current);
        scenarioTimeoutRef.current = null;
      }
      
      if (node.timeLimit && node.timeoutNodeId) {
        scenarioTimeoutRef.current = setTimeout(() => {
          if (scenarioState?.currentNodeId === node.id) {
            const timeoutNode = customScenario?.nodes[node.timeoutNodeId];
            if (timeoutNode) {
              handleScenarioTransition(timeoutNode, null);
            }
          }
          scenarioTimeoutRef.current = null;
        }, node.timeLimit * 1000);
      }
       
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

  // 历史记录初始化（复用PC版本的Hook）
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

  // 图片预加载（复用PC版本的Hook）
  useImagePreload(character.avatarUrl);

  // 从陪伴系统中解构关怀消息
  const { careMessages, markAsRead: markCareMessageAsRead } = companionSystem;

  // 处理发送消息（复用PC版本的逻辑）
  const handleSend = async () => {
    if (!input.trim() || isLoading || isScenarioMode) return;
    
    // 防止并发请求
    if (isLoading) {
      logger.warn('[MobileChatWindow] 已有请求在进行中，忽略新请求');
      return;
    }
    
    const userText = input.trim();
    setInput('');
    setIsLoading(true);
    
    // 先创建用户消息对象
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
    const tempBotId = `bot_${Date.now()}`;
    
    // 系统集成：分析用户输入并集成各个系统
    await systemIntegration.analyzeAndIntegrate(userText, userMsg.id);
    
    // 构建包含用户消息的完整历史
    const historyWithUserMsg = [...safeHistory, userMsg];
    
    // 使用函数式更新
    onUpdateHistory(prevHistory => {
      if (typeof prevHistory === 'function') {
        console.error('[MobileChatWindow] prevHistory是函数，这是错误的:', prevHistory);
        return [userMsg];
      }
      const prev = Array.isArray(prevHistory) ? prevHistory : [];
      const userMsgExists = prev.some(m => m.id === userMsg.id);
      if (userMsgExists) {
        return prev;
      }
      return [...prev, userMsg];
    });
    
    try {
      // 检查当前配置模式
      const config = await AIConfigManager.getUserConfig();
      
      // 统一模式和本地模式都使用相同的AI响应生成逻辑
          // Phase 5: 类型安全增强 - 使用明确的类型定义
          interface MemoryItem {
            id: string;
            content: string;
            relevance?: number;
            [key: string]: unknown;
          }
          let relevantMemories: MemoryItem[] = [];
      if (config.mode === 'unified') {
        // 温度感引擎：计算温度感
        const currentTemperature = await systemIntegration.calculateTemperature(userText);
        
        // 获取相关记忆用于上下文
        relevantMemories = await systemIntegration.getRelevantMemories(userText, 3);
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
        logger.error('[MobileChatWindow] AI服务调用失败:', error);
        const errorMsg = createErrorMessage(error as Error, tempBotId);
        onUpdateHistory(prevHistory => {
          if (typeof prevHistory === 'function' || !Array.isArray(prevHistory)) {
            return [errorMsg];
          }
          return [...prevHistory, errorMsg];
        });
        showAlert(getErrorMessage(error as Error), "错误", "error");
    } finally { 
        setIsLoading(false); 
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理选项点击（剧本模式，复用PC版本的逻辑）
  const handleOptionClick = (optionId: string) => {
    if (isLoading) {
      return;
    }
    
    if (!customScenario || !scenarioState) {
      logger.error('[MobileChatWindow] 缺少 customScenario 或 scenarioState');
      return;
    }
    
    const currentNodeId = scenarioState.currentNodeId;
    if (!currentNodeId) {
      logger.error('[MobileChatWindow] scenarioState.currentNodeId 为空');
      return;
    }
    
    const currentNode = customScenario.nodes[currentNodeId];
    if (!currentNode) {
      logger.error('[MobileChatWindow] 找不到当前节点:', currentNodeId);
      return;
    }
    
    const option = currentNode.options?.find(o => o.id === optionId);
    if (!option) {
      logger.error('[MobileChatWindow] 找不到选项:', optionId);
      return;
    }
    
    if (!option.nextNodeId) {
      return;
    }
    
    const nextNode = customScenario.nodes[option.nextNodeId];
    if (!nextNode) {
      logger.error('[MobileChatWindow] 找不到下一个节点:', option.nextNodeId);
      return;
    }
    
    // 应用选项的状态影响
    if (option.effects && option.effects.length > 0 && onUpdateScenarioStateData && scenarioState) {
      const updates = applyOptionEffects(option.effects, scenarioState);
      
      const hasUpdates =
        (updates.events && updates.events.length > 0) ||
        (updates.items && updates.items.length > 0) ||
        (updates.favorability && Object.keys(updates.favorability).length > 0);
      
      if (hasUpdates) {
        onUpdateScenarioStateData(updates);
      }
    }
    
    // 调用场景转换
    handleScenarioTransition(nextNode, option.text || optionId);
  };

  // 处理音频播放（复用PC版本的逻辑）
  const handlePlayAudio = React.useCallback(async (msgId: string, text: string) => {
    if (audioPlayback.playingMessageId === msgId) {
      audioPlayback.stopAudio();
      return;
    }
    audioPlayback.stopAudio();
    audioPlayback.setLoadingMessageId(msgId);

    try {
      if (!audioPlayback.audioContextRef.current) {
        // Phase 5: 类型安全增强 - 使用类型断言替代any
        type AudioContextType = typeof AudioContext;
        const AudioContextClass = (window.AudioContext || (window as typeof window & { webkitAudioContext?: AudioContextType }).webkitAudioContext) as AudioContextType;
        audioPlayback.audioContextRef.current = new AudioContextClass({sampleRate: 24000});
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
      showAlert("语音播放失败，检查网络或稍后重试", "错误", "error");
    } finally {
      audioPlayback.setLoadingMessageId(null);
    }
  }, [audioPlayback, character.voiceName]);

  // 切换语音模式
  const toggleVoiceMode = () => {
    voiceInput.toggleVoiceMode();
  };

  // 开始语音识别
  const startSpeechRecognition = async (isVoiceMode: boolean) => {
    try {
      await voiceInput.startListening();
      if (isVoiceMode) {
        // 语音模式下的处理逻辑
      }
    } catch (error: unknown) {
      logger.error('[MobileChatWindow] 语音识别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '无法启动语音识别';
      showAlert('语音识别失败', errorMessage, 'error');
    }
  };

  // 触发E-SOUL来信
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
    } catch (error: unknown) {
      console.error('触发E-SOUL来信失败:', error);
      const errorMessage = error instanceof Error ? error.message : '发送E-SOUL来信时发生错误，请稍后重试';
      showAlert('发送失败', errorMessage, 'error');
    } finally {
      setIsTriggeringLetter(false);
    }
  };

  // 处理记忆结晶
  const handleCrystalizeMemory = async () => {
    if (!activeJournalEntryId) return;
    setIsCrystalizing(true);
    try {
      // 记忆结晶逻辑
      // TODO: 实现记忆结晶功能
    } catch (error: unknown) {
      logger.error('[MobileChatWindow] 记忆结晶失败:', error);
      const errorMessage = error instanceof Error ? error.message : '无法进行记忆结晶';
      showAlert('记忆结晶失败', errorMessage, 'error');
    } finally {
      setIsCrystalizing(false);
    }
  };

  // 处理关怀消息关闭
  const handleDismissCareMessage = (messageId: string) => {
    markCareMessageAsRead(messageId);
  };

  // 获取当前选项（剧本模式）
  const currentOptions = scenarioState && customScenario
    ? (scenarioState.currentNodeId && customScenario.nodes[scenarioState.currentNodeId]?.options || [])
        .filter(opt => checkOptionConditions(opt, scenarioState))
    : [];

  // 自动滚动到底部（内存管理优化：合并重复的useEffect）
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [safeHistory.length, uiState.isCinematic, scrollToBottom]);
  
  // 内存管理优化：清理定时器
  useEffect(() => {
    return () => {
      if (scenarioTimeoutRef.current) {
        clearTimeout(scenarioTimeoutRef.current);
        scenarioTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <MobileSafeAreaView className="h-full w-full bg-black relative overflow-hidden">
      {/* 背景层 */}
      <BackgroundLayer
        backgroundImage={sceneGeneration.currentBackgroundUrl || character?.backgroundUrl || null}
        character={character}
        isStoryMode={isStoryMode}
        isCinematic={uiState.isCinematic}
      />

      {/* 角色头像（影院模式） */}
      {uiState.isCinematic && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <CharacterAvatar
            character={character}
            size="large"
            isCinematic={true}
          />
        </div>
      )}

      {/* 角色头像（背景显示，非影院模式） */}
      {!uiState.isCinematic && !isStoryMode && (
        <CharacterAvatar
          character={character}
          size="medium"
          isStoryMode={isStoryMode}
          isCinematic={false}
        />
      )}

      {/* 头部栏（移动端优化） */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/95 via-black/90 to-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <MobileTouchableButton
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </MobileTouchableButton>
          
          <div className="flex items-center gap-2 flex-1 justify-center">
            <CharacterAvatar
              character={character}
              size="small"
              isCinematic={false}
            />
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <h2 className="text-white font-bold text-base drop-shadow-lg">{character.name}</h2>
              {customScenario && (
                <p className="text-white/80 text-xs drop-shadow-md">{customScenario.title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!uiState.isCinematic && (
              <MobileTouchableButton
                onClick={() => uiState.setIsCinematic(true)}
                variant="ghost"
                size="sm"
                className="text-white/70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </MobileTouchableButton>
            )}
          </div>
        </div>
      </div>

      {/* 退出影院模式按钮 */}
      {uiState.isCinematic && (
        <MobileTouchableButton
          onClick={() => uiState.setIsCinematic(false)}
          variant="ghost"
          size="md"
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/40 text-white/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-3.65-3.65m3.65 3.65F5.183 2.16 20.632 17.608M14.25 12a2.25 2.25 0 0 1-2.25 2.25" />
          </svg>
        </MobileTouchableButton>
      )}

      {/* 关怀消息通知 */}
      {careMessages.map((message) => (
        <CareMessageNotification
          key={message.id}
          message={message}
          onDismiss={handleDismissCareMessage}
        />
      ))}

      {/* 主聊天区域（移动端优化） */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-4 bg-gradient-to-t from-black via-black/90 to-black/70 transition-all duration-500 ${uiState.isCinematic ? 'h-[40vh] bg-gradient-to-t from-black via-black/70 to-black/50' : 'h-[55vh]'}`}>
        
        {/* 消息列表（使用MobileSmoothScroll） */}
        <MobileSmoothScroll className="flex-1 px-4 py-4 space-y-4" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}>
          {safeHistory.length === 0 && isLoading && isStoryMode && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <MobileLoadingSpinner />
              <p className="text-indigo-300 font-bold text-lg animate-pulse">正在生成故事...</p>
            </div>
          )}
          
          {safeHistory.length === 0 && !isLoading && (
            <MobileEmptyState
              icon="💬"
              title="暂无消息"
              description={`开始和${character.name}聊天吧`}
            />
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
                onPlayAudio={(msgId: string, text: string) => handlePlayAudio(msgId, text)}
                audioLoadingId={audioPlayback.loadingMessageId}
                playingMessageId={audioPlayback.playingMessageId}
                showAudioButton={!uiState.isCinematic}
              />
            ))}
          
          {isLoading && safeHistory.length > 0 && (
            <div className="flex justify-start w-full">
              <div className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border border-white/10 flex items-center space-x-2" style={{ backgroundColor: `${character.colorAccent}1A` }}>
                <div className="w-2 h-2 bg-white/70 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-white/70 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-white/70 rounded-full typing-dot" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </MobileSmoothScroll>

        {/* 输入区域（移动端优化） */}
        <div 
          className="px-4 mt-2 w-full pb-6 min-h-[80px]"
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
                /* 普通文本输入模式（移动端优化） */
                <div className="relative flex items-center bg-black/90 rounded-2xl p-2 border border-white/10 animate-fade-in w-full">
                  {/* 表情按钮（使用MobileTouchableButton） */}
                  <MobileTouchableButton
                    onClick={() => uiState.setShowEmojiPicker(true)}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="mr-2 bg-white/10 text-white/70"
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
                  </MobileTouchableButton>
                  
                  {/* 输入框（移动端优化） */}
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入你的消息..."
                    className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 resize-none max-h-24 py-3 px-3 scrollbar-hide text-base min-h-[44px]"
                    rows={1}
                    disabled={isLoading}
                    inputMode="text"
                  />
                  
                  {/* 语音输入按钮（使用MobileTouchableButton） */}
                  <MobileTouchableButton
                    onClick={voiceInput.isListening ? voiceInput.stopListening : () => startSpeechRecognition(false)}
                    disabled={isLoading}
                    variant={voiceInput.isListening ? "danger" : "ghost"}
                    size="sm"
                    className={`ml-2 ${voiceInput.isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/70'}`}
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
                  </MobileTouchableButton>
                  
                  {/* 发送按钮（使用MobileTouchableButton） */}
                  <MobileTouchableButton
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    variant="primary"
                    size="md"
                    className="ml-2"
                    style={{ backgroundColor: character.colorAccent }}
                  >
                    发送
                  </MobileTouchableButton>
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
    </MobileSafeAreaView>
  );
});

MobileChatWindowScreen.displayName = 'MobileChatWindowScreen';
