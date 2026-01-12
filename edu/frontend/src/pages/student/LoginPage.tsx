import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { login } from '../../services/api/auth';

export const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        setError('请输入用户名和密码');
        setLoading(false);
        return;
      }

      const response = await login({
        username: username.trim(),
        password: password,
      });

      if (response && response.token) {
        // 登录成功，跳转到仪表板
        // 根据用户信息或默认跳转到小学版
        navigate('/student/dashboard/elementary');
      } else {
        setError('登录失败，请检查用户名和密码');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#9333EA' }}>
          欢迎来到心域-教育版
        </h1>
        <p className="text-center mb-8" style={{ color: '#4B5563' }}>学生登录</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              用户名或邮箱
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请输入用户名或邮箱"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: '#4B5563' }}>记住我</span>
            </label>
            <a href="#" className="text-sm hover:underline" style={{ color: '#9333EA' }}>
              忘记密码？
            </a>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            ageGroup="elementary"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#4B5563' }}>
            还没有账号？{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
              className="font-medium hover:underline"
              style={{ color: '#9333EA' }}
            >
              立即注册
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};