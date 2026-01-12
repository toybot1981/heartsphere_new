import React, { useState, useEffect } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';
import { adminApi } from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { showAlert, showConfirm } from '../../utils/dialog';
import type { Student } from '../../types/edu';

export const AdminStudentManagePage: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState<'all' | 'elementary' | 'middle'>('all');

  const loadStudents = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      // 转换年龄组筛选为数字（1: elementary, 2: middle）
      const ageGroupNum = filterAgeGroup === 'elementary' ? 1 : filterAgeGroup === 'middle' ? 2 : undefined;
      
      const response = await adminApi.edu.students.getAll(
        adminToken,
        currentPage,
        pageSize,
        searchTerm || undefined,
        ageGroupNum,
        undefined // school filter
      );
      setStudents(response.students);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('加载学生列表失败:', error);
      showAlert('加载学生列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      // 如果 edu 后端未实现，使用空列表
      setStudents([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [currentPage, searchTerm, filterAgeGroup, adminToken]);

  // 延迟搜索（避免每次输入都请求）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        loadStudents();
      } else {
        setCurrentPage(0); // 搜索时重置到第一页
      }
    }, 500); // 500ms 延迟
    return () => clearTimeout(timer);
  }, [searchTerm, filterAgeGroup]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">学生管理</h1>
          <p className="text-gray-600">管理系统中的所有学生账户</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          {loading ? (
            <div className="p-8 text-center" style={{ color: '#6B7280' }}>
              <p>加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>学生</th>
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>年级</th>
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>学校</th>
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>年龄组</th>
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>注册时间</th>
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>状态</th>
                    <th className="text-left p-4 font-semibold" style={{ color: '#374151' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center" style={{ color: '#6B7280' }}>
                        {totalElements === 0 ? '暂无学生数据' : '没有找到匹配的学生'}
                      </td>
                    </tr>
                  ) : (
                    students.map((student: Student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span>👤</span>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#111827' }}>{student.username}</p>
                            <p className="text-sm" style={{ color: '#6B7280' }}>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4" style={{ color: '#111827' }}>{student.grade || '-'}</td>
                      <td className="p-4" style={{ color: '#111827' }}>{student.school || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          student.ageGroup === 'elementary'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {student.ageGroup === 'elementary' ? '小学生' : '中学生'}
                        </span>
                      </td>
                      <td className="p-4 text-sm" style={{ color: '#6B7280' }}>
                        {new Date(student.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          正常
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!adminToken) return;
                              try {
                                const studentData = await adminApi.edu.students.getById(parseInt(student.id), adminToken);
                                showAlert(
                                  `学生信息:\n姓名: ${studentData.username}\n邮箱: ${studentData.email}\n年级: ${studentData.grade || '未设置'}\n学校: ${studentData.school || '未设置'}`,
                                  '学生详情',
                                  'info'
                                );
                              } catch (error: any) {
                                console.error('获取学生详情失败:', error);
                                showAlert('获取学生详情失败: ' + (error.message || '未知错误'), '操作失败', 'error');
                              }
                            }}
                          >
                            查看
                          </Button>
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300"
                            onClick={async () => {
                              if (!adminToken) return;
                              const confirmed = await showConfirm(
                                `确定要删除学生 "${student.username}" 吗？`,
                                '删除学生',
                                'warning'
                              );
                              if (!confirmed) return;
                              
                              try {
                                await adminApi.edu.students.delete(parseInt(student.id), adminToken);
                                showAlert('学生已删除', '操作成功', 'success');
                                loadStudents();
                              } catch (error: any) {
                                console.error('删除学生失败:', error);
                                showAlert('删除学生失败: ' + (error.message || '未知错误'), '操作失败', 'error');
                              }
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          )}
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm" style={{ color: '#4B5563' }}>
                共 {totalElements} 条记录，第 {currentPage + 1} / {totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  ageGroup="middle"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0 || loading}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </Button>
                <Button
                  ageGroup="middle"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1 || loading}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};