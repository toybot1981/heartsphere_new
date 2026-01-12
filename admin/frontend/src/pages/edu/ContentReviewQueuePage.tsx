import React, { useState, useEffect } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';
import { adminApi } from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { showAlert, showConfirm } from '../../utils/dialog';
import type { ContentDTO } from '../../services/api/admin/edu/content';

export const ContentReviewQueuePage: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [content, setContent] = useState<ContentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadReviewQueue = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.edu.content.getReviewQueue(
        adminToken,
        currentPage,
        pageSize,
        undefined, // type: 所有类型
        'pending' // status: 待审核
      );
      setContent(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('加载审核队列失败:', error);
      showAlert('加载审核队列失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      // 如果 edu 后端未实现，使用空列表
      setContent([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewQueue();
  }, [currentPage, adminToken]);

  const handleApprove = async (id: string) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      '确定要审核通过这条内容吗？',
      '审核通过',
      'warning'
    );
    if (!confirmed) return;

    try {
      await adminApi.edu.content.approve(parseInt(id), adminToken);
      showAlert('内容已审核通过', '操作成功', 'success');
      loadReviewQueue();
    } catch (error: any) {
      console.error('审核通过失败:', error);
      showAlert('审核通过失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const handleReject = async (id: string) => {
    if (!adminToken) return;
    const reason = prompt('请输入拒绝原因:');
    if (!reason) return;

    try {
      await adminApi.edu.content.reject(parseInt(id), reason, adminToken);
      showAlert('内容已拒绝', '操作成功', 'success');
      loadReviewQueue();
    } catch (error: any) {
      console.error('拒绝内容失败:', error);
      showAlert('拒绝内容失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const totalPending = totalElements;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F2937' }}>内容审核队列</h1>
          <p style={{ color: '#4B5563' }}>审核用户提交的内容（场景、角色等）</p>
          {totalPending > 0 && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">⚠️ 共有 {totalPending} 个待审核内容</p>
            </div>
          )}
        </header>

        {/* 待审核内容列表 */}
        <Card>
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>加载中...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold mb-2">没有待审核内容</h2>
              <p className="text-gray-600">所有内容都已审核完成</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {content.map((item: ContentDTO) => {
                  const isScene = 'ageGroup' in item; // Scene 有 ageGroup，Character 有 role
                  return (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{isScene ? '🎨' : '👤'}</span>
                            <div>
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                              <p className="text-sm text-gray-500">创建者ID: {item.createdBy}</p>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>创建时间：{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
                            {isScene && 'ageGroup' in item && (
                              <span className={`px-2 py-1 rounded ${
                                item.ageGroup === 'elementary' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.ageGroup === 'elementary' ? '小学' : '中学'}
                              </span>
                            )}
                            {!isScene && 'role' in item && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {item.role}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300"
                            onClick={() => handleApprove(item.id)}
                          >
                            通过
                          </Button>
                          <Button
                            ageGroup="middle"
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300"
                            onClick={() => handleReject(item.id)}
                          >
                            拒绝
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t mt-4">
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
            </>
          )}
        </Card>
      </div>
    </div>
  );
};