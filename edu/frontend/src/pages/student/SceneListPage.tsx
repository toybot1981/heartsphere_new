import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockScenes } from '../../types/mock';
import type { AgeGroup } from '../../types';

interface SceneListPageProps {
  ageGroup: AgeGroup;
}

export const SceneListPage: React.FC<SceneListPageProps> = ({ ageGroup }) => {
  const navigate = useNavigate();
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  
  const scenes = mockScenes.filter(s => s.ageGroup === ageGroup);

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
              {isElementary ? '🎨 我的场景' : '我的场景'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isElementary ? '看看你创造了哪些有趣的世界吧！' : '管理和查看你创建的场景'}
            </p>
          </div>
          <Button 
            ageGroup={ageGroup}
            onClick={() => navigate(`/student/scenes/create?ageGroup=${ageGroup}`)}
          >
            {isElementary ? '➕ 创建新场景' : '+ 创建场景'}
          </Button>
        </header>

        {scenes.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold mb-2">还没有场景</h2>
            <p className="text-gray-600 mb-6">
              {isElementary ? '来创建你的第一个场景吧！' : '开始创建你的第一个场景'}
            </p>
            <Button 
              ageGroup={ageGroup}
              onClick={() => navigate(`/student/scenes/create?ageGroup=${ageGroup}`)}
            >
              {isElementary ? '🎨 创建场景' : '创建场景'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene) => (
              <Card 
                key={scene.id}
                onClick={() => navigate(`/student/scenes/${scene.id}`)}
                className="hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  {scene.thumbnail ? (
                    <img src={scene.thumbnail} alt={scene.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-4xl">🎨</div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{scene.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{scene.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{scene.characters.length} 个角色</span>
                  <span>{new Date(scene.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 场景模板推荐 */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            {isElementary ? '💡 推荐模板' : '推荐模板'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['古代中国', '太空探索', '数学世界', '童话王国'].map((template) => (
              <Card key={template} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-3xl">🎨</div>
                </div>
                <h3 className="font-semibold text-center">{template}</h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};