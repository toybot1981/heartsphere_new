import React, { useState, useEffect } from 'react';

interface SessionManagementPanelProps {
  adminToken: string | null;
}

interface SessionItem {
  sessionId: string;
  userId: string;
  title: string;
  vmId?: string;
  lastActivityTime?: string;
  createdAt: string;
}

export const SessionManagementPanel: React.FC<SessionManagementPanelProps> = ({ adminToken }) => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 加载会话列表
  const loadSessions = async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      // TODO: 实现获取所有会话的 API
      // 目前先使用占位数据
      setSessions([]);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [adminToken]);

  const filteredSessions = sessions.filter(session =>
    !searchTerm ||
    session.sessionId.includes(searchTerm) ||
    session.title.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 操作栏 */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">会话管理</h2>
          <div className="flex gap-2">
            <button
              onClick={loadSessions}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              刷新
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              onClick={() => {
                // TODO: 创建演示会话
              }}
            >
              创建演示会话
            </button>
          </div>
        </div>
        
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索会话ID或标题..."
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {sessions.length === 0 ? '暂无会话' : '没有匹配的会话'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredSessions.map((session) => (
              <div key={session.sessionId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{session.title}</span>
                      {session.vmId && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          已绑定VM
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>会话ID: {session.sessionId}</div>
                      <div>用户ID: {session.userId}</div>
                      {session.vmId && <div>虚拟机ID: {session.vmId}</div>}
                      <div>
                        创建时间: {new Date(session.createdAt).toLocaleString()}
                        {session.lastActivityTime && 
                          ` · 最后活动: ${new Date(session.lastActivityTime).toLocaleString()}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                      onClick={() => {
                        // TODO: 查看会话详情
                      }}
                    >
                      详情
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => {
                        // TODO: 删除会话
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
