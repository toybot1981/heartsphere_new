
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { authApi, wechatApi } from '../services/api';
import QRCode from 'qrcode';
import { AgreementModal } from './AgreementModal';

interface LoginModalProps {
  onLoginSuccess: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  onCancel: () => void;
  initialNickname?: string; // 从访客状态传入的昵称
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onCancel, initialNickname }) => {
  // 如果有初始昵称，默认显示注册标签
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'wechat'>(initialNickname ? 'register' : 'login');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register State
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerNickname, setRegisterNickname] = useState(initialNickname || ''); // 昵称（在心域中的称呼）
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerInviteCode, setRegisterInviteCode] = useState(''); // 邀请码
  const [registerEmailVerificationCode, setRegisterEmailVerificationCode] = useState(''); // 邮箱验证码
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null); // 密码强度
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]); // 密码错误列表
  const [inviteCodeRequired, setInviteCodeRequired] = useState(false); // 是否需要邀请码
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true); // 是否需要邮箱验证码，默认需要
  const [isSendingCode, setIsSendingCode] = useState(false); // 是否正在发送验证码
  const [codeSent, setCodeSent] = useState(false); // 是否已发送验证码
  const [codeCountdown, setCodeCountdown] = useState(0); // 验证码倒计时

  // 当initialNickname变化时，更新昵称字段，并自动切换到注册标签
  useEffect(() => {
    if (initialNickname) {
      setRegisterNickname(initialNickname);
      setActiveTab('register');
    }
  }, [initialNickname]);

  // WeChat State
  const [qrStatus, setQrStatus] = useState<'loading' | 'ready' | 'scanned' | 'confirmed' | 'expired'>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(''); // 二维码图片数据URL
  const [qrState, setQrState] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Agreement Modal State
  const [agreementModalType, setAgreementModalType] = useState<'terms' | 'privacy' | null>(null);

  // 检查是否需要邀请码和邮箱验证
  const checkRequirements = async () => {
    try {
      const [inviteCodeResponse, emailVerificationResponse] = await Promise.all([
        authApi.isInviteCodeRequired(),
        authApi.isEmailVerificationRequired()
      ]);
      setInviteCodeRequired(inviteCodeResponse.inviteCodeRequired);
      setEmailVerificationRequired(emailVerificationResponse.emailVerificationRequired);
    } catch (err) {
      console.error('检查注册要求失败:', err);
      setInviteCodeRequired(false); // 默认不需要
      setEmailVerificationRequired(true); // 默认需要邮箱验证
    }
  };

  // 组件挂载时检查
  useEffect(() => {
    checkRequirements();
  }, []);

  // 切换到注册标签时重新检查（确保获取最新配置）
  useEffect(() => {
    if (activeTab === 'register') {
      checkRequirements();
    }
  }, [activeTab]);

  // 加载微信二维码
  useEffect(() => {
    if (activeTab === 'wechat') {
        setQrStatus('loading');
        // 生成二维码
        const loadQrCode = async () => {
            try {
                const response = await wechatApi.getQrCodeUrl();
                setQrCodeUrl(response.qrCodeUrl);
                setQrState(response.state);
                
                // 生成二维码图片
                try {
                    const dataUrl = await QRCode.toDataURL(response.qrCodeUrl, {
                        width: 256,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    setQrCodeDataUrl(dataUrl);
                    setQrStatus('ready');
                } catch (qrErr) {
                    console.error('生成二维码图片失败:', qrErr);
                    setQrStatus('ready'); // 即使生成图片失败，也显示ready状态
                }
                
                // 开始轮询登录状态
                startPolling(response.state);
            } catch (err) {
                console.error('获取微信二维码失败:', err);
                setQrStatus('expired');
            }
        };
        loadQrCode();
        
        // 清理函数：切换标签页时停止轮询
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }
        };
    } else {
        // 切换标签页时停止轮询
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 轮询登录状态
  const startPolling = (state: string) => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    const interval = setInterval(async () => {
        try {
            const status = await wechatApi.checkStatus(state);
            
            if (status.status === 'confirmed') {
                // 登录成功
                clearInterval(interval);
                setPollingInterval(null);
                setQrStatus('confirmed');
                
                // 保存token
                if (status.token) {
                    localStorage.setItem('auth_token', status.token);
                } else {
                    console.error('[LoginModal] 微信登录成功但未收到token！');
                }
                
                // 确保token已保存后再调用登录成功回调
                // 添加短暂延迟，确保localStorage写入完成
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // 验证token是否已保存
                const savedToken = localStorage.getItem('auth_token');
                if (!savedToken) {
                    console.error('[LoginModal] token保存失败！');
                    setError('登录成功，但保存登录信息失败，请重新登录');
                    return;
                }
                
                // 调用登录成功回调
                onLoginSuccess('wechat', status.username || 'wechat_user', status.isFirstLogin, status.worlds);
            } else if (status.status === 'scanned') {
                setQrStatus('scanned');
            } else if (status.status === 'expired' || status.status === 'error') {
                clearInterval(interval);
                setPollingInterval(null);
                setQrStatus('expired');
            }
        } catch (err) {
            console.error('检查登录状态失败:', err);
        }
    }, 2000); // 每2秒轮询一次
    
    setPollingInterval(interval);
    
    // 30分钟后自动停止轮询
    setTimeout(() => {
        clearInterval(interval);
        setPollingInterval(null);
        if (qrStatus === 'ready' || qrStatus === 'scanned') {
            setQrStatus('expired');
        }
    }, 30 * 60 * 1000);
  };

  // 处理登录
  const handleLoginSubmit = async () => {
      if (!username || !password) {
          setError('请输入用户名和密码');
          return;
      }

      setIsLoading(true);
      setError('');

      try {
          const response = await authApi.login(username, password);
          
          // 检查响应格式，如果是 ApiResponse 格式，提取 data 字段
          const responseData = (response && typeof response === 'object' && 'data' in response) 
            ? response.data 
            : response;
          
          
          if (!responseData || !responseData.token) {
              setError('登录成功，但未获取到登录令牌，请重新登录');
              return;
          }
          
          // 保存token到本地存储
          localStorage.setItem('auth_token', responseData.token);
          
          onLoginSuccess('password', username, responseData.isFirstLogin, responseData.worlds);
      } catch (err: any) {
          setError(err.message || '登录失败，请检查用户名和密码');
      } finally {
          setIsLoading(false);
      }
  };

  // 发送邮箱验证码
  const handleSendVerificationCode = async () => {
      if (!registerEmail || !registerEmail.includes('@')) {
          setRegisterError('请输入有效的邮箱地址');
          return;
      }

      setIsSendingCode(true);
      setRegisterError('');

      try {
          await authApi.sendEmailVerificationCode(registerEmail);
          setCodeSent(true);
          setCodeCountdown(60); // 60秒倒计时
          
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
          setRegisterError(err.message || '验证码发送失败，请稍后重试');
      } finally {
          setIsSendingCode(false);
      }
  };

  // 验证密码强度
  const validatePassword = (password: string): { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' | null } => {
      const errors: string[] = [];
      
      if (password.length < 8) {
          errors.push('密码至少需要8个字符');
      }
      
      if (!/[a-z]/.test(password)) {
          errors.push('密码必须包含至少一个小写字母');
      }
      
      if (!/[A-Z]/.test(password)) {
          errors.push('密码必须包含至少一个大写字母');
      }
      
      if (!/\d/.test(password)) {
          errors.push('密码必须包含至少一个数字');
      }
      
      if (!/[@$!%*?&]/.test(password)) {
          errors.push('密码必须包含至少一个特殊字符(@$!%*?&)');
      }
      
      // 计算密码强度
      let strength: 'weak' | 'medium' | 'strong' | null = null;
      if (errors.length === 0) {
          // 根据密码长度和复杂度判断强度
          const hasAllTypes = /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password);
          if (password.length >= 12 && hasAllTypes) {
              strength = 'strong';
          } else if (password.length >= 8 && hasAllTypes) {
              strength = 'medium';
          } else {
              strength = 'weak';
          }
      }
      
      return {
          isValid: errors.length === 0,
          errors,
          strength
      };
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
      if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
          setRegisterError('请填写所有必填字段');
          return;
      }

      if (!registerNickname.trim()) {
          setRegisterError('请输入昵称（这将作为你在心域中的称呼）');
          return;
      }

      // 验证密码强度
      const passwordValidation = validatePassword(registerPassword);
      if (!passwordValidation.isValid) {
          setRegisterError('密码不符合要求：' + passwordValidation.errors.join('，'));
          return;
      }

      if (emailVerificationRequired && !registerEmailVerificationCode.trim()) {
          setRegisterError('请输入邮箱验证码');
          return;
      }

      if (inviteCodeRequired && !registerInviteCode.trim()) {
          setRegisterError('请输入邀请码');
          return;
      }

      if (registerPassword !== registerConfirmPassword) {
          setRegisterError('两次输入的密码不一致');
          return;
      }

      setIsRegistering(true);
      setRegisterError('');

      try {
          // 检查当前是否为游客（通过检查是否有token且用户信息为游客）
          const token = localStorage.getItem('auth_token');
          let isGuestUpgrade = false;
          
          if (token && initialNickname) {
              // 可能是游客升级，尝试调用游客注册接口
              try {
                  const response = await authApi.guestRegister(
                      registerUsername, 
                      registerEmail, 
                      registerPassword, 
                      registerNickname.trim(),
                      emailVerificationRequired ? registerEmailVerificationCode.trim() : undefined
                  );
                  
                  // 检查响应格式
                  const responseData = (response && typeof response === 'object' && 'data' in response) 
                    ? response.data 
                    : response;
                  
                  if (!responseData || !responseData.token) {
                      setRegisterError('注册成功，但未获取到登录令牌，请重新登录');
                      return;
                  }
                  
                  // 保存token到本地存储
                  localStorage.setItem('auth_token', responseData.token);
                  
                  onLoginSuccess('password', registerUsername, responseData.isFirstLogin, responseData.worlds);
                  isGuestUpgrade = true;
                  return;
              } catch (guestErr: any) {
                  // 如果不是游客升级，继续使用普通注册流程
                  if (guestErr.message && !guestErr.message.includes('不是游客')) {
                      throw guestErr;
                  }
              }
          }
          
          // 普通注册流程
          if (!isGuestUpgrade) {
              const response = await authApi.register(
                  registerUsername, 
                  registerEmail, 
                  registerPassword, 
                  registerNickname.trim(),
                  inviteCodeRequired ? registerInviteCode.trim() : undefined,
                  emailVerificationRequired ? registerEmailVerificationCode.trim() : undefined
              );
              
              // 检查响应格式，如果是 ApiResponse 格式，提取 data 字段
              const responseData = (response && typeof response === 'object' && 'data' in response) 
                ? response.data 
                : response;
              
              
              if (!responseData || !responseData.token) {
                  setRegisterError('注册成功，但未获取到登录令牌，请重新登录');
                  return;
              }
              
              // 保存token到本地存储
              localStorage.setItem('auth_token', responseData.token);
              
              onLoginSuccess('password', registerUsername, responseData.isFirstLogin, responseData.worlds);
          }
      } catch (err: any) {
          setRegisterError(err.message || '注册失败，请稍后重试');
      } finally {
          setIsRegistering(false);
      }
  };

  // 刷新二维码
  const refreshQrCode = async () => {
      setQrStatus('loading');
      if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
      }
      try {
          const response = await wechatApi.getQrCodeUrl();
          setQrCodeUrl(response.qrCodeUrl);
          setQrState(response.state);
          
          // 生成二维码图片
          try {
              const dataUrl = await QRCode.toDataURL(response.qrCodeUrl, {
                  width: 256,
                  margin: 2,
                  color: {
                      dark: '#000000',
                      light: '#FFFFFF'
                  }
              });
              setQrCodeDataUrl(dataUrl);
              setQrStatus('ready');
          } catch (qrErr) {
              console.error('生成二维码图片失败:', qrErr);
              setQrStatus('ready');
          }
          
          startPolling(response.state);
      } catch (err) {
          console.error('刷新二维码失败:', err);
          setQrStatus('expired');
      }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md p-4 animate-fade-in overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.8))' }}
    >
      <div 
        className="rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative my-auto"
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          borderColor: 'var(--color-primary, rgba(99, 102, 241, 0.3))',
        }}
      >
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 z-10"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-4 sm:p-8 pb-4 text-center flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                身份连接
            </h2>
            <p 
              className="text-xs sm:text-sm mt-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              绑定身份以保存记忆、解锁心域全部功能。
            </p>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b mx-4 sm:mx-8 flex-shrink-0"
          style={{ borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))' }}
        >
            <button 
                onClick={() => setActiveTab('login')}
                className="flex-1 pb-3 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom: activeTab === 'login' ? '2px solid #ec4899' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'login') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'login') {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
            >
                登录
            </button>
            <button 
                onClick={() => setActiveTab('register')}
                className="flex-1 pb-3 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom: activeTab === 'register' ? '2px solid #3b82f6' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'register') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'register') {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
            >
                注册
            </button>
            <button 
                onClick={() => setActiveTab('wechat')}
                className="flex-1 pb-3 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === 'wechat' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom: activeTab === 'wechat' ? '2px solid #22c55e' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'wechat') {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'wechat') {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
            >
                微信登录
            </button>
        </div>

        <div className="p-4 sm:p-8 pt-4 sm:pt-6 overflow-y-auto flex-1 min-h-0">
            {/* 登录表单 */}
            {activeTab === 'login' && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <label 
                          className="text-xs font-bold uppercase"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          用户名
                        </label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="请输入用户名"
                            className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #1e293b)',
                              borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#ec4899';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                            }}
                        />
                    </div>

                    <div className="space-y-1">
                         <label 
                           className="text-xs font-bold uppercase"
                           style={{ color: 'var(--text-tertiary)' }}
                         >
                           密码
                         </label>
                         <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #1e293b)',
                              borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#ec4899';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                            }}
                        />
                    </div>
                    
                    {error && (
                      <p 
                        className="text-xs text-center animate-pulse"
                        style={{ color: 'var(--color-error, #f87171)' }}
                      >
                        {error}
                      </p>
                    )}

                    <Button onClick={handleLoginSubmit} fullWidth className="bg-gradient-to-r from-pink-500 to-indigo-600 shadow-lg shadow-indigo-500/20 mt-2" disabled={isLoading}>
                        {isLoading ? '登录中...' : '登录'}
                    </Button>
                </div>
            )}

            {/* 注册表单 */}
            {activeTab === 'register' && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <label 
                          className="text-xs font-bold uppercase"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          昵称 <span style={{ color: 'var(--color-info, #22d3ee)' }}>（在心域中的称呼）</span>
                        </label>
                        <input 
                            type="text" 
                            value={registerNickname}
                            onChange={e => setRegisterNickname(e.target.value)}
                            placeholder="输入你的昵称"
                            className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #1e293b)',
                              borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                            }}
                        />
                        {initialNickname && (
                            <p 
                              className="text-xs mt-1"
                              style={{ color: 'var(--color-info, #22d3ee)' }}
                            >
                              已从访客昵称自动填入，可修改
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label 
                          className="text-xs font-bold uppercase"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          用户名
                        </label>
                        <input 
                            type="text" 
                            value={registerUsername}
                            onChange={e => setRegisterUsername(e.target.value)}
                            placeholder="请输入用户名（用于登录）"
                            className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #1e293b)',
                              borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                            }}
                        />
                    </div>

                    <div className="space-y-1">
                        <label 
                          className="text-xs font-bold uppercase"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          邮箱
                        </label>
                        {emailVerificationRequired ? (
                            <div className="flex gap-2">
                                <input 
                                    type="email" 
                                    value={registerEmail}
                                    onChange={e => {
                                        setRegisterEmail(e.target.value);
                                        setCodeSent(false);
                                        setRegisterEmailVerificationCode('');
                                    }}
                                    placeholder="请输入邮箱"
                                    className="flex-1 min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all touch-manipulation"
                                    style={{
                                      backgroundColor: 'var(--bg-secondary, #1e293b)',
                                      borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                                      color: 'var(--text-primary)',
                                    }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendVerificationCode}
                                    disabled={isSendingCode || codeCountdown > 0 || !registerEmail || !registerEmail.includes('@')}
                                    className="min-w-[44px] min-h-[44px] px-4 py-3 disabled:cursor-not-allowed font-bold rounded-lg transition-colors text-sm whitespace-nowrap touch-manipulation active:scale-95"
                                    style={{
                                      backgroundColor: 'var(--color-primary, #2563eb)',
                                      color: 'var(--text-primary)',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSendingCode && codeCountdown === 0 && registerEmail && registerEmail.includes('@')) {
                                        e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #1d4ed8)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSendingCode && codeCountdown === 0 && registerEmail && registerEmail.includes('@')) {
                                        e.currentTarget.style.backgroundColor = 'var(--color-primary, #2563eb)';
                                      }
                                    }}
                                >
                                    {isSendingCode ? '发送中...' : codeCountdown > 0 ? `${codeCountdown}秒` : '发送验证码'}
                                </button>
                            </div>
                        ) : (
                            <input 
                                type="email" 
                                value={registerEmail}
                                onChange={e => setRegisterEmail(e.target.value)}
                                placeholder="请输入邮箱"
                                className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all touch-manipulation"
                                style={{
                                  backgroundColor: 'var(--bg-card)',
                                  borderColor: 'var(--border-color-overlay)',
                                  color: 'var(--text-primary)',
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--color-info)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                                }}
                            />
                        )}
                        {emailVerificationRequired && codeSent && (
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--color-success, #4ade80)' }}
                            >
                              验证码已发送，请查收邮件
                            </p>
                        )}
                    </div>

                    {emailVerificationRequired && (
                        <div className="space-y-1">
                            <label 
                              className="text-xs font-bold uppercase"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              邮箱验证码 <span style={{ color: 'var(--color-error, #f87171)' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={registerEmailVerificationCode}
                                onChange={e => setRegisterEmailVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="请输入6位验证码"
                                maxLength={6}
                                className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all font-mono text-center text-lg tracking-widest touch-manipulation"
                                style={{
                                  backgroundColor: 'var(--bg-secondary, #1e293b)',
                                  borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                                  color: 'var(--text-primary)',
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                                }}
                            />
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              验证码有效期为10分钟
                            </p>
                        </div>
                    )}

                    <div className="space-y-1">
                         <label 
                           className="text-xs font-bold uppercase"
                           style={{ color: 'var(--text-tertiary)' }}
                         >
                           密码
                         </label>
                         <input 
                            type="password" 
                            value={registerPassword}
                            onChange={e => handlePasswordChange(e.target.value)}
                            placeholder="至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)"
                            className="w-full min-h-[44px] border rounded-lg py-3 px-4 focus:outline-none transition-all touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: registerPassword.length > 0 
                                ? passwordStrength === 'strong' 
                                  ? 'var(--color-success)' 
                                  : passwordStrength === 'medium'
                                  ? 'var(--color-warning)'
                                  : passwordErrors.length > 0
                                  ? 'var(--color-error)'
                                  : 'var(--border-color-overlay)'
                                : 'var(--border-color-overlay)',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              if (registerPassword.length === 0) {
                                e.currentTarget.style.borderColor = 'var(--color-info)';
                              }
                            }}
                            onBlur={(e) => {
                              if (registerPassword.length === 0) {
                                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                              }
                            }}
                        />
                        {/* 密码强度指示器 */}
                        {registerPassword.length > 0 && (
                            <div className="space-y-1">
                                {/* 强度条 */}
                                <div className="flex gap-1 h-1">
                                    <div 
                                      className="flex-1 rounded"
                                      style={{
                                        backgroundColor: passwordStrength === 'strong' 
                                          ? 'var(--color-success)' 
                                          : passwordStrength === 'medium' 
                                          ? 'var(--color-warning)'
                                          : passwordErrors.length > 0
                                          ? 'var(--color-error)'
                                          : 'var(--bg-secondary)',
                                      }}
                                    ></div>
                                    <div 
                                      className="flex-1 rounded"
                                      style={{
                                        backgroundColor: passwordStrength === 'strong' || passwordStrength === 'medium' 
                                          ? (passwordStrength === 'strong' ? 'var(--color-success)' : 'var(--color-warning)')
                                          : 'var(--bg-secondary)',
                                      }}
                                    ></div>
                                    <div 
                                      className="flex-1 rounded"
                                      style={{
                                        backgroundColor: passwordStrength === 'strong' 
                                          ? 'var(--color-success)' 
                                          : 'var(--bg-secondary)',
                                      }}
                                    ></div>
                                </div>
                                {/* 强度文字提示 */}
                                {passwordStrength && (
                                    <p 
                                      className="text-xs"
                                      style={{
                                        color: passwordStrength === 'strong' 
                                          ? 'var(--color-success)' 
                                          : passwordStrength === 'medium' 
                                          ? 'var(--color-warning)' 
                                          : 'var(--color-error)',
                                      }}
                                    >
                                        {passwordStrength === 'strong' ? '✓ 密码强度：强' :
                                         passwordStrength === 'medium' ? '⚠ 密码强度：中' : '✗ 密码强度：弱'}
                                    </p>
                                )}
                                {/* 错误提示 */}
                                {passwordErrors.length > 0 && (
                                    <ul 
                                      className="text-xs space-y-0.5"
                                      style={{ color: 'var(--color-error)' }}
                                    >
                                        {passwordErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {/* 密码要求提示（当密码为空时显示） */}
                        {registerPassword.length === 0 && (
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                                密码要求：至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                         <label 
                           className="text-xs font-bold uppercase"
                           style={{ color: 'var(--text-tertiary)' }}
                         >
                           确认密码
                         </label>
                         <input 
                            type="password" 
                            value={registerConfirmPassword}
                            onChange={e => setRegisterConfirmPassword(e.target.value)}
                            placeholder="请再次输入密码以确认"
                            className="w-full min-h-[44px] border rounded-lg py-3 px-4 focus:outline-none transition-all touch-manipulation"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: registerConfirmPassword.length > 0
                                ? registerPassword === registerConfirmPassword
                                  ? 'var(--color-success)'
                                  : 'var(--color-error)'
                                : 'var(--border-color-overlay)',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              if (registerConfirmPassword.length === 0) {
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }
                            }}
                            onBlur={(e) => {
                              if (registerConfirmPassword.length === 0) {
                                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                              }
                            }}
                        />
                        {/* 密码匹配提示 */}
                        {registerConfirmPassword.length > 0 && (
                            <p 
                              className="text-xs"
                              style={{
                                color: registerPassword === registerConfirmPassword 
                                  ? 'var(--color-success)' 
                                  : 'var(--color-error)',
                              }}
                            >
                                {registerPassword === registerConfirmPassword ? '✓ 密码匹配' : '✗ 密码不匹配'}
                            </p>
                        )}
                    </div>

                    {inviteCodeRequired && (
                        <div className="space-y-1">
                            <label 
                              className="text-xs font-bold uppercase"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              邀请码 <span style={{ color: 'var(--color-error, #f87171)' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={registerInviteCode}
                                onChange={e => setRegisterInviteCode(e.target.value.toUpperCase())}
                                placeholder="请输入邀请码"
                                className="w-full min-h-[44px] border rounded-lg py-3 px-4 outline-none transition-all uppercase font-mono tracking-wider touch-manipulation"
                                maxLength={8}
                                style={{
                                  backgroundColor: 'var(--bg-secondary, #1e293b)',
                                  borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))',
                                  color: 'var(--text-primary)',
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(148, 163, 184, 1))';
                                }}
                            />
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              当前需要邀请码才能注册
                            </p>
                        </div>
                    )}
                    
                    {registerError && (
                      <p 
                        className="text-xs text-center animate-pulse"
                        style={{ color: 'var(--color-error, #f87171)' }}
                      >
                        {registerError}
                      </p>
                    )}

                    <Button 
                      onClick={handleRegisterSubmit} 
                      fullWidth 
                      className="shadow-lg mt-2" 
                      style={{
                        background: 'var(--gradient-button)',
                        color: 'var(--text-primary)',
                      }}
                      disabled={isRegistering}
                    >
                        {isRegistering ? '注册中...' : '注册'}
                    </Button>
                </div>
            )}

            {/* 微信登录 */}
            {activeTab === 'wechat' && (
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <div className={`w-64 h-64 bg-white p-3 rounded-xl flex items-center justify-center relative transition-all ${
                        qrStatus === 'scanned' ? 'opacity-50 blur-sm' : 
                        qrStatus === 'expired' ? 'opacity-30' : 
                        'opacity-100'
                    }`}>
                        {qrStatus === 'loading' ? (
                            <div 
                              className="w-12 h-12 border-4 rounded-full animate-spin"
                              style={{
                                borderColor: 'var(--bg-overlay, rgba(226, 232, 240, 1)) var(--bg-overlay, rgba(226, 232, 240, 1)) var(--bg-overlay, rgba(226, 232, 240, 1)) #22c55e',
                              }}
                            />
                        ) : qrStatus === 'expired' ? (
                            <div 
                              className="text-center"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm">二维码已过期</p>
                            </div>
                        ) : qrCodeDataUrl ? (
                            <img 
                                src={qrCodeDataUrl}
                                alt="微信登录二维码"
                                className="w-full h-full"
                            />
                        ) : (
                            <div 
                              className="text-center"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                                <p className="text-sm">加载中...</p>
                            </div>
                        )}
                        
                        {qrStatus === 'scanned' && (
                             <div className="absolute inset-0 flex items-center justify-center z-10">
                                 <div 
                                   className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                                   style={{ backgroundColor: 'var(--color-success)' }}
                                 >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                     </svg>
                                 </div>
                             </div>
                        )}

                        {qrStatus === 'confirmed' && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center z-10 rounded-xl"
                              style={{
                                backgroundColor: 'var(--bg-success-alpha)',
                              }}
                            >
                                <div 
                                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                                  style={{
                                    backgroundColor: 'var(--color-success)',
                                  }}
                                >
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className="h-10 w-10" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center">
                        <p 
                          className="font-bold mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                            {qrStatus === 'loading' ? '正在生成二维码...' :
                             qrStatus === 'scanned' ? '已扫描，请在手机上确认' :
                             qrStatus === 'confirmed' ? '登录成功！' :
                             qrStatus === 'expired' ? '二维码已过期' :
                             '使用微信扫码登录'}
                        </p>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                            {qrStatus === 'scanned' ? '正在同步您的心域数据...' : 
                             qrStatus === 'expired' ? '请点击刷新重新生成二维码' :
                             '安全、快捷、无需记忆密码'}
                        </p>
                    </div>

                    {(qrStatus === 'expired' || qrStatus === 'ready') && (
                        <button 
                            onClick={refreshQrCode}
                            className="px-6 py-2 font-bold rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'var(--color-success, #16a34a)',
                              color: 'var(--text-primary)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-success, #15803d)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-success, #16a34a)';
                            }}
                        >
                            {qrStatus === 'expired' ? '刷新二维码' : '重新生成'}
                        </button>
                    )}
                </div>
            )}
        </div>
        
        <div 
          className="p-3 sm:p-4 text-center border-t flex-shrink-0"
          style={{
            backgroundColor: 'var(--bg-secondary, #020617)',
            borderColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))',
          }}
        >
             <p 
               className="text-[10px]"
               style={{ color: 'var(--text-tertiary)' }}
             >
                 登录即代表您同意 <span 
                   className="cursor-pointer hover:underline"
                   style={{ color: 'var(--color-info)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.color = 'var(--color-info-light)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.color = 'var(--color-info)';
                   }}
                   onClick={() => setAgreementModalType('terms')}
                 >《心域用户协议》</span> 及 <span 
                   className="cursor-pointer hover:underline"
                   style={{ color: 'var(--color-info)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.color = 'var(--color-info-light)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.color = 'var(--color-info)';
                   }}
                   onClick={() => setAgreementModalType('privacy')}
                 >《隐私政策》</span>
             </p>
        </div>
      </div>

      {/* Agreement Modal */}
      {agreementModalType && (
        <AgreementModal
          type={agreementModalType}
          onClose={() => setAgreementModalType(null)}
        />
      )}
    </div>
  );
};
