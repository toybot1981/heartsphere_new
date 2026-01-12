import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { register } from '../../services/api/auth';

export const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    ageGroup: 'elementary' as 'elementary' | 'middle',
    grade: '',
    school: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 验证表单
      if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
        setError('请填写所有必填字段');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('密码长度至少为6位');
        setLoading(false);
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('请输入有效的邮箱地址');
        setLoading(false);
        return;
      }

      const response = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ageGroup: formData.ageGroup,
        grade: formData.grade || undefined,
        school: formData.school || undefined,
      });

      if (response && response.token) {
        // 注册成功，跳转到仪表板
        navigate(`/student/dashboard/${formData.ageGroup}`);
      } else {
        setError('注册失败，请稍后重试');
      }
    } catch (err: any) {
      console.error('注册错误:', err);
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#9333EA' }}>
          注册账号
        </h1>
        <p className="text-center mb-8" style={{ color: '#4B5563' }}>创建您的心域教育版账号</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              用户名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请输入密码（至少6位）"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              确认密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请再次输入密码"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              年龄段
            </label>
            <select
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
            >
              <option value="elementary">小学生（6-12岁）</option>
              <option value="middle">中学生（13-18岁）</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              年级
            </label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="例如：一年级、七年级"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              学校
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ color: '#111827' }}
              placeholder="请输入学校名称"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            ageGroup="elementary"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: '#4B5563' }}>
            已有账号？{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              className="font-medium hover:underline"
              style={{ color: '#9333EA' }}
            >
              立即登录
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};
