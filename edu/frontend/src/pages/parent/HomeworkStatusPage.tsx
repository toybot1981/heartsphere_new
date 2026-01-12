import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockHomework, mockParents, mockStudents } from '../../types/mock';

export const HomeworkStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const currentParent = mockParents[0];
  const childId = currentParent.childrenIds[0];
  const child = mockStudents.find(s => s.id === childId);
  const homeworkList = mockHomework.filter(hw => hw.studentId === childId);

  if (!child) {
    return <div>未找到学生信息</div>;
  }

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
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {child.username} 的作业情况
          </h1>
          <p className="text-gray-600">查看孩子的作业完成情况</p>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-3xl mb-2">{homeworkList.length}</div>
            <div className="text-sm text-gray-600">总作业</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2 text-orange-600">
              {homeworkList.filter(hw => hw.status === 'pending' || hw.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">待完成</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2 text-green-600">
              {homeworkList.filter(hw => hw.status === 'submitted' || hw.status === 'graded').length}
            </div>
            <div className="text-sm text-gray-600">已完成</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl mb-2 text-purple-600">
              {homeworkList.filter(hw => hw.status === 'graded').length}
            </div>
            <div className="text-sm text-gray-600">已批改</div>
          </Card>
        </div>

        {/* 作业列表 */}
        {homeworkList.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold mb-2">还没有作业</h2>
            <p className="text-gray-600">老师还没有布置作业</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {homeworkList.map((homework) => (
              <Card key={homework.id}>
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
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          成绩：{homework.grade} 分
                        </span>
                      </div>
                    )}
                    {homework.status === 'graded' && homework.feedback && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">老师反馈：</p>
                        <p className="text-sm text-blue-700">{homework.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};