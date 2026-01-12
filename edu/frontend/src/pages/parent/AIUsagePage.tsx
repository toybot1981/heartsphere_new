import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockAnalytics, mockParents, mockStudents } from '../../types/mock';

export const AIUsagePage: React.FC = () => {
  const navigate = useNavigate();
  const currentParent = mockParents[0];
  const childId = currentParent.childrenIds[0];
  const child = mockStudents.find(s => s.id === childId);
  const analytics = mockAnalytics;

  if (!child) {
    return <div>未找到学生信息</div>;
  }

  const aiUsageCount = analytics.activityDistribution.find(a => a.type === 'ai_conversation')?.count || 0;
  const totalActivities = analytics.activityDistribution.reduce((sum, a) => sum + a.count, 0);
  const aiUsagePercentage = totalActivities > 0 ? Math.round((aiUsageCount / totalActivities) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
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
            {child.username} 的 AI 使用情况
          </h1>
          <p className="text-gray-600">了解孩子的AI使用情况和学习效果</p>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{aiUsageCount}</div>
              <div className="text-sm text-gray-600">AI对话次数</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(analytics.totalLearningTime * 0.3)}
              </div>
              <div className="text-sm text-gray-600">AI对话时长（分钟）</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{aiUsagePercentage}%</div>
              <div className="text-sm text-gray-600">AI使用占比</div>
            </div>
          </Card>
        </div>

        {/* 使用趋势 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">AI使用趋势</h2>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">（图表展示区域 - 原型阶段）</p>
          </div>
        </Card>

        {/* 使用类型分布 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">AI功能使用分布</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">学习对话</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">60%</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">作业辅导</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">25%</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">场景生成</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-purple-500 h-4 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">10%</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">其他功能</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-orange-500 h-4 rounded-full" style={{ width: '5%' }}></div>
              </div>
              <div className="w-16 text-right text-sm font-medium">5%</div>
            </div>
          </div>
        </Card>

        {/* 使用建议 */}
        <Card className="bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">使用建议</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✅ 孩子主要使用AI进行学习对话，这是很好的学习方式。</p>
            <p>💡 可以鼓励孩子多使用AI进行作业辅导，提高学习效率。</p>
            <p>📚 AI使用时长适中，没有过度依赖的情况。</p>
          </div>
        </Card>
      </div>
    </div>
  );
};