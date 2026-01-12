import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockScenes, mockCharacters } from '../../types/mock';

export const ResourceLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'scenes' | 'characters'>('scenes');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/teacher/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">教学资源库</h1>
              <p className="text-gray-600">管理和分享教学资源</p>
            </div>
            <Button ageGroup="middle" onClick={() => console.log('上传资源')}>
              + 上传资源
            </Button>
          </div>
        </header>

        {/* 标签页 */}
        <div className="mb-6 flex gap-3 border-b">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'scenes'
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            场景模板 ({mockScenes.length})
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'characters'
                ? 'border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            角色模板 ({mockCharacters.length})
          </button>
        </div>

        {/* 资源列表 */}
        {activeTab === 'scenes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockScenes.map((scene) => (
              <Card 
                key={scene.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/teacher/resources/scenes/${scene.id}`)}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-5xl">🎨</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{scene.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{scene.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded ${
                    scene.ageGroup === 'elementary' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {scene.ageGroup === 'elementary' ? '小学' : '中学'}
                  </span>
                  <span>{scene.characters.length} 个角色</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    ageGroup="middle"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('使用模板');
                    }}
                  >
                    使用
                  </Button>
                  <Button 
                    ageGroup="middle"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('分享模板');
                    }}
                  >
                    分享
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCharacters.map((character) => (
              <Card 
                key={character.id}
                className="cursor-pointer hover:shadow-lg transition-shadow text-center"
                onClick={() => navigate(`/teacher/resources/characters/${character.id}`)}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="font-semibold mb-2">{character.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{character.role}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{character.description}</p>
                <Button 
                  ageGroup="middle"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('使用角色');
                  }}
                >
                  使用
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};