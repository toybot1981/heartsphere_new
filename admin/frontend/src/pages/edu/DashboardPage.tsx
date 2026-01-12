import React, { useState, useEffect } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';
import { adminApi } from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useAdminState } from '../../contexts/AdminStateContext';

export const AdminDashboardPage: React.FC = () => {
  const { setActiveSection } = useAdminState();
  const { adminToken } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalContent: 0,
    activeUsers: 0,
  });

  const loadOverview = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const overview = await adminApi.edu.analytics.getOverview(adminToken);
      setStats(overview);
    } catch (error: any) {
      console.error('加载概览统计失败:', error);
      // 如果 edu 后端未实现，使用默认值（0）
      setStats({
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
    loadOverview();
  }, [adminToken]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">管理后台</h1>
          <p className="text-gray-600">心域-教育版系统管理</p>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>学生总数</p>
                <p className="text-3xl font-bold" style={{ color: '#2563EB' }}>
                  {loading ? '...' : stats.totalStudents}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>教师总数</p>
                <p className="text-3xl font-bold" style={{ color: '#16A34A' }}>
                  {loading ? '...' : stats.totalTeachers}
                </p>
              </div>
              <div className="text-4xl">👨‍🏫</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>课程总数</p>
                <p className="text-3xl font-bold" style={{ color: '#9333EA' }}>
                  {loading ? '...' : stats.totalCourses}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#4B5563' }}>内容总数</p>
                <p className="text-3xl font-bold" style={{ color: '#EA580C' }}>
                  {loading ? '...' : stats.totalContent}
                </p>
              </div>
              <div className="text-4xl">🎨</div>
            </div>
          </Card>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow text-center" onClick={() => setActiveSection('edu-content-review')}>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>审核队列</h2>
            <p className="mb-4" style={{ color: '#4B5563' }}>待审核内容</p>
            <Button ageGroup="middle" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setActiveSection('edu-content-review'); }}>
              进入审核
            </Button>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow text-center" onClick={() => setActiveSection('edu-settings')}>
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>系统设置</h2>
            <p className="mb-4" style={{ color: '#4B5563' }}>系统配置和设置</p>
            <Button ageGroup="middle" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setActiveSection('edu-settings'); }}>
              进入设置
            </Button>
          </Card>
        </div>

        {/* 其他管理功能 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow text-center" onClick={() => setActiveSection('edu-students')}>
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>学生管理</h2>
            <Button ageGroup="middle" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setActiveSection('edu-students'); }}>
              进入管理
            </Button>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow text-center" onClick={() => setActiveSection('edu-teachers')}>
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>教师管理</h2>
            <Button ageGroup="middle" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setActiveSection('edu-teachers'); }}>
              进入管理
            </Button>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow text-center" onClick={() => setActiveSection('edu-content')}>
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>内容管理</h2>
            <Button ageGroup="middle" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setActiveSection('edu-content'); }}>
              进入管理
            </Button>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow text-center" onClick={() => setActiveSection('edu-analytics')}>
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>数据分析</h2>
            <Button ageGroup="middle" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setActiveSection('edu-analytics'); }}>
              查看数据
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};