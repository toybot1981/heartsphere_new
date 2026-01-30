/**
 * 角色学习统计卡片组件
 * 展示角色的经验等级、资产统计、学习进度等信息
 */

import React, { useEffect, useState } from 'react';
import { memoryApi } from '../../../services/api/memory/memory';
import { getToken } from '../../../services/api/base/tokenStorage';
import { logger } from '../../../utils/logger';

interface CharacterLearningStatsProps {
  characterId: number;
  characterName?: string;
}

interface LearningStats {
  experienceLevel: number;
  experienceLevelName: string;
  totalAssets: number;
  approvedAssets: number;
  pendingAssets: number;
  averageTrustScore: number;
  levelDescription: string;
  progressPercentage: number;
  nextLevelAssetRequirement: number;
  nextLevelTrustRequirement: number;
}

export const CharacterLearningStatsCard: React.FC<CharacterLearningStatsProps> = ({
  characterId,
  characterName = '角色',
}) => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [characterId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('未登录');
        return;
      }

      const response = await fetch(
        `/api/memory/v1/character/${characterId}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('获取统计失败');

      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      logger.error('[CharacterLearningStatsCard] 加载统计失败', { error: message });
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

  if (error || !stats) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#f44336' }}>
        {error || '无法加载数据'}
      </div>
    );
  }

  const getLevelColor = (level: number): string => {
    const colors = ['#999', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getLevelEmoji = (level: number): string => {
    const emojis = ['🆕', '🌱', '📚', '⭐', '👑', '🔥'];
    return emojis[Math.min(level - 1, emojis.length - 1)];
  };

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: `2px solid ${getLevelColor(stats.experienceLevel)}`,
    }}>
      {/* 标题和等级 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          {characterName} 的学习进度
        </h3>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: getLevelColor(stats.experienceLevel),
        }}>
          {getLevelEmoji(stats.experienceLevel)} L{stats.experienceLevel}
        </div>
      </div>

      {/* 等级名称和描述 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          {stats.experienceLevelName}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          {stats.levelDescription}
        </div>
      </div>

      {/* 进度条 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px', color: '#666' }}>
          进度: {stats.progressPercentage}%
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#ddd',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${stats.progressPercentage}%`,
            height: '100%',
            backgroundColor: getLevelColor(stats.experienceLevel),
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* 统计数据 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* 资产统计 */}
        <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>知识资产</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.totalAssets}</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            已批准: {stats.approvedAssets} | 待审核: {stats.pendingAssets}
          </div>
        </div>

        {/* 信任度 */}
        <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>平均信任度</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {(stats.averageTrustScore * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            {stats.averageTrustScore >= 0.8 ? '✓ 优秀' : stats.averageTrustScore >= 0.6 ? '↗ 良好' : '⚠ 需改进'}
          </div>
        </div>
      </div>

      {/* 晋升信息 */}
      <div style={{
        padding: '10px',
        backgroundColor: '#e8f5e9',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#2e7d32',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>下一等级要求:</div>
        <div>
          🎯 知识资产: {stats.nextLevelAssetRequirement} 个
          {' '}
          | 💪 信任度: {stats.nextLevelTrustRequirement}%
        </div>
      </div>

      {/* 刷新按钮 */}
      <div style={{ marginTop: '12px', textAlign: 'right' }}>
        <button
          onClick={loadStats}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            backgroundColor: getLevelColor(stats.experienceLevel),
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          🔄 刷新
        </button>
      </div>
    </div>
  );
};

export default CharacterLearningStatsCard;
