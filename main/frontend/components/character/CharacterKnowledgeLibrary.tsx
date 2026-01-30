/**
 * 角色知识库查看器
 * 展示角色的所有知识资产、支持搜索、筛选、排序
 */

import React, { useState, useEffect } from 'react';
import { getToken } from '../../../services/api/base/tokenStorage';
import { logger } from '../../../utils/logger';

interface KnowledgeAsset {
  id: number;
  title: string;
  content: string;
  assetType: string;
  trustScore: number;
  usageCount: number;
  isApproved: boolean;
  createdAt: string;
}

interface CharacterKnowledgeLibraryProps {
  characterId: number;
  characterName?: string;
}

type SortBy = 'trust' | 'usage' | 'created' | 'title';
type FilterType = 'all' | 'DOMAIN_KNOWLEDGE' | 'INTERACTION_SKILLS' | 'DECISION_RULES' | 'EXPERIENCE_PATTERNS';

export const CharacterKnowledgeLibrary: React.FC<CharacterKnowledgeLibraryProps> = ({
  characterId,
  characterName = '角色',
}) => {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('trust');

  useEffect(() => {
    loadAssets();
  }, [characterId, filterType]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      // 使用 request 函数统一处理 API_BASE_URL，并静默处理404错误
      const { request } = await import('../../services/api/base/request');
      const assets = await request<any[]>(
        `/memory/v1/character/${characterId}/related-assets?query=&limit=100`, // 注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch((error) => {
        // 静默处理404错误（端点可能尚未实现）
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('404') || errorMessage.includes('未找到') || errorMessage.includes('Not Found')) {
          logger.info('[CharacterKnowledgeLibrary] 角色资产端点不存在，返回空数组', { characterId });
          return [];
        }
        logger.error('[CharacterKnowledgeLibrary] 加载资产失败', { characterId, error: errorMessage });
        return [];
      });
      
      // request 函数已经处理了 ApiResponse 格式，直接返回 data
      setAssets(Array.isArray(assets) ? assets : []);
    } catch (err) {
      logger.error('[CharacterKnowledgeLibrary] 加载资产失败', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      DOMAIN_KNOWLEDGE: '#2196F3',
      INTERACTION_SKILLS: '#4CAF50',
      DECISION_RULES: '#FF9800',
      EXPERIENCE_PATTERNS: '#9C27B0',
    };
    return colors[type] || '#999';
  };

  const getTypeName = (type: string): string => {
    const names: Record<string, string> = {
      DOMAIN_KNOWLEDGE: '领域知识',
      INTERACTION_SKILLS: '交互技巧',
      DECISION_RULES: '决策规则',
      EXPERIENCE_PATTERNS: '经验模式',
    };
    return names[type] || type;
  };

  // 过滤和搜索
  let filtered = assets;
  if (filterType !== 'all') {
    filtered = filtered.filter((a) => a.assetType === filterType);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
    );
  }

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'trust':
        return b.trustScore - a.trustScore;
      case 'usage':
        return b.usageCount - a.usageCount;
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        {characterName} 的知识库
      </h2>

      {/* 控制条 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {/* 搜索 */}
        <input
          type="text"
          placeholder="搜索知识..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        />

        {/* 类型筛选 */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        >
          <option value="all">所有类型</option>
          <option value="DOMAIN_KNOWLEDGE">领域知识</option>
          <option value="INTERACTION_SKILLS">交互技巧</option>
          <option value="DECISION_RULES">决策规则</option>
          <option value="EXPERIENCE_PATTERNS">经验模式</option>
        </select>

        {/* 排序 */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        >
          <option value="trust">按信任度</option>
          <option value="usage">按使用次数</option>
          <option value="created">按创建时间</option>
          <option value="title">按标题</option>
        </select>
      </div>

      {/* 统计 */}
      <div style={{ marginBottom: '12px', color: '#666', fontSize: '12px' }}>
        共 {sorted.length} 个知识资产
      </div>

      {/* 资产列表 */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '32px 16px' }}>
            没有找到匹配的知识资产
          </div>
        ) : (
          sorted.map((asset) => (
            <div
              key={asset.id}
              style={{
                padding: '12px',
                backgroundColor: '#fff',
                borderLeft: `4px solid ${getTypeColor(asset.assetType)}`,
                borderRadius: '4px',
                border: '1px solid #eee',
              }}
            >
              {/* 头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    {asset.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        marginRight: '8px',
                        backgroundColor: getTypeColor(asset.assetType),
                        color: 'white',
                        borderRadius: '3px',
                      }}
                    >
                      {getTypeName(asset.assetType)}
                    </span>
                    {!asset.isApproved && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor: '#FFC107',
                          color: '#333',
                          borderRadius: '3px',
                          fontSize: '10px',
                        }}
                      >
                        待审核
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#2196F3' }}>
                    信任度: {(asset.trustScore * 100).toFixed(0)}%
                  </div>
                  <div style={{ color: '#666' }}>
                    使用: {asset.usageCount} 次
                  </div>
                </div>
              </div>

              {/* 内容预览 */}
              <div style={{
                fontSize: '12px',
                color: '#555',
                marginBottom: '8px',
                maxHeight: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'pre-wrap',
              }}>
                {asset.content.substring(0, 150)}...
              </div>

              {/* 底部 */}
              <div style={{ fontSize: '11px', color: '#999' }}>
                创建于 {new Date(asset.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
          加载中...
        </div>
      )}
    </div>
  );
};

export default CharacterKnowledgeLibrary;
