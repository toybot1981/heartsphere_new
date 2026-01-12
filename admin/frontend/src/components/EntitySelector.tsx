import React, { useState, useEffect } from 'react';
import { adminEntityApi } from '../services/api';
import type { Entity, EntityListResponse } from '../services/api';
import { InputGroup, TextInput } from './AdminUIComponents';

interface EntitySelectorProps {
  entityType: 'era' | 'character' | 'event' | 'item' | 'world';
  value?: string | number;
  adminToken: string | null;
  onChange: (entityId: string | number | undefined, entity?: Entity) => void;
  placeholder?: string;
  label?: string;
  eraId?: number; // 用于筛选（如角色、事件、物品按场景筛选）
}

/**
 * 实体选择器组件
 * 用于在节点配置中选择实体
 */
export const EntitySelector: React.FC<EntitySelectorProps> = ({
  entityType,
  value,
  adminToken,
  onChange,
  placeholder,
  label,
  eraId,
}) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  useEffect(() => {
    if (adminToken) {
      loadEntities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, entityType, eraId]);

  useEffect(() => {
    if (value && entities.length > 0) {
      const entity = entities.find(e => String(e.id) === String(value));
      if (entity) {
        setSelectedEntity(entity);
      }
    }
  }, [value, entities]);

  const loadEntities = async () => {
    if (!adminToken) return;
    
    setLoading(true);
    try {
      let response: EntityListResponse<any>;
      
      switch (entityType) {
        case 'era':
          response = await adminEntityApi.getEras(adminToken);
          break;
        case 'character':
          response = await adminEntityApi.getCharacters(adminToken, eraId);
          break;
        case 'event':
          response = await adminEntityApi.getEvents(adminToken, eraId);
          break;
        case 'item':
          response = await adminEntityApi.getItems(adminToken, eraId);
          break;
        case 'world':
          response = await adminEntityApi.getWorlds(adminToken);
          break;
        default:
          response = { items: [], total: 0 };
      }
      
      setEntities(response.items || []);
    } catch (err: any) {
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
      String(entity.id).includes(term)
    );
  });

  const handleSelectEntity = (entity: Entity) => {
    setSelectedEntity(entity);
    onChange(entity.id, entity);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedEntity(null);
    onChange(undefined);
    setShowDropdown(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <InputGroup label={label || `选择${getEntityTypeLabel(entityType)}`}>
        <div className="relative">
          <div
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className={selectedEntity ? 'text-white' : 'text-slate-500'}>
              {selectedEntity ? selectedEntity.name : placeholder || `请选择${getEntityTypeLabel(entityType)}`}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg max-h-60 overflow-y-auto">
              {/* 搜索框 */}
              <div className="p-2 border-b border-slate-700">
                <TextInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索..."
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* 实体列表 */}
              {loading ? (
                <div className="p-4 text-center text-slate-500 text-sm">加载中...</div>
              ) : filteredEntities.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  {searchTerm ? '未找到匹配的实体' : '暂无实体'}
                </div>
              ) : (
                <div className="py-1">
                  {filteredEntities.map((entity) => (
                    <div
                      key={entity.id}
                      onClick={() => handleSelectEntity(entity)}
                      className={`px-4 py-2 cursor-pointer hover:bg-slate-700 ${
                        selectedEntity?.id === entity.id ? 'bg-indigo-600' : ''
                      }`}
                    >
                      <div className="text-sm text-white">{entity.name}</div>
                      {entity.description && (
                        <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {entity.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 清除按钮 */}
              {selectedEntity && (
                <div className="border-t border-slate-700 p-2">
                  <button
                    onClick={handleClear}
                    className="w-full px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                  >
                    清除选择
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </InputGroup>
    </div>
  );
};

function getEntityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    era: '场景',
    character: '角色',
    event: '事件',
    item: '物品',
    world: '世界',
  };
  return labels[type] || type;
}
