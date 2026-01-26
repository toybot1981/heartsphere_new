import React, { memo, useState, useEffect } from 'react';
import { authApi } from '../../services/api';
import { MobileTouchableButton } from './MobileTouchableButton';
import { MobileFormField } from './MobileFormField';
import { MobilePasswordStrengthIndicator } from './MobilePasswordStrengthIndicator';
import {
  MobileInputStyles,
  MobileSpacing,
  MobileStatusStyles,
  MobileTypography,
  MobileColors,
} from './MobileStyleGuide';
import {
  validatePassword,
  validateEmail,
  validateRequiredFields,
  validatePasswordMatch,
  extractApiResponse,
  type PasswordStrength,
} from '../utils/authHelpers';

interface MobileRegisterFormProps {
  initialNickname?: string;
  onRegisterSuccess: (method: 'password', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  onError?: (error: string) => void;
}

/**
 * Mobile注册表单组件
 * 提供完整的用户注册功能，包括邮箱验证、邀请码等
 */
export const MobileRegisterForm: React.FC<MobileRegisterFormProps> = memo(({
  initialNickname,
  onRegisterSuccess,
  onError,
}) => {
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerNickname, setRegisterNickname] = useState(initialNickname || '');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerInviteCode, setRegisterInviteCode] = useState('');
  const [registerEmailVerificationCode, setRegisterEmailVerificationCode] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [inviteCodeRequired, setInviteCodeRequired] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  // 当initialNickname变化时，更新昵称字段
  useEffect(() => {
    if (initialNickname) {
      setRegisterNickname(initialNickname);
    }
  }, [initialNickname]);

  // 检查是否需要邀请码和邮箱验证
  const checkRequirements = async () => {
    try {
      const [inviteCodeResponse, emailVerificationResponse] = await Promise.all([
        authApi.isInviteCodeRequired(),
        authApi.isEmailVerificationRequired(),
      ]);
      setInviteCodeRequired(inviteCodeResponse.inviteCodeRequired);
      setEmailVerificationRequired(emailVerificationResponse.emailVerificationRequired);
    } catch (err) {
      console.error('检查注册要求失败:', err);
      setInviteCodeRequired(false);
      setEmailVerificationRequired(true);
    }
  };

  useEffect(() => {
    checkRequirements();
  }, []);

  // 发送邮箱验证码
  const handleSendVerificationCode = async () => {
    if (!registerEmail || !validateEmail(registerEmail)) {
      const errorMsg = '请输入有效的邮箱地址';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsSendingCode(true);
    setRegisterError('');

    try {
      await authApi.sendEmailVerificationCode(registerEmail);
      setCodeSent(true);
      setCodeCountdown(60);

      // 倒计时
      const timer = setInterval(() => {
        setCodeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.message || '验证码发送失败，请稍后重试';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsSendingCode(false);
    }
  };

  // 处理密码输入变化
  const handlePasswordChange = (password: string) => {
    setRegisterPassword(password);
    if (password.length > 0) {
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
      setPasswordStrength(validation.strength);
    } else {
      setPasswordErrors([]);
      setPasswordStrength(null);
    }
  };

  // 处理注册
  const handleRegisterSubmit = async () => {
    // 验证必填字段
    const requiredFields = {
      '用户名': registerUsername,
      '邮箱': registerEmail,
      '密码': registerPassword,
      '确认密码': registerConfirmPassword,
    };
    const requiredValidation = validateRequiredFields(requiredFields);
    if (!requiredValidation.isValid) {
      const errorMsg = requiredValidation.errors.join('，');
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!registerNickname.trim()) {
      const errorMsg = '请输入昵称（这将作为你在心域中的称呼）';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // 验证密码强度
    const passwordValidation = validatePassword(registerPassword);
    if (!passwordValidation.isValid) {
      const errorMsg = '密码不符合要求：' + passwordValidation.errors.join('，');
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // 验证密码匹配
    if (!validatePasswordMatch(registerPassword, registerConfirmPassword)) {
      const errorMsg = '两次输入的密码不一致';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (emailVerificationRequired && !registerEmailVerificationCode.trim()) {
      const errorMsg = '请输入邮箱验证码';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (inviteCodeRequired && !registerInviteCode.trim()) {
      const errorMsg = '请输入邀请码';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsRegistering(true);
    setRegisterError('');

    try {
      const response = await authApi.register(
        registerUsername,
        registerEmail,
        registerPassword,
        registerNickname.trim(),
        inviteCodeRequired ? registerInviteCode.trim() : undefined,
        emailVerificationRequired ? registerEmailVerificationCode.trim() : undefined
      );

      const responseData = extractApiResponse(response);

      if (!responseData || !responseData.token) {
        const errorMsg = '注册成功，但未获取到登录令牌，请重新登录';
        setRegisterError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // 保存token到本地存储
      localStorage.setItem('auth_token', responseData.token);

      onRegisterSuccess('password', registerUsername, responseData.isFirstLogin, responseData.worlds);
    } catch (err: any) {
      const errorMsg = err.message || '注册失败，请稍后重试';
      setRegisterError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  // 获取密码输入框的样式
  const getPasswordInputStyle = (password: string): React.CSSProperties => {
    if (password.length === 0) {
      return {};
    }
    if (passwordStrength === 'strong') {
      return {
        borderColor: 'var(--color-success)',
      };
    } else if (passwordStrength === 'medium') {
      return {
        borderColor: 'var(--color-warning)',
      };
    } else if (passwordErrors.length > 0) {
      return {
        borderColor: 'var(--color-error)',
      };
    }
    return {};
  };

  // 获取确认密码输入框的样式
  const getConfirmPasswordInputStyle = (): React.CSSProperties => {
    if (registerConfirmPassword.length === 0) {
      return {};
    }
    if (validatePasswordMatch(registerPassword, registerConfirmPassword)) {
      return {
        borderColor: 'var(--color-success)',
      };
    }
    return {
      borderColor: 'var(--color-error)',
    };
  };

  return (
    <div className={`space-y-4 ${MobileSpacing.margin.md}`}>
      <MobileFormField label="昵称" hint="在心域中的称呼" required>
        <input
          type="text"
          value={registerNickname}
          onChange={(e) => setRegisterNickname(e.target.value)}
          placeholder="输入你的昵称"
          className={MobileInputStyles}
          aria-label="昵称"
          disabled={isRegistering}
        />
      </MobileFormField>
      {initialNickname && (
        <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.accent}`}>
          已从访客昵称自动填入，可修改
        </p>
      )}

      <MobileFormField label="用户名" hint="用于登录" required>
        <input
          type="text"
          value={registerUsername}
          onChange={(e) => setRegisterUsername(e.target.value)}
          placeholder="请输入用户名（用于登录）"
          className={MobileInputStyles}
          autoComplete="username"
          aria-label="用户名"
          disabled={isRegistering}
        />
      </MobileFormField>

      <MobileFormField
        label="邮箱"
        error={registerError && registerEmail && !codeSent ? registerError : undefined}
        required
      >
        {emailVerificationRequired ? (
          <div className="flex gap-2">
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => {
                setRegisterEmail(e.target.value);
                setCodeSent(false);
                setRegisterEmailVerificationCode('');
              }}
              placeholder="请输入邮箱"
              className={`flex-1 ${MobileInputStyles}`}
              autoComplete="email"
              aria-label="邮箱"
              disabled={isRegistering || isSendingCode}
            />
            <MobileTouchableButton
              variant="secondary"
              size="md"
              onClick={handleSendVerificationCode}
              disabled={isSendingCode || codeCountdown > 0 || !registerEmail || !validateEmail(registerEmail) || isRegistering}
              loading={isSendingCode}
            >
              {codeCountdown > 0 ? `${codeCountdown}秒` : '发送验证码'}
            </MobileTouchableButton>
          </div>
        ) : (
          <input
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="请输入邮箱"
            className={MobileInputStyles}
            autoComplete="email"
            aria-label="邮箱"
            disabled={isRegistering}
          />
        )}
      </MobileFormField>
      {emailVerificationRequired && codeSent && (
        <p className={`${MobileTypography.fontSize.xs} ${MobileStatusStyles.success.text}`}>
          验证码已发送，请查收邮件
        </p>
      )}

      {emailVerificationRequired && (
        <MobileFormField label="邮箱验证码" required hint="验证码有效期为10分钟">
          <input
            type="text"
            value={registerEmailVerificationCode}
            onChange={(e) => setRegisterEmailVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="请输入6位验证码"
            maxLength={6}
            className={`${MobileInputStyles} text-center ${MobileTypography.fontSize.lg} tracking-widest font-mono`}
            aria-label="邮箱验证码"
            inputMode="numeric"
            disabled={isRegistering}
          />
        </MobileFormField>
      )}

      <MobileFormField
        label="密码"
        error={passwordErrors.length > 0 ? passwordErrors.join('，') : undefined}
        required
      >
        <input
          type="password"
          value={registerPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          placeholder="至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)"
          className={MobileInputStyles}
          style={getPasswordInputStyle(registerPassword)}
          autoComplete="new-password"
          aria-label="密码"
          disabled={isRegistering}
        />
        <MobilePasswordStrengthIndicator
          password={registerPassword}
          strength={passwordStrength}
          errors={passwordErrors}
        />
      </MobileFormField>

      <MobileFormField label="确认密码" required>
        <input
          type="password"
          value={registerConfirmPassword}
          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
          placeholder="请再次输入密码以确认"
          className={MobileInputStyles}
          style={getConfirmPasswordInputStyle()}
          autoComplete="new-password"
          aria-label="确认密码"
          disabled={isRegistering}
        />
        {registerConfirmPassword.length > 0 && (
          <p className={`${MobileTypography.fontSize.xs} mt-2 ${
            validatePasswordMatch(registerPassword, registerConfirmPassword)
              ? MobileStatusStyles.success.text
              : MobileStatusStyles.error.text
          }`}>
            {validatePasswordMatch(registerPassword, registerConfirmPassword)
              ? '✓ 密码匹配'
              : '✗ 密码不匹配'}
          </p>
        )}
      </MobileFormField>

      {inviteCodeRequired && (
        <MobileFormField label="邀请码" required hint="当前需要邀请码才能注册">
          <input
            type="text"
            value={registerInviteCode}
            onChange={(e) => setRegisterInviteCode(e.target.value.toUpperCase())}
            placeholder="请输入邀请码"
            className={`${MobileInputStyles} uppercase font-mono tracking-wider`}
            maxLength={8}
            aria-label="邀请码"
            disabled={isRegistering}
          />
        </MobileFormField>
      )}

      {registerError && (
        <div className={MobileStatusStyles.error.container} role="alert">
          <p className={MobileStatusStyles.error.text}>{registerError}</p>
        </div>
      )}

      <MobileTouchableButton
        variant="primary"
        size="lg"
        fullWidth
        loading={isRegistering}
        onClick={handleRegisterSubmit}
        disabled={isRegistering}
        className="mt-6"
        aria-label="注册"
      >
        注册
      </MobileTouchableButton>
    </div>
  );
});

MobileRegisterForm.displayName = 'MobileRegisterForm';
