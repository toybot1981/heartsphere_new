import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ContentControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [contentCategories, setContentCategories] = useState({
    scenes: { allowed: true, restricted: [] },
    characters: { allowed: true, restricted: [] },
    aiChat: { allowed: true },
    homework: { allowed: true },
    counseling: { allowed: true },
  });
  const [ageFilter, setAgeFilter] = useState(true);

  const handleSave = () => {
    console.log('保存内容设置:', { contentCategories, ageFilter });
    alert('设置已保存');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">内容访问控制</h1>
          <p className="text-gray-600">设置孩子可以访问的内容类型</p>
        </header>

        {/* 年龄过滤 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">年龄分级过滤</h2>
              <p className="text-sm text-gray-600">自动过滤不适合孩子年龄的内容</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ageFilter}
                onChange={(e) => setAgeFilter(e.target.checked)}
                className="w-5 h-5 mr-2"
              />
              <span className="text-sm font-medium">启用</span>
            </label>
          </div>
        </Card>

        {/* 内容类型控制 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">内容类型权限</h2>
          <div className="space-y-4">
            {[
              { key: 'scenes', label: '场景创建和浏览', icon: '🎨', description: '允许创建和查看学习场景' },
              { key: 'characters', label: '角色创建和交互', icon: '👤', description: '允许创建角色并与角色对话' },
              { key: 'aiChat', label: 'AI对话功能', icon: '💬', description: '允许使用AI对话学习功能' },
              { key: 'homework', label: '作业功能', icon: '📚', description: '允许查看和提交作业' },
              { key: 'counseling', label: '心理辅导功能', icon: '💚', description: '允许使用心理辅导功能' },
            ].map((item) => (
              <div key={item.key} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentCategories[item.key as keyof typeof contentCategories].allowed}
                      onChange={(e) => setContentCategories({
                        ...contentCategories,
                        [item.key]: { ...contentCategories[item.key as keyof typeof contentCategories], allowed: e.target.checked }
                      })}
                      className="w-5 h-5 mr-2"
                    />
                    <span className="text-sm font-medium">允许</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 关键词过滤 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">关键词过滤</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                禁止的关键词（每行一个）
              </label>
              <textarea
                placeholder="输入要禁止的关键词，每行一个..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">包含这些关键词的内容将被自动过滤</p>
            </div>
          </div>
        </Card>

        {/* 保存按钮 */}
        <div className="flex gap-4">
          <Button 
            ageGroup="middle"
            variant="outline"
            onClick={() => navigate('/parent/dashboard')}
            className="flex-1"
          >
            取消
          </Button>
          <Button 
            ageGroup="middle"
            onClick={handleSave}
            className="flex-1"
          >
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
};