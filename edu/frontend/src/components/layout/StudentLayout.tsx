import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../common/Button';
import type { AgeGroup } from '../../types';

interface StudentLayoutProps {
  children: React.ReactNode;
  ageGroup?: AgeGroup;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children, ageGroup = 'elementary' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isElementary = ageGroup === 'elementary';

  const navItems = [
    { path: `/student/dashboard/${ageGroup}`, label: isElementary ? '🏠 主页' : '主页', icon: '🏠' },
    { path: `/student/scenes?ageGroup=${ageGroup}`, label: isElementary ? '🎨 场景' : '场景', icon: '🎨' },
    { path: `/student/characters?ageGroup=${ageGroup}`, label: isElementary ? '👤 角色' : '角色', icon: '👤' },
    { path: `/student/homework?ageGroup=${ageGroup}`, label: isElementary ? '📚 作业' : '作业', icon: '📚' },
    { path: `/student/counseling?ageGroup=${ageGroup}`, label: isElementary ? '💚 心理' : '心理', icon: '💚' },
    { path: `/student/profile?ageGroup=${ageGroup}`, label: isElementary ? '👤 我的' : '我的', icon: '👤' },
  ];

  const isActive = (path: string) => {
    return location.pathname.includes(path.split('?')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className={`${isElementary ? 'bg-primary-elementary-600' : 'bg-primary-middle-600'} text-white shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/student/dashboard/${ageGroup}`)}
                className="text-xl font-bold hover:opacity-80 transition-opacity"
              >
                {isElementary ? '🎓 心域-教育版' : '心域-教育版'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                ageGroup={ageGroup}
                variant="outline"
                size="sm"
                onClick={() => navigate(`/student/profile?ageGroup=${ageGroup}`)}
                className="text-white border-white hover:bg-white/20"
              >
                {isElementary ? '👤 个人中心' : '个人中心'}
              </Button>
              <Button
                ageGroup={ageGroup}
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-white border-white hover:bg-white/20"
              >
                {isElementary ? '🚪 退出' : '退出'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 底部导航栏（移动端） */}
      <div className={`${isElementary ? 'bg-primary-elementary-600' : 'bg-primary-middle-600'} text-white fixed bottom-0 left-0 right-0 z-50 md:hidden shadow-lg`}>
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive(item.path)
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label.split(' ')[1] || item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 侧边栏（桌面端） */}
      <div className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:top-16 md:w-64 md:flex-col">
        <div className={`${isElementary ? 'bg-primary-elementary-50' : 'bg-primary-middle-50'} border-r border-gray-200 h-full overflow-y-auto`}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? isElementary
                      ? 'bg-primary-elementary-500 text-white'
                      : 'bg-primary-middle-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="md:ml-64 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
};