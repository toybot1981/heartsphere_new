/**
 * 邮件检查 Hook
 * 检查用户离线时间，并在需要时生成 Chronos 邮件
 */

import { useEffect, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { aiService } from '../services/ai';
import { Character, Mail, WorldScene } from '../types';
import { WORLD_SCENES } from '../constants';

interface UseMailCheckProps {
  isLoaded: boolean;
  showInitializationWizard: boolean;
}

export const useMailCheck = ({ isLoaded, showInitializationWizard }: UseMailCheckProps) => {
  const { state: gameState, dispatch } = useGameState();
  const hasCheckedMail = useRef(false);
  const lastJournalIdsRef = useRef<Set<string>>(new Set()); // 记录上次检查时的日记ID集合
  const lastJournalCheckTimeRef = useRef(Date.now()); // 记录上次检查日记的时间

  // 计算当前场景列表（与 App.tsx 中的逻辑保持一致）
  const currentScenes: WorldScene[] = (() => {
    // 如果正在显示初始化向导，返回空数组，避免显示游客预置场景
    if (showInitializationWizard) {
      return [];
    }
    
    // 强制从数据库获取：登录用户使用 userWorldScenes（从数据库加载），游客使用预置场景
    if (gameState.userProfile && !gameState.userProfile.isGuest) {
      // 登录用户：使用从数据库获取的用户专属场景（userWorldScenes 现在只从数据库获取）
      // + 自定义场景（排除已在userWorldScenes中的）
      const userWorldScenes = gameState.userWorldScenes || []; // 如果为空，说明还在加载中
      const userWorldSceneIds = new Set(userWorldScenes.map(s => s.id));
      const customScenesOnly = gameState.customScenes.filter(s => !userWorldSceneIds.has(s.id));
      return [...userWorldScenes, ...customScenesOnly];
    } else {
      // 游客：使用本地预置场景 + 自定义场景
      return [...WORLD_SCENES, ...gameState.customScenes];
    }
  })();

  // Mail check - 检查离线时长或新日记
  useEffect(() => {
    if (!isLoaded || !gameState.userProfile) {
      return;
    }
    
    const checkMail = async () => {
      const now = Date.now();
      // 从localStorage获取上次登录时间，避免被状态保存覆盖
      const savedLastLoginTime = localStorage.getItem('lastLoginTime');
      const lastLoginTime = savedLastLoginTime ? parseInt(savedLastLoginTime, 10) : gameState.lastLoginTime;
      const offlineDuration = now - lastLoginTime;
      const OFFLINE_THRESHOLD = 60 * 1000; // 离线60秒阈值
      
      // 检查是否有新日记（通过时间戳检测最近创建的日记，更准确）
      // 确保 lastJournalIdsRef.current 是 Set 对象
      if (!(lastJournalIdsRef.current instanceof Set)) {
        lastJournalIdsRef.current = new Set();
      }
      
      // 方法1：通过ID对比检测新日记
      const currentJournalIds = new Set(gameState.journalEntries.map(e => e.id));
      const newJournalIds = Array.from(currentJournalIds).filter(id => !lastJournalIdsRef.current.has(id));
      
      // 方法2：通过时间戳检测最近创建的日记（5分钟内创建的视为新日记）
      const RECENT_JOURNAL_THRESHOLD = 5 * 60 * 1000; // 5分钟
      const recentJournals = gameState.journalEntries.filter(entry => {
        const entryTime = entry.timestamp || 0;
        return (now - entryTime) < RECENT_JOURNAL_THRESHOLD;
      });
      
      // 如果通过ID检测到新日记，或者有最近创建的日记，都认为有新日记
      const hasNewJournalById = newJournalIds.length > 0;
      const hasRecentJournal = recentJournals.length > 0;
      const hasNewJournal = hasNewJournalById || hasRecentJournal;
      const timeSinceLastJournalCheck = now - lastJournalCheckTimeRef.current;
      const JOURNAL_CHECK_INTERVAL = 30 * 1000; // 每30秒最多检查一次新日记触发

      console.log('[useMailCheck] 检查邮件 - 当前时间:', new Date(now).toLocaleString());
      console.log('[useMailCheck] 上次登录时间:', new Date(lastLoginTime).toLocaleString());
      console.log('[useMailCheck] 离线时长:', Math.floor(offlineDuration / 1000), '秒, 阈值:', OFFLINE_THRESHOLD / 1000, '秒');
      console.log('[useMailCheck] 日记数量:', gameState.journalEntries.length, '上次ID集合大小:', lastJournalIdsRef.current.size);
      console.log('[useMailCheck] 新日记ID:', newJournalIds, '最近日记数量:', recentJournals.length, '有新日记:', hasNewJournal);

      // 更新日记ID集合和检查时间（无论是否检测到新日记，都更新ID集合，避免下次误判）
      lastJournalIdsRef.current = new Set(currentJournalIds);
      if (hasNewJournal) {
        lastJournalCheckTimeRef.current = now;
        console.log('[useMailCheck] 检测到新日记，更新检查时间');
      }

      // 触发条件：离线时长超过阈值 或 有新日记且距离上次检查超过间隔
      const shouldGenerateMail = offlineDuration > OFFLINE_THRESHOLD || 
                                 (hasNewJournal && timeSinceLastJournalCheck > JOURNAL_CHECK_INTERVAL);

      if (shouldGenerateMail) {
        // 避免重复生成（离线触发只执行一次，新日记触发可以多次）
        if (offlineDuration > OFFLINE_THRESHOLD && hasCheckedMail.current) {
          console.log('[useMailCheck] 离线触发已执行过，跳过');
          return;
        }
        
        if (offlineDuration > OFFLINE_THRESHOLD) {
          hasCheckedMail.current = true;
        }
        const chattedCharIds = Object.keys(gameState.history);
        console.log('[useMailCheck] 已聊过的角色ID:', chattedCharIds);
        
        let candidate: Character | null = null;
        if (chattedCharIds.length > 0) {
          const allScenes = [...currentScenes, ...gameState.customScenes];
          console.log('[useMailCheck] 可用场景数:', allScenes.length);
          for (const scene of allScenes) {
            const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
            const found = sceneChars.find(c => c.id === chattedCharIds[0]);
            if (found) { 
              candidate = found; 
              console.log('[useMailCheck] 找到已聊过的角色:', candidate.name);
              break; 
            }
          }
        }
        if (!candidate && currentScenes.length > 0) {
          // 尝试找到第一个有角色的场景
          for (const scene of currentScenes) {
            if (scene.characters && scene.characters.length > 0) {
              candidate = scene.characters[0];
              console.log('[useMailCheck] 使用场景的第一个角色:', scene.name, candidate.name);
              break;
            }
          }
          if (!candidate) {
            console.warn('[useMailCheck] 所有场景都没有角色');
          }
        }

        if (candidate) {
          console.log('[useMailCheck] 开始生成时间信件，发件人:', candidate.name);
          try {
            const letter = await aiService.generateChronosLetter(candidate, gameState.userProfile!, gameState.journalEntries);
            if (letter) {
              console.log('[useMailCheck] 信件生成成功:', letter.subject);
              // AI生成的信件只显示在界面上，不保存到数据库
              const newMail: Mail = {
                id: `mail_ai_${Date.now()}`, // 使用ai_前缀标识AI生成的信件
                senderId: candidate.id,
                senderName: candidate.name,
                senderAvatarUrl: candidate.avatarUrl,
                subject: letter.subject,
                content: letter.content,
                timestamp: Date.now(),
                isRead: false,
                themeColor: candidate.themeColor,
                type: 'ai_generated' // 标记为AI生成
              };
              dispatch({ type: 'ADD_MAIL', payload: newMail });
              console.log('[useMailCheck] AI生成的信件已添加到信箱（仅显示，不保存到数据库）');
            } else {
              console.warn('[useMailCheck] 信件生成返回null');
            }
          } catch (error) {
            console.error('[useMailCheck] 生成时间信件失败:', error);
          }
        } else {
          console.warn('[useMailCheck] 未找到候选角色，无法生成信件');
        }
      } else {
        console.log('[useMailCheck] 不满足触发条件（离线时间不足且无新日记）');
      }
    };
    checkMail();
  }, [isLoaded, gameState.userProfile, gameState.lastLoginTime, gameState.history, gameState.customScenes, gameState.customCharacters, gameState.journalEntries, currentScenes, dispatch, showInitializationWizard]);
  
  // 初始化时记录日记ID集合
  useEffect(() => {
    if (isLoaded && gameState.userProfile) {
      // 确保是 Set 对象
      lastJournalIdsRef.current = new Set(gameState.journalEntries.map(e => e.id));
      lastJournalCheckTimeRef.current = Date.now();
      console.log('[useMailCheck] 初始化日记ID集合，数量:', lastJournalIdsRef.current.size, 'IDs:', Array.from(lastJournalIdsRef.current));
    }
  }, [isLoaded, gameState.userProfile]);
};




