import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockAnalytics, mockStudents, mockParents } from '../../types/mock';

export const LearningReportPage: React.FC = () => {
  const navigate = useNavigate();
  const currentParent = mockParents[0];
  const childId = currentParent.childrenIds[0];
  const child = mockStudents.find(s => s.id === childId);
  const analytics = mockAnalytics;

  if (!child) {
    return <div>未找到学生信息</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {child.username} 的学习报告
          </h1>
          <p className="text-gray-600">查看详细的学习进度和分析</p>
        </header>

        {/* 时间范围选择 */}
        <Card className="mb-6">
          <div className="flex gap-2">
            {['本周', '本月', '本学期', '全部'].map((period) => (
              <Button
                key={period}
                ageGroup="middle"
                variant={period === '本月' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => console.log('选择时间段:', period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </Card>

        {/* 核心指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{analytics.totalLearningTime}</div>
              <div className="text-sm text-gray-600">总学习时长（分钟）</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{analytics.sceneCount}</div>
              <div className="text-sm text-gray-600">创建场景</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{analytics.characterCount}</div>
              <div className="text-sm text-gray-600">创建角色</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {Math.round(analytics.homeworkCompletionRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">作业完成率</div>
            </div>
          </Card>
        </div>

        {/* 详细报告 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">活动分布</h2>
            <div className="space-y-3">
              {analytics.activityDistribution.map((activity) => (
                <div key={activity.type}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {activity.type === 'scene_creation' ? '场景创建' : 
                       activity.type === 'character_creation' ? '角色创建' : 
                       activity.type === 'ai_conversation' ? 'AI对话' : '作业'}
                    </span>
                    <span className="text-sm text-gray-600">{activity.count} 次 ({activity.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${activity.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">学习时长趋势</h2>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">（图表展示区域 - 原型阶段）</p>
            </div>
          </Card>
        </div>

        {/* 情绪趋势 */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">情绪健康趋势</h2>
          <div className="space-y-3">
            {analytics.emotionTrend.map((trend, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{new Date(trend.date).toLocaleDateString('zh-CN')}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trend.dominantEmotion === 'happy' ? 'bg-yellow-100 text-yellow-800' :
                    trend.dominantEmotion === 'calm' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {trend.dominantEmotion === 'happy' ? '开心' : 
                     trend.dominantEmotion === 'calm' ? '平静' : '一般'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(trend.averageIntensity / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 导出报告 */}
        <div className="mt-6 text-center">
          <Button ageGroup="middle" variant="outline" onClick={() => console.log('导出报告')}>
            📥 导出报告
          </Button>
        </div>
      </div>
    </div>
  );
};