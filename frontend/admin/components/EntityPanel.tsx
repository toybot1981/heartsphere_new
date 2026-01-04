import React, { useState, useEffect } from 'react';
import { adminEntityApi } from '../../services/api/admin/entity';
import type { Entity, EntityListResponse } from '../../services/api/admin/entityTypes';
import { InputGroup, TextInput } from './AdminUIComponents';

interface EntityPanelProps {
  adminToken: string | null;
  onEntitySelect?: (entity: Entity) => void;
}

/**
 * 实体管理面板
 * 显示和管理场景、角色、事件、物品等实体
 */
export const EntityPanel: React.FC<EntityPanelProps> = ({ adminToken, onEntitySelect }) => {
  const [activeTab, setActiveTab] = useState<'era' | 'character' | 'event' | 'item' | 'world'>('era');
  const [searchTerm, setSearchTerm] = useState('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (adminToken) {
      loadEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, adminToken]);

  const loadEntities = async () => {
    if (!adminToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response: EntityListResponse<any>;
      
      switch (activeTab) {
        case 'era':
          response = await adminEntityApi.getEras(adminToken);
          break;
        case 'character':
          response = await adminEntityApi.getCharacters(adminToken);
          break;
        case 'event':
          response = await adminEntityApi.getEvents(adminToken);
          break;
        case 'item':
          response = await adminEntityApi.getItems(adminToken);
          break;
        case 'world':
          response = await adminEntityApi.getWorlds(adminToken);
          break;
        default:
          response = { items: [], total: 0 };
      }
      
      setEntities(response.items || []);
    } catch (err: any) {
      setError(err.message || '加载实体失败');
      console.error('加载实体失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      entity.name?.toLowerCase().includes(term) ||
      entity.description?.toLowerCase().includes(term) ||
      String(entity.id).includes(term)
    );
  });

  const handleEntityClick = (entity: Entity) => {
    if (onEntitySelect) {
      onEntitySelect(entity);
    }
  };

  const tabs = [
    { id: 'era' as const, label: '场景', icon: '🌍' },
    { id: 'character' as const, label: '角色', icon: '👤' },
    { id: 'event' as const, label: '事件', icon: '⚡' },
    { id: 'item' as const, label: '物品', icon: '🎁' },
    { id: 'world' as const, label: '世界', icon: '🌐' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 标签页 */}
      <div className="border-b border-slate-700 p-2 flex gap-1">
        {tabs.map(tab => (
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

      {/* 搜索框 */}
      <div className="p-3 border-b border-slate-700">
        <TextInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索实体..."
          className="w-full"
        />
      </div>

      {/* 实体列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">加载中...</div>
        ) : error ? (
          <div className="text-center text-red-400 text-sm py-8">{error}</div>
        ) : filteredEntities.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            {searchTerm ? '未找到匹配的实体' : '暂无实体'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntities.map((entity) => (
              <div
                key={entity.id}
                onClick={() => handleEntityClick(entity)}
                className="p-3 bg-slate-800 border border-slate-700 rounded cursor-pointer hover:bg-slate-700 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">{entity.name}</div>
                    {entity.description && (
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {entity.description}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">ID: {entity.id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="border-t border-slate-700 p-2 text-xs text-slate-500 text-center">
        共 {filteredEntities.length} 个实体
      </div>
    </div>
  );
};
