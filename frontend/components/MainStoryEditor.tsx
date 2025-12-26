import React, { useState, useEffect, useRef } from 'react';
import { Character, WorldScene } from '../types';
import { imageApi, userMainStoryApi } from '../services/api';
import { Button } from './Button';
import { ResourcePicker } from './ResourcePicker';
import { showAlert } from '../utils/dialog';

interface MainStoryEditorProps {
  scene: WorldScene;
  initialMainStory?: Character | null;
  onSave: (mainStory: Character) => void;
  onClose: () => void;
  worldStyle?: string;
}

export const MainStoryEditor: React.FC<MainStoryEditorProps> = ({ 
  scene, 
  initialMainStory, 
  onSave, 
  onClose,
  worldStyle 
}) => {
  const [mainStory, setMainStory] = useState<Character>(() => {
    if (initialMainStory) {
      return initialMainStory;
    }
    return {
      id: '',
      name: '',
      age: 0,
      role: '叙事者',
      bio: '',
      avatarUrl: '',
      backgroundUrl: '',
      themeColor: 'indigo-500',
      colorAccent: '#6366f1',
      firstMessage: '',
      systemInstruction: '',
      voiceName: 'Aoede',
      tags: [],
      speechStyle: '',
      catchphrases: [],
      secrets: '',
      motivations: ''
    };
  });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [showAvatarResourcePicker, setShowAvatarResourcePicker] = useState(false);
  const [showBackgroundResourcePicker, setShowBackgroundResourcePicker] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof Character, value: any) => {
    setMainStory(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type: 'avatar' | 'background', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        updateField('avatarUrl', reader.result as string);
      } else {
        updateField('backgroundUrl', reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (type === 'avatar') {
      setIsUploadingAvatar(true);
    } else {
      setIsUploadingBackground(true);
    }

    try {
      const token = localStorage.getItem('auth_token');
      const result = await imageApi.uploadImage(file, 'character', token || undefined);
      if (type === 'avatar') {
        updateField('avatarUrl', result.url);
      } else {
        updateField('backgroundUrl', result.url);
      }
    } catch (error) {
      console.error('上传失败:', error);
      showAlert('图片上传失败，请稍后重试', '上传失败', 'error');
    } finally {
      if (type === 'avatar') {
        setIsUploadingAvatar(false);
      } else {
        setIsUploadingBackground(false);
      }
    }
  };

  const handleSave = () => {
    if (!mainStory.name.trim()) {
      showAlert('请输入剧情名称', '提示', 'warning');
      return;
    }
    if (!mainStory.firstMessage.trim()) {
      showAlert('请输入开场白', '提示', 'warning');
      return;
    }
    onSave(mainStory);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">编辑主线剧情</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 所属场景 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              所属场景 <span className="text-red-500">*</span>
            </label>
            <input
              value={scene.name}
              disabled
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* 剧情名称 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              剧情名称 <span className="text-red-500">*</span>
            </label>
            <input
              value={mainStory.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="请输入剧情名称"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* 叙事者年龄和角色定位 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">叙事者年龄</label>
              <input
                type="number"
                value={mainStory.age || ''}
                onChange={e => updateField('age', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">角色定位</label>
              <input
                value={mainStory.role || '叙事者'}
                onChange={e => updateField('role', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* 剧情简介 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">剧情简介</label>
            <textarea
              value={mainStory.bio || ''}
              onChange={e => updateField('bio', e.target.value)}
              placeholder="请输入剧情简介"
              rows={4}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* 开场白 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              开场白（第一句问候） <span className="text-red-500">*</span>
            </label>
            <textarea
              value={mainStory.firstMessage || ''}
              onChange={e => updateField('firstMessage', e.target.value)}
              placeholder="请输入开场白"
              rows={6}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* 叙事者头像 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">叙事者头像</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={mainStory.avatarUrl || ''}
                  onChange={e => updateField('avatarUrl', e.target.value)}
                  placeholder="头像URL或点击上传"
                  className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={() => {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      setShowAvatarResourcePicker(true);
                    } else {
                      showAlert('请先登录', '提示', 'warning');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm"
                >
                  选择资源
                </button>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {isUploadingAvatar ? '上传中...' : '上传'}
                </button>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={e => handleFileUpload('avatar', e)}
                accept="image/*"
                className="hidden"
              />
              {mainStory.avatarUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700">
                  <img src={mainStory.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  <button
                    onClick={() => updateField('avatarUrl', '')}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 背景图 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">背景图</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={mainStory.backgroundUrl || ''}
                  onChange={e => updateField('backgroundUrl', e.target.value)}
                  placeholder="背景图URL或点击上传"
                  className="flex-1 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={() => {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      setShowBackgroundResourcePicker(true);
                    } else {
                      showAlert('请先登录', '提示', 'warning');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm"
                >
                  选择资源
                </button>
                <button
                  onClick={() => bgInputRef.current?.click()}
                  disabled={isUploadingBackground}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {isUploadingBackground ? '上传中...' : '上传'}
                </button>
              </div>
              <input
                type="file"
                ref={bgInputRef}
                onChange={e => handleFileUpload('background', e)}
                accept="image/*"
                className="hidden"
              />
              {mainStory.backgroundUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-700">
                  <img src={mainStory.backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                  <button
                    onClick={() => updateField('backgroundUrl', '')}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 主题色和强调色 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">主题色</label>
              <input
                value={mainStory.themeColor || 'indigo-500'}
                onChange={e => updateField('themeColor', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-2">强调色</label>
              <input
                type="color"
                value={mainStory.colorAccent || '#6366f1'}
                onChange={e => updateField('colorAccent', e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none h-10"
              />
            </div>
          </div>

          {/* 系统指令 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">系统指令</label>
            <textarea
              value={mainStory.systemInstruction || ''}
              onChange={e => updateField('systemInstruction', e.target.value)}
              placeholder="请输入系统指令"
              rows={6}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* 语音名称 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">语音名称</label>
            <input
              value={mainStory.voiceName || ''}
              onChange={e => updateField('voiceName', e.target.value)}
              placeholder="例如: Charon"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">标签（逗号分隔）</label>
            <input
              value={Array.isArray(mainStory.tags) ? mainStory.tags.join(',') : (mainStory.tags || '')}
              onChange={e => {
                const tagsArray = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                updateField('tags', tagsArray);
              }}
              placeholder="例如: Narrator,Story"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* 语言风格 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">语言风格</label>
            <textarea
              value={mainStory.speechStyle || ''}
              onChange={e => updateField('speechStyle', e.target.value)}
              placeholder="请输入语言风格"
              rows={2}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* 口头禅 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">口头禅（逗号分隔）</label>
            <input
              value={Array.isArray(mainStory.catchphrases) ? mainStory.catchphrases.join(',') : (mainStory.catchphrases || '')}
              onChange={e => {
                const catchphrasesArray = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                updateField('catchphrases', catchphrasesArray);
              }}
              placeholder="例如: 你知道吗,真的吗"
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* 动机 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">动机</label>
            <textarea
              value={mainStory.motivations || ''}
              onChange={e => updateField('motivations', e.target.value)}
              placeholder="请输入动机"
              rows={2}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* 秘密 */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">秘密</label>
            <textarea
              value={mainStory.secrets || ''}
              onChange={e => updateField('secrets', e.target.value)}
              placeholder="请输入秘密"
              rows={2}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 border border-gray-700 text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-700">
          <Button
            onClick={onClose}
            variant="secondary"
            className="px-6 py-2"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500"
          >
            保存修改
          </Button>
        </div>

        {/* 资源选择器 */}
        {showAvatarResourcePicker && (
          <ResourcePicker
            category="character"
            token={localStorage.getItem('auth_token') || undefined}
            useAdminApi={false}
            onSelect={(url) => {
              updateField('avatarUrl', url);
              setShowAvatarResourcePicker(false);
            }}
            onClose={() => setShowAvatarResourcePicker(false)}
            currentUrl={mainStory.avatarUrl}
          />
        )}
        {showBackgroundResourcePicker && (
          <ResourcePicker
            category="character"
            token={localStorage.getItem('auth_token') || undefined}
            useAdminApi={false}
            onSelect={(url) => {
              updateField('backgroundUrl', url);
              setShowBackgroundResourcePicker(false);
            }}
            onClose={() => setShowBackgroundResourcePicker(false)}
            currentUrl={mainStory.backgroundUrl}
          />
        )}
      </div>
    </div>
  );
};



