import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockCourses } from '../../types/mock';

export const CourseManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [courses] = useState(mockCourses);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">课程管理</h1>
              <p className="text-gray-600">创建和管理你的课程</p>
            </div>
            <Button ageGroup="middle" onClick={() => navigate('/teacher/courses/create')}>
              + 创建课程
            </Button>
          </div>
        </header>

        {courses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold mb-2">还没有课程</h2>
            <p className="text-gray-600 mb-6">创建你的第一个课程，开始教学吧！</p>
            <Button ageGroup="middle" onClick={() => navigate('/teacher/courses/create')}>
              创建课程
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card 
                key={course.id}
                onClick={() => navigate(`/teacher/courses/${course.id}`)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-5xl">📚</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>
                    <span className={`px-2 py-1 rounded ${
                      course.ageGroup === 'elementary' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {course.ageGroup === 'elementary' ? '小学' : '中学'}
                    </span>
                  </span>
                  <span>{course.studentIds.length} 名学生</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    ageGroup="middle"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/courses/${course.id}/edit`);
                    }}
                  >
                    编辑
                  </Button>
                  <Button 
                    ageGroup="middle"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/courses/${course.id}/students`);
                    }}
                  >
                    学生
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};