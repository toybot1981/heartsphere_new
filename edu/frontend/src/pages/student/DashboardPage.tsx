import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CharacterRecommendation } from '../../components/digitalHuman';
import { useCurrentUserId } from '../../hooks/useAuth';
import type { AgeGroup } from '../../types';

interface DashboardPageProps {
  ageGroup: AgeGroup;
}

export const StudentDashboardPage: React.FC<DashboardPageProps> = ({ ageGroup }) => {
  const navigate = useNavigate();
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  const textColor = isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700';
  const progressColor = isElementary ? 'bg-primary-elementary-500' : 'bg-primary-middle-500';
  
  // 从认证系统获取学生ID
  const studentId = useCurrentUserId(1);
  
  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className={`text-4xl font-bold ${textColor} mb-2`}>
            {isElementary ? '👋 你好！' : '欢迎回来'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isElementary ? '今天你想做什么呢？' : '继续你的学习之旅'}
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold mb-2">创建场景</h2>
            <p className="text-gray-600 mb-4">
              {isElementary 
                ? '创造一个有趣的世界吧！' 
                : '构建你的虚拟世界'}
            </p>
            <Button 
              ageGroup={ageGroup} 
              className="w-full"
              onClick={() => navigate(`/student/scenes/create?ageGroup=${ageGroup}`)}
            >
              开始创建
            </Button>
          </Card>
          
          <Card>
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-xl font-semibold mb-2">创建角色</h2>
            <p className="text-gray-600 mb-4">
              {isElementary 
                ? '设计一个好朋友吧！' 
                : '设计你的AI伙伴'}
            </p>
            <Button 
              ageGroup={ageGroup} 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate(`/student/characters/create?ageGroup=${ageGroup}`)}
            >
              开始创建
            </Button>
          </Card>
          
          <Card>
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-semibold mb-2">AI对话</h2>
            <p className="text-gray-600 mb-4">
              {isElementary 
                ? '和AI朋友聊天学习！' 
                : '与AI进行学习对话'}
            </p>
            <Button 
              ageGroup={ageGroup} 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/student/ai-chat?ageGroup=${ageGroup}`)}
            >
              开始对话
            </Button>
          </Card>
          
          <Card>
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">我的作业</h2>
            <p className="text-gray-600 mb-4">
              {isElementary 
                ? '看看有哪些作业要做' 
                : '查看和完成作业'}
            </p>
            <Button 
              ageGroup={ageGroup} 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/student/homework?ageGroup=${ageGroup}`)}
            >
              查看作业
            </Button>
          </Card>
          
          <Card>
            <div className="text-4xl mb-4">💚</div>
            <h2 className="text-xl font-semibold mb-2">心理辅导</h2>
            <p className="text-gray-600 mb-4">
              {isElementary 
                ? '心情不好？来聊聊吧' 
                : '情绪支持与心理辅导'}
            </p>
            <Button 
              ageGroup={ageGroup} 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/student/counseling?ageGroup=${ageGroup}`)}
            >
              开始辅导
            </Button>
          </Card>
          
          <Card>
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">学习报告</h2>
            <p className="text-gray-600 mb-4">
              {isElementary 
                ? '看看你学到了什么' 
                : '查看学习数据分析'}
            </p>
            <Button 
              ageGroup={ageGroup} 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/student/profile?ageGroup=${ageGroup}`)}
            >
              查看报告
            </Button>
          </Card>
        </div>
        
        {/* 数字人推荐 */}
        <div className="mb-8">
          <CharacterRecommendation
            studentId={studentId}
            ageGroup={ageGroup}
            criteria={{
              ageGroup: ageGroup === 'elementary' ? 'primary_6_12' : 'secondary_13_18',
              limit: 4,
              includeHistory: true,
            }}
            onCharacterClick={(characterId) => navigate(`/student/characters/${characterId}?ageGroup=${ageGroup}`)}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '🎨 最近创建的场景' : '最近创建的场景'}
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">古代中国</p>
                <p className="text-sm text-gray-500">2天前</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">太空探索</p>
                <p className="text-sm text-gray-500">5天前</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {isElementary ? '📊 学习进度' : '学习进度'}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">本周学习时间</span>
                  <span className="text-sm text-gray-600">120分钟</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${progressColor} h-2 rounded-full`} style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">作业完成率</span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${progressColor} h-2 rounded-full`} style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};