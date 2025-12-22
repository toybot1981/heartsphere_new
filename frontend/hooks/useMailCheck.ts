/**
 * 邮件检查 Hook
 * 检查用户离线时间，并在需要时生成 Chronos 邮件
 */

import { useEffect, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { geminiService } from '../services/gemini';
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

  // Mail check
  useEffect(() => {
    if (!isLoaded || !gameState.userProfile || hasCheckedMail.current) return;
    const checkMail = async () => {
      hasCheckedMail.current = true;
      const now = Date.now();
      const offlineDuration = now - gameState.lastLoginTime;
      const THRESHOLD = 60 * 1000; 

      if (offlineDuration > THRESHOLD) {
        const chattedCharIds = Object.keys(gameState.history);
        let candidate: Character | null = null;
        if (chattedCharIds.length > 0) {
          const allScenes = [...currentScenes, ...gameState.customScenes];
          for (const scene of allScenes) {
            const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
            const found = sceneChars.find(c => c.id === chattedCharIds[0]);
            if (found) { candidate = found; break; }
          }
        }
        if (!candidate && currentScenes.length > 0) candidate = currentScenes[0].characters[0]; 

        if (candidate) {
          const letter = await geminiService.generateChronosLetter(candidate, gameState.userProfile!, gameState.journalEntries);
          if (letter) {
            const newMail: Mail = {
              id: `mail_${Date.now()}`,
              senderId: candidate.id,
              senderName: candidate.name,
              senderAvatarUrl: candidate.avatarUrl,
              subject: letter.subject,
              content: letter.content,
              timestamp: Date.now(),
              isRead: false,
              themeColor: candidate.themeColor
            };
            dispatch({ type: 'ADD_MAIL', payload: newMail });
          }
        }
      }
    };
    checkMail();
  }, [isLoaded, gameState.userProfile, gameState.lastLoginTime, gameState.history, gameState.customScenes, gameState.customCharacters, currentScenes, dispatch, showInitializationWizard]);
};




