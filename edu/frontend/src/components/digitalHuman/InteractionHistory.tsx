// 互动历史组件
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { eduApi } from '../../services/api';
import type { EduCharacterInteraction, InteractionQueryParams } from '../../types/digitalHuman';

interface InteractionHistoryProps {
  studentId: number;
  characterId?: number;
  ageGroup?: 'elementary' | 'middle';
  limit?: number;
  showPagination?: boolean;
  onInteractionClick?: (interaction: EduCharacterInteraction) => void;
  className?: string;
}

/**
 * 互动历史组件
 * 展示学生与数字人的互动记录
 */
export const InteractionHistory: React.FC<InteractionHistoryProps> = ({
  studentId,
  characterId,
  ageGroup = 'elementary',
  limit = 10,
  showPagination = false,
  onInteractionClick,
  className = '',
}) => {
  const [interactions, setInteractions] = useState<EduCharacterInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isElementary = ageGroup === 'elementary';

  useEffect(() => {
    loadInteractions();
  }, [studentId, characterId, currentPage, limit]);

  const loadInteractions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: InteractionQueryParams = {
        studentId,
        characterId,
        page: currentPage,
        size: limit,
      };
      
      const result = await eduApi.characterInteraction.getInteractions(params);
      setInteractions(result.content);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error('获取互动历史失败:', err);
      setError(err.message || '获取互动历史失败');
    } finally {
      setLoading(false);
    }
  };

  // 互动类型显示文本
  const interactionTypeLabels: Record<string, string> = {
    teaching_dialogue: isElementary ? '📚 教学对话' : '教学对话',
    homework_help: isElementary ? '✏️ 作业辅导' : '作业辅导',
    counseling: isElementary ? '💚 心理疏导' : '心理疏导',
    knowledge_explanation: isElementary ? '📖 知识讲解' : '知识讲解',
    practice_exercise: isElementary ? '🎯 练习训练' : '练习训练',
  };

  // 理解程度显示文本
  const comprehensionLabels: Record<string, string> = {
    not_understood: '不理解',
    partially_understood: '部分理解',
    well_understood: '理解良好',
    mastered: '掌握',
  };

  // 格式化时长
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '未记录';
    if (minutes < 60) return `${minutes} 分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && interactions.length === 0) {
    return (
      <div className={className}>
        <Card>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button ageGroup={ageGroup} onClick={loadInteractions}>
            {isElementary ? '🔄 重试' : '重试'}
          </Button>
        </Card>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className={className}>
        <Card className="text-center py-8">
          <div className="text-4xl mb-4">{isElementary ? '📝' : '📝'}</div>
          <p className="text-gray-500">
            {isElementary ? '还没有互动记录，开始与数字人互动吧！' : '暂无互动记录'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {interactions.map((interaction) => (
          <Card
            key={interaction.id}
            onClick={() => onInteractionClick?.(interaction)}
            className={`hover:shadow-lg transition-shadow ${
              onInteractionClick ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-700">
                    {interactionTypeLabels[interaction.interactionType] || interaction.interactionType}
                  </span>
                  {interaction.comprehensionLevel && (
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      interaction.comprehensionLevel === 'mastered'
                        ? 'bg-green-100 text-green-700'
                        : interaction.comprehensionLevel === 'well_understood'
                        ? 'bg-blue-100 text-blue-700'
                        : interaction.comprehensionLevel === 'partially_understood'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {comprehensionLabels[interaction.comprehensionLevel] || interaction.comprehensionLevel}
                    </span>
                  )}
                </div>

                {/* 学习主题 */}
                {interaction.learningTopics && interaction.learningTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {interaction.learningTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* 学生反馈 */}
                {interaction.studentFeedback && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {interaction.studentFeedback}
                  </p>
                )}

                {/* 统计信息 */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>{formatDate(interaction.createdAt)}</span>
                  {interaction.durationMinutes !== undefined && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(interaction.durationMinutes)}</span>
                    </>
                  )}
                  {interaction.studentRating !== undefined && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-500">
                        {'★'.repeat(interaction.studentRating)}{'☆'.repeat(5 - interaction.studentRating)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 分页 */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            {isElementary ? '← 上一页' : '上一页'}
          </Button>
          <span className="text-sm text-gray-600">
            第 {currentPage + 1} 页 / 共 {totalPages} 页
          </span>
          <Button
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            {isElementary ? '下一页 →' : '下一页'}
          </Button>
        </div>
      )}
    </div>
  );
};
