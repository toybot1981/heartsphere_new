import React from 'react';
import { useRoutingStrategies } from './hooks/useRoutingStrategies';
import { useModelsManagement } from './hooks/useModelsManagement';
import type { RoutingStrategy } from './types';

interface RoutingStrategiesProps {
  adminToken: string;
  onReload: () => void;
}

const CAPABILITIES = [
  { value: 'text', label: '文本生成' },
  { value: 'image', label: '图片生成' },
  { value: 'audio', label: '音频生成' },
  { value: 'video', label: '视频生成' },
] as const;

const STRATEGY_TYPES = [
  { value: 'single', label: '单一模型', description: '始终使用指定的默认模型' },
  { value: 'fallback', label: '容错模式', description: '主模型失败时自动切换到备用模型' },
  { value: 'economy', label: '经济模式', description: '根据成本选择最经济的模型' },
] as const;

const PROVIDERS = [
  { value: 'GEMINI', label: 'Gemini' },
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'DASHSCOPE', label: 'DashScope' },
  { value: 'DOUBAO', label: 'Doubao' },
] as const;

export const RoutingStrategies: React.FC<RoutingStrategiesProps> = ({
  adminToken,
  onReload,
}) => {
  const { modelConfigs, loadModelsByProvider } = useModelsManagement(adminToken);
  
  const {
    routingStrategies,
    editingStrategy,
    strategyFormData,
    loading,
    setStrategyFormData,
    handleLoadStrategy,
    handleAddFallbackItem,
    handleRemoveFallbackItem,
    handleUpdateFallbackItem,
    handleMoveFallbackItem,
    handleSaveStrategy,
    handleCancelEdit,
  } = useRoutingStrategies(adminToken, modelConfigs, loadModelsByProvider, onReload);

  const getCapabilityDisplayName = (capability: string) => {
    return CAPABILITIES.find(c => c.value === capability)?.label || capability;
  };

  const getStrategyTypeDisplayName = (strategyType: string) => {
    return STRATEGY_TYPES.find(s => s.value === strategyType)?.label || strategyType;
  };

  const getProviderDisplayName = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider)?.label || provider;
  };

  // 获取指定能力类型和提供商的模型列表
  const getModelsForProvider = (provider: string, capability: string) => {
    return modelConfigs.filter(
      m => m.provider === provider && 
           m.capability === capability && 
           m.isActive
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-100">路由策略管理</h3>
      </div>

      <div className="space-y-6">
        {CAPABILITIES.map((capability) => {
          const strategy = routingStrategies.find(s => s.capability === capability.value);
          const isEditing = editingStrategy?.capability === capability.value;

          return (
            <div key={capability.value} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100">{capability.label}</h4>
                    {strategy && (
                      <p className="text-sm text-slate-400 mt-1">
                        策略类型: {getStrategyTypeDisplayName(strategy.strategyType)} | 
                        状态: {strategy.isActive ? (
                          <span className="text-green-400">启用</span>
                        ) : (
                          <span className="text-red-400">禁用</span>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleLoadStrategy(capability.value as any)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    {strategy ? '编辑策略' : '配置策略'}
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="p-6 bg-slate-800/50 border-b border-slate-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">策略类型</label>
                      <select
                        value={strategyFormData.strategyType || 'single'}
                        onChange={(e) =>
                          setStrategyFormData({
                            ...strategyFormData,
                            strategyType: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none"
                      >
                        {STRATEGY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 单一模型配置 */}
                    {strategyFormData.strategyType === 'single' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">默认提供商</label>
                          <select
                            value={strategyFormData.defaultProvider || ''}
                            onChange={(e) => {
                              const provider = e.target.value;
                              setStrategyFormData({
                                ...strategyFormData,
                                defaultProvider: provider,
                                defaultModel: '', // 清空模型选择
                              });
                              if (provider && editingStrategy?.capability) {
                                loadModelsByProvider(provider, editingStrategy.capability);
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none"
                          >
                            <option value="">选择提供商</option>
                            {PROVIDERS.map(provider => (
                              <option key={provider.value} value={provider.value}>
                                {provider.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {strategyFormData.defaultProvider && (
                          <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">默认模型</label>
                            <select
                              value={strategyFormData.defaultModel || ''}
                              onChange={(e) =>
                                setStrategyFormData({
                                  ...strategyFormData,
                                  defaultModel: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none"
                            >
                              <option value="">选择模型</option>
                              {getModelsForProvider(
                                strategyFormData.defaultProvider!,
                                editingStrategy?.capability || ''
                              ).map(model => (
                                <option key={model.id} value={model.modelName}>
                                  {model.modelName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {/* 容错模式配置 */}
                    {strategyFormData.strategyType === 'fallback' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-slate-300">降级链</label>
                          <button
                            onClick={handleAddFallbackItem}
                            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                          >
                            + 添加备用模型
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(strategyFormData.fallbackChain || []).map((item, index) => (
                            <div key={index} className="flex gap-2 items-center bg-slate-700 p-3 rounded">
                              <span className="text-sm text-slate-400 w-8">#{item.priority}</span>
                              <select
                                value={item.provider}
                                onChange={(e) =>
                                  handleUpdateFallbackItem(index, 'provider', e.target.value)
                                }
                                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-500 outline-none"
                              >
                                <option value="">选择提供商</option>
                                {PROVIDERS.map(provider => (
                                  <option key={provider.value} value={provider.value}>
                                    {provider.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={item.model}
                                onChange={(e) =>
                                  handleUpdateFallbackItem(index, 'model', e.target.value)
                                }
                                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-indigo-500 outline-none"
                                disabled={!item.provider}
                              >
                                <option value="">选择模型</option>
                                {item.provider && getModelsForProvider(
                                  item.provider,
                                  editingStrategy?.capability || ''
                                ).map(model => (
                                  <option key={model.id} value={model.modelName}>
                                    {model.modelName}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleMoveFallbackItem(index, 'up')}
                                  disabled={index === 0}
                                  className="px-2 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => handleMoveFallbackItem(index, 'down')}
                                  disabled={index === (strategyFormData.fallbackChain?.length || 0) - 1}
                                  className="px-2 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  ↓
                                </button>
        <button
                                  onClick={() => handleRemoveFallbackItem(index)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
        >
                                  删除
        </button>
      </div>
                            </div>
                          ))}
                          {(!strategyFormData.fallbackChain || strategyFormData.fallbackChain.length === 0) && (
                            <p className="text-sm text-slate-500 text-center py-4">
                              暂无备用模型，点击"添加备用模型"开始配置
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 经济模式配置 */}
                    {strategyFormData.strategyType === 'economy' && (
          <div className="space-y-4">
            <div>
                          <label className="flex items-center gap-2 cursor-pointer">
              <input
                              type="checkbox"
                              checked={strategyFormData.economyConfig?.enabled || false}
                onChange={(e) =>
                                setStrategyFormData({
                    ...strategyFormData,
                                  economyConfig: {
                                    ...strategyFormData.economyConfig,
                                    enabled: e.target.checked,
                                  },
                  })
                }
                              className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
              />
                            <span className="text-sm text-slate-300">启用经济模式</span>
                          </label>
            </div>
                        {strategyFormData.economyConfig?.enabled && (
                          <>
            <div>
                              <label className="block text-sm font-medium mb-2 text-slate-300">首选提供商</label>
              <select
                                value={strategyFormData.economyConfig?.preferredProvider || ''}
                onChange={(e) =>
                                setStrategyFormData({
                                  ...strategyFormData,
                                  economyConfig: {
                                    enabled: strategyFormData.economyConfig?.enabled ?? false,
                                    ...strategyFormData.economyConfig,
                                    preferredProvider: e.target.value,
                                  },
                                })
                                }
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none"
                              >
                                <option value="">自动选择</option>
                                {PROVIDERS.map(provider => (
                                  <option key={provider.value} value={provider.value}>
                                    {provider.label}
                                  </option>
                                ))}
              </select>
            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-slate-300">
                                最大成本（每Token）
                              </label>
                              <input
                                type="number"
                                step="0.0001"
                                value={strategyFormData.economyConfig?.maxCostPerToken || ''}
                                onChange={(e) =>
                                setStrategyFormData({
                                  ...strategyFormData,
                                  economyConfig: {
                                    enabled: strategyFormData.economyConfig?.enabled ?? false,
                                    ...strategyFormData.economyConfig,
                                    maxCostPerToken: parseFloat(e.target.value) || undefined,
                                  },
                                })
                                }
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none placeholder-slate-400"
                                placeholder="0.0001"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={strategyFormData.isActive !== false}
                        onChange={(e) =>
                          setStrategyFormData({
                            ...strategyFormData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                      />
                      <label className="text-sm text-slate-300">启用此策略</label>
                    </div>

                    <div className="flex gap-2 pt-4">
              <button
                onClick={handleSaveStrategy}
                disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                保存
              </button>
              <button
                onClick={handleCancelEdit}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

              {!isEditing && strategy && (
                <div className="p-6">
                  <div className="text-sm text-slate-400">
                    <p>策略类型: <span className="text-slate-200">{getStrategyTypeDisplayName(strategy.strategyType)}</span></p>
                    {strategy.defaultProvider && (
                      <p className="mt-2">
                        默认: <span className="text-slate-200">
                          {getProviderDisplayName(strategy.defaultProvider)}
                          {strategy.defaultModel && ` / ${strategy.defaultModel}`}
                        </span>
                      </p>
                    )}
                    {strategy.fallbackChain && strategy.fallbackChain.length > 0 && (
                      <div className="mt-2">
                        <p className="text-slate-400">降级链:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {strategy.fallbackChain.map((item, idx) => (
                            <li key={idx} className="text-slate-300">
                              {getProviderDisplayName(item.provider)} / {item.model}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
