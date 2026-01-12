/**
 * 邮件检查 Hook
 * 在需要时生成 Chronos 邮件
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

  // Mail check - 生成时间信件
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
      const OFFLINE_THRESHOLD = 60 * 1000; // 60秒阈值

      // 触发条件：基于离线时长
      const shouldGenerateMail = offlineDuration > OFFLINE_THRESHOLD;

        if (shouldGenerateMail) {
        // 避免重复生成
        if (offlineDuration > OFFLINE_THRESHOLD && hasCheckedMail.current) {
          return;
        }
        
        if (offlineDuration > OFFLINE_THRESHOLD) {
          hasCheckedMail.current = true;
        }
        const chattedCharIds = Object.keys(gameState.history);
        
        let candidate: Character | null = null;
        if (chattedCharIds.length > 0) {
          const allScenes = [...currentScenes, ...gameState.customScenes];
          for (const scene of allScenes) {
            const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
            const found = sceneChars.find(c => c.id === chattedCharIds[0]);
            if (found) { 
              candidate = found; 
              break; 
            }
          }
        }
        if (!candidate && currentScenes.length > 0) {
          // 尝试找到第一个有角色的场景
          for (const scene of currentScenes) {
            if (scene.characters && scene.characters.length > 0) {
              candidate = scene.characters[0];
              break;
            }
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
      }
    };
    checkMail();
  }, [isLoaded, gameState.userProfile, gameState.lastLoginTime, gameState.history, gameState.customScenes, gameState.customCharacters, currentScenes, dispatch, showInitializationWizard]);
};




