
import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, CustomScenario, AppSettings, StoryNode, StoryOption, UserProfile, JournalEcho } from '../types';
import { geminiService } from '../services/gemini';
import { GenerateContentResponse } from '@google/genai';
import { Button } from './Button';
import { showAlert } from '../utils/dialog';

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
  onUpdateHistory: (msgs: Message[]) => void;
  onUpdateScenarioState?: (nodeId: string) => void;
  onBack: (echo?: JournalEcho) => void;
  participatingCharacters?: Character[]; // 参与剧本的角色列表
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  character, customScenario, history, scenarioState, settings, userProfile, activeJournalEntryId, onUpdateHistory, onUpdateScenarioState, onBack, participatingCharacters 
}) => {
  console.log('========================================');
  console.log('[ChatWindow] 🚀 组件被渲染/更新:', {
    hasCharacter: !!character,
    characterId: character?.id,
    characterName: character?.name,
    hasCustomScenario: !!customScenario,
    customScenarioId: customScenario?.id,
    customScenarioTitle: customScenario?.title,
    hasScenarioState: !!scenarioState,
    scenarioStateValue: scenarioState,
    historyLength: history?.length || 0,
    timestamp: Date.now()
  });
  console.log('========================================');
  
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

  // Determine mode
  const isStoryMode = !!customScenario || character?.id.startsWith('story_');
  const isScenarioMode = !!customScenario; // Specifically for Node-based scenarios
  
  console.log('[ChatWindow] 模式判断:', {
    isStoryMode,
    isScenarioMode,
    characterIdStartsWithStory: character?.id?.startsWith('story_')
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history, isCinematic]); 

  // --- CRITICAL FIX: Reset Session on Mount ---
  // This ensures that when we enter a chat, the Gemini Service clears any stale cache 
  // and rebuilds the context from the passed 'history' prop.
  useEffect(() => {
    if (character) {
        geminiService.resetSession(character.id);
    }
  }, [character.id]);

  useEffect(() => {
    if (!character) return;

    console.log('[ChatWindow] 初始化检查:', {
      historyLength: history.length,
      hasCustomScenario: !!customScenario,
      hasScenarioState: !!scenarioState,
      scenarioStateValue: scenarioState,
      customScenarioStartNodeId: customScenario?.startNodeId,
      customScenarioNodes: customScenario ? Object.keys(customScenario.nodes || {}) : []
    });

    if (history.length === 0) {
      if (customScenario && onUpdateScenarioState) {
          // Scenario Mode: 确保 scenarioState 已初始化
          let targetNodeId = scenarioState?.currentNodeId;
          
          // 如果 scenarioState 未初始化或 currentNodeId 无效，使用 startNodeId
          if (!targetNodeId || !customScenario.nodes[targetNodeId]) {
            targetNodeId = customScenario.startNodeId;
            console.log('[ChatWindow] 使用 startNodeId 初始化 scenarioState:', targetNodeId);
            
            // 更新 scenarioState
            if (onUpdateScenarioState) {
              onUpdateScenarioState(targetNodeId);
            }
          }
          
          const startNode = customScenario.nodes[targetNodeId];
          if (startNode) {
            console.log('[ChatWindow] 触发第一个节点:', {
              nodeId: startNode.id,
              nodeTitle: startNode.title,
              hasOptions: !!startNode.options && startNode.options.length > 0
            });
            handleScenarioTransition(startNode, null);
          } else {
            console.error('[ChatWindow] 找不到起始节点:', {
              targetNodeId,
              availableNodes: Object.keys(customScenario.nodes)
            });
          }
      } else if (!isStoryMode) {
        // Normal Mode
        onUpdateHistory([{ id: 'init', role: 'model', text: character.firstMessage, timestamp: Date.now() }]);
      } else if (isStoryMode && !customScenario) {
        // Main Story Mode
        onUpdateHistory([{ id: 'init_story', role: 'model', text: character.firstMessage, timestamp: Date.now() }]);
      }
    }
  }, [character?.id, customScenario?.id]);

  useEffect(() => {
    if (!isStoryMode || !settings.autoGenerateStoryScenes) return;
    
    const lastMsg = history[history.length - 1];
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
    
    let currentHistory = [...history];
    if (choiceText) {
       const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: choiceText, timestamp: Date.now() };
       currentHistory.push(userMsg);
       onUpdateHistory(currentHistory);
    }

    // 使用传入的参与角色信息，如果没有则尝试从 customScenario 中获取
    const charsToUse = participatingCharacters && participatingCharacters.length > 0 
        ? participatingCharacters 
        : undefined;

    try {
       const stream = await geminiService.generateStoryBeatStream(node, currentHistory, choiceText, userProfile, charsToUse);
       let fullResponseText = '';
       let firstChunk = true;
       for await (const chunk of stream) {
         const chunkText = (chunk as GenerateContentResponse).text;
         if (chunkText) {
           fullResponseText += chunkText;
           const newMsg = { id: tempBotId, role: 'model' as const, text: fullResponseText, timestamp: Date.now() };
           if (firstChunk) {
               currentHistory = [...currentHistory, newMsg];
               firstChunk = false;
           } else {
               currentHistory = [...currentHistory.slice(0, -1), newMsg];
           }
           onUpdateHistory(currentHistory);
         }
       }
       
      // 更新场景状态到当前节点
      if (onUpdateScenarioState) {
        console.log('[ChatWindow] 调用 onUpdateScenarioState 更新节点:', {
          newNodeId: node.id,
          nodeTitle: node.title,
          hasOptions: !!node.options && node.options.length > 0
        });
        onUpdateScenarioState(node.id);
      } else {
        console.warn('[ChatWindow] onUpdateScenarioState 未定义，无法更新状态');
      }
       
       // 重要：如果当前节点有选项，应该停下来等待用户选择，而不是自动继续
       // 节点处理完成，等待用户选择（如果有选项的话）
       // renderChoices 函数会根据 scenarioState.currentNodeId 和 node.options 来显示选项
       
    } catch (e) {
        console.error("Scenario generation failed", e);
        onUpdateHistory([...currentHistory, {id: tempBotId, role: 'model', text: "【系统错误：剧本生成失败，请稍后重试】", timestamp: Date.now()}]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOptionClick = (optionId: string) => {
      console.log('========================================');
      console.log('[ChatWindow] 🟢🟢🟢 handleOptionClick 被调用:', { 
        optionId, 
        customScenario: !!customScenario, 
        scenarioState,
        isLoading,
        timestamp: Date.now(),
        callStack: new Error().stack
      });
      console.log('========================================');
      
      // 如果正在加载，阻止处理
      if (isLoading) {
          console.warn('[ChatWindow] handleOptionClick 被阻止 - 正在加载中');
          return;
      }
      
      if (!customScenario || !scenarioState) {
          console.error('[ChatWindow] ❌ 缺少 customScenario 或 scenarioState:', {
            hasCustomScenario: !!customScenario,
            hasScenarioState: !!scenarioState,
            scenarioStateValue: scenarioState
          });
          return;
      }
      
      const currentNodeId = scenarioState.currentNodeId;
      if (!currentNodeId) {
          console.error('[ChatWindow] ❌ scenarioState.currentNodeId 为空');
          return;
      }
      
      const currentNode = customScenario.nodes[currentNodeId];
      if (!currentNode) {
          console.error('[ChatWindow] ❌ 找不到当前节点:', {
            currentNodeId,
            availableNodes: Object.keys(customScenario.nodes),
            nodesData: customScenario.nodes
          });
          return;
      }
      
      console.log('[ChatWindow] 📍 当前节点信息:', {
        nodeId: currentNode.id,
        nodeTitle: currentNode.title,
        optionsCount: currentNode.options?.length || 0,
        options: currentNode.options?.map(o => ({ id: o.id, text: o.text, nextNodeId: o.nextNodeId }))
      });
      
      const option = currentNode.options.find(o => o.id === optionId);
      if (!option) {
          console.error('[ChatWindow] ❌ 找不到选项:', {
            optionId,
            availableOptions: currentNode.options.map(o => ({ id: o.id, text: o.text }))
          });
          return;
      }
      
      console.log('[ChatWindow] ✅ 找到选项:', { 
        optionId, 
        text: option.text, 
        nextNodeId: option.nextNodeId,
        optionData: option
      });
      
      if (!option.nextNodeId) {
          console.warn('[ChatWindow] ⚠️ 选项没有 nextNodeId（故事可能结束）:', option);
          return;
      }
      
      const nextNode = customScenario.nodes[option.nextNodeId];
      if (!nextNode) {
          console.error('[ChatWindow] ❌ 找不到下一个节点:', {
            nextNodeId: option.nextNodeId,
            availableNodes: Object.keys(customScenario.nodes),
            allNodeIds: Object.keys(customScenario.nodes)
          });
          return;
      }
      
      console.log('[ChatWindow] 🚀 准备跳转到节点:', {
        nextNodeId: nextNode.id,
        nextNodeTitle: nextNode.title,
        choiceText: option.text || optionId
      });
      
      // 调用场景转换
      handleScenarioTransition(nextNode, option.text || optionId);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isScenarioMode) return;
    const userText = input.trim();
    setInput('');
    setIsLoading(true);
    
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() };
    let currentHistory = [...history, userMsg];
    onUpdateHistory(currentHistory);
    
    let fullResponseText = '';
    const tempBotId = `bot_${Date.now()}`;
    
    try {
      // Pass userProfile correctly
      const stream = await geminiService.sendMessageStream(character, currentHistory, userText, userProfile);
      let firstChunk = true;
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponseText += chunkText;
          const msg = { id: tempBotId, role: 'model' as const, text: fullResponseText, timestamp: Date.now() };
          if (firstChunk) {
            currentHistory = [...currentHistory, msg];
            firstChunk = false;
          } else {
            currentHistory = [...currentHistory.slice(0, -1), msg];
          }
          onUpdateHistory(currentHistory);
        }
      }
    } catch (error) { 
        console.error("Gemini Error:", error);
        onUpdateHistory([...currentHistory, {id: tempBotId, role: 'model', text: "【系统错误：连接失败，请稍后重试】", timestamp: Date.now()}]);
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCrystalizeMemory = async () => {
    if (!activeJournalEntryId || history.length < 2 || isCrystalizing) return;
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
    console.log('========================================');
    console.log('[ChatWindow] 🎯 renderChoices 函数被调用!');
    console.log('[ChatWindow] renderChoices 参数检查:', {
      hasCustomScenario: !!customScenario,
      hasScenarioState: !!scenarioState,
      isLoading,
      scenarioStateValue: scenarioState,
      customScenarioNodes: customScenario ? Object.keys(customScenario.nodes || {}) : [],
      customScenarioStartNodeId: customScenario?.startNodeId,
      customScenarioId: customScenario?.id,
      customScenarioTitle: customScenario?.title
    });
    console.log('========================================');

    if (!customScenario || !scenarioState || isLoading) {
      console.log('[ChatWindow] renderChoices 返回 null - 缺少必要数据或正在加载');
      return null;
    }

    const currentNodeId = scenarioState.currentNodeId;
    if (!currentNodeId) {
      console.warn('[ChatWindow] renderChoices - scenarioState.currentNodeId 为空');
      return null;
    }

    const currentNode = customScenario.nodes[currentNodeId];
    if (!currentNode) {
      console.warn('[ChatWindow] renderChoices - 找不到当前节点:', {
        currentNodeId,
        availableNodes: Object.keys(customScenario.nodes),
        nodesData: customScenario.nodes
      });
      return null;
    }

    // 检查 options 是否存在且是数组
    if (!currentNode.options) {
      console.warn('[ChatWindow] renderChoices - 节点没有 options 字段:', {
        nodeId: currentNode.id,
        nodeTitle: currentNode.title,
        nodeData: currentNode
      });
      return null;
    }

    if (!Array.isArray(currentNode.options)) {
      console.warn('[ChatWindow] renderChoices - options 不是数组:', {
        nodeId: currentNode.id,
        optionsType: typeof currentNode.options,
        optionsValue: currentNode.options
      });
      return null;
    }

    if (currentNode.options.length === 0) {
      console.log('[ChatWindow] renderChoices - 节点没有选项（这是正常的，表示故事结束）');
      return null;
    }

    // 验证每个选项的结构，并确保每个选项都有唯一的 id
    const validOptions = currentNode.options
      .map((opt, index) => {
        // 如果选项没有 id，生成一个唯一的 id
        if (!opt || typeof opt !== 'object') {
          console.warn('[ChatWindow] renderChoices - 发现无效选项:', opt);
          return null;
        }
        if (!opt.id) {
          console.warn('[ChatWindow] renderChoices - 选项缺少 id，生成临时 id:', { opt, index });
          return { ...opt, id: `temp-option-${currentNode.id}-${index}` };
        }
        return opt;
      })
      .filter((opt): opt is NonNullable<typeof opt> => opt !== null);

    if (validOptions.length === 0) {
      console.warn('[ChatWindow] renderChoices - 没有有效的选项');
      return null;
    }

    // 调试日志
    console.log('[ChatWindow] ✅ 渲染选择按钮:', {
      currentNodeId: currentNode.id,
      currentNodeTitle: currentNode.title,
      optionsCount: validOptions.length,
      options: validOptions.map(opt => ({ id: opt.id, text: opt.text || '(无文本)', nextNodeId: opt.nextNodeId }))
    });

    console.log('[ChatWindow] 🎨 准备渲染按钮容器，validOptions 数量:', validOptions.length);

    return (
        <div 
          className={`flex flex-wrap gap-3 justify-center mt-4 animate-fade-in ${isCinematic ? 'mb-10' : ''}`}
          style={{ 
            zIndex: 999, // 提高 z-index 确保按钮容器在最上层
            position: 'relative',
            pointerEvents: 'auto', // 确保容器可以接收事件
            backgroundColor: 'rgba(255, 0, 0, 0.1)' // 临时添加背景色用于调试
          }}
          onClick={(e) => {
            console.log('[ChatWindow] 📦 按钮容器 onClick 事件:', {
              target: e.target,
              currentTarget: e.currentTarget,
              timestamp: Date.now()
            });
          }}
          onMouseEnter={() => {
            console.log('[ChatWindow] 🖱️ 鼠标进入按钮容器');
          }}
          onMouseEnter={() => {
            console.log('[ChatWindow] 🖱️ 鼠标进入按钮容器');
          }}
        >
            {validOptions.map((opt, index) => {
              console.log('[ChatWindow] 🔘 正在渲染按钮:', {
                index,
                optionId: opt.id,
                buttonText: opt.text || opt.id || '选择'
              });
              // 确保文本存在，提供 fallback
              const buttonText = opt.text || opt.id || '选择';
              
              // 检查按钮是否应该被禁用
              const isButtonDisabled = isLoading;
              
              // 确保 key 的唯一性：使用 opt.id，如果不存在则使用 index
              const uniqueKey = opt.id || `option-${index}`;
              
              console.log('[ChatWindow] 🔘 渲染按钮详情:', {
                index,
                optionId: opt.id,
                uniqueKey,
                buttonText,
                isDisabled: isButtonDisabled,
                isLoading,
                nextNodeId: opt.nextNodeId,
                willRender: true
              });
              
              return (
                <button
                  key={uniqueKey}
                  id={`choice-button-${uniqueKey}`}
                  data-option-id={opt.id}
                  data-index={index}
                  onClick={(e) => {
                    console.log('[ChatWindow] 🔵🔵🔵 onClick 事件触发:', {
                      optionId: opt.id,
                      uniqueKey,
                      buttonText,
                      isLoading,
                      isButtonDisabled,
                      timestamp: Date.now(),
                      eventType: e.type,
                      target: e.target,
                      currentTarget: e.currentTarget
                    });
                    
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 如果正在加载，阻止点击
                    if (isLoading) {
                      console.warn('[ChatWindow] ⚠️ 按钮点击被阻止 - 正在加载中');
                      return;
                    }
                    
                    if (isButtonDisabled) {
                      console.warn('[ChatWindow] ⚠️ 按钮点击被阻止 - 按钮被禁用');
                      return;
                    }
                    
                    console.log('[ChatWindow] ✅ 准备调用 handleOptionClick');
                    
                    // 调用处理函数（handleScenarioTransition 内部会设置 loading 状态）
                    try {
                      console.log('[ChatWindow] 🚀 调用 handleOptionClick，参数:', opt.id);
                      const result = handleOptionClick(opt.id);
                      console.log('[ChatWindow] handleOptionClick 返回:', result);
                    } catch (error) {
                      console.error('[ChatWindow] ❌ 处理选项点击时出错:', {
                        error,
                        errorMessage: error instanceof Error ? error.message : String(error),
                        errorStack: error instanceof Error ? error.stack : undefined,
                        optionId: opt.id
                      });
                    }
                  }}
                  onMouseDown={(e) => {
                    console.log('[ChatWindow] 🖱️ onMouseDown 事件:', {
                      optionId: opt.id,
                      button: e.button,
                      timestamp: Date.now()
                    });
                  }}
                  onMouseUp={(e) => {
                    console.log('[ChatWindow] 🖱️ onMouseUp 事件:', {
                      optionId: opt.id,
                      button: e.button,
                      timestamp: Date.now()
                    });
                  }}
                  onTouchStart={(e) => {
                    console.log('[ChatWindow] 📱 onTouchStart 事件:', {
                      optionId: opt.id,
                      touches: e.touches.length,
                      timestamp: Date.now()
                    });
                  }}
                  onTouchEnd={(e) => {
                    console.log('[ChatWindow] 📱 onTouchEnd 事件:', {
                      optionId: opt.id,
                      touches: e.touches.length,
                      timestamp: Date.now()
                    });
                  }}
                  className="bg-indigo-600/80 backdrop-blur-md hover:bg-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg border border-indigo-400/50 transition-all active:scale-95"
                  style={{
                    // 添加内联样式作为 fallback，确保按钮可见
                    backgroundColor: isButtonDisabled ? 'rgba(79, 70, 229, 0.4)' : 'rgba(79, 70, 229, 0.8)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                    zIndex: 999, // 提高 z-index 确保按钮在最上层
                    position: 'relative',
                    minWidth: '120px',
                    fontSize: '16px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    opacity: isButtonDisabled ? 0.6 : 1,
                    pointerEvents: isButtonDisabled ? 'none' : 'auto',
                    // 确保按钮可以接收点击事件
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
    console.warn('[ChatWindow] ⚠️ character 为空，组件不渲染');
    return null;
  }

  console.log('[ChatWindow] ✅ character 存在，准备渲染组件:', {
    characterId: character.id,
    characterName: character.name
  });

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
          {history.length === 0 && isLoading && isStoryMode && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 border-4 border-t-indigo-500 border-white/20 rounded-full animate-spin" />
                  <p className="text-indigo-300 font-bold text-lg animate-pulse">正在生成故事...</p>
              </div>
          )}
          {history.map((msg, index) => (
              <div key={`msg-${msg.id}-${index}`} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${isCinematic && msg.role === 'user' ? 'opacity-0 h-0 overflow-hidden' : ''}`}> 
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
          ))}
          {isLoading && history.length > 0 && (<div className="flex justify-start w-full"><div className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border border-white/10 flex items-center space-x-2" style={{ backgroundColor: `${character.colorAccent}1A` }}><div className="w-2 h-2 bg-white/70 rounded-full typing-dot" /><div className="w-2 h-2 bg-white/70 rounded-full typing-dot" /><div className="w-2 h-2 bg-white/70 rounded-full typing-dot" /></div></div>)}
          <div ref={messagesEndRef} />
        </div>

        <div 
          className="px-4 sm:px-8 mt-2 max-w-4xl mx-auto w-full pb-6 min-h-[80px]"
          style={{ 
            zIndex: 1000, // 提高 z-index
            position: 'relative',
            pointerEvents: 'auto'
          }}
        >
            {(() => {
              console.log('[ChatWindow] 🔍 检查渲染模式:', {
                isScenarioMode,
                hasCustomScenario: !!customScenario,
                customScenarioId: customScenario?.id,
                willRenderChoices: isScenarioMode
              });
              
              if (isScenarioMode) {
                console.log('[ChatWindow] 🎯 isScenarioMode 为 true，准备调用 renderChoices');
                const choices = renderChoices();
                console.log('[ChatWindow] 🎯 renderChoices 返回:', {
                  hasContent: !!choices,
                  isNull: choices === null,
                  isUndefined: choices === undefined,
                  type: typeof choices
                });
                return choices;
              } else {
                console.log('[ChatWindow] 📝 isScenarioMode 为 false，渲染输入框');
                return null;
              }
            })()}
            
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