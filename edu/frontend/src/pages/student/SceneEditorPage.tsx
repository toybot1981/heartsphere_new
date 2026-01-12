import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import type { AgeGroup } from '../../types';
import { mockScenes, mockCharacters } from '../../types/mock';

export const SceneEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  
  const scene = mockScenes.find(s => s.id === id);
  const characters = mockCharacters.filter(c => c.sceneId === id);

  if (!scene) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p>场景不存在</p>
          <Button ageGroup={ageGroup} onClick={() => navigate(`/student/scenes?ageGroup=${ageGroup}`)}>
            返回
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isElementary ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100'} p-6`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Button 
              ageGroup={ageGroup}
              variant="outline"
              onClick={() => navigate(`/student/scenes?ageGroup=${ageGroup}`)}
              className="mb-4"
            >
              ← 返回
            </Button>
            <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
              {scene.name}
            </h1>
            <p className="text-gray-600">{scene.description}</p>
          </div>
          <div className="flex gap-3">
            <Button ageGroup={ageGroup} variant="outline">
              {isElementary ? '💾 保存' : '保存'}
            </Button>
            <Button ageGroup={ageGroup}>
              {isElementary ? '▶️ 预览' : '预览'}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主编辑区域 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '🎨 场景编辑器' : '场景编辑器'}
              </h2>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-500">
                    {isElementary ? '在这里编辑你的场景' : '场景编辑器界面'}
                  </p>
                  {isElementary && (
                    <p className="text-sm text-gray-400 mt-2">
                      （原型阶段：实际功能待开发）
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '📝 场景设置' : '场景设置'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    场景名称
                  </label>
                  <input
                    type="text"
                    defaultValue={scene.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    场景描述
                  </label>
                  <textarea
                    defaultValue={scene.description}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '👤 场景中的角色' : '场景角色'}
              </h2>
              {characters.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">👤</div>
                  <p className="text-gray-500 mb-4">
                    {isElementary ? '还没有角色' : '暂无角色'}
                  </p>
                  <Button 
                    ageGroup={ageGroup}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/characters/create?sceneId=${id}&ageGroup=${ageGroup}`)}
                  >
                    {isElementary ? '➕ 添加角色' : '+ 添加角色'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/student/characters/${character.id}?ageGroup=${ageGroup}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {character.avatar ? (
                            <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-xl">👤</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{character.name}</p>
                          <p className="text-sm text-gray-500">{character.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    ageGroup={ageGroup}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/student/characters/create?sceneId=${id}&ageGroup=${ageGroup}`)}
                  >
                    {isElementary ? '➕ 添加角色' : '+ 添加角色'}
                  </Button>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '⚙️ 快捷操作' : '快捷操作'}
              </h2>
              <div className="space-y-2">
                <Button ageGroup={ageGroup} variant="outline" size="sm" className="w-full">
                  {isElementary ? '🖼️ 上传背景图' : '上传背景'}
                </Button>
                <Button ageGroup={ageGroup} variant="outline" size="sm" className="w-full">
                  {isElementary ? '🎵 添加音效' : '添加音效'}
                </Button>
                <Button ageGroup={ageGroup} variant="outline" size="sm" className="w-full">
                  {isElementary ? '📤 分享场景' : '分享场景'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};