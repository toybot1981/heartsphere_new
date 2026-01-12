// 学习进度可视化组件
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { eduApi } from '../../services/api';

interface LearningProgressProps {
  studentId: number;
  characterId?: number;
  ageGroup?: 'elementary' | 'middle';
  days?: number; // 统计最近多少天的数据，默认30天
  className?: string;
}

interface ProgressData {
  date: string;
  interactions: number;
  duration: number; // 分钟
  topics: string[];
}

/**
 * 学习进度可视化组件
 * 展示学生的学习进度统计和趋势
 */
export const LearningProgress: React.FC<LearningProgressProps> = ({
  studentId,
  characterId,
  ageGroup = 'elementary',
  days = 30,
  className = '',
}) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInteractions: 0,
    totalDuration: 0,
    totalTopics: 0,
    averageDuration: 0,
  });
  const isElementary = ageGroup === 'elementary';

  useEffect(() => {
    loadProgressData();
  }, [studentId, characterId, days]);

  const loadProgressData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await eduApi.characterInteraction.getInteractions({
        studentId,
        characterId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: 0,
        size: 1000, // 获取足够多的数据用于统计
      });

      // 处理数据，按日期分组统计
      const dateMap = new Map<string, ProgressData>();
      let totalInteractions = 0;
      let totalDuration = 0;
      const allTopics = new Set<string>();

      result.content.forEach((interaction) => {
        const date = new Date(interaction.createdAt).toISOString().split('T')[0];
        
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date,
            interactions: 0,
            duration: 0,
            topics: [],
          });
        }

        const dayData = dateMap.get(date)!;
        dayData.interactions += 1;
        if (interaction.durationMinutes) {
          dayData.duration += interaction.durationMinutes;
          totalDuration += interaction.durationMinutes;
        }
        
        if (interaction.learningTopics) {
          interaction.learningTopics.forEach(topic => {
            if (!dayData.topics.includes(topic)) {
              dayData.topics.push(topic);
            }
            allTopics.add(topic);
          });
        }
        
        totalInteractions += 1;
      });

      // 转换为数组并按日期排序
      const sortedData = Array.from(dateMap.values()).sort((a, b) => 
        a.date.localeCompare(b.date)
      );

      setProgressData(sortedData);
      setStats({
        totalInteractions,
        totalDuration,
        totalTopics: allTopics.size,
        averageDuration: totalInteractions > 0 ? Math.round(totalDuration / totalInteractions) : 0,
      });
    } catch (err: any) {
      console.error('获取学习进度失败:', err);
      setError(err.message || '获取学习进度失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化时长
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
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
          <Button ageGroup={ageGroup} onClick={loadProgressData}>
            {isElementary ? '🔄 重试' : '重试'}
          </Button>
        </Card>
      </div>
    );
  }

  // 计算最大互动次数（用于图表比例）
  const maxInteractions = Math.max(...progressData.map(d => d.interactions), 1);

  return (
    <div className={className}>
      <Card>
        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-2 ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'}`}>
            {isElementary ? '📊 学习进度' : '学习进度'}
          </h3>
          <p className="text-sm text-gray-500">最近 {days} 天的学习情况</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.totalInteractions}</div>
            <div className="text-sm text-blue-600 mt-1">{isElementary ? '互动次数' : '互动次数'}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">{formatDuration(stats.totalDuration)}</div>
            <div className="text-sm text-green-600 mt-1">{isElementary ? '总时长' : '总时长'}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.totalTopics}</div>
            <div className="text-sm text-purple-600 mt-1">{isElementary ? '学习主题' : '学习主题'}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-700">
              {stats.averageDuration > 0 ? `${stats.averageDuration} 分钟` : '-'}
            </div>
            <div className="text-sm text-orange-600 mt-1">{isElementary ? '平均时长' : '平均时长'}</div>
          </div>
        </div>

        {/* 学习趋势图（简单的柱状图） */}
        {progressData.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {isElementary ? '每日互动趋势' : '每日互动趋势'}
            </h4>
            <div className="space-y-2">
              {progressData.slice(-14).map((data) => (
                <div key={data.date} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600 text-right">
                    {formatDate(data.date)}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-8 rounded ${
                        isElementary
                          ? 'bg-primary-elementary-500'
                          : 'bg-primary-middle-500'
                      }`}
                      style={{
                        width: `${(data.interactions / maxInteractions) * 100}%`,
                        minWidth: data.interactions > 0 ? '8px' : '0',
                      }}
                    />
                    <div className="w-12 text-xs text-gray-600 text-right">
                      {data.interactions} 次
                    </div>
                    {data.duration > 0 && (
                      <div className="w-20 text-xs text-gray-500">
                        {formatDuration(data.duration)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>{isElementary ? '暂无学习数据' : '暂无学习数据'}</p>
          </div>
        )}

        {/* 刷新按钮 */}
        <div className="mt-6 flex justify-end">
          <Button
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={loadProgressData}
          >
            {isElementary ? '🔄 刷新' : '刷新'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
