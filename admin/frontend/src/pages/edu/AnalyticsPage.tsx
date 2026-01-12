import React, { useState, useEffect } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';
import { adminApi } from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export const AdminAnalyticsPage: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalContent: 0,
    activeUsers: 0,
  });
  const [homeworkStats, setHomeworkStats] = useState({
    completionRate: 0,
    totalHomework: 0,
    completedHomework: 0,
    pendingHomework: 0,
  });

  const loadAnalytics = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      // 获取总体统计
      const overviewData = await adminApi.edu.analytics.getOverview(adminToken);
      setOverview(overviewData);

      // 获取作业完成情况（最近30天）
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      try {
        const homeworkData = await adminApi.edu.analytics.getHomeworkCompletion(adminToken, startDate, endDate);
        setHomeworkStats(homeworkData);
      } catch (error) {
        console.warn('获取作业完成情况失败，使用默认值:', error);
      }
    } catch (error: any) {
      console.error('加载数据分析失败:', error);
      // 如果 edu 后端未实现，使用默认值（0）
      setOverview({
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalContent: 0,
        activeUsers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [adminToken]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F2937' }}>数据分析</h1>
          <p style={{ color: '#4B5563' }}>查看教育版系统的数据统计和分析</p>
        </header>

        {/* 总体统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>总学生数</p>
                <p className="text-3xl font-bold" style={{ color: '#2563EB' }}>
                  {loading ? '...' : overview.totalStudents}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>总教师数</p>
                <p className="text-3xl font-bold" style={{ color: '#16A34A' }}>
                  {loading ? '...' : overview.totalTeachers}
                </p>
              </div>
              <div className="text-4xl">👨‍🏫</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>总课程数</p>
                <p className="text-3xl font-bold" style={{ color: '#9333EA' }}>
                  {loading ? '...' : overview.totalCourses}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">活跃用户</p>
                <p className="text-3xl font-bold text-orange-600">
                  {loading ? '...' : overview.activeUsers}
                </p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </Card>
        </div>

        {/* 数据可视化 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4">用户增长趋势</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">（图表展示区域 - 原型阶段）</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">学习时长分布</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">（图表展示区域 - 原型阶段）</p>
            </div>
          </Card>
        </div>

        {/* 活动统计 */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">作业完成情况（最近30天）</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? '...' : homeworkStats.totalHomework}
              </div>
              <div className="text-sm text-gray-600">总作业数</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {loading ? '...' : homeworkStats.completedHomework}
              </div>
              <div className="text-sm text-gray-600">已完成作业</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {loading ? '...' : Math.round(homeworkStats.completionRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">完成率</div>
            </div>
          </div>
        </Card>

        {/* 导出数据 */}
        <Card className="mt-6">
          <div className="text-center">
            <Button 
              ageGroup="middle" 
              variant="outline" 
              onClick={() => {
                // TODO: 实现数据导出功能
                alert('数据导出功能待实现');
              }}
            >
              📥 导出数据
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};