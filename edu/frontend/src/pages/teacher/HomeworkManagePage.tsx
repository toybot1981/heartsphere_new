import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockHomework, mockTeachers } from '../../types/mock';

export const HomeworkManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const currentTeacher = mockTeachers[0];
  const homeworkList = mockHomework.filter(hw => hw.teacherId === currentTeacher.id);

  const filteredHomework = filterStatus === 'all' 
    ? homeworkList 
    : homeworkList.filter(hw => hw.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: '待完成', color: 'bg-yellow-100 text-yellow-800' },
      in_progress: { text: '进行中', color: 'bg-blue-100 text-blue-800' },
      submitted: { text: '已提交', color: 'bg-green-100 text-green-800' },
      graded: { text: '已批改', color: 'bg-purple-100 text-purple-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">作业管理</h1>
              <p className="text-gray-600">布置和批改学生作业</p>
            </div>
            <Button ageGroup="middle" onClick={() => navigate('/teacher/homework/create')}>
              + 布置作业
            </Button>
          </div>
        </header>

        {/* 筛选 */}
        <Card className="mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'submitted', 'graded'] as const).map((status) => (
              <Button
                key={status}
                ageGroup="middle"
                variant={filterStatus === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? '全部' : 
                 status === 'pending' ? '待完成' :
                 status === 'submitted' ? '待批改' : '已批改'}
              </Button>
            ))}
          </div>
        </Card>

        {/* 作业列表 */}
        {filteredHomework.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2">还没有作业</h2>
            <p className="text-gray-600 mb-6">布置你的第一个作业吧！</p>
            <Button ageGroup="middle" onClick={() => navigate('/teacher/homework/create')}>
              布置作业
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHomework.map((homework) => (
              <Card 
                key={homework.id}
                onClick={() => navigate(`/teacher/homework/${homework.id}`)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{homework.title}</h3>
                      {getStatusBadge(homework.status)}
                    </div>
                    <p className="text-gray-600 mb-3">{homework.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>布置时间：{new Date(homework.createdAt).toLocaleDateString('zh-CN')}</span>
                      {homework.dueDate && (
                        <span>截止：{new Date(homework.dueDate).toLocaleDateString('zh-CN')}</span>
                      )}
                      {homework.submittedAt && (
                        <span>提交时间：{new Date(homework.submittedAt).toLocaleDateString('zh-CN')}</span>
                      )}
                    </div>
                    {homework.status === 'graded' && homework.grade !== undefined && (
                      <div className="mt-3 inline-block">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          成绩：{homework.grade} 分
                        </span>
                      </div>
                    )}
                  </div>
                  <Button 
                    ageGroup="middle"
                    variant={homework.status === 'submitted' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/homework/${homework.id}`);
                    }}
                  >
                    {homework.status === 'submitted' ? '批改' : homework.status === 'graded' ? '查看' : '查看'}
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