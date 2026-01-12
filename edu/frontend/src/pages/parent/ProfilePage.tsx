import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockParents } from '../../types/mock';

export const ParentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentParent = mockParents[0];

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">个人中心</h1>
        </header>

        <Card className="mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
              <span>👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{currentParent.username}</h2>
              <p className="text-gray-600 mb-2">{currentParent.email}</p>
              <p className="text-sm text-gray-500">
                注册时间：{new Date(currentParent.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <Button ageGroup="middle" variant="outline">
              编辑资料
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">账户设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">修改密码</p>
                <p className="text-sm text-gray-500">定期修改密码可以保护账户安全</p>
              </div>
              <Button ageGroup="middle" variant="outline" size="sm">
                修改
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">修改邮箱</p>
                <p className="text-sm text-gray-500">用于接收重要通知</p>
              </div>
              <Button ageGroup="middle" variant="outline" size="sm">
                修改
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};