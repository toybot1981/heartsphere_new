import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockParents, mockStudents, mockAnalytics } from '../../types/mock';

export const ParentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentParent = mockParents[0];
  const childId = currentParent.childrenIds[0];
  const child = mockStudents.find(s => s.id === childId);
  const analytics = mockAnalytics;

  if (!child) {
    return <div>未找到学生信息</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-green-700 mb-2">
                欢迎，{currentParent.username}
              </h1>
              <p className="text-gray-600 text-lg">
                正在查看 {child.username} 的学习情况
              </p>
            </div>
            <div className="flex gap-3">
              <Button ageGroup="middle" variant="outline" onClick={() => navigate('/parent/profile')}>
                个人中心
              </Button>
              <Button ageGroup="middle" variant="outline" onClick={() => navigate('/parent/login')}>
                退出
              </Button>
            </div>
          </div>
        </header>

        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">本周学习时长</p>
                <p className="text-3xl font-bold text-green-600">{analytics.totalLearningTime} 分钟</p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">作业完成率</p>
                <p className="text-3xl font-bold text-blue-600">{Math.round(analytics.homeworkCompletionRate * 100)}%</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">创建场景</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.sceneCount} 个</p>
              </div>
              <div className="text-4xl">🎨</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">平均成绩</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.averageGrade} 分</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </Card>
        </div>

        {/* 快捷功能 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parent/report')}>
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">学习报告</h2>
            <p className="text-gray-600 mb-4">查看详细的学习进度报告</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看报告
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parent/homework')}>
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">作业情况</h2>
            <p className="text-gray-600 mb-4">查看孩子的作业完成情况</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看作业
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parent/ai-usage')}>
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold mb-2">AI使用情况</h2>
            <p className="text-gray-600 mb-4">了解孩子的AI使用情况</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看统计
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parent/time-control')}>
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-xl font-semibold mb-2">时间管理</h2>
            <p className="text-gray-600 mb-4">设置使用时长和时间段</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              设置时间
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parent/content-control')}>
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2">内容过滤</h2>
            <p className="text-gray-600 mb-4">设置允许访问的内容类型</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              内容设置
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parent/emotional-summary')}>
            <div className="text-4xl mb-4">💚</div>
            <h2 className="text-xl font-semibold mb-2">情绪健康</h2>
            <p className="text-gray-600 mb-4">查看孩子的情绪健康摘要</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看摘要
            </Button>
          </Card>
        </div>

        {/* 最近活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">最近学习活动</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎨</span>
                  <div className="flex-1">
                    <p className="font-medium">创建了场景"古代中国"</p>
                    <p className="text-sm text-gray-500">2天前 · 学习30分钟</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📚</span>
                  <div className="flex-1">
                    <p className="font-medium">完成了作业"历史场景设计"</p>
                    <p className="text-sm text-gray-500">3天前 · 得分95分</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">💬</span>
                  <div className="flex-1">
                    <p className="font-medium">进行了AI对话学习</p>
                    <p className="text-sm text-gray-500">1天前 · 15分钟</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">学习趋势</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">本周学习时长</span>
                  <span className="text-sm text-gray-600">120分钟</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">作业完成率</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">AI使用频率</span>
                  <span className="text-sm text-gray-600">适中</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};