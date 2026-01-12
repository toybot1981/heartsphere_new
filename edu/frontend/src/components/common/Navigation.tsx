import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';
import type { AgeGroup } from '../../types';

interface NavigationProps {
  ageGroup?: AgeGroup;
  userType?: 'student' | 'teacher' | 'parent';
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ ageGroup = 'elementary', userType = 'student', className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isElementary = ageGroup === 'elementary';

  const getNavItems = () => {
    if (userType === 'student') {
      return [
        { path: `/student/dashboard/${ageGroup}`, label: isElementary ? '🏠 主页' : '主页', icon: '🏠' },
        { path: `/student/scenes?ageGroup=${ageGroup}`, label: isElementary ? '🎨 场景' : '场景', icon: '🎨' },
        { path: `/student/characters?ageGroup=${ageGroup}`, label: isElementary ? '👤 角色' : '角色', icon: '👤' },
        { path: `/student/ai-chat?ageGroup=${ageGroup}`, label: isElementary ? '💬 对话' : '对话', icon: '💬' },
        { path: `/student/homework?ageGroup=${ageGroup}`, label: isElementary ? '📚 作业' : '作业', icon: '📚' },
        { path: `/student/counseling?ageGroup=${ageGroup}`, label: isElementary ? '💚 心理' : '心理', icon: '💚' },
        { path: `/student/profile?ageGroup=${ageGroup}`, label: isElementary ? '👤 我的' : '我的', icon: '👤' },
      ];
    } else if (userType === 'teacher') {
      return [
        { path: '/teacher/dashboard', label: '主页', icon: '🏠' },
        { path: '/teacher/students', label: '学生', icon: '👥' },
        { path: '/teacher/courses', label: '课程', icon: '📚' },
        { path: '/teacher/homework', label: '作业', icon: '📝' },
        { path: '/teacher/progress', label: '进度', icon: '📊' },
        { path: '/teacher/resources', label: '资源', icon: '📦' },
        { path: '/teacher/profile', label: '我的', icon: '👤' },
      ];
    } else {
      return [
        { path: '/parent/dashboard', label: '主页', icon: '🏠' },
        { path: '/parent/report', label: '报告', icon: '📊' },
        { path: '/parent/homework', label: '作业', icon: '📚' },
        { path: '/parent/ai-usage', label: 'AI使用', icon: '🤖' },
        { path: '/parent/time-control', label: '时间', icon: '⏰' },
        { path: '/parent/content-control', label: '内容', icon: '🔒' },
        { path: '/parent/profile', label: '我的', icon: '👤' },
      ];
    }
  };

  const navItems = getNavItems();
  const isActive = (path: string) => {
    const pathWithoutQuery = path.split('?')[0];
    return location.pathname === pathWithoutQuery || location.pathname.startsWith(pathWithoutQuery + '/');
  };

  return (
    <nav className={`${className}`}>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {navItems.map((item) => (
          <Button
            key={item.path}
            ageGroup={ageGroup}
            variant={isActive(item.path) ? 'primary' : 'outline'}
            size="sm"
            onClick={() => navigate(item.path)}
            className={isActive(item.path) ? 'font-semibold' : ''}
          >
            <span className="mr-1">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  );
};