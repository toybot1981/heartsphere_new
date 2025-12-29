/**
 * 庆祝提供者组件
 * 管理庆祝消息的显示和动画
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GrowthMilestone } from '../../services/growth-system/types/GrowthTypes';
import { CelebrationManager, CelebrationMessage } from '../../services/growth-system/celebration/CelebrationManager';
import { CelebrationAnimation } from './CelebrationAnimation';

interface CelebrationProviderProps {
  userId: number;
  milestones: GrowthMilestone[];
  children: React.ReactNode;
}

export const CelebrationProvider: React.FC<CelebrationProviderProps> = ({
  userId,
  milestones,
  children,
}) => {
  const [celebrationManager] = useState(() => new CelebrationManager(userId));
  const [activeCelebrations, setActiveCelebrations] = useState<CelebrationMessage[]>([]);
  const [previousMilestones, setPreviousMilestones] = useState<Set<string>>(new Set());

  // 检测新的里程碑
  useEffect(() => {
    const checkNewMilestones = async () => {
      // 找出新的里程碑
      const newMilestones = milestones.filter(
        (m) => !previousMilestones.has(m.id)
      );

      if (newMilestones.length > 0) {
        // 更新已处理的里程碑
        setPreviousMilestones((prev) => {
          const newSet = new Set(prev);
          newMilestones.forEach((m) => newSet.add(m.id));
          return newSet;
        });

        // 生成庆祝消息
        const celebrations = await celebrationManager.checkAndCelebrate(newMilestones);
        if (celebrations.length > 0) {
          // 依次显示庆祝动画（避免同时显示多个）
          for (let i = 0; i < celebrations.length; i++) {
            setTimeout(() => {
              setActiveCelebrations((prev) => [...prev, celebrations[i]]);
            }, i * (celebrations[i].duration + 500)); // 每个庆祝之间间隔500ms
          }
        }
      }
    };

    checkNewMilestones();
  }, [milestones, celebrationManager, previousMilestones]);

  // 处理庆祝完成
  const handleCelebrationComplete = useCallback((celebrationId: string) => {
    setActiveCelebrations((prev) => prev.filter((c) => c.id !== celebrationId));
  }, []);

  return (
    <>
      {children}
      {activeCelebrations.map((celebration) => (
        <CelebrationAnimation
          key={celebration.id}
          celebration={celebration}
          onComplete={() => handleCelebrationComplete(celebration.id)}
        />
      ))}
    </>
  );
};

