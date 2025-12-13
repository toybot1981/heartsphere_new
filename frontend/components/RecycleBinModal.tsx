import React, { useState, useEffect } from 'react';
import { recycleBinApi } from '../services/api';
import { Button } from './Button';

interface RecycleBinModalProps {
  token: string;
  onClose: () => void;
  onRestore?: () => void; // 恢复后刷新数据
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({ token, onClose, onRestore }) => {
  const [recycleBin, setRecycleBin] = useState<{
    characters: any[];
    worlds: any[];
    eras: any[];
    scripts: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'characters' | 'worlds' | 'eras' | 'scripts'>('characters');

  useEffect(() => {
    loadRecycleBin();
  }, []);

  const loadRecycleBin = async () => {
    try {
      setLoading(true);
      const data = await recycleBinApi.getRecycleBin(token);
      setRecycleBin(data);
    } catch (error) {
      console.error('加载回收站失败:', error);
      alert('加载回收站失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type: 'characters' | 'worlds' | 'eras' | 'scripts', id: number) => {
    try {
      switch (type) {
        case 'characters':
          await recycleBinApi.restoreCharacter(id, token);
          break;
        case 'worlds':
          await recycleBinApi.restoreWorld(id, token);
          break;
        case 'eras':
          await recycleBinApi.restoreEra(id, token);
          break;
        case 'scripts':
          await recycleBinApi.restoreScript(id, token);
          break;
      }
      alert('恢复成功');
      await loadRecycleBin();
      if (onRestore) {
        onRestore();
      }
    } catch (error) {
      console.error('恢复失败:', error);
      alert('恢复失败');
    }
  };

  const handlePermanentlyDelete = async (type: 'characters' | 'worlds' | 'eras' | 'scripts', id: number, name: string) => {
    if (!confirm(`确定要永久删除 "${name}" 吗？此操作不可恢复！`)) {
      return;
    }

    try {
      switch (type) {
        case 'characters':
          await recycleBinApi.permanentlyDeleteCharacter(id, token);
          break;
        case 'worlds':
          await recycleBinApi.permanentlyDeleteWorld(id, token);
          break;
        case 'eras':
          await recycleBinApi.permanentlyDeleteEra(id, token);
          break;
        case 'scripts':
          await recycleBinApi.permanentlyDeleteScript(id, token);
          break;
      }
      alert('永久删除成功');
      await loadRecycleBin();
    } catch (error) {
      console.error('永久删除失败:', error);
      alert('永久删除失败');
    }
  };

  const getCurrentItems = () => {
    if (!recycleBin) return [];
    switch (activeTab) {
      case 'characters':
        return recycleBin.characters;
      case 'worlds':
        return recycleBin.worlds;
      case 'eras':
        return recycleBin.eras;
      case 'scripts':
        return recycleBin.scripts;
      default:
        return [];
    }
  };

  const getItemName = (item: any) => {
    return item.name || item.title || '未命名';
  };

  const getItemDescription = (item: any) => {
    return item.description || item.bio || '';
  };

  const totalCount = recycleBin
    ? recycleBin.characters.length + recycleBin.worlds.length + recycleBin.eras.length + recycleBin.scripts.length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">回收站</h2>
            <p className="text-sm text-slate-400 mt-1">共 {totalCount} 项已删除的数据</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-6">
          {[
            { key: 'characters' as const, label: '角色', count: recycleBin?.characters.length || 0 },
            { key: 'worlds' as const, label: '世界', count: recycleBin?.worlds.length || 0 },
            { key: 'eras' as const, label: '时代', count: recycleBin?.eras.length || 0 },
            { key: 'scripts' as const, label: '剧本', count: recycleBin?.scripts.length || 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-400">加载中...</div>
            </div>
          ) : (
            <>
              {getCurrentItems().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <p>回收站为空</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getCurrentItems().map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg mb-1">{getItemName(item)}</h3>
                          {getItemDescription(item) && (
                            <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                              {getItemDescription(item)}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            删除时间: {item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '未知'}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleRestore(activeTab, item.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
                          >
                            恢复
                          </button>
                          <button
                            onClick={() => handlePermanentlyDelete(activeTab, item.id, getItemName(item))}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            永久删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <Button variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};

