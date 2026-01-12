import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import type { AgeGroup } from '../../types';

export const CharacterCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const sceneId = searchParams.get('sceneId');
  const isElementary = ageGroup === 'elementary';
  
  const [step, setStep] = useState(1);
  const [characterName, setCharacterName] = useState('');
  const [characterRole, setCharacterRole] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const roleTemplates = [
    { id: 'teacher', name: '老师', icon: '👨‍🏫', description: '知识渊博的老师' },
    { id: 'friend', name: '朋友', icon: '👫', description: '友好的小伙伴' },
    { id: 'assistant', name: '助手', icon: '🤖', description: '智能学习助手' },
    { id: 'guide', name: '向导', icon: '🧭', description: '学习向导' },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    console.log('创建角色:', { characterName, characterRole, characterDescription, selectedTemplate, sceneId });
    if (sceneId) {
      navigate(`/student/scenes/${sceneId}?ageGroup=${ageGroup}`);
    } else {
      navigate(`/student/characters?ageGroup=${ageGroup}`);
    }
  };

  return (
    <div className={`min-h-screen ${isElementary ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            onClick={() => sceneId ? navigate(`/student/scenes/${sceneId}?ageGroup=${ageGroup}`) : navigate(`/student/characters?ageGroup=${ageGroup}`)}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
            {isElementary ? '👤 创建新角色' : '创建角色'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isElementary ? '让我们一步一步来创建一个有趣的角色吧！' : '设计你的AI角色'}
          </p>
          
          {/* 进度指示器 */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s === step
                      ? isElementary
                        ? 'bg-primary-elementary-500 text-white'
                        : 'bg-primary-middle-500 text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-16 ${
                      s < step ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </header>

        <Card>
          {/* 第1步：选择模板 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '第1步：选择角色类型' : '步骤 1: 选择角色类型'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {roleTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setCharacterRole(template.name);
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? isElementary
                          ? 'border-primary-elementary-500 bg-primary-elementary-50'
                          : 'border-primary-middle-500 bg-primary-middle-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-4xl mb-2 text-center">{template.icon}</div>
                    <h3 className="font-semibold text-center mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-600 text-center">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 第2步：基本信息 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '第2步：填写基本信息' : '步骤 2: 填写基本信息'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isElementary ? '角色名称' : '角色名称 *'}
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder={isElementary ? '例如：小明老师' : '请输入角色名称'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isElementary ? '角色描述' : '角色描述 *'}
                  </label>
                  <textarea
                    value={characterDescription}
                    onChange={(e) => setCharacterDescription(e.target.value)}
                    placeholder={isElementary ? '描述一下这个角色的性格和特点...' : '详细描述角色的性格、特点、能力等'}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent"
                  />
                  {isElementary && (
                    <p className="mt-2 text-sm text-gray-500">
                      💡 提示：可以描述角色的性格、兴趣爱好、擅长什么等
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isElementary ? '角色头像' : '角色头像（可选）'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-500">
                      {isElementary ? '点击上传头像' : '点击上传头像图片'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 第3步：确认 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '第3步：确认创建' : '步骤 3: 确认创建'}
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{characterName || '未命名角色'}</h3>
                      <p className="text-gray-500">{characterRole || '未选择类型'}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{characterDescription || '暂无描述'}</p>
                </div>
                
                {isElementary && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      ✅ 角色创建后，你可以在场景中与它对话，让它帮助你学习！
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex gap-4 pt-6 mt-6 border-t">
            {step > 1 && (
              <Button 
                ageGroup={ageGroup}
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                上一步
              </Button>
            )}
            <Button 
              ageGroup={ageGroup}
              onClick={handleNext}
              disabled={step === 1 && !selectedTemplate || step === 2 && (!characterName || !characterDescription)}
              className={step === 1 ? 'flex-1 ml-auto' : 'flex-1'}
            >
              {step < 3 ? (isElementary ? '➡️ 下一步' : '下一步') : (isElementary ? '✨ 创建角色' : '创建角色')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};