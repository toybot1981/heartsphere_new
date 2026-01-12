import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import type { AgeGroup } from '../../types';

export const SceneCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  
  const [sceneName, setSceneName] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    { id: 'ancient-china', name: '古代中国', icon: '🏛️', description: '探索中国古代历史和文化' },
    { id: 'space', name: '太空探索', icon: '🚀', description: '遨游宇宙，学习天文学知识' },
    { id: 'math', name: '数学世界', icon: '📊', description: '在游戏中学习数学概念' },
    { id: 'fairy-tale', name: '童话王国', icon: '👑', description: '进入童话世界，学习故事创作' },
  ];

  const handleCreate = () => {
    // 模拟创建场景
    console.log('创建场景:', { sceneName, sceneDescription, selectedTemplate });
    navigate(`/student/scenes?ageGroup=${ageGroup}`);
  };

  return (
    <div className={`min-h-screen ${isElementary ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            onClick={() => navigate(`/student/scenes?ageGroup=${ageGroup}`)}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
            {isElementary ? '🎨 创建新场景' : '创建场景'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isElementary ? '让我们开始创造一个有趣的世界吧！' : '设计你的学习场景'}
          </p>
        </header>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isElementary ? '第1步：选择模板（可选）' : '步骤 1: 选择模板（可选）'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? isElementary
                      ? 'border-primary-elementary-500 bg-primary-elementary-50'
                      : 'border-primary-middle-500 bg-primary-middle-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2 text-center">{template.icon}</div>
                <h3 className="font-semibold text-center mb-1">{template.name}</h3>
                <p className="text-xs text-gray-600 text-center">{template.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">
            {isElementary ? '第2步：填写信息' : '步骤 2: 填写信息'}
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isElementary ? '场景名称' : '场景名称 *'}
              </label>
              <input
                type="text"
                value={sceneName}
                onChange={(e) => setSceneName(e.target.value)}
                placeholder={isElementary ? '例如：我的古代世界' : '请输入场景名称'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isElementary ? '场景描述' : '场景描述 *'}
              </label>
              <textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder={isElementary ? '描述一下这个场景是什么样子的...' : '详细描述你的场景'}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent"
              />
              {isElementary && (
                <p className="mt-2 text-sm text-gray-500">
                  💡 提示：可以描述场景的环境、人物、故事背景等
                </p>
              )}
            </div>

            {!isElementary && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学习目标
                </label>
                <input
                  type="text"
                  placeholder="这个场景要达成什么学习目标？"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-middle-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                ageGroup={ageGroup}
                variant="outline"
                onClick={() => navigate(`/student/scenes?ageGroup=${ageGroup}`)}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                ageGroup={ageGroup}
                onClick={handleCreate}
                disabled={!sceneName || !sceneDescription}
                className="flex-1"
              >
                {isElementary ? '✨ 创建场景' : '创建场景'}
              </Button>
            </div>
          </div>
        </Card>

        {isElementary && (
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <div className="text-2xl mr-3">💡</div>
              <div>
                <h3 className="font-semibold mb-2">小贴士</h3>
                <p className="text-sm text-gray-700">
                  创建场景后，你可以添加角色，设置对话，让场景变得生动有趣！
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};