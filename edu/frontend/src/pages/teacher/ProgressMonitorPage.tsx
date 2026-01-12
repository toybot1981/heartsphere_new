import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockStudents, mockAnalytics } from '../../types/mock';

export const ProgressMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const student = selectedStudent ? mockStudents.find(s => s.id === selectedStudent) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/teacher/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">学生进度监控</h1>
          <p className="text-gray-600">查看学生的学习进度和AI使用情况</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 学生列表 */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">学生列表</h2>
            <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {mockStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStudent === student.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span>👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.username}</p>
                      <p className="text-sm text-gray-500">{student.grade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 学生详情 */}
          {student ? (
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{student.username}</h2>
                    <p className="text-gray-600">{student.grade} · {student.school}</p>
                  </div>
                  <Button 
                    ageGroup="middle"
                    variant="outline"
                    onClick={() => navigate(`/teacher/students/${student.id}`)}
                  >
                    查看详情
                  </Button>
                </div>

                {/* 统计卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockAnalytics.totalLearningTime}</div>
                    <div className="text-sm text-gray-600">总学习时长（分钟）</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{mockAnalytics.sceneCount}</div>
                    <div className="text-sm text-gray-600">创建场景</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockAnalytics.characterCount}</div>
                    <div className="text-sm text-gray-600">创建角色</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(mockAnalytics.homeworkCompletionRate * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">作业完成率</div>
                  </div>
                </div>

                {/* 活动分布 */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">活动分布</h3>
                  <div className="space-y-2">
                    {mockAnalytics.activityDistribution.map((activity) => (
                      <div key={activity.type} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600">{activity.type === 'scene_creation' ? '场景创建' : activity.type === 'character_creation' ? '角色创建' : activity.type === 'ai_conversation' ? 'AI对话' : '作业'}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full" 
                            style={{ width: `${activity.percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm font-medium">{activity.count} 次</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 最近活动 */}
                <div>
                  <h3 className="font-semibold mb-3">最近活动</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">🎨</span>
                      <div className="flex-1">
                        <p className="font-medium">创建了场景"古代中国"</p>
                        <p className="text-sm text-gray-500">2天前</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <div className="flex-1">
                        <p className="font-medium">完成了作业"历史场景设计"</p>
                        <p className="text-sm text-gray-500">3天前</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="lg:col-span-2 text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-semibold mb-2">选择学生</h2>
              <p className="text-gray-600">从左侧列表选择一个学生查看详细进度</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};