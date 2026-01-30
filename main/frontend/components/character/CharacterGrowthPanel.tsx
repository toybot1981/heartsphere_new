/**
 * 角色成长面板组件
 * 展示角色的成长轨迹、自我反思、能力提升等信息
 */

import React, { useEffect, useState } from 'react';
import { memoryApi } from '../../services/api/memory';
import { getToken } from '../../services/api/base/tokenStorage';
import { logger } from '../../utils/logger';

interface CharacterGrowthPanelProps {
  characterId: number;
  userId: number | string; // 支持数字或字符串，内部会转换为数字
  characterName?: string;
}

interface GrowthEvent {
  id: number;
  eventType: string;
  eventCategory: string;
  title: string;
  description: string;
  createdAt: string;
}

interface GrowthTrajectory {
  characterId: number;
  userId: number;
  totalEvents: number;
  events: GrowthEvent[];
  eventTypeStats: Record<string, number>;
}

export const CharacterGrowthPanel: React.FC<CharacterGrowthPanelProps> = ({
  characterId,
  userId,
  characterName = '角色',
}) => {
  const [trajectory, setTrajectory] = useState<GrowthTrajectory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrajectory();
  }, [characterId, userId]);

  const loadTrajectory = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('未登录');
        return;
      }

      // 确保 userId 是有效的数字
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNum) || userIdNum <= 0) {
        setError(`无效的用户ID: ${userId}`);
        return;
      }

      const data = await memoryApi.getGrowthTrajectory(characterId, userIdNum, token);
      setTrajectory(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      logger.error('[CharacterGrowthPanel] 加载成长轨迹失败', { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReflection = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert('未登录');
        return;
      }

      // 确保 userId 是有效的数字
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNum) || userIdNum <= 0) {
        alert(`无效的用户ID: ${userId}`);
        return;
      }

      await memoryApi.triggerSelfReflection(characterId, userIdNum, 'MANUAL', token);
      alert('自我反思已触发');
      loadTrajectory(); // 重新加载
    } catch (err) {
      logger.error('[CharacterGrowthPanel] 触发自我反思失败', { error: err });
      alert('触发自我反思失败');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  if (error || !trajectory) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#f44336' }}>
        {error || '无法加载数据'}
      </div>
    );
  }

  const getEventTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      LEARNING: '学习',
      REFLECTION: '反思',
      ABILITY_UPGRADE: '能力提升',
      RELATIONSHIP_PROGRESS: '关系进展',
    };
    return labels[type] || type;
  };

  const getEventCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      SELF_GROWTH: '自我成长',
      COMPANIONSHIP: '挚友能力',
      MENTORSHIP: '导师能力',
    };
    return labels[category] || category;
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>成长轨迹</h3>
        <button
          onClick={handleTriggerReflection}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          触发自我反思
        </button>
      </div>

      {/* 统计信息 */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <strong>总事件数:</strong> {trajectory.totalEvents}
          </div>
          {Object.entries(trajectory.eventTypeStats).map(([type, count]) => (
            <div key={type}>
              <strong>{getEventTypeLabel(type)}:</strong> {count}
            </div>
          ))}
        </div>
      </div>

      {/* 成长事件列表 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {trajectory.events && trajectory.events.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trajectory.events.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong>{event.title}</strong>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                      {getEventTypeLabel(event.eventType)}
                    </span>
                    {event.eventCategory && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#999' }}>
                        [{getEventCategoryLabel(event.eventCategory)}]
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(event.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                {event.description && (
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
            暂无成长事件
          </div>
        )}
      </div>
    </div>
  );
};
