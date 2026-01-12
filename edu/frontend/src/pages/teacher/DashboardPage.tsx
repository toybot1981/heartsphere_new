import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockTeachers, mockStudents, mockCourses, mockHomework } from '../../types/mock';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  // 模拟当前登录教师
  const currentTeacher = mockTeachers[0];
  const studentCount = mockStudents.length;
  const courseCount = mockCourses.length;
  const pendingHomework = mockHomework.filter(hw => hw.status === 'submitted' || hw.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-700 mb-2">
                欢迎，{currentTeacher.username}
              </h1>
              <p className="text-gray-600 text-lg">
                {currentTeacher.school} · {currentTeacher.subject}老师
              </p>
            </div>
            <div className="flex gap-3">
              <Button ageGroup="middle" variant="outline" onClick={() => navigate('/teacher/profile')}>
                个人中心
              </Button>
              <Button ageGroup="middle" variant="outline" onClick={() => navigate('/login')}>
                退出
              </Button>
            </div>
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">学生总数</p>
                <p className="text-3xl font-bold text-blue-600">{studentCount}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">课程总数</p>
                <p className="text-3xl font-bold text-green-600">{courseCount}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">待批改作业</p>
                <p className="text-3xl font-bold text-orange-600">{pendingHomework}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">本周活跃度</p>
                <p className="text-3xl font-bold text-purple-600">85%</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </Card>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/teacher/students')}>
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-semibold mb-2">学生管理</h2>
            <p className="text-gray-600 mb-4">查看和管理学生信息</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              进入管理
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/teacher/courses')}>
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">课程管理</h2>
            <p className="text-gray-600 mb-4">创建和管理课程</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              进入管理
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/teacher/homework')}>
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">作业管理</h2>
            <p className="text-gray-600 mb-4">布置和批改作业</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              进入管理
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/teacher/progress')}>
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">学生进度</h2>
            <p className="text-gray-600 mb-4">查看学生学习进度</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看进度
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/teacher/resources')}>
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-semibold mb-2">教学资源</h2>
            <p className="text-gray-600 mb-4">管理和分享教学资源</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看资源
            </Button>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/teacher/analytics')}>
            <div className="text-4xl mb-4">📈</div>
            <h2 className="text-xl font-semibold mb-2">数据分析</h2>
            <p className="text-gray-600 mb-4">查看教学数据分析</p>
            <Button ageGroup="middle" variant="outline" className="w-full">
              查看数据
            </Button>
          </Card>
        </div>

        {/* 最近活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">最近活动</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">布置了新作业"历史场景设计"</p>
                <p className="text-sm text-gray-500">2小时前</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">创建了新课程"中国历史入门"</p>
                <p className="text-sm text-gray-500">1天前</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">批改了5份作业</p>
                <p className="text-sm text-gray-500">2天前</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">待办事项</h2>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-medium text-orange-900">3份作业待批改</p>
                <p className="text-sm text-orange-700">点击查看详情</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">下周课程需要准备</p>
                <p className="text-sm text-blue-700">查看课程计划</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900">学生提交了新场景</p>
                <p className="text-sm text-green-700">需要审核</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};