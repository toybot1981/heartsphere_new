// 数字人推荐组件
import React, { useState, useEffect } from 'react';
import { DigitalCharacterCard } from './DigitalCharacterCard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { eduApi } from '../../services/api';
import type { CharacterRecommendation as Recommendation, RecommendationCriteria } from '../../types/digitalHuman';

interface CharacterRecommendationProps {
  studentId: number;
  ageGroup?: 'elementary' | 'middle';
  criteria?: RecommendationCriteria;
  limit?: number;
  onCharacterClick?: (characterId: number) => void;
  className?: string;
}

/**
 * 数字人推荐组件
 * 根据学生信息和推荐条件显示推荐的角色
 */
export const CharacterRecommendation: React.FC<CharacterRecommendationProps> = ({
  studentId,
  ageGroup = 'elementary',
  criteria,
  limit = 6,
  onCharacterClick,
  className = '',
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isElementary = ageGroup === 'elementary';

  useEffect(() => {
    loadRecommendations();
  }, [studentId, criteria, limit]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await eduApi.digitalHuman.getRecommendations(
        studentId,
        {
          ...criteria,
          limit: criteria?.limit || limit,
        }
      );
      setRecommendations(result);
    } catch (err: any) {
      console.error('获取推荐角色失败:', err);
      setError(err.message || '获取推荐角色失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <h2 className={`text-2xl font-bold mb-6 ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'}`}>
          {isElementary ? '💡 为你推荐' : '为你推荐'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button ageGroup={ageGroup} onClick={loadRecommendations}>
            {isElementary ? '🔄 重试' : '重试'}
          </Button>
        </Card>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={className}>
        <h2 className={`text-2xl font-bold mb-6 ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'}`}>
          {isElementary ? '💡 为你推荐' : '为你推荐'}
        </h2>
        <Card className="text-center py-8">
          <p className="text-gray-500">
            {isElementary ? '暂时没有推荐的角色，试试其他筛选条件吧！' : '暂无推荐角色'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'}`}>
          {isElementary ? '💡 为你推荐' : '为你推荐'}
        </h2>
        <Button
          ageGroup={ageGroup}
          variant="outline"
          size="sm"
          onClick={loadRecommendations}
        >
          {isElementary ? '🔄 刷新' : '刷新'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((recommendation) => (
          <div key={recommendation.character.id} className="relative">
            <DigitalCharacterCard
              character={recommendation.character}
              ageGroup={ageGroup}
              onClick={() => onCharacterClick?.(recommendation.character.id)}
              showStats={true}
            />
            {/* 推荐理由和相关性分数 */}
            {recommendation.reason && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs">
                <div className="font-semibold text-gray-700">{recommendation.reason}</div>
                {recommendation.relevanceScore !== undefined && (
                  <div className="text-gray-500 mt-0.5">
                    匹配度: {Math.round(recommendation.relevanceScore * 100)}%
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
