import React from 'react';
import { useRoutingStrategies } from './hooks/useRoutingStrategies';
import { RoutingStrategy } from '../../../../services/api';

interface RoutingStrategiesProps {
  adminToken: string;
  onReload: () => void;
}

export const RoutingStrategies: React.FC<RoutingStrategiesProps> = ({
  adminToken,
  onReload,
}) => {
  const {
    routingStrategies,
    editingStrategy,
    strategyFormData,
    loading,
    loadStrategies,
    handleCreateStrategy,
    handleEditStrategy,
    handleSaveStrategy,
    handleCancelEdit,
    handleDeleteStrategy,
  } = useRoutingStrategies(adminToken, onReload);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">路由策略管理</h3>
        <button
          onClick={handleCreateStrategy}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新增策略
        </button>
      </div>

      {editingStrategy && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium mb-4">
            {editingStrategy.id ? '编辑策略' : '新增策略'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">策略名称</label>
              <input
                type="text"
                value={strategyFormData.name || ''}
                onChange={(e) =>
                  handleEditStrategy({
                    ...strategyFormData,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                placeholder="输入策略名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">策略类型</label>
              <select
                value={strategyFormData.type || ''}
                onChange={(e) =>
                  handleEditStrategy({
                    ...strategyFormData,
                    type: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">选择类型</option>
                <option value="ROUND_ROBIN">轮询</option>
                <option value="PRIORITY">优先级</option>
                <option value="LOAD_BALANCE">负载均衡</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveStrategy}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                保存
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left border-b">ID</th>
              <th className="px-4 py-2 text-left border-b">策略名称</th>
              <th className="px-4 py-2 text-left border-b">策略类型</th>
              <th className="px-4 py-2 text-left border-b">优先级</th>
              <th className="px-4 py-2 text-left border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {routingStrategies.map((strategy) => (
              <tr key={strategy.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{strategy.id}</td>
                <td className="px-4 py-2 border-b">{strategy.name}</td>
                <td className="px-4 py-2 border-b">{strategy.type}</td>
                <td className="px-4 py-2 border-b">{strategy.priority || '-'}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleEditStrategy(strategy)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteStrategy(strategy.id!)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

