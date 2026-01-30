/**
 * 角色关系面板组件
 * 展示角色与用户的关系阶段、里程碑等信息
 */

import React, { useEffect, useState } from 'react';
import { memoryApi } from '../../services/api/memory';
import { getToken } from '../../services/api/base/tokenStorage';
import { logger } from '../../utils/logger';

interface CharacterRelationshipPanelProps {
  characterId: number;
  userId: number | string; // 支持数字或字符串，内部会转换为数字
  characterName?: string;
}

interface RelationshipMilestone {
  id: number;
  milestoneType: string;
  fromStage: string;
  toStage: string;
  title: string;
  description: string;
  createdAt: string;
}

interface RelationshipInfo {
  characterId: number;
  userId: number;
  milestones: RelationshipMilestone[];
  milestoneCount: number;
  currentStage: string;
  lastTransitionAt?: string;
}

export const CharacterRelationshipPanel: React.FC<CharacterRelationshipPanelProps> = ({
  characterId,
  userId,
  characterName = '角色',
}) => {
  const [info, setInfo] = useState<RelationshipInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRelationshipInfo();
  }, [characterId, userId]);

  const loadRelationshipInfo = async () => {
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

      const data = await memoryApi.getRelationshipInfo(characterId, userIdNum, token);
      setInfo(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      logger.error('[CharacterRelationshipPanel] 加载关系信息失败', { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }

  if (error || !info) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#f44336' }}>
        {error || '无法加载数据'}
      </div>
    );
  }

  const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      STRANGER: '陌生人',
      FRIEND: '朋友',
      CLOSE_FRIEND: '挚友',
      MENTOR: '导师',
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string): string => {
    const colors: Record<string, string> = {
      STRANGER: '#999',
      FRIEND: '#4CAF50',
      CLOSE_FRIEND: '#2196F3',
      MENTOR: '#FF9800',
    };
    return colors[stage] || '#999';
  };

  const getMilestoneTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      STAGE_TRANSITION: '阶段转换',
      EMOTIONAL_CONNECTION: '情感连接',
      SHARED_EXPERIENCE: '共同经历',
    };
    return labels[type] || type;
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>关系发展</h3>

      {/* 当前关系阶段 */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: getStageColor(info.currentStage),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {getStageLabel(info.currentStage).charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {getStageLabel(info.currentStage)}
            </div>
            {info.lastTransitionAt && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                最后更新: {new Date(info.lastTransitionAt).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 里程碑统计 */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>里程碑总数:</strong> {info.milestoneCount}
      </div>

      {/* 里程碑列表 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {info.milestones && info.milestones.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {info.milestones.map((milestone) => (
              <div
                key={milestone.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong>{milestone.title}</strong>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                      {getMilestoneTypeLabel(milestone.milestoneType)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(milestone.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                {milestone.fromStage && milestone.toStage && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {getStageLabel(milestone.fromStage)} → {getStageLabel(milestone.toStage)}
                  </div>
                )}
                {milestone.description && (
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {milestone.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
            暂无关系里程碑
          </div>
        )}
      </div>
    </div>
  );
};
