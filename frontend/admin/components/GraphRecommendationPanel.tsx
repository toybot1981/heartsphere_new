import React, { useState, useEffect } from 'react';
import { adminGraphRecommendationApi } from '../../services/api/admin/graphRecommendation';
import type {
  EntityRecommendation,
  RelationRecommendation,
  OptimizationSuggestion,
} from '../../services/api/admin/graphRecommendation';
import type { GraphNode, GraphEdge } from '../../services/api/admin/graphTypes';

interface GraphRecommendationPanelProps {
  adminToken: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onEntitySelect?: (recommendation: EntityRecommendation) => void;
  onRelationCreate?: (recommendation: RelationRecommendation) => void;
}

/**
 * Graph智能推荐面板
 * 提供实体推荐、关系识别、优化建议等功能
 */
export const GraphRecommendationPanel: React.FC<GraphRecommendationPanelProps> = ({
  adminToken,
  nodes,
  edges,
  onEntitySelect,
  onRelationCreate,
}) => {
  const [activeTab, setActiveTab] = useState<'entities' | 'relations' | 'optimizations'>('entities');
  const [entityType, setEntityType] = useState<'era' | 'character' | 'event' | 'item'>('character');
  const [entityRecommendations, setEntityRecommendations] = useState<EntityRecommendation[]>([]);
  const [relationRecommendations, setRelationRecommendations] = useState<RelationRecommendation[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 提取Graph中的实体信息
  const extractEntities = (): Array<Record<string, any>> => {
    return nodes
      .filter((node) => ['era', 'character', 'event', 'item'].includes(node.nodeType))
      .map((node) => ({
        entityId: node.config?.eraId || node.config?.characterId || node.config?.eventId || node.config?.itemId,
        entityType: node.nodeType,
        entityName: node.config?.eraName || node.config?.characterName || node.config?.eventName || node.config?.itemName,
        eraId: node.config?.eraId,
      }))
      .filter((e) => e.entityId);
  };

  // 获取已存在的实体ID列表
  const getExistingEntityIds = (type: string): string[] => {
    return nodes
      .filter((node) => node.nodeType === type)
      .map((node) => {
        const config = node.config || {};
        return String(config.eraId || config.characterId || config.eventId || config.itemId || '');
      })
      .filter((id) => id);
  };

  // 加载实体推荐
  const loadEntityRecommendations = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError(null);

    try {
      const existingIds = getExistingEntityIds(entityType);
      const context = extractContext();

      const response = await adminGraphRecommendationApi.recommendEntities(
        entityType,
        existingIds,
        context,
        adminToken
      );

      setEntityRecommendations(response.items || []);
    } catch (err: any) {
      setError(err.message || '加载推荐失败');
      console.error('加载实体推荐失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载关系推荐
  const loadRelationRecommendations = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError(null);

    try {
      const entities = extractEntities();
      const context = extractContext();

      const response = await adminGraphRecommendationApi.autoDetectRelations(entities, context, adminToken);

      setRelationRecommendations(response.items || []);
    } catch (err: any) {
      setError(err.message || '识别关系失败');
      console.error('识别关系失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载优化建议
  const loadOptimizationSuggestions = async () => {
    if (!adminToken) return;

    setLoading(true);
    setError(null);

    try {
      const nodesData = nodes.map((node) => ({
        nodeId: node.nodeId,
        nodeType: node.nodeType,
        config: node.config || {},
      }));

      const edgesData = edges.map((edge) => ({
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        edgeType: edge.edgeType,
      }));

      const response = await adminGraphRecommendationApi.suggestOptimizations(
        nodesData,
        edgesData,
        adminToken
      );

      setOptimizationSuggestions(response.items || []);
    } catch (err: any) {
      setError(err.message || '获取优化建议失败');
      console.error('获取优化建议失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 提取上下文信息
  const extractContext = (): Record<string, any> => {
    const context: Record<string, any> = {};

    // 提取场景ID
    const eraNode = nodes.find((n) => n.nodeType === 'era' && n.config?.eraId);
    if (eraNode?.config?.eraId) {
      context.eraId = eraNode.config.eraId;
      // 如果场景节点有worldId，也提取世界ID
      if (eraNode.config.worldId) {
        context.worldId = eraNode.config.worldId;
      }
    }

    return context;
  };

  useEffect(() => {
    if (activeTab === 'entities') {
      loadEntityRecommendations();
    } else if (activeTab === 'relations') {
      loadRelationRecommendations();
    } else if (activeTab === 'optimizations') {
      loadOptimizationSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, entityType, nodes, edges, adminToken]);

  const tabs = [
    { id: 'entities' as const, label: '实体推荐', icon: '💡' },
    { id: 'relations' as const, label: '关系识别', icon: '🔗' },
    { id: 'optimizations' as const, label: '优化建议', icon: '⚡' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-400 border-red-500';
      case 'warning':
        return 'text-yellow-400 border-yellow-500';
      default:
        return 'text-blue-400 border-blue-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 标签页 */}
      <div className="border-b border-slate-700 p-2 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 实体推荐 */}
      {activeTab === 'entities' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3">
            <label className="text-xs text-slate-400 mb-1 block">实体类型</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as 'era' | 'character' | 'event' | 'item')}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            >
              <option value="era">场景</option>
              <option value="character">角色</option>
              <option value="event">事件</option>
              <option value="item">物品</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">加载中...</div>
          ) : error ? (
            <div className="text-center text-red-400 text-sm py-8">{error}</div>
          ) : entityRecommendations.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">暂无推荐</div>
          ) : (
            <div className="space-y-2">
              {entityRecommendations.map((rec, index) => (
                <div
                  key={index}
                  onClick={() => onEntitySelect?.(rec)}
                  className="p-3 bg-slate-800 border border-slate-700 rounded cursor-pointer hover:bg-slate-700 hover:border-indigo-500 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{rec.entityName}</div>
                      {rec.description && (
                        <div className="text-xs text-slate-400 mt-1">{rec.description}</div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">{rec.reason}</div>
                    </div>
                    <div className="text-xs text-indigo-400 ml-2">{(rec.score || 0).toFixed(0)}分</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 关系识别 */}
      {activeTab === 'relations' && (
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">识别中...</div>
          ) : error ? (
            <div className="text-center text-red-400 text-sm py-8">{error}</div>
          ) : relationRecommendations.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">未识别到关系</div>
          ) : (
            <div className="space-y-2">
              {relationRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-800 border border-slate-700 rounded"
                >
                  <div className="text-sm text-slate-200 mb-2">
                    {rec.sourceEntityType}:{rec.sourceEntityId} → {rec.targetEntityType}:{rec.targetEntityId}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">关系: {rec.relationType}</div>
                  <div className="text-xs text-slate-500 mb-2">{rec.reason}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">置信度: {(rec.confidence || 0).toFixed(0)}%</div>
                    <button
                      onClick={() => onRelationCreate?.(rec)}
                      className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                    >
                      创建关系
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 优化建议 */}
      {activeTab === 'optimizations' && (
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">分析中...</div>
          ) : error ? (
            <div className="text-center text-red-400 text-sm py-8">{error}</div>
          ) : optimizationSuggestions.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-8">暂无优化建议</div>
          ) : (
            <div className="space-y-2">
              {optimizationSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 bg-slate-800 border rounded ${getSeverityColor(suggestion.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs font-medium uppercase">{suggestion.severity}</div>
                    {suggestion.nodeId && (
                      <div className="text-xs text-slate-500">节点: {suggestion.nodeId}</div>
                    )}
                  </div>
                  <div className="text-sm text-slate-200 mb-1">{suggestion.message}</div>
                  <div className="text-xs text-slate-400">{suggestion.suggestion}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
