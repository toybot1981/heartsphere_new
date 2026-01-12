import React, { useState, useEffect } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';
import { adminApi } from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { showAlert, showConfirm } from '../../utils/dialog';
import type { Teacher } from '../../types/edu';

export const AdminTeacherManagePage: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');

  const loadTeachers = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.edu.teachers.getAll(
        adminToken,
        currentPage,
        pageSize,
        searchTerm || undefined,
        filterStatus === 'all' ? undefined : filterStatus
      );
      setTeachers(response.teachers);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('加载教师列表失败:', error);
      showAlert('加载教师列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      // 如果 edu 后端未实现，使用空列表
      setTeachers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [currentPage, searchTerm, filterStatus, adminToken]);

  // 延迟搜索（避免每次输入都请求）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        loadTeachers();
      } else {
        setCurrentPage(0); // 搜索时重置到第一页
      }
    }, 500); // 500ms 延迟
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F2937' }}>教师管理</h1>
          <p style={{ color: '#4B5563' }}>管理系统中的所有教师账户</p>
        </header>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索教师姓名或邮箱..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                ageGroup="middle"
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                全部
              </Button>
              <Button
                ageGroup="middle"
                variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                待审核
              </Button>
              <Button
                ageGroup="middle"
                variant={filterStatus === 'approved' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
              >
                已审核
              </Button>
            </div>
          </div>
        </Card>

        {/* 教师列表 */}
        <Card>
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">教师</th>
                    <th className="text-left p-4 font-semibold text-gray-700">学校</th>
                    <th className="text-left p-4 font-semibold text-gray-700">科目</th>
                    <th className="text-left p-4 font-semibold text-gray-700">注册时间</th>
                    <th className="text-left p-4 font-semibold text-gray-700">审核状态</th>
                    <th className="text-left p-4 font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {totalElements === 0 ? '暂无教师数据' : '没有找到匹配的教师'}
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher: Teacher) => (
                    <tr key={teacher.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span>👨‍🏫</span>
                          </div>
                          <div>
                            <p className="font-medium">{teacher.username}</p>
                            <p className="text-sm text-gray-500">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{teacher.school || '-'}</td>
                      <td className="p-4">{teacher.subject || '-'}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(teacher.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="p-4">
                        {/* TODO: 从 teacher 对象中获取实际状态 */}
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          已审核
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
                                const teacherData = await adminApi.edu.teachers.getById(parseInt(teacher.id), adminToken);
                                showAlert(
                                  `教师信息:\n姓名: ${teacherData.username}\n邮箱: ${teacherData.email}\n学校: ${teacherData.school || '未设置'}\n科目: ${teacherData.subject || '未设置'}`,
                                  '教师详情',
                                  'info'
                                );
                              } catch (error: any) {
                                console.error('获取教师详情失败:', error);
                                showAlert('获取教师详情失败: ' + (error.message || '未知错误'), '操作失败', 'error');
                              }
                            }}
                          >
                            查看
                          </Button>
                          <Button
                            ageGroup="middle"
                            variant="primary"
                            size="sm"
                            onClick={async () => {
                              if (!adminToken) return;
                              const confirmed = await showConfirm(
                                `确定要审核通过教师 "${teacher.username}" 吗？`,
                                '审核通过',
                                'warning'
                              );
                              if (!confirmed) return;
                              
                              try {
                                await adminApi.edu.teachers.approve(parseInt(teacher.id), adminToken);
                                showAlert('教师已审核通过', '操作成功', 'success');
                                loadTeachers();
                              } catch (error: any) {
                                console.error('审核通过失败:', error);
                                showAlert('审核通过失败: ' + (error.message || '未知错误'), '操作失败', 'error');
                              }
                            }}
                          >
                            通过
                          </Button>
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300"
                            onClick={async () => {
                              if (!adminToken) return;
                              const reason = prompt('请输入拒绝原因:');
                              if (!reason) return;
                              
                              try {
                                await adminApi.edu.teachers.reject(parseInt(teacher.id), reason, adminToken);
                                showAlert('教师申请已拒绝', '操作成功', 'success');
                                loadTeachers();
                              } catch (error: any) {
                                console.error('拒绝教师申请失败:', error);
                                showAlert('拒绝教师申请失败: ' + (error.message || '未知错误'), '操作失败', 'error');
                              }
                            }}
                          >
                            拒绝
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
              <div className="text-sm text-gray-600">
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