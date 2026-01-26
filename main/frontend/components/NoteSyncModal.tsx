import React, { useState, useEffect } from 'react';
import { noteSyncApi } from '../services/api';
import { showAlert, showConfirm } from '../utils/dialog';
import { getApiUrl } from '../services/api/config';

// 声明 sessionStorage（TypeScript 可能需要）
declare const sessionStorage: Storage;

interface NoteSyncModalProps {
  token: string;
  onClose: () => void;
}

interface NoteSync {
  id: number;
  userId: number;
  provider: string;
  isActive: boolean;
  lastSyncAt: string | null;
  syncStatus: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: number;
  userId: number;
  provider: string;
  providerNoteId: string;
  title: string;
  content: string;
  contentType: string | null;
  notebookName: string | null;
  tags: string | null;
  url: string | null;
  createdAtProvider: string | null;
  updatedAtProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

export const NoteSyncModal: React.FC<NoteSyncModalProps> = ({ token, onClose }) => {
  const [syncs, setSyncs] = useState<NoteSync[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'syncs' | 'notes'>('syncs');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState<string | null>(null);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const [updatingDatabaseId, setUpdatingDatabaseId] = useState(false);

  useEffect(() => {
    loadData();
    
    // 监听来自授权窗口的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'notion_auth_result') {
        setAuthorizing(null);
        setAuthWindow(null);
        
        if (event.data.status === 'success') {
          showAlert('授权成功！', '授权成功', 'success');
          loadData();
        } else {
          showAlert(event.data.message || '授权失败', '授权失败', 'error');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 获取实际的 token（从 props 或存储中）
  const getActualToken = (): string => {
    let actualToken = token;
    if (!actualToken) {
      actualToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    }
    return actualToken;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 如果传入的 token 为空，尝试从存储中获取
      const actualToken = getActualToken();
      
      if (!actualToken) {
        console.error('[NoteSyncModal] 无法获取 token，无法加载数据');
        showAlert('无法获取登录令牌，请重新登录', '需要登录', 'warning');
        return;
      }
      
      const [syncsData, notesData] = await Promise.all([
        noteSyncApi.getSyncs(actualToken),
        noteSyncApi.getNotes(undefined, actualToken),
      ]);
      setSyncs(syncsData);
      setNotes(notesData);
    } catch (error) {
      console.error('加载数据失败:', error);
      showAlert('加载同步数据失败，请检查登录状态', '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeNotion = async () => {
    const actualToken = getActualToken();
    if (!actualToken) return;
    
    try {
      setAuthorizing('notion');
      // 使用后端服务器的回调地址，而不是前端地址
      // Notion OAuth 2.0 回调地址需要指向后端服务器
      const callbackUrl = getApiUrl('/notes/notion/callback');
      const authInfo = await noteSyncApi.getNotionAuthUrl(callbackUrl, actualToken);
      
      // 打开授权页面
      const newAuthWindow = window.open(
        authInfo.authorizationUrl,
        'notion_auth',
        'width=600,height=700,scrollbars=yes'
      );

      if (!newAuthWindow) {
        showAlert('无法打开授权窗口，请检查浏览器弹窗设置', '错误', 'error');
        setAuthorizing(null);
        return;
      }

      setAuthWindow(newAuthWindow);

      // 监听授权窗口关闭或授权完成
      const checkClosed = setInterval(async () => {
        if (newAuthWindow.closed) {
          clearInterval(checkClosed);
          setAuthorizing(null);
          setAuthWindow(null);
          
          // 等待一下再检查授权状态
          setTimeout(async () => {
            try {
              const actualToken = getActualToken();
              if (!actualToken) return;
              const status = await noteSyncApi.getSyncStatus('notion', actualToken);
              if (status.authorized) {
                showAlert('授权成功！', '授权成功', 'success');
                await loadData();
              } else {
                showAlert('授权未完成，请重试', '提示', 'warning');
              }
            } catch (error) {
              console.error('检查授权状态失败:', error);
            }
          }, 1000);
        }
      }, 1000);

      // 30分钟后自动停止检查
      setTimeout(() => {
        clearInterval(checkClosed);
        setAuthorizing(null);
        setAuthWindow(null);
      }, 30 * 60 * 1000);
    } catch (error: any) {
      showAlert('获取授权URL失败: ' + (error.message || '未知错误'), '错误', 'error');
      setAuthorizing(null);
    }
  };

  const handleSync = async (provider: string) => {
    try {
      setSyncing(provider);
      await noteSyncApi.syncNotes(provider, token);
      await loadData();
      showAlert('同步成功', '操作成功', 'success');
    } catch (error: any) {
      showAlert('同步失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setSyncing(null);
    }
  };

  const handleRevoke = async (provider: string) => {
    const confirmed = await showConfirm(`确定要撤销${provider}的授权吗？`, '撤销授权', 'warning');
    if (!confirmed) {
      return;
    }

    try {
      const actualToken = getActualToken();
      if (!actualToken) return;
      await noteSyncApi.revokeAuthorization(provider, actualToken);
      await loadData();
      showAlert('撤销授权成功', '操作成功', 'success');
    } catch (error: any) {
      showAlert('撤销授权失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'success':
        return 'var(--color-success, #4ade80)';
      case 'error':
        return 'var(--color-error, #f87171)';
      case 'syncing':
        return 'var(--color-info, #60a5fa)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  if (loading) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.5))',
        }}
      >
        <div 
          className="rounded-xl p-8 border"
          style={{
            backgroundColor: 'var(--bg-secondary, #0f172a)',
            borderColor: 'var(--border-color-overlay, #1e293b)',
          }}
        >
          <div style={{ color: 'var(--text-primary)' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.5))',
      }}
    >
      <div 
        className="rounded-xl border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-secondary, #0f172a)',
          borderColor: 'var(--border-color-overlay, #1e293b)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border-color-overlay, #1e293b)' }}
        >
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            笔记同步
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b"
          style={{ borderColor: 'var(--border-color-overlay, #1e293b)' }}
        >
          <button
            onClick={() => setActiveTab('syncs')}
            className="flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2"
            style={{
              color: activeTab === 'syncs'
                ? 'var(--color-primary, #818cf8)'
                : 'var(--text-tertiary)',
              borderColor: activeTab === 'syncs'
                ? 'var(--color-primary, #818cf8)'
                : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'syncs') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'syncs') {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            同步配置
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className="flex-1 px-6 py-3 text-sm font-medium transition-colors border-b-2"
            style={{
              color: activeTab === 'notes'
                ? 'var(--color-primary, #818cf8)'
                : 'var(--text-tertiary)',
              borderColor: activeTab === 'notes'
                ? 'var(--color-primary, #818cf8)'
                : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'notes') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'notes') {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            笔记列表 ({notes.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'syncs' && (
            <div className="space-y-4">
              {/* Notion */}
              <div 
                className="rounded-lg p-6 border"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                  borderColor: 'var(--border-color-overlay, #334155)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 
                      className="text-lg font-bold mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Notion
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      同步您的 Notion 笔记到心域
                    </p>
                  </div>
                  {syncs.find(s => s.provider === 'notion' && s.isActive) ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync('notion')}
                        disabled={syncing === 'notion'}
                        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{
                          backgroundColor: 'var(--color-primary, #6366f1)',
                          color: 'var(--text-primary)',
                        }}
                        onMouseEnter={(e) => {
                          if (syncing !== 'notion') {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (syncing !== 'notion') {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
                          }
                        }}
                      >
                        {syncing === 'notion' ? '同步中...' : '立即同步'}
                      </button>
                      <button
                        onClick={() => handleRevoke('notion')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: 'var(--color-error, #dc2626)',
                          color: 'var(--text-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-error, #b91c1c)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-error, #dc2626)';
                        }}
                      >
                        撤销授权
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAuthorizeNotion}
                      disabled={authorizing === 'notion'}
                      className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: 'var(--color-primary, #6366f1)',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        if (authorizing !== 'notion') {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (authorizing !== 'notion') {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
                        }
                      }}
                    >
                      {authorizing === 'notion' ? (
                        <>
                          <div 
                            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                            style={{
                              borderColor: 'var(--text-primary)',
                              borderTopColor: 'transparent',
                            }}
                          />
                          授权中...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          授权连接
                        </>
                      )}
                    </button>
                  )}
                </div>

                {syncs.find(s => s.provider === 'notion') && (
                  <div className="mt-4 space-y-4">
                    {/* 数据库 ID 配置 */}
                    <div 
                      className="rounded-lg p-4 border"
                      style={{
                        backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
                        borderColor: 'var(--border-color-overlay, #334155)',
                      }}
                    >
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Notion 数据库 ID
                      </label>
                      <p 
                        className="text-xs mb-3"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        在 Notion 中创建数据库后，从 URL 中复制数据库 ID（32 位字符，包含连字符）
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={notionDatabaseId}
                          onChange={(e) => setNotionDatabaseId(e.target.value)}
                          placeholder="例如: 8c916df3-7fc1-81b5-b59f-0003c2b3777d"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                            borderColor: 'var(--border-color-overlay, #334155)',
                            color: 'var(--text-primary)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = '2px solid var(--color-primary, #6366f1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                          }}
                        />
                        <button
                          onClick={async () => {
                            if (!notionDatabaseId.trim()) {
                              showAlert('请输入数据库 ID', '错误', 'error');
                              return;
                            }
                            try {
                              setUpdatingDatabaseId(true);
                              const actualToken = getActualToken();
                              if (!actualToken) return;
                              await noteSyncApi.updateNotionDatabaseId(notionDatabaseId.trim(), actualToken);
                              showAlert('数据库 ID 更新成功！', '成功', 'success');
                              setNotionDatabaseId('');
                              await loadData();
                            } catch (error: any) {
                              showAlert('更新失败: ' + (error.message || '未知错误'), '错误', 'error');
                            } finally {
                              setUpdatingDatabaseId(false);
                            }
                          }}
                          disabled={updatingDatabaseId || !notionDatabaseId.trim()}
                          className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          style={{
                            backgroundColor: 'var(--color-primary, #6366f1)',
                            color: 'var(--text-primary)',
                          }}
                          onMouseEnter={(e) => {
                            if (!updatingDatabaseId && notionDatabaseId.trim()) {
                              e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!updatingDatabaseId && notionDatabaseId.trim()) {
                              e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
                            }
                          }}
                        >
                          {updatingDatabaseId ? '更新中...' : '更新'}
                        </button>
                      </div>
                      <p 
                        className="text-xs mt-2"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        💡 提示：数据库必须与您的 Notion 集成共享
                      </p>
                    </div>

                    {/* 状态信息 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-tertiary)' }}>状态:</span>
                        <span style={{ color: getStatusColor(syncs.find(s => s.provider === 'notion')?.syncStatus || null) }}>
                          {(() => {
                            const status = syncs.find(s => s.provider === 'notion')?.syncStatus;
                            if (status === 'success') return '✓ 已同步';
                            if (status === 'error') return '✗ 同步失败';
                            if (status === 'syncing') return '⟳ 同步中';
                            if (status === 'authorized') return '✓ 已授权';
                            return '未同步';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-tertiary)' }}>最后同步:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(syncs.find(s => s.provider === 'notion')?.lastSyncAt || null)}
                        </span>
                      </div>
                      {syncs.find(s => s.provider === 'notion')?.syncError && (
                        <div 
                          className="mt-2 p-2 border rounded text-xs"
                          style={{
                            backgroundColor: 'var(--color-error, rgba(127, 29, 29, 0.2))',
                            borderColor: 'var(--color-error, rgba(153, 27, 27, 1))',
                            color: 'var(--color-error, #f87171)',
                          }}
                        >
                          {syncs.find(s => s.provider === 'notion')?.syncError}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {authorizing === 'notion' && (
                  <div 
                    className="mt-4 p-4 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-info, rgba(30, 58, 138, 0.2))',
                      borderColor: 'var(--color-info, rgba(30, 64, 175, 1))',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mt-0.5"
                        style={{
                          borderColor: 'var(--color-info, #60a5fa)',
                          borderTopColor: 'transparent',
                        }}
                      />
                      <div className="flex-1">
                        <p 
                          className="text-sm font-medium mb-1"
                          style={{ color: 'var(--color-info, #93c5fd)' }}
                        >
                          正在授权中...
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--color-info, rgba(96, 165, 250, 0.8))' }}
                        >
                          请在弹出的窗口中完成 Notion 授权。授权完成后，窗口将自动关闭。
                        </p>
                        {authWindow && (
                          <button
                            onClick={() => {
                              authWindow.focus();
                            }}
                            className="mt-2 text-xs underline transition-colors"
                            style={{ color: 'var(--color-info, #60a5fa)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--color-info, #93c5fd)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--color-info, #60a5fa)';
                            }}
                          >
                            点击打开授权窗口
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 未来可以添加其他笔记服务 */}
              <div 
                className="rounded-lg p-6 border opacity-50"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                  borderColor: 'var(--border-color-overlay, #334155)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 
                      className="text-lg font-bold mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      更多笔记服务
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Notion、Obsidian 等即将支持
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--bg-overlay, rgba(51, 65, 85, 1))',
                      color: 'var(--text-disabled)',
                    }}
                  >
                    即将推出
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: selectedProvider === null
                      ? 'var(--color-primary, #6366f1)'
                      : 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                    color: selectedProvider === null
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProvider !== null) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 1))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProvider !== null) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 1))';
                    }
                  }}
                >
                  全部
                </button>
                {Array.from(new Set(notes.map(n => n.provider))).map(provider => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: selectedProvider === provider
                        ? 'var(--color-primary, #6366f1)'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                      color: selectedProvider === provider
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProvider !== provider) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 1))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProvider !== provider) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 1))';
                      }
                    }}
                  >
                    {provider === 'notion' ? 'Notion' : provider}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              {notes
                .filter(n => !selectedProvider || n.provider === selectedProvider)
                .length === 0 ? (
                <div 
                  className="text-center py-12"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <p>暂无笔记</p>
                  <p 
                    className="text-sm mt-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    请先授权并同步笔记服务
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes
                    .filter(n => !selectedProvider || n.provider === selectedProvider)
                    .map(note => (
                      <div
                        key={note.id}
                        className="rounded-lg p-4 border transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
                          borderColor: 'var(--border-color-overlay, #334155)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 
                              className="font-medium mb-1"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {note.title}
                            </h4>
                            <p 
                              className="text-sm line-clamp-2 mb-2"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              {note.content?.substring(0, 200)}...
                            </p>
                            <div 
                              className="flex items-center gap-4 text-xs"
                              style={{ color: 'var(--text-disabled)' }}
                            >
                              <span>{note.provider === 'notion' ? 'Notion' : note.provider}</span>
                              {note.notebookName && <span>📁 {note.notebookName}</span>}
                              {note.tags && <span>🏷️ {note.tags}</span>}
                              <span>🕒 {formatDate(note.updatedAtProvider || note.updatedAt)}</span>
                            </div>
                          </div>
                          {note.url && (
                            <a
                              href={note.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 px-3 py-1 rounded text-xs font-medium transition-colors"
                              style={{
                                backgroundColor: 'var(--color-primary, #6366f1)',
                                color: 'var(--text-primary)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
                              }}
                            >
                              查看原文
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

