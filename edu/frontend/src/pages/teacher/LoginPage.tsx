import React from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const TeacherLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-700">
          教师登录
        </h1>
        <p className="text-center text-gray-600 mb-8">心域-教育版管理平台</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教师编号或邮箱
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入教师编号或邮箱"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入密码"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-600">记住我</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              忘记密码？
            </a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            ageGroup="middle"
          >
            登录
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            还没有账号？{' '}
            <a href="#" className="text-blue-600 font-medium hover:underline">
              申请教师账号
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};