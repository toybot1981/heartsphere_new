
import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, CustomScenario, AppSettings, StoryNode, StoryOption, UserProfile, JournalEcho, DialogueStyle } from '../types';
import { geminiService } from '../services/gemini';
import { aiService } from '../services/ai';
import { AIConfigManager } from '../services/ai/config';
import { GenerateContentResponse } from '@google/genai';
import { Button } from './Button';
import { showAlert } from '../utils/dialog';
import { createScenarioContext } from '../constants';

// --- Audio Decoding Helpers (Raw PCM) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Rich Text Parser ---
// Parses *actions* and (thoughts) for styled rendering
const RichTextRenderer: React.FC<{ text: string, colorAccent: string }> = ({ text, colorAccent }) => {
    const parts = text.split(/(\*[^*]+\*|\([^)]+\))/g);

    // 过滤掉空字符串，然后渲染，确保每个元素都有唯一的 key
    const validParts = parts
        .map((part, index) => ({ part, index }))
        .filter(({ part }) => part.trim() !== '');

    return (
        <span className="whitespace-pre-wrap">
            {validParts.map(({ part, index }) => {
                // 使用原始索引确保 key 的唯一性和稳定性
                const uniqueKey = `rich-text-${index}`;
                
                if (part.startsWith('*') && part.endsWith('*')) {
                    // Action: Italic, slightly faded
                    return (
                        <span key={uniqueKey} className="italic opacity-70 text-sm mx-1 block my-1" style={{ color: '#e5e7eb' }}>
                            {part.slice(1, -1)}
                        </span>
                    );
                } else if (part.startsWith('(') && part.endsWith(')')) {
                    // Thought/Inner Monologue: Smaller, distinct color
                    return (
                        <span key={uniqueKey} className="block text-xs my-1 font-serif opacity-80 tracking-wide" style={{ color: `${colorAccent}cc` }}>
                            {part}
                        </span>
                    );
                } else {
                    // Standard dialogue
                    return <span key={uniqueKey}>{part}</span>;
                }
            })}
        </span>
    );
};

interface ChatWindowProps {
  character: Character;
  customScenario?: CustomScenario;
  history: Message[];
  scenarioState?: { currentNodeId: string };
  settings: AppSettings;
  userProfile: UserProfile;
  activeJournalEntryId: string | null; 
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onUpdateScenarioState?: (nodeId: string) => void;
  onBack: (echo?: JournalEcho) => void;
  participatingCharacters?: Character[]; // 参与剧本的角色列表
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  character, customScenario, history, scenarioState, settings, userProfile, activeJournalEntryId, onUpdateHistory, onUpdateScenarioState, onBack, participatingCharacters 
}) => {
  // 防御性检查：确保history是数组
  const safeHistory = Array.isArray(history) ? history : [];
  
  // 调试日志：检查history数据
  useEffect(() => {
    console.log('[ChatWindow] history prop变化:', {
      historyLength: history?.length || 0,
      historyType: typeof history,
      isArray: Array.isArray(history),
      safeHistoryLength: safeHistory.length,
      safeHistoryContent: safeHistory.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
    });
  }, [history, safeHistory]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(character?.backgroundUrl || null);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  
  // Cinematic Mode State
  const [isCinematic, setIsCinematic] = useState(false);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  
  // Manual Memory Crystallization State
  const [isCrystalizing, setIsCrystalizing] = useState(false);
  const [generatedEcho, setGeneratedEcho] = useState<JournalEcho | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  // 标记是否已经初始化过history（防止在用户交互后重置history）
  const hasInitializedHistoryRef = useRef<boolean>(false);

  // Determine mode
  const isStoryMode = !!customScenario || (character?.id?.startsWith('story_') ?? false);
  const isScenarioMode = !!customScenario; // Specifically for Node-based scenarios

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [safeHistory, isCinematic]); 

  // --- CRITICAL FIX: Reset Session on Mount ---
  // This ensures that when we enter a chat, the Gemini Service clears any stale cache 
  // and rebuilds the context from the passed 'history' prop.
  useEffect(() => {
    if (character?.id) {
        geminiService.resetSession(character.id);
    }
  }, [character?.id]);

  // 存储上一次的character.id和customScenario.id，用于检测切换
  const prevCharacterIdRef = useRef<string | undefined>(character?.id);
  const prevScenarioIdRef = useRef<string | undefined>(customScenario?.id);
  
  // 检测character或scenario是否切换了
  useEffect(() => {
    const characterChanged = prevCharacterIdRef.current !== character?.id;
    const scenarioChanged = prevScenarioIdRef.current !== customScenario?.id;
    
    if (characterChanged || scenarioChanged) {
      console.log('[ChatWindow] character或scenario切换，重置初始化标记:', {
        prevCharacterId: prevCharacterIdRef.current,
        newCharacterId: character?.id,
        prevScenarioId: prevScenarioIdRef.current,
        newScenarioId: customScenario?.id,
        currentHistoryLength: safeHistory.length
      });
      hasInitializedHistoryRef.current = false;
      prevCharacterIdRef.current = character?.id;
      prevScenarioIdRef.current = customScenario?.id;
    }
  }, [character?.id, customScenario?.id]);
  
  // 初始化history：只在首次加载且history为空时执行
  // 使用useEffect + hasInitializedHistoryRef确保不会在用户交互后重置history
  useEffect(() => {
    if (!character) return;
    
    // 关键检查：
    // 1. 还没有初始化过
    // 2. history确实为空
    // 如果history已经有内容（用户已经交互过），就不再初始化
    const shouldInitialize = !hasInitializedHistoryRef.current && safeHistory.length === 0;
    
    console.log('[ChatWindow] 检查是否需要初始化history:', {
      shouldInitialize,
      hasInitialized: hasInitializedHistoryRef.current,
      historyLength: safeHistory.length,
      characterId: character.id,
      customScenarioId: customScenario?.id
    });
    
    if (shouldInitialize) {
      console.log('[ChatWindow] ========== 开始初始化history ==========');
      hasInitializedHistoryRef.current = true; // 立即标记为已初始化，防止重复执行
      
      if (customScenario && onUpdateScenarioState) {
          // Scenario Mode: 确保 scenarioState 已初始化
          let targetNodeId = scenarioState?.currentNodeId;
          
          // 如果 scenarioState 未初始化或 currentNodeId 无效，使用 startNodeId
          if (!targetNodeId || !customScenario.nodes[targetNodeId]) {
            targetNodeId = customScenario.startNodeId;
            
            // 更新 scenarioState
            if (onUpdateScenarioState) {
              onUpdateScenarioState(targetNodeId);
            }
          }
          
          const startNode = customScenario.nodes[targetNodeId];
          if (startNode) {
            console.log('[ChatWindow] Scenario Mode: 调用handleScenarioTransition');
            handleScenarioTransition(startNode, null);
          } else {
            console.error('[ChatWindow] 找不到起始节点:', {
              targetNodeId,
              availableNodes: Object.keys(customScenario.nodes)
            });
          }
      } else if (!isStoryMode) {
        // Normal Mode
        console.log('[ChatWindow] Normal Mode: 初始化firstMessage');
        const initMsg = { id: 'init', role: 'model' as const, text: character.firstMessage, timestamp: Date.now() };
        onUpdateHistory([initMsg]);
        console.log('[ChatWindow] Normal Mode: firstMessage已添加:', initMsg);
      } else if (isStoryMode && !customScenario) {
        // Main Story Mode
        console.log('[ChatWindow] Main Story Mode: 初始化firstMessage');
        const initMsg = { id: 'init_story', role: 'model' as const, text: character.firstMessage, timestamp: Date.now() };
        onUpdateHistory([initMsg]);
        console.log('[ChatWindow] Main Story Mode: firstMessage已添加:', initMsg);
      }
      
      console.log('[ChatWindow] ========== history初始化完成 ==========');
    } else if (!hasInitializedHistoryRef.current && safeHistory.length > 0) {
      // history已经有内容（可能是从外部加载的），标记为已初始化（防止后续被重置）
      console.log('[ChatWindow] history已有内容，标记为已初始化，防止被重置:', {
        historyLength: safeHistory.length,
        historyPreview: safeHistory.map(m => ({ id: m.id, role: m.role }))
      });
      hasInitializedHistoryRef.current = true;
    }
  }, [character?.id, customScenario?.id]);

  useEffect(() => {
    if (!isStoryMode || !settings.autoGenerateStoryScenes) return;
    
    const lastMsg = safeHistory[safeHistory.length - 1];
    if (lastMsg && lastMsg.role === 'model' && !isGeneratingScene) {
        const generate = async () => {
            setIsGeneratingScene(true);
            try {
                const desc = await geminiService.generateSceneDescription(history);
                if (desc) {
                    const prompt = `${desc}. Style: Modern Chinese Anime (Manhua), High Quality, Cinematic Lighting, Vibrant Colors. Aspect Ratio: 16:9.`;
                    const img = await geminiService.generateImageFromPrompt(prompt, '16:9');
                    if (img) setSceneImageUrl(img);
                }
            } catch (e) {
                console.error("Scene generation error (UI handled):", e);
            } finally {
                setIsGeneratingScene(false);
            }
        };
        const timeoutId = setTimeout(generate, 500);
        return () => clearTimeout(timeoutId);
    }
  }, [history, isStoryMode, settings.autoGenerateStoryScenes]);

  const stopAudio = () => {
    if (sourceNodeRef.current) { 
        try { sourceNodeRef.current.stop(); } catch(e) {/* already stopped */} 
        sourceNodeRef.current = null; 
    }
    setPlayingMessageId(null);
    setIsPlayingAudio(false);
  };
  
  const handlePlayAudio = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      stopAudio();
      return;
    }
    stopAudio(); 
    setAudioLoadingId(msgId);

    try {
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const base64Audio = await geminiService.generateSpeech(text, character.voiceName || 'Kore');
      if (!base64Audio) throw new Error("No audio data generated");

      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPlayingMessageId(null);
        setIsPlayingAudio(false);
      };
      
      sourceNodeRef.current = source;
      source.start();
      
      setPlayingMessageId(msgId);
      setIsPlayingAudio(true);
    } catch (e) {
      console.error("Audio playback failed", e);
      showAlert("语音播放失败，请检查网络或稍后重试", "错误", "error");
    } finally {
      setAudioLoadingId(null);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleScenarioTransition = async (node: StoryNode, choiceText: string | null) => {
    setIsLoading(true);
    const tempBotId = `bot_${Date.now()}`;
    
    // 在流程驱动模式下，直接显示节点的prompt内容，不调用AI生成
    // 因为剧本是预设的流程，不需要AI动态生成对话
    
    let currentHistory = [...safeHistory];
    if (choiceText) {
       const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: choiceText, timestamp: Date.now() };
       currentHistory.push(userMsg);
       onUpdateHistory(currentHistory);
    }

    try {
      // 流程驱动模式：直接使用节点预设的prompt内容，不调用AI生成
      const nodeContent = node.prompt || node.title || '【场景内容】';
      const botMsg: Message = { 
        id: tempBotId, 
        role: 'model', 
        text: nodeContent, 
        timestamp: Date.now() 
      };
      currentHistory = [...currentHistory, botMsg];
      onUpdateHistory(currentHistory);
      
      // 更新场景状态到当前节点
      if (onUpdateScenarioState) {
        onUpdateScenarioState(node.id);
      }
       
      // 节点处理完成，等待用户选择（如果有选项的话）
      // renderChoices 函数会根据 scenarioState.currentNodeId 和 node.options 来显示选项
       
    } catch (e) {
        console.error("Scenario transition failed", e);
        onUpdateHistory([...currentHistory, {id: tempBotId, role: 'model', text: "【系统错误：剧本执行失败，请稍后重试】", timestamp: Date.now()}]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOptionClick = (optionId: string) => {
      // 如果正在加载，阻止处理
      if (isLoading) {
          return;
      }
      
      if (!customScenario || !scenarioState) {
          console.error('[ChatWindow] 缺少 customScenario 或 scenarioState');
          return;
      }
      
      const currentNodeId = scenarioState.currentNodeId;
      if (!currentNodeId) {
          console.error('[ChatWindow] scenarioState.currentNodeId 为空');
          return;
      }
      
      const currentNode = customScenario.nodes[currentNodeId];
      if (!currentNode) {
          console.error('[ChatWindow] 找不到当前节点:', currentNodeId);
          return;
      }
      
      const option = currentNode.options?.find(o => o.id === optionId);
      if (!option) {
          console.error('[ChatWindow] 找不到选项:', optionId);
          return;
      }
      
      if (!option.nextNodeId) {
          return;
      }
      
      const nextNode = customScenario.nodes[option.nextNodeId];
      if (!nextNode) {
          console.error('[ChatWindow] 找不到下一个节点:', option.nextNodeId);
          return;
      }
      
      // 调用场景转换
      handleScenarioTransition(nextNode, option.text || optionId);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isScenarioMode) return;
    
    // 防止并发请求：如果已有请求在进行，忽略新的请求
    if (isLoading) {
      console.warn('[ChatWindow] 已有请求在进行中，忽略新请求');
      return;
    }
    
    const userText = input.trim();
    setInput('');
    setIsLoading(true);
    
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
    const tempBotId = `bot_${Date.now()}`;
    
    // 使用函数式更新，确保获取最新的history状态
    // 注意：用户消息需要立即添加到history，这样后续的响应才能正确追加
    console.log('[ChatWindow] ========== 开始添加用户消息 ==========');
    console.log('[ChatWindow] 当前history prop:', {
      historyLength: safeHistory.length,
      history: safeHistory.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
    });
    console.log('[ChatWindow] 要添加的用户消息:', userMsg);
    
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
        console.log('[ChatWindow] 用户消息已存在，跳过重复添加');
        return prev;
      }
      
      const newHistory = [...prev, userMsg];
      console.log('[ChatWindow] 用户消息已添加到history:', {
        prevLength: prev.length,
        newLength: newHistory.length,
        userMsgId: userMsg.id,
        userMsgText: userMsg.text.substring(0, 50),
        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
      });
      return newHistory;
    });
    
    console.log('[ChatWindow] ========== 用户消息添加完成 ==========');
    
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
      
      if (config.mode === 'unified') {
        console.log('[ChatWindow] 使用统一接入模式调用大模型');
        
        // 统一接入模式：使用新的 aiService
        // 构建系统指令
        let systemInstruction = character.systemInstruction || '';
        if (character.mbti) systemInstruction += `\nMBTI: ${character.mbti}`;
        if (character.speechStyle) systemInstruction += `\nSpeaking Style: ${character.speechStyle}`;
        if (character.catchphrases) systemInstruction += `\nCommon Phrases: ${character.catchphrases.join(', ')}`;
        if (character.secrets) systemInstruction += `\nSecrets: ${character.secrets}`;
        
        // 添加对话风格
        const dialogueStyle = settings?.dialogueStyle || 'mobile-chat';
        const styleInstruction = getDialogueStyleInstruction(dialogueStyle);
        systemInstruction += styleInstruction;
        
        // 添加场景上下文
        if (userProfile) {
          const scenarioContext = createScenarioContext(userProfile);
          systemInstruction = `${scenarioContext}\n\n${systemInstruction}`;
        }
        
        // 转换消息历史：使用包含用户消息的完整历史
        // 注意：这里使用historyWithUserMsg而不是safeHistory，确保包含刚添加的用户消息
        const historyMessages = historyWithUserMsg.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant' | 'system',
          content: msg.text,
        }));
        
        console.log('[ChatWindow] 统一模式 - 构建AI请求的historyMessages:', {
          historyWithUserMsgLength: historyWithUserMsg.length,
          historyMessagesLength: historyMessages.length,
          lastMsg: historyMessages[historyMessages.length - 1],
          allRoles: historyMessages.map(m => m.role)
        });
        
        // 使用统一AI服务
        // 为当前请求创建独立的状态，避免闭包捕获旧请求的状态
        const currentRequestId = tempBotId; // 使用tempBotId作为请求ID
        let requestFullResponseText = ''; // 当前请求的响应文本（每个请求独立）
        let hasAddedBotMessage = false; // 标记是否已添加机器人消息（使用ref方式避免闭包问题）
        
        await aiService.generateTextStream(
          {
            prompt: userText,
            systemInstruction: systemInstruction,
            messages: historyMessages, // 历史消息（不包含当前用户输入）
            temperature: 0.7,
            maxTokens: 2048,
          },
          (chunk) => {
            try {
              if (!chunk.done && chunk.content) {
                requestFullResponseText += chunk.content;
                const msg = { id: currentRequestId, role: 'model' as const, text: requestFullResponseText, timestamp: Date.now() };
                
                // 使用函数式更新，确保获取最新的history状态，避免闭包问题
                // 通过消息ID匹配确保更新正确的消息
                onUpdateHistory(prevHistory => {
                  try {
                    // 防御性检查：确保prevHistory是数组，且不是函数
                    if (typeof prevHistory === 'function') {
                      console.error('[ChatWindow] prevHistory是函数，这是错误的:', prevHistory);
                      return [];
                    }
                    if (!Array.isArray(prevHistory)) {
                      console.error('[ChatWindow] prevHistory不是数组:', prevHistory, typeof prevHistory);
                      return [];
                    }
                    
                    // 检查用户消息是否存在（确保用户消息没有被丢失）
                    const userMsgExists = prevHistory.some(m => m.id === userMsg.id && m.role === 'user');
                    if (!userMsgExists) {
                      console.warn('[ChatWindow] ⚠️ 用户消息不在history中，重新添加:', {
                        userMsgId: userMsg.id,
                        prevHistoryLength: prevHistory.length,
                        prevHistoryIds: prevHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      // 如果用户消息不在history中，先添加用户消息，然后再添加机器人消息
                      prevHistory = [...prevHistory, userMsg];
                    }
                    
                    // 检查最后一条消息是否是我们刚刚添加的机器人消息
                    const lastMsg = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
                    const isLastMsgOurs = lastMsg && lastMsg.id === currentRequestId && lastMsg.role === 'model';
                    
                    console.log('[ChatWindow] 更新机器人消息:', {
                      prevHistoryLength: prevHistory.length,
                      lastMsgId: lastMsg?.id,
                      lastMsgRole: lastMsg?.role,
                      currentRequestId,
                      isLastMsgOurs,
                      hasAddedBotMessage,
                      userMsgExists,
                      allMsgIds: prevHistory.map(m => ({ id: m.id, role: m.role }))
                    });
                    
                    if (!hasAddedBotMessage && !isLastMsgOurs) {
                      // 还没有添加机器人消息，且最后一条不是我们的消息，添加新消息
                      hasAddedBotMessage = true;
                      const newHistory = [...prevHistory, msg];
                      console.log('[ChatWindow] 添加机器人消息，新history长度:', newHistory.length, {
                        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      return newHistory;
                    } else if (isLastMsgOurs) {
                      // 最后一条是我们的消息，更新它
                      hasAddedBotMessage = true;
                      const newHistory = [...prevHistory.slice(0, -1), msg];
                      console.log('[ChatWindow] 更新机器人消息，新history长度:', newHistory.length, {
                        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      return newHistory;
                    } else {
                      // 其他情况，追加新消息
                      hasAddedBotMessage = true;
                      const newHistory = [...prevHistory, msg];
                      console.log('[ChatWindow] 追加机器人消息，新history长度:', newHistory.length, {
                        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      return newHistory;
                    }
                  } catch (error) {
                    console.error('[ChatWindow] onUpdateHistory回调中发生错误:', error);
                    // 返回安全的默认值，确保不返回函数
                    return Array.isArray(prevHistory) && typeof prevHistory !== 'function' ? prevHistory : [];
                  }
                });
              } else if (chunk.done) {
                // 完成 - 确保完成信号能够正常处理（即使isLoading已经变为false）
                setIsLoading(false);
              }
            } catch (error) {
              console.error('[ChatWindow] 处理chunk时发生错误:', error);
              // 确保即使出错也能恢复加载状态
              setIsLoading(false);
            }
          }
        );
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
        
        // 本地配置模式：使用新的 aiService（具备多provider容错能力）
        // 构建系统指令
        let systemInstruction = character.systemInstruction || '';
        if (character.mbti) systemInstruction += `\nMBTI: ${character.mbti}`;
        if (character.speechStyle) systemInstruction += `\nSpeaking Style: ${character.speechStyle}`;
        if (character.catchphrases) systemInstruction += `\nCommon Phrases: ${character.catchphrases.join(', ')}`;
        if (character.secrets) systemInstruction += `\nSecrets: ${character.secrets}`;
        
        // 添加对话风格
        const dialogueStyle = settings?.dialogueStyle || 'mobile-chat';
        const styleInstruction = getDialogueStyleInstruction(dialogueStyle);
        systemInstruction += styleInstruction;
        
        // 添加场景上下文
        if (userProfile) {
          const scenarioContext = createScenarioContext(userProfile);
          systemInstruction = `${scenarioContext}\n\n${systemInstruction}`;
        }
        
        // 转换消息历史：使用包含用户消息的完整历史
        // 注意：这里使用historyWithUserMsg而不是safeHistory，确保包含刚添加的用户消息
        const historyMessages = historyWithUserMsg.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant' | 'system',
          content: msg.text,
        }));
        
        console.log('[ChatWindow] 本地模式 - 构建AI请求的historyMessages:', {
          historyWithUserMsgLength: historyWithUserMsg.length,
          historyMessagesLength: historyMessages.length,
          lastMsg: historyMessages[historyMessages.length - 1],
          allRoles: historyMessages.map(m => m.role)
        });
        
        // 使用本地AI服务（会自动尝试所有可用的provider）
        // 为当前请求创建独立的状态，避免闭包捕获旧请求的状态
        const currentRequestId = tempBotId; // 使用tempBotId作为请求ID
        let requestFullResponseText = ''; // 当前请求的响应文本（每个请求独立）
        let hasAddedBotMessage = false; // 标记是否已添加机器人消息（使用ref方式避免闭包问题）
        
        await aiService.generateTextStream(
          {
            prompt: userText,
            systemInstruction: systemInstruction,
            messages: historyMessages, // 历史消息（不包含当前用户输入）
            temperature: 0.7,
            maxTokens: 2048,
          },
          (chunk) => {
            try {
              if (!chunk.done && chunk.content) {
                requestFullResponseText += chunk.content;
                const msg = { id: currentRequestId, role: 'model' as const, text: requestFullResponseText, timestamp: Date.now() };
                
                // 使用函数式更新，确保获取最新的history状态，避免闭包问题
                // 通过消息ID匹配确保更新正确的消息
                onUpdateHistory(prevHistory => {
                  try {
                    // 防御性检查：确保prevHistory是数组，且不是函数
                    if (typeof prevHistory === 'function') {
                      console.error('[ChatWindow] prevHistory是函数，这是错误的:', prevHistory);
                      return [];
                    }
                    if (!Array.isArray(prevHistory)) {
                      console.error('[ChatWindow] prevHistory不是数组:', prevHistory, typeof prevHistory);
                      return [];
                    }
                    
                    // 检查用户消息是否存在（确保用户消息没有被丢失）
                    const userMsgExists = prevHistory.some(m => m.id === userMsg.id && m.role === 'user');
                    if (!userMsgExists) {
                      console.warn('[ChatWindow] ⚠️ 用户消息不在history中，重新添加:', {
                        userMsgId: userMsg.id,
                        prevHistoryLength: prevHistory.length,
                        prevHistoryIds: prevHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      // 如果用户消息不在history中，先添加用户消息，然后再添加机器人消息
                      prevHistory = [...prevHistory, userMsg];
                    }
                    
                    // 检查最后一条消息是否是我们刚刚添加的机器人消息
                    const lastMsg = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
                    const isLastMsgOurs = lastMsg && lastMsg.id === currentRequestId && lastMsg.role === 'model';
                    
                    console.log('[ChatWindow] 更新机器人消息:', {
                      prevHistoryLength: prevHistory.length,
                      lastMsgId: lastMsg?.id,
                      lastMsgRole: lastMsg?.role,
                      currentRequestId,
                      isLastMsgOurs,
                      hasAddedBotMessage,
                      userMsgExists,
                      allMsgIds: prevHistory.map(m => ({ id: m.id, role: m.role }))
                    });
                    
                    if (!hasAddedBotMessage && !isLastMsgOurs) {
                      // 还没有添加机器人消息，且最后一条不是我们的消息，添加新消息
                      hasAddedBotMessage = true;
                      const newHistory = [...prevHistory, msg];
                      console.log('[ChatWindow] 添加机器人消息，新history长度:', newHistory.length, {
                        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      return newHistory;
                    } else if (isLastMsgOurs) {
                      // 最后一条是我们的消息，更新它
                      hasAddedBotMessage = true;
                      const newHistory = [...prevHistory.slice(0, -1), msg];
                      console.log('[ChatWindow] 更新机器人消息，新history长度:', newHistory.length, {
                        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      return newHistory;
                    } else {
                      // 其他情况，追加新消息
                      hasAddedBotMessage = true;
                      const newHistory = [...prevHistory, msg];
                      console.log('[ChatWindow] 追加机器人消息，新history长度:', newHistory.length, {
                        allMsgIds: newHistory.map(m => ({ id: m.id, role: m.role }))
                      });
                      return newHistory;
                    }
                  } catch (error) {
                    console.error('[ChatWindow] onUpdateHistory回调中发生错误:', error);
                    // 返回安全的默认值，确保不返回函数
                    return Array.isArray(prevHistory) && typeof prevHistory !== 'function' ? prevHistory : [];
                  }
                });
              } else if (chunk.done) {
                // 完成
                setIsLoading(false);
              }
            } catch (error) {
              console.error('[ChatWindow] 处理chunk时发生错误:', error);
              // 确保即使出错也能恢复加载状态
              setIsLoading(false);
            }
          }
        );
      }
    } catch (error) { 
        console.error('[ChatWindow] AI服务调用失败:', error);
        try {
          // 使用函数式更新，确保获取最新的history状态
          onUpdateHistory(prevHistory => {
            try {
                    // 防御性检查：确保prevHistory不是函数，且是数组
                    if (typeof prevHistory === 'function') {
                      console.error('[ChatWindow] prevHistory是函数，这是错误的:', prevHistory);
                      return [];
                    }
                    if (!Array.isArray(prevHistory)) {
                      console.error('[ChatWindow] prevHistory不是数组:', prevHistory, typeof prevHistory);
                      return [];
                    }
              return [
                ...prevHistory, 
                {id: tempBotId, role: 'model', text: "【系统错误：连接失败，请稍后重试】", timestamp: Date.now()}
              ];
            } catch (updateError) {
              console.error('[ChatWindow] 更新错误消息时发生错误:', updateError);
              return prevHistory;
            }
          });
        } catch (updateError) {
          console.error('[ChatWindow] 调用onUpdateHistory失败:', updateError);
        }
    } finally { 
        setIsLoading(false); 
    }
  };
  
  // 辅助函数：获取对话风格指令
  const getDialogueStyleInstruction = (style: DialogueStyle = 'mobile-chat'): string => {
    switch (style) {
      case 'mobile-chat':
        return `\n\n[对话风格：即时网聊]
- 使用短句，像微信聊天一样自然
- 可以适当使用 Emoji 表情（😊、😢、🤔、💭 等）
- 动作描写用 *动作内容* 格式，例如：*轻轻拍了拍你的肩膀*
- 节奏要快，回复要简洁有力
- 语气要轻松、亲切，像和朋友聊天
- 避免冗长的描述，重点突出对话和互动`;
      case 'visual-novel':
        return `\n\n[对话风格：沉浸小说]
- 侧重心理描写和环境渲染
- 辞藻优美，富有文学性
- 像读轻小说一样，有代入感和画面感
- 可以详细描述角色的内心活动、表情、动作
- 适当描写周围环境，营造氛围
- 回复可以较长，但要保持节奏感
- 注重情感表达和细节刻画`;
      case 'stage-script':
        return `\n\n[对话风格：剧本独白]
- 格式严格：动作用 [动作内容] 表示，台词直接说
- 例如：[缓缓转身] 你来了...
- 干脆利落，适合作为创作大纲
- 动作和台词要清晰分离
- 避免过多的心理描写，重点在动作和对话
- 风格要简洁、有力，像舞台剧脚本`;
      case 'poetic':
        return `\n\n[对话风格：诗意留白]
- 极简、隐晦、富有哲理
- 像《主要还是看气质》或《光遇》的风格
- 用词要精炼，意境要深远
- 可以适当留白，让读者自己体会
- 避免直白的表达，多用隐喻和象征
- 节奏要慢，每个字都要有分量
- 注重氛围和情感，而非具体情节`;
      default:
        return '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCrystalizeMemory = async () => {
    if (!activeJournalEntryId || safeHistory.length < 2 || isCrystalizing) return;
    setIsCrystalizing(true);
    try {
        const wisdom = await geminiService.generateWisdomEcho(history, character.name);
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
  
  const renderChoices = () => {
    if (!customScenario || !scenarioState || isLoading) {
      return null;
    }

    const currentNodeId = scenarioState.currentNodeId;
    if (!currentNodeId) {
      return null;
    }

    const currentNode = customScenario.nodes[currentNodeId];
    if (!currentNode) {
      return null;
    }

    // 检查 options 是否存在且是数组
    if (!currentNode.options || !Array.isArray(currentNode.options) || currentNode.options.length === 0) {
      return null;
    }

    // 验证每个选项的结构，并确保每个选项都有唯一的 id
    const validOptions = currentNode.options
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

    if (validOptions.length === 0) {
      return null;
    }

    return (
        <div 
          className={`flex flex-wrap gap-3 justify-center mt-4 animate-fade-in ${isCinematic ? 'mb-10' : ''}`}
          style={{ 
            zIndex: 999,
            position: 'relative',
            pointerEvents: 'auto'
          }}
        >
            {validOptions.map((opt, index) => {
              const buttonText = opt.text || opt.id || '选择';
              const isButtonDisabled = isLoading;
              const uniqueKey = opt.id || `option-${index}`;
              
              return (
                <button
                  key={uniqueKey}
                  id={`choice-button-${uniqueKey}`}
                  data-option-id={opt.id}
                  data-index={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (isLoading || isButtonDisabled) {
                      return;
                    }
                    
                    try {
                      handleOptionClick(opt.id);
                    } catch (error) {
                      console.error('[ChatWindow] 处理选项点击时出错:', error);
                    }
                  }}
                  className="bg-indigo-600/80 backdrop-blur-md hover:bg-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg border border-indigo-400/50 transition-all active:scale-95"
                  style={{
                    backgroundColor: isButtonDisabled ? 'rgba(79, 70, 229, 0.4)' : 'rgba(79, 70, 229, 0.8)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                    zIndex: 999,
                    position: 'relative',
                    minWidth: '120px',
                    fontSize: '16px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    opacity: isButtonDisabled ? 0.6 : 1,
                    pointerEvents: isButtonDisabled ? 'none' : 'auto',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  disabled={isButtonDisabled}
                  aria-label={`选择: ${buttonText}`}
                >
                    {buttonText}
                </button>
              );
            })}
        </div>
    );
  };
  
  if (!character) {
    return null;
  }

  const backgroundImage = isStoryMode && sceneImageUrl ? sceneImageUrl : character.backgroundUrl;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white font-sans">
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url(${backgroundImage})`, filter: isCinematic ? 'brightness(0.9)' : (isStoryMode ? 'blur(0px) brightness(0.6)' : 'blur(4px) opacity(0.6)') }} />
      
      {!isStoryMode && !isCinematic && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="relative h-[85vh] w-[85vh] max-w-full flex items-end justify-center pb-10">
              <div className="absolute inset-0 opacity-40 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${character.colorAccent}66 0%, transparent 70%)` }} />
            <img src={character.avatarUrl} alt={character.name} className="h-full w-full object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-fade-in transition-transform duration-75 will-change-transform" />
          </div>
        </div>
      )}

      {/* Header Bar */}
      {!isCinematic && (
        <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center transition-opacity duration-500">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={handleBackClick} className="!p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wider">{customScenario ? customScenario.title : character.name}</h2>
              <span className="text-xs uppercase tracking-widest opacity-80" style={{ color: character.colorAccent }}>{customScenario ? '原创剧本' : '已连接'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
               <button 
                  onClick={() => setIsCinematic(true)} 
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                  title="进入沉浸模式"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
               </button>

              {activeJournalEntryId && (
                  <button 
                    onClick={handleCrystalizeMemory} 
                    disabled={isCrystalizing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all text-xs font-bold ${
                        generatedEcho 
                        ? 'bg-indigo-500/80 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                        : 'bg-white/10 border-white/20 text-indigo-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                     {isCrystalizing ? '凝结中...' : generatedEcho ? '记忆已凝结' : '凝结记忆'}
                  </button>
              )}

             <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
               {isGeneratingScene && <span className="text-xs text-orange-400 animate-pulse mr-2">正在生成场景...</span>}
               {isPlayingAudio && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />}
               <span className="text-xs font-mono">{isPlayingAudio ? "正在播放" : "待机"}</span>
             </div>
          </div>
        </div>
      )}

      {isCinematic && (
        <button 
          onClick={() => setIsCinematic(false)}
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/50 hover:text-white transition-all backdrop-blur-md"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-3.65-3.65m3.65 3.65F5.183 2.16 20.632 17.608M14.25 12a2.25 2.25 0 0 1-2.25 2.25" />
           </svg>
        </button>
      )}

      {/* Main Chat Area */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ${isCinematic ? 'h-[40vh] bg-gradient-to-t from-black via-black/50 to-transparent' : 'h-[65vh]'}`}>
        
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
          {safeHistory.map((msg, index) => {
            if (!msg || !msg.text) {
              console.warn('[ChatWindow] 无效的消息:', msg);
              return null;
            }
            
            const isUserMsg = msg.role === 'user';
            const willBeHidden = isCinematic && isUserMsg;
            
            // 只在开发时输出详细日志（避免日志过多）
            if (index < 3 || safeHistory.length - index <= 2 || isUserMsg) {
              console.log(`[ChatWindow] 渲染消息 ${index}/${safeHistory.length - 1}:`, {
                id: msg.id,
                role: msg.role,
                textPreview: msg.text.substring(0, 50),
                isUser: isUserMsg,
                isCinematic: isCinematic,
                willBeHidden: willBeHidden,
                fullHistory: safeHistory.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
              });
            }
            
            return (
              <div 
                key={`msg-${msg.id}-${index}`} 
                className={`flex w-full ${isUserMsg ? 'justify-end' : 'justify-start'}`}
                style={willBeHidden ? { opacity: 0, height: 0, overflow: 'hidden' } : {}}
              > 
                <div 
                  className={`
                    max-w-[85%] sm:max-w-[70%] rounded-2xl overflow-hidden backdrop-blur-md shadow-lg text-sm sm:text-base leading-relaxed 
                    ${msg.role === 'user' ? 'bg-white/10 text-white border border-white/20 rounded-br-none' : 'text-white rounded-bl-none'}
                    ${isCinematic ? '!bg-black/60 !border-none !text-lg !font-medium !text-center !w-full !max-w-2xl !mx-auto !rounded-xl' : ''} 
                  `} 
                  style={!isCinematic && msg.role !== 'user' ? { backgroundColor: `${character.colorAccent}33`, borderColor: `${character.colorAccent}4D`, borderWidth: '1px' } : {}}
                >
                  {msg.image ? (
                     <div className="p-1"><img src={msg.image} alt="Generated" className="w-full h-auto rounded-xl shadow-inner" /></div>
                  ) : (
                     <div className={`px-5 py-3 flex flex-col ${isCinematic ? 'items-center' : 'items-start'}`}>
                         <RichTextRenderer text={msg.text} colorAccent={character.colorAccent} />
                         {msg.role === 'model' && !isCinematic && (
                             <div className="mt-2 w-full flex justify-end">
                                 <button 
                                   onClick={() => handlePlayAudio(msg.id, msg.text)}
                                   disabled={audioLoadingId === msg.id}
                                   className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white hover:scale-110 active:scale-95"
                                 >
                                   {audioLoadingId === msg.id ? (
                                     <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                   ) : (
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${playingMessageId === msg.id ? 'text-pink-300 animate-pulse' : ''}`}>
                                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0 2.25 2.25 0 0 1 0 3.182.75.75 0 0 0 0-3.182.75.75 0 0 1 0-1.06Z" />
                                     </svg>
                                   )}
                                 </button>
                             </div>
                         )}
                     </div>
                  )}
                </div>
              </div>
            );
          })}
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
            {isScenarioMode ? renderChoices() : null}
            
            {!isScenarioMode && !isCinematic && (
                <div className="relative flex items-center bg-black/90 rounded-2xl p-2 border border-white/10 animate-fade-in w-full">
                   <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="输入你的消息..." className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 resize-none max-h-24 py-3 px-3 scrollbar-hide text-base" rows={1} disabled={isLoading} />
                   <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="ml-2 !rounded-xl !px-6 !py-2 shadow-lg" style={{ backgroundColor: character.colorAccent }}>发送</Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};