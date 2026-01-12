import React, { useState, useEffect } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';
import { adminApi } from '../../services/api';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { showAlert, showConfirm } from '../../utils/dialog';
import type { ContentDTO } from '../../services/api/admin/edu/content';
import type { Scene, Character } from '../../types/edu';

export const AdminContentManagePage: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'scenes' | 'characters' | 'pending'>('pending');
  const [pendingContent, setPendingContent] = useState<ContentDTO[]>([]);
  const [allScenes, setAllScenes] = useState<Scene[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize] = useState(20);

  const loadPendingContent = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.edu.content.getReviewQueue(
        adminToken,
        0, // page: 第一页
        pageSize,
        undefined, // type: 所有类型
        'pending' // status: 待审核
      );
      setPendingContent(response.content);
    } catch (error: any) {
      console.error('加载待审核内容失败:', error);
      showAlert('加载待审核内容失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      setPendingContent([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllScenes = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.edu.content.getReviewQueue(
        adminToken,
        0, // page: 第一页
        pageSize,
        'scene', // type: 场景
        undefined // status: 所有状态
      );
      // TODO: 需要根据实际 API 响应调整
      setAllScenes(response.content as Scene[]);
    } catch (error: any) {
      console.error('加载场景列表失败:', error);
      showAlert('加载场景列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      setAllScenes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCharacters = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.edu.content.getReviewQueue(
        adminToken,
        0, // page: 第一页
        pageSize,
        'character', // type: 角色
        undefined // status: 所有状态
      );
      // TODO: 需要根据实际 API 响应调整
      setAllCharacters(response.content as Character[]);
    } catch (error: any) {
      console.error('加载角色列表失败:', error);
      showAlert('加载角色列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      setAllCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingContent();
    } else if (activeTab === 'scenes') {
      loadAllScenes();
    } else if (activeTab === 'characters') {
      loadAllCharacters();
    }
  }, [activeTab, adminToken]);

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
      if (activeTab === 'pending') {
        loadPendingContent();
      } else if (activeTab === 'scenes') {
        loadAllScenes();
      } else if (activeTab === 'characters') {
        loadAllCharacters();
      }
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
      if (activeTab === 'pending') {
        loadPendingContent();
      } else if (activeTab === 'scenes') {
        loadAllScenes();
      } else if (activeTab === 'characters') {
        loadAllCharacters();
      }
    } catch (error: any) {
      console.error('拒绝内容失败:', error);
      showAlert('拒绝内容失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      '确定要删除这条内容吗？',
      '删除内容',
      'warning'
    );
    if (!confirmed) return;

    try {
      await adminApi.edu.content.delete(parseInt(id), adminToken);
      showAlert('内容已删除', '操作成功', 'success');
      if (activeTab === 'scenes') {
        loadAllScenes();
      } else if (activeTab === 'characters') {
        loadAllCharacters();
      }
    } catch (error: any) {
      console.error('删除内容失败:', error);
      showAlert('删除内容失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F2937' }}>内容管理</h1>
          <p style={{ color: '#4B5563' }}>管理教育版中的所有内容（场景、角色等）</p>
        </header>

        {/* 标签页 */}
        <Card className="mb-6">
          <div className="flex gap-3 border-b">
            {[
              { id: 'pending', label: '待审核内容', count: pendingContent.length },
              { id: 'scenes', label: '场景管理', count: allScenes.length },
              { id: 'characters', label: '角色管理', count: allCharacters.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </Card>

        {/* 内容列表 */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {loading ? (
              <Card className="text-center py-12">
                <p className="text-gray-500">加载中...</p>
              </Card>
            ) : pendingContent.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-semibold mb-2">没有待审核内容</h2>
                <p className="text-gray-600">所有内容都已审核完成</p>
              </Card>
            ) : (
              <>
                {pendingContent.map((item: ContentDTO) => {
                  const isScene = 'ageGroup' in item;
                  return (
                    <Card key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{isScene ? '🎨' : '👤'}</span>
                            <div>
                              <h3 className="text-xl font-semibold">{item.name}</h3>
                              <p className="text-sm text-gray-500">创建者：{item.createdBy}</p>
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
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeTab === 'scenes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500">加载中...</p>
              </Card>
            ) : allScenes.length === 0 ? (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500">暂无场景数据</p>
              </Card>
            ) : (
              allScenes.map((scene: Scene) => (
                <Card key={scene.id}>
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <h3 className="font-semibold mb-2">{scene.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scene.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      ageGroup="middle" 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        // TODO: 实现编辑功能
                        showAlert('编辑功能待实现', '提示', 'info');
                      }}
                    >
                      编辑
                    </Button>
                    <Button 
                      ageGroup="middle" 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-300"
                      onClick={() => handleDelete(scene.id)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500">加载中...</p>
              </Card>
            ) : allCharacters.length === 0 ? (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500">暂无角色数据</p>
              </Card>
            ) : (
              allCharacters.map((character: Character) => (
                <Card key={character.id} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                  <h3 className="font-semibold mb-2">{character.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{character.role}</p>
                  <div className="flex gap-2">
                    <Button 
                      ageGroup="middle" 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        // TODO: 实现编辑功能
                        showAlert('编辑功能待实现', '提示', 'info');
                      }}
                    >
                      编辑
                    </Button>
                    <Button 
                      ageGroup="middle" 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-300"
                      onClick={() => handleDelete(character.id)}
                    >
                      删除
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};