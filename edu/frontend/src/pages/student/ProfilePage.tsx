import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LearningProgress, InteractionHistory } from '../../components/digitalHuman';
import { useCurrentUserId } from '../../hooks/useAuth';
import { mockStudents, mockAnalytics } from '../../types/mock';
import type { AgeGroup } from '../../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  
  // 模拟当前登录学生
  const currentStudent = mockStudents[0];
  const analytics = mockAnalytics;

  // 从认证系统获取学生ID
  const studentId = useCurrentUserId(1);

  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'settings' | 'progress'>('profile');

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            onClick={() => navigate(`/student/dashboard/${ageGroup}`)}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
            {isElementary ? '👤 个人中心' : '个人中心'}
          </h1>
        </header>

        {/* 用户信息卡片 */}
        <Card className="mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
              {currentStudent.avatar ? (
                <img src={currentStudent.avatar} alt={currentStudent.username} className="w-full h-full rounded-full" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{currentStudent.username}</h2>
              <p className="text-gray-600 mb-2">
                {currentStudent.grade} · {currentStudent.school}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-primary-elementary-100 text-primary-elementary-700 rounded-full">
                  {currentStudent.ageGroup === 'elementary' ? '小学生' : '中学生'}
                </span>
                <span className="text-gray-500">
                  加入时间：{new Date(currentStudent.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
            <Button ageGroup={ageGroup} variant="outline">
              {isElementary ? '✏️ 编辑资料' : '编辑资料'}
            </Button>
          </div>
        </Card>

        {/* 标签页 */}
        <div className="mb-6 flex gap-3 border-b">
          {[
            { id: 'profile', label: isElementary ? '📝 我的资料' : '我的资料' },
            { id: 'progress', label: isElementary ? '📊 学习进度' : '学习进度' },
            { id: 'achievements', label: isElementary ? '🏆 成就' : '成就' },
            { id: 'settings', label: isElementary ? '⚙️ 设置' : '设置' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'profile' | 'achievements' | 'settings' | 'progress')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? isElementary
                    ? 'border-primary-elementary-500 text-primary-elementary-700'
                    : 'border-primary-middle-500 text-primary-middle-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* 学习统计 */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '📊 学习统计' : '学习统计'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-elementary-600 mb-1">
                    {analytics.totalLearningTime}
                  </div>
                  <div className="text-sm text-gray-600">总学习时长（分钟）</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-elementary-600 mb-1">
                    {analytics.sceneCount}
                  </div>
                  <div className="text-sm text-gray-600">创建场景</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-elementary-600 mb-1">
                    {analytics.characterCount}
                  </div>
                  <div className="text-sm text-gray-600">创建角色</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-primary-elementary-600 mb-1">
                    {Math.round(analytics.homeworkCompletionRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">作业完成率</div>
                </div>
              </div>
            </Card>

            {/* 最近活动 */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '🕐 最近活动' : '最近活动'}
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="text-2xl">🎨</div>
                  <div className="flex-1">
                    <p className="font-medium">创建了场景"古代中国"</p>
                    <p className="text-sm text-gray-500">2天前</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="text-2xl">👤</div>
                  <div className="flex-1">
                    <p className="font-medium">创建了角色"孔子"</p>
                    <p className="text-sm text-gray-500">2天前</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <div className="text-2xl">📚</div>
                  <div className="flex-1">
                    <p className="font-medium">完成了作业"历史场景设计"</p>
                    <p className="text-sm text-gray-500">3天前</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* 学习进度可视化 */}
            <LearningProgress
              studentId={studentId}
              ageGroup={ageGroup}
              days={30}
            />

            {/* 互动历史 */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '📝 最近互动' : '最近互动'}
              </h2>
              <InteractionHistory
                studentId={studentId}
                ageGroup={ageGroup}
                limit={10}
                showPagination={true}
                onInteractionClick={(interaction) => {
                  // TODO: 导航到互动详情页面
                  console.log('查看互动详情:', interaction);
                }}
              />
            </Card>
          </div>
        )}

        {activeTab === 'achievements' && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '🏆 我的成就' : '我的成就'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '🎨', name: isElementary ? '场景大师' : '场景创建者', unlocked: true },
                { emoji: '👤', name: isElementary ? '角色设计师' : '角色设计师', unlocked: true },
                { emoji: '💬', name: isElementary ? '对话达人' : 'AI对话专家', unlocked: false },
                { emoji: '📚', name: isElementary ? '作业完成者' : '作业完成者', unlocked: true },
              ].map((achievement) => (
                <div
                  key={achievement.name}
                  className={`p-4 rounded-lg text-center ${
                    achievement.unlocked ? 'bg-gray-50' : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.emoji}</div>
                  <div className="text-sm font-medium">{achievement.name}</div>
                  {!achievement.unlocked && (
                    <div className="text-xs text-gray-400 mt-1">未解锁</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '⚙️ 设置' : '设置'}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">账户设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>修改密码</span>
                    <Button ageGroup={ageGroup} variant="outline" size="sm">
                      修改
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>修改头像</span>
                    <Button ageGroup={ageGroup} variant="outline" size="sm">
                      修改
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">隐私设置</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>允许其他学生查看我的场景</span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>允许其他学生查看我的角色</span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-red-600">危险操作</h3>
                <Button ageGroup={ageGroup} variant="outline" className="text-red-600 border-red-300">
                  {isElementary ? '🗑️ 删除账户' : '删除账户'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};