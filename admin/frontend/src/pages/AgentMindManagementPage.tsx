import React, { useState, useEffect } from 'react';
import { agentMindApi, AgentIdentityDTO, AgentStateHistoryDTO, AgentStateStatisticsDTO } from '@/services/api/admin/agentMind';

/**
 * Agent Mind 管理页面
 * 提供智能体身份认知、状态监控和能力管理功能
 */
const AgentMindManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'identities' | 'states' | 'capabilities'>('identities');
  const [identities, setIdentities] = useState<AgentIdentityDTO[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<AgentIdentityDTO | null>(null);
  const [stateHistory, setStateHistory] = useState<AgentStateHistoryDTO[]>([]);
  const [currentState, setCurrentState] = useState<AgentStateHistoryDTO | null>(null);
  const [stateStatistics, setStateStatistics] = useState<AgentStateStatisticsDTO | null>(null);
  const [capabilities, setCapabilities] = useState<Array<Record<string, any>>>([]);
  const [limitations, setLimitations] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [statePage, setStatePage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stateTotalPages, setStateTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载身份认知列表
  const loadIdentities = async () => {
    setLoading(true);
    try {
      const response = await agentMindApi.getAgentIdentities(page, 20, searchKeyword);
      if (response) {
        setIdentities(response.content || []);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error('加载身份认知列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载状态历史
  const loadStateHistory = async (characterId: number) => {
    setLoading(true);
    try {
      const response = await agentMindApi.getStateHistory(characterId, statePage, 20);
      if (response) {
        setStateHistory(response.content || []);
        setStateTotalPages(response.totalPages || 0);
      }
      
      // 加载当前状态
      const currentStateResponse = await agentMindApi.getCurrentState(characterId);
      if (currentStateResponse) {
        setCurrentState(currentStateResponse);
      }
      
      // 加载统计信息
      const statsResponse = await agentMindApi.getStateStatistics(characterId);
      if (statsResponse) {
        setStateStatistics(statsResponse);
      }
    } catch (error) {
      console.error('加载状态信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载能力信息
  const loadCapabilities = async (characterId: number) => {
    setLoading(true);
    try {
      const [capabilitiesResponse, limitationsResponse] = await Promise.all([
        agentMindApi.getCapabilities(characterId),
        agentMindApi.getLimitations(characterId)
      ]);
      
      if (capabilitiesResponse) {
        setCapabilities(capabilitiesResponse);
      }
      if (limitationsResponse) {
        setLimitations(limitationsResponse);
      }
    } catch (error) {
      console.error('加载能力信息失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 加载身份认知详情
  const loadIdentityDetail = async (characterId: number) => {
    setLoading(true);
    try {
      const response = await agentMindApi.getAgentIdentity(characterId);
      if (response) {
        setSelectedIdentity(response);
      }
    } catch (error) {
      console.error('加载身份认知详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'identities') {
      loadIdentities();
    }
  }, [page, searchKeyword, activeTab]);

  useEffect(() => {
    if (activeTab === 'states' && selectedCharacterId) {
      loadStateHistory(selectedCharacterId);
    }
  }, [activeTab, selectedCharacterId, statePage]);

  useEffect(() => {
    if (activeTab === 'capabilities' && selectedCharacterId) {
      loadCapabilities(selectedCharacterId);
    }
  }, [activeTab, selectedCharacterId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Agent Mind 管理</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('identities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'identities'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            身份认知管理
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'states'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            状态监控
          </button>
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'capabilities'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
            }`}
          >
            能力管理
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* 身份认知管理 */}
        {activeTab === 'identities' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="搜索角色名称或角色类型..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  setPage(0);
                  loadIdentities();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-400">加载中...</div>
            ) : (
              <>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">角色ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">角色名称</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">角色类型</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">自我认知水平</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {identities.map((identity) => (
                        <tr key={identity.id} className="hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{identity.characterId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{identity.characterName || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{identity.characterRole || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            <div className="flex items-center">
                              <div className="w-24 bg-slate-700 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${identity.selfAwarenessLevel || 0}%` }}
                                />
                              </div>
                              <span>{identity.selfAwarenessLevel || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => {
                                setSelectedCharacterId(identity.characterId);
                                loadIdentityDetail(identity.characterId);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <span className="text-slate-300">
                    第 {page + 1} 页，共 {totalPages} 页
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </>
            )}

            {/* 身份认知详情 */}
            {selectedIdentity && (
              <div className="mt-6 bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">身份认知详情</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">角色名称</label>
                    <p className="text-white">{selectedIdentity.characterName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">角色类型</label>
                    <p className="text-white">{selectedIdentity.characterRole || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">角色简介</label>
                    <p className="text-white">{selectedIdentity.characterBio || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">自我认知水平</label>
                    <p className="text-white">{selectedIdentity.selfAwarenessLevel || 0}%</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">能力数量</label>
                    <p className="text-white">{selectedIdentity.capabilities?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 状态监控 */}
        {activeTab === 'states' && (
          <div className="space-y-6">
            {!selectedCharacterId ? (
              <div className="text-center py-8 text-slate-400">
                <p>请先从"身份认知管理"中选择一个角色</p>
              </div>
            ) : (
              <>
                {/* 当前状态 */}
                {currentState && (
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">当前状态</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">状态类型</label>
                        <p className="text-white font-semibold">{currentState.stateType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">状态描述</label>
                        <p className="text-white">{currentState.stateDescription || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">持续时间</label>
                        <p className="text-white">{currentState.durationMs ? `${(currentState.durationMs / 1000).toFixed(2)}秒` : '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 状态统计 */}
                {stateStatistics && (
                  <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">状态统计</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">总记录数</label>
                        <p className="text-white text-2xl font-bold">{stateStatistics.totalRecords || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">状态类型分布</label>
                        <div className="mt-2 space-y-2">
                          {stateStatistics.stateTypeCounts?.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-slate-300">{item.stateType}</span>
                              <span className="text-white font-semibold">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 状态历史 */}
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white">状态历史</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">时间</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">状态类型</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">描述</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">持续时间</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {stateHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {history.createdAt ? new Date(history.createdAt).toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{history.stateType}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{history.stateDescription || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {history.durationMs ? `${(history.durationMs / 1000).toFixed(2)}秒` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setStatePage(Math.max(0, statePage - 1))}
                    disabled={statePage === 0}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <span className="text-slate-300">
                    第 {statePage + 1} 页，共 {stateTotalPages} 页
                  </span>
                  <button
                    onClick={() => setStatePage(Math.min(stateTotalPages - 1, statePage + 1))}
                    disabled={statePage >= stateTotalPages - 1}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 能力管理 */}
        {activeTab === 'capabilities' && (
          <div className="space-y-6">
            {!selectedCharacterId ? (
              <div className="text-center py-8 text-slate-400">
                <p>请先从"身份认知管理"中选择一个角色</p>
              </div>
            ) : (
              <>
                {/* 能力列表 */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">能力列表</h3>
                  {capabilities.length === 0 ? (
                    <p className="text-slate-400">暂无能力数据</p>
                  ) : (
                    <div className="space-y-3">
                      {capabilities.map((capability, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(capability).map(([key, value]) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-slate-400 mb-1">{key}</label>
                                <p className="text-white">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 能力边界 */}
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">能力边界</h3>
                  {limitations.length === 0 ? (
                    <p className="text-slate-400">暂无限制数据</p>
                  ) : (
                    <div className="space-y-3">
                      {limitations.map((limitation, index) => (
                        <div key={index} className="bg-slate-700 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(limitation).map(([key, value]) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-slate-400 mb-1">{key}</label>
                                <p className="text-white">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMindManagementPage;
