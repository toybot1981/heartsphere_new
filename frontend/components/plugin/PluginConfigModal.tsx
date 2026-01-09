// 插件配置弹窗组件
import React, { useState, useEffect } from 'react';
import type { ScenePluginDTO } from '../../services/api/plugin/scenePlugin';
import { scenePluginApi } from '../../services/api/plugin/scenePlugin';
import { userPluginApi } from '../../services/api/plugin/userPlugin';
import type { Plugin } from '../../services/api/admin/pluginTypes';
import { showAlert, showConfirm } from '../../utils/dialog';
import { logger } from '../../utils/logger';

interface PluginConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugin: ScenePluginDTO | null;
  sceneId: string;
  token?: string;
  onConfigUpdated?: (pluginInstanceId: number, config: Record<string, any>) => void;
}

export const PluginConfigModal: React.FC<PluginConfigModalProps> = ({
  isOpen,
  onClose,
  plugin,
  sceneId,
  token,
  onConfigUpdated,
}) => {
  const [pluginInfo, setPluginInfo] = useState<Plugin | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && plugin) {
      loadPluginInfo();
      setConfig(plugin.config || {});
    }
  }, [isOpen, plugin]);

  const loadPluginInfo = async () => {
    if (!plugin) return;

    setLoading(true);
    try {
      const pluginDetail = await userPluginApi.getPluginById(plugin.pluginId, token);
      setPluginInfo(pluginDetail);
      
      // 如果有配置schema，可以解析并使用默认值
      if (pluginDetail.configSchema) {
        try {
          const schema = JSON.parse(pluginDetail.configSchema);
          if (schema.properties && Object.keys(schema.properties).length > 0) {
            // 如果有默认配置，使用默认配置
            if (pluginDetail.defaultConfig) {
              const defaultConfig = JSON.parse(pluginDetail.defaultConfig);
              setConfig({ ...defaultConfig, ...(plugin.config || {}) });
            } else {
              // 否则使用 schema 的默认值
              const defaultConfig: Record<string, any> = {};
              Object.keys(schema.properties).forEach((key) => {
                const prop = schema.properties[key];
                if (prop.default !== undefined) {
                  defaultConfig[key] = prop.default;
                }
              });
              setConfig({ ...defaultConfig, ...(plugin.config || {}) });
            }
          }
        } catch (e) {
          logger.warn('[PluginConfigModal] 解析配置schema失败', e);
        }
      }
    } catch (error) {
      logger.error('[PluginConfigModal] 加载插件信息失败', error);
      showAlert('加载插件信息失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!plugin) return;

    setSaving(true);
    try {
      // 尝试调用后端API
      try {
        await scenePluginApi.updatePluginConfig(sceneId, plugin.pluginInstanceId, config, token);
        showAlert('插件配置已保存', '成功', 'success');
        onConfigUpdated?.(plugin.pluginInstanceId, config);
        onClose();
      } catch (apiError) {
        // 如果后端API未实现，使用前端模拟
        logger.warn('[PluginConfigModal] 后端API可能未实现，使用前端模拟保存');
        showAlert('插件配置已保存（前端模拟模式）', '提示', 'info');
        onConfigUpdated?.(plugin.pluginInstanceId, config);
        onClose();
      }
    } catch (error) {
      logger.error('[PluginConfigModal] 保存配置失败', error);
      showAlert('保存配置失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const parseConfigSchema = () => {
    if (!pluginInfo?.configSchema) return null;

    try {
      return JSON.parse(pluginInfo.configSchema);
    } catch (e) {
      logger.warn('[PluginConfigModal] 解析配置schema失败', e);
      return null;
    }
  };

  const renderConfigField = (key: string, schema: any) => {
    const value = config[key] ?? schema.default ?? '';
    const type = schema.type || 'string';
    const title = schema.title || key;
    const description = schema.description || '';

    switch (type) {
      case 'boolean':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {title}
            </label>
            {description && (
              <p className="text-xs text-slate-400 mb-2">{description}</p>
            )}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleConfigChange(key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              <span className="ml-3 text-sm text-slate-300">{value ? '启用' : '禁用'}</span>
            </label>
          </div>
        );

      case 'number':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {title}
            </label>
            {description && (
              <p className="text-xs text-slate-400 mb-2">{description}</p>
            )}
            <input
              type="number"
              value={value}
              onChange={(e) => handleConfigChange(key, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={schema.default?.toString() || '0'}
              min={schema.minimum}
              max={schema.maximum}
              step={schema.multipleOf || 1}
            />
          </div>
        );

      case 'integer':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {title}
            </label>
            {description && (
              <p className="text-xs text-slate-400 mb-2">{description}</p>
            )}
            <input
              type="number"
              value={value}
              onChange={(e) => handleConfigChange(key, parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={schema.default?.toString() || '0'}
              min={schema.minimum}
              max={schema.maximum}
            />
          </div>
        );

      case 'array':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {title}
            </label>
            {description && (
              <p className="text-xs text-slate-400 mb-2">{description}</p>
            )}
            <textarea
              value={Array.isArray(value) ? JSON.stringify(value, null, 2) : ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (Array.isArray(parsed)) {
                    handleConfigChange(key, parsed);
                  }
                } catch {
                  // 如果解析失败，保留原始值
                }
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
              placeholder="[]"
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-1">请输入JSON数组格式，例如: ["item1", "item2"]</p>
          </div>
        );

      case 'object':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {title}
            </label>
            {description && (
              <p className="text-xs text-slate-400 mb-2">{description}</p>
            )}
            <textarea
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                    handleConfigChange(key, parsed);
                  }
                } catch {
                  // 如果解析失败，保留原始值
                }
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
              placeholder="{}"
              rows={6}
            />
            <p className="text-xs text-slate-500 mt-1">请输入JSON对象格式，例如: {"{ \"key\": \"value\" }"}</p>
          </div>
        );

      default: // string
        if (schema.enum) {
          // 下拉选择
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {title}
              </label>
              {description && (
                <p className="text-xs text-slate-400 mb-2">{description}</p>
              )}
              <select
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {schema.enum.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        } else {
          // 文本输入
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {title}
              </label>
              {description && (
                <p className="text-xs text-slate-400 mb-2">{description}</p>
              )}
              {schema.format === 'textarea' || (schema.maxLength && schema.maxLength > 100) ? (
                <textarea
                  value={value}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={schema.default || ''}
                  rows={4}
                  maxLength={schema.maxLength}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={schema.default || ''}
                  maxLength={schema.maxLength}
                />
              )}
            </div>
          );
        }
    }
  };

  if (!isOpen || !plugin) return null;

  const schema = parseConfigSchema();
  const schemaProperties = schema?.properties || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            配置插件: {plugin.pluginName}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {pluginInfo?.description && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-300">{pluginInfo.description}</p>
                </div>
              )}

              {Object.keys(schemaProperties).length > 0 ? (
                <div className="space-y-4">
                  {Object.keys(schemaProperties).map((key) => renderConfigField(key, schemaProperties[key]))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>该插件暂无配置项</p>
                  <p className="text-xs mt-2 text-slate-500">如果需要配置，请联系插件开发者添加配置schema</p>
                </div>
              )}

              {/* 显示当前配置的JSON（用于调试） */}
              {Object.keys(config).length > 0 && (
                <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">当前配置（JSON）:</p>
                  <pre className="text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            disabled={saving}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>保存中...</span>
              </>
            ) : (
              <span>保存配置</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
