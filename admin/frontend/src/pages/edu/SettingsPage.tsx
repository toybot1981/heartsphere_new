import React, { useState } from 'react';
import { Card } from '../../components/edu/Card';
import { Button } from '../../components/edu/Button';

export const AdminSettingsPage: React.FC = () => {
  const [systemConfig, setSystemConfig] = useState({
    enableRegistration: true,
    requireEmailVerification: true,
    maxSceneSize: 100,
    maxCharacterSize: 50,
    enableContentModeration: true,
  });

  const handleSave = () => {
    console.log('保存系统配置:', systemConfig);
    alert('设置已保存');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">系统设置</h1>
          <p className="text-gray-600">配置教育版系统的各项设置</p>
        </header>

        {/* 用户注册设置 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">用户注册设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">允许用户注册</p>
                <p className="text-sm text-gray-500">是否允许新用户注册账户</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.enableRegistration}
                  onChange={(e) => setSystemConfig({...systemConfig, enableRegistration: e.target.checked})}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">启用</span>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">要求邮箱验证</p>
                <p className="text-sm text-gray-500">注册时是否要求邮箱验证</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.requireEmailVerification}
                  onChange={(e) => setSystemConfig({...systemConfig, requireEmailVerification: e.target.checked})}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">启用</span>
              </label>
            </div>
          </div>
        </Card>

        {/* 内容限制设置 */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">内容限制设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大场景数量
              </label>
              <input
                type="number"
                value={systemConfig.maxSceneSize}
                onChange={(e) => setSystemConfig({...systemConfig, maxSceneSize: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大角色数量
              </label>
              <input
                type="number"
                value={systemConfig.maxCharacterSize}
                onChange={(e) => setSystemConfig({...systemConfig, maxCharacterSize: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">启用内容审核</p>
                <p className="text-sm text-gray-500">用户创建的内容是否需要审核</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.enableContentModeration}
                  onChange={(e) => setSystemConfig({...systemConfig, enableContentModeration: e.target.checked})}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">启用</span>
              </label>
            </div>
          </div>
        </Card>

        {/* 保存按钮 */}
        <div className="flex gap-4">
          <Button 
            ageGroup="middle"
            variant="outline"
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