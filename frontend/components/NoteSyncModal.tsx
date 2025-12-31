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
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'syncing':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
          <div className="text-white">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">笔记同步</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('syncs')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'syncs'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            同步配置
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            笔记列表 ({notes.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'syncs' && (
            <div className="space-y-4">
              {/* Notion */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Notion</h3>
                    <p className="text-sm text-slate-400">同步您的 Notion 笔记到心域</p>
                  </div>
                  {syncs.find(s => s.provider === 'notion' && s.isActive) ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync('notion')}
                        disabled={syncing === 'notion'}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {syncing === 'notion' ? '同步中...' : '立即同步'}
                      </button>
                      <button
                        onClick={() => handleRevoke('notion')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                      >
                        撤销授权
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAuthorizeNotion}
                      disabled={authorizing === 'notion'}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {authorizing === 'notion' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notion 数据库 ID
                      </label>
                      <p className="text-xs text-slate-400 mb-3">
                        在 Notion 中创建数据库后，从 URL 中复制数据库 ID（32 位字符，包含连字符）
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={notionDatabaseId}
                          onChange={(e) => setNotionDatabaseId(e.target.value)}
                          placeholder="例如: 8c916df3-7fc1-81b5-b59f-0003c2b3777d"
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingDatabaseId ? '更新中...' : '更新'}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        💡 提示：数据库必须与您的 Notion 集成共享
                      </p>
                    </div>

                    {/* 状态信息 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">状态:</span>
                        <span className={getStatusColor(syncs.find(s => s.provider === 'notion')?.syncStatus || null)}>
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
                        <span className="text-slate-400">最后同步:</span>
                        <span className="text-slate-300">
                          {formatDate(syncs.find(s => s.provider === 'notion')?.lastSyncAt || null)}
                        </span>
                      </div>
                      {syncs.find(s => s.provider === 'notion')?.syncError && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-xs">
                          {syncs.find(s => s.provider === 'notion')?.syncError}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {authorizing === 'notion' && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mt-0.5"></div>
                      <div className="flex-1">
                        <p className="text-blue-300 text-sm font-medium mb-1">正在授权中...</p>
                        <p className="text-blue-400/80 text-xs">
                          请在弹出的窗口中完成 Notion 授权。授权完成后，窗口将自动关闭。
                        </p>
                        {authWindow && (
                          <button
                            onClick={() => {
                              authWindow.focus();
                            }}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
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
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">更多笔记服务</h3>
                    <p className="text-sm text-slate-400">Notion、Obsidian 等即将支持</p>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-700 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed"
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedProvider === null
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  全部
                </button>
                {Array.from(new Set(notes.map(n => n.provider))).map(provider => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedProvider === provider
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {provider === 'notion' ? 'Notion' : provider}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              {notes
                .filter(n => !selectedProvider || n.provider === selectedProvider)
                .length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p>暂无笔记</p>
                  <p className="text-sm mt-2">请先授权并同步笔记服务</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes
                    .filter(n => !selectedProvider || n.provider === selectedProvider)
                    .map(note => (
                      <div
                        key={note.id}
                        className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{note.title}</h4>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                              {note.content?.substring(0, 200)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
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
                              className="ml-4 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium"
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

