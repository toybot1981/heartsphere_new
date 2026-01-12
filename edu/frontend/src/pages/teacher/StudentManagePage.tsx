import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockStudents } from '../../types/mock';

export const StudentManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState<'all' | 'elementary' | 'middle'>('all');

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgeGroup = filterAgeGroup === 'all' || student.ageGroup === filterAgeGroup;
    return matchesSearch && matchesAgeGroup;
  });

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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">学生管理</h1>
              <p className="text-gray-600">查看和管理所有学生信息</p>
            </div>
            <Button ageGroup="middle" onClick={() => console.log('添加学生')}>
              + 添加学生
            </Button>
          </div>
        </header>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索学生姓名或邮箱..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                ageGroup="middle"
                variant={filterAgeGroup === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterAgeGroup('all')}
              >
                全部
              </Button>
              <Button
                ageGroup="middle"
                variant={filterAgeGroup === 'elementary' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterAgeGroup('elementary')}
              >
                小学生
              </Button>
              <Button
                ageGroup="middle"
                variant={filterAgeGroup === 'middle' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterAgeGroup('middle')}
              >
                中学生
              </Button>
            </div>
          </div>
        </Card>

        {/* 学生列表 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold text-gray-700">学生</th>
                  <th className="text-left p-4 font-semibold text-gray-700">年级</th>
                  <th className="text-left p-4 font-semibold text-gray-700">学校</th>
                  <th className="text-left p-4 font-semibold text-gray-700">年龄组</th>
                  <th className="text-left p-4 font-semibold text-gray-700">注册时间</th>
                  <th className="text-left p-4 font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      没有找到学生
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.username} className="w-full h-full rounded-full" />
                            ) : (
                              <span>👤</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{student.username}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{student.grade || '-'}</td>
                      <td className="p-4">{student.school || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          student.ageGroup === 'elementary'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {student.ageGroup === 'elementary' ? '小学生' : '中学生'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/teacher/students/${student.id}`)}
                          >
                            查看
                          </Button>
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/teacher/students/${student.id}/progress`)}
                          >
                            进度
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};