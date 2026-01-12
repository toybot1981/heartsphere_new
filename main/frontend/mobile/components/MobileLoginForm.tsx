import React, { memo, useState } from 'react';
import { authApi } from '../../services/api';
import { MobileTouchableButton } from './MobileTouchableButton';
import { MobileFormField } from './MobileFormField';
import { MobileInputStyles, MobileSpacing, MobileStatusStyles, MobileTypography } from './MobileStyleGuide';
import { extractApiResponse } from '../utils/authHelpers';

interface MobileLoginFormProps {
  onLoginSuccess: (method: 'password', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  onError?: (error: string) => void;
}

/**
 * Mobile登录表单组件
 * 提供用户名和密码登录功能
 */
export const MobileLoginForm: React.FC<MobileLoginFormProps> = memo(({
  onLoginSuccess,
  onError,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      const errorMsg = '请输入用户名和密码';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login(username, password);
      const responseData = extractApiResponse(response);

      if (!responseData || !responseData.token) {
        const errorMsg = '登录成功，但未获取到登录令牌，请重新登录';
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // 保存token到本地存储
      localStorage.setItem('auth_token', responseData.token);

      onLoginSuccess('password', username, responseData.isFirstLogin, responseData.worlds);
    } catch (err: any) {
      const errorMsg = err.message || '登录失败，请检查用户名和密码';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${MobileSpacing.margin.md}`}>
      <MobileFormField label="用户名" error={error && username ? error : undefined} required>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError('');
          }}
          placeholder="请输入用户名"
          className={MobileInputStyles}
          autoComplete="username"
          aria-label="用户名"
          disabled={isLoading}
        />
      </MobileFormField>

      <MobileFormField label="密码" error={error && password ? error : undefined} required>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="请输入密码"
          className={MobileInputStyles}
          autoComplete="current-password"
          aria-label="密码"
          disabled={isLoading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSubmit();
            }
          }}
        />
      </MobileFormField>

      {error && !username && !password && (
        <div className={MobileStatusStyles.error.container} role="alert">
          <p className={MobileStatusStyles.error.text}>{error}</p>
        </div>
      )}

      <MobileTouchableButton
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        onClick={handleSubmit}
        disabled={isLoading || !username || !password}
        className="mt-6"
        aria-label="登录"
      >
        登录
      </MobileTouchableButton>
    </div>
  );
});

MobileLoginForm.displayName = 'MobileLoginForm';
