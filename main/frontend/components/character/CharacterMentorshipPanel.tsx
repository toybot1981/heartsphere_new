/**
 * 角色导师能力面板组件
 * 展示角色的导师能力、指导会话等信息
 */

import React, { useEffect, useState } from 'react';
import { memoryApi } from '../../services/api/memory';
import { getToken } from '../../services/api/base/tokenStorage';
import { logger } from '../../utils/logger';

interface CharacterMentorshipPanelProps {
  characterId: number;
  userId: number;
  characterName?: string;
}

interface MentorshipCapabilities {
  characterId: number;
  totalScore: number;
  knowledgeScore: number;
  guidanceScore: number;
  totalAssets: number;
  approvedAssets: number;
  averageTrustScore: number;
  capabilityLevel: string;
}

interface MentorshipSession {
  id: number;
  sessionType: string;
  title: string;
  content: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  effectivenessScore?: number;
}

export const CharacterMentorshipPanel: React.FC<CharacterMentorshipPanelProps> = ({
  characterId,
  userId,
  characterName = '角色',
}) => {
  const [capabilities, setCapabilities] = useState<MentorshipCapabilities | null>(null);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [characterId, userId, showActiveOnly]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('未登录');
        return;
      }

      const [capabilitiesData, sessionsData] = await Promise.all([
        memoryApi.getMentorshipCapabilities(characterId, token),
        memoryApi.getMentorshipSessions(characterId, userId, showActiveOnly, token),
      ]);

      setCapabilities(capabilitiesData);
      setSessions(sessionsData);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      logger.error('[CharacterMentorshipPanel] 加载导师信息失败', { error: message });
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

  if (error) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#f44336' }}>
        {error}
      </div>
    );
  }

  const getCapabilityLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
      NOVICE: '新手',
      BEGINNER: '初级',
      INTERMEDIATE: '中级',
      ADVANCED: '高级',
      EXPERT: '专家',
    };
    return labels[level] || level;
  };

  const getCapabilityLevelColor = (level: string): string => {
    const colors: Record<string, string> = {
      NOVICE: '#999',
      BEGINNER: '#4CAF50',
      INTERMEDIATE: '#2196F3',
      ADVANCED: '#FF9800',
      EXPERT: '#9C27B0',
    };
    return colors[level] || '#999';
  };

  const getSessionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      ACTIVE_GUIDANCE: '主动指导',
      PERSONALIZED_EDUCATION: '个性化教育',
      GROWTH_PLANNING: '成长规划',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      ACTIVE: '进行中',
      COMPLETED: '已完成',
      ARCHIVED: '已归档',
    };
    return labels[status] || status;
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>导师能力</h3>

      {/* 能力评估 */}
      {capabilities && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: getCapabilityLevelColor(capabilities.capabilityLevel),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              {capabilities.totalScore}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {getCapabilityLevelLabel(capabilities.capabilityLevel)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                综合评分: {capabilities.totalScore}/100
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div>
              <strong>知识分数:</strong> {capabilities.knowledgeScore}/100
            </div>
            <div>
              <strong>指导分数:</strong> {capabilities.guidanceScore}/100
            </div>
            <div>
              <strong>知识资产:</strong> {capabilities.approvedAssets}/{capabilities.totalAssets}
            </div>
            <div>
              <strong>平均信任度:</strong> {capabilities.averageTrustScore.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* 指导会话 */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>指导会话</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
          />
          <span style={{ fontSize: '14px' }}>仅显示进行中</span>
        </label>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {sessions && sessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong>{session.title}</strong>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                      {getSessionTypeLabel(session.sessionType)}
                    </span>
                    <span
                      style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        backgroundColor: session.status === 'ACTIVE' ? '#4CAF50' : '#999',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {getStatusLabel(session.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(session.startedAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                {session.content && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {session.content.length > 100
                      ? session.content.substring(0, 100) + '...'
                      : session.content}
                  </div>
                )}
                {session.effectivenessScore !== undefined && (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    效果评分: {session.effectivenessScore}/100
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
            暂无指导会话
          </div>
        )}
      </div>
    </div>
  );
};
