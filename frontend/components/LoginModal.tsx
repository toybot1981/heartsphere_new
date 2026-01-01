
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
  useEffect(() => {
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
    checkRequirements();
  }, []);

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
                    console.log('[LoginModal] 微信登录成功，token已保存到localStorage，长度:', status.token.length);
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
          console.log('[LoginModal] 登录响应:', response);
          
          // 检查响应格式，如果是 ApiResponse 格式，提取 data 字段
          const responseData = (response && typeof response === 'object' && 'data' in response) 
            ? response.data 
            : response;
          
          console.log('[LoginModal] 提取的响应数据:', responseData);
          console.log('[LoginModal] token存在:', !!responseData?.token);
          
          if (!responseData || !responseData.token) {
              setError('登录成功，但未获取到登录令牌，请重新登录');
              return;
          }
          
          // 保存token到本地存储
          localStorage.setItem('auth_token', responseData.token);
          console.log('[LoginModal] token已保存到localStorage');
          
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
          const response = await authApi.register(
              registerUsername, 
              registerEmail, 
              registerPassword, 
              registerNickname.trim(),
              inviteCodeRequired ? registerInviteCode.trim() : undefined,
              emailVerificationRequired ? registerEmailVerificationCode.trim() : undefined
          );
          console.log('[LoginModal] 注册响应:', response);
          
          // 检查响应格式，如果是 ApiResponse 格式，提取 data 字段
          const responseData = (response && typeof response === 'object' && 'data' in response) 
            ? response.data 
            : response;
          
          console.log('[LoginModal] 提取的响应数据:', responseData);
          console.log('[LoginModal] token存在:', !!responseData?.token);
          
          if (!responseData || !responseData.token) {
              setRegisterError('注册成功，但未获取到登录令牌，请重新登录');
              return;
          }
          
          // 保存token到本地存储
          localStorage.setItem('auth_token', responseData.token);
          console.log('[LoginModal] token已保存到localStorage');
          
          onLoginSuccess('password', registerUsername, responseData.isFirstLogin, responseData.worlds);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-md max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative my-auto">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-4 sm:p-8 pb-4 text-center flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                身份连接
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">绑定身份以保存记忆、解锁心域全部功能。</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 mx-4 sm:mx-8 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'login' ? 'text-white border-b-2 border-pink-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
                登录
            </button>
            <button 
                onClick={() => setActiveTab('register')}
                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'register' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
                注册
            </button>
            <button 
                onClick={() => setActiveTab('wechat')}
                className={`flex-1 pb-3 text-sm font-bold transition-colors ${activeTab === 'wechat' ? 'text-white border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
                微信登录
            </button>
        </div>

        <div className="p-4 sm:p-8 pt-4 sm:pt-6 overflow-y-auto flex-1 min-h-0">
            {/* 登录表单 */}
            {activeTab === 'login' && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">用户名</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="请输入用户名"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-pink-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase">密码</label>
                         <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-pink-500 outline-none transition-all"
                        />
                    </div>
                    
                    {error && <p className="text-red-400 text-xs text-center animate-pulse">{error}</p>}

                    <Button onClick={handleLoginSubmit} fullWidth className="bg-gradient-to-r from-pink-500 to-indigo-600 shadow-lg shadow-indigo-500/20 mt-2" disabled={isLoading}>
                        {isLoading ? '登录中...' : '登录'}
                    </Button>
                </div>
            )}

            {/* 注册表单 */}
            {activeTab === 'register' && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">昵称 <span className="text-cyan-400">（在心域中的称呼）</span></label>
                        <input 
                            type="text" 
                            value={registerNickname}
                            onChange={e => setRegisterNickname(e.target.value)}
                            placeholder="输入你的昵称"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none transition-all"
                        />
                        {initialNickname && (
                            <p className="text-xs text-cyan-400 mt-1">已从访客昵称自动填入，可修改</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">用户名</label>
                        <input 
                            type="text" 
                            value={registerUsername}
                            onChange={e => setRegisterUsername(e.target.value)}
                            placeholder="请输入用户名（用于登录）"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">邮箱</label>
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
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendVerificationCode}
                                    disabled={isSendingCode || codeCountdown > 0 || !registerEmail || !registerEmail.includes('@')}
                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap"
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none transition-all"
                            />
                        )}
                        {emailVerificationRequired && codeSent && (
                            <p className="text-xs text-green-400">验证码已发送，请查收邮件</p>
                        )}
                    </div>

                    {emailVerificationRequired && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">邮箱验证码 <span className="text-red-400">*</span></label>
                            <input 
                                type="text" 
                                value={registerEmailVerificationCode}
                                onChange={e => setRegisterEmailVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="请输入6位验证码"
                                maxLength={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none transition-all font-mono text-center text-lg tracking-widest"
                            />
                            <p className="text-xs text-slate-500">验证码有效期为10分钟</p>
                        </div>
                    )}

                    <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase">密码</label>
                         <input 
                            type="password" 
                            value={registerPassword}
                            onChange={e => handlePasswordChange(e.target.value)}
                            placeholder="至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)"
                            className={`w-full bg-slate-800 border rounded-lg py-3 px-4 text-white focus:outline-none transition-all ${
                                registerPassword.length > 0 
                                    ? passwordStrength === 'strong' 
                                        ? 'border-green-500 focus:border-green-400' 
                                        : passwordStrength === 'medium'
                                        ? 'border-yellow-500 focus:border-yellow-400'
                                        : passwordErrors.length > 0
                                        ? 'border-red-500 focus:border-red-400'
                                        : 'border-slate-700 focus:border-blue-500'
                                    : 'border-slate-700 focus:border-blue-500'
                            }`}
                        />
                        {/* 密码强度指示器 */}
                        {registerPassword.length > 0 && (
                            <div className="space-y-1">
                                {/* 强度条 */}
                                <div className="flex gap-1 h-1">
                                    <div className={`flex-1 rounded ${
                                        passwordStrength === 'strong' ? 'bg-green-500' :
                                        passwordStrength === 'medium' ? 'bg-yellow-500' :
                                        passwordErrors.length > 0 ? 'bg-red-500' : 'bg-slate-600'
                                    }`}></div>
                                    <div className={`flex-1 rounded ${
                                        passwordStrength === 'strong' || passwordStrength === 'medium' ? 
                                        (passwordStrength === 'strong' ? 'bg-green-500' : 'bg-yellow-500') : 'bg-slate-600'
                                    }`}></div>
                                    <div className={`flex-1 rounded ${
                                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-600'
                                    }`}></div>
                                </div>
                                {/* 强度文字提示 */}
                                {passwordStrength && (
                                    <p className={`text-xs ${
                                        passwordStrength === 'strong' ? 'text-green-400' :
                                        passwordStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {passwordStrength === 'strong' ? '✓ 密码强度：强' :
                                         passwordStrength === 'medium' ? '⚠ 密码强度：中' : '✗ 密码强度：弱'}
                                    </p>
                                )}
                                {/* 错误提示 */}
                                {passwordErrors.length > 0 && (
                                    <ul className="text-xs text-red-400 space-y-0.5">
                                        {passwordErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {/* 密码要求提示（当密码为空时显示） */}
                        {registerPassword.length === 0 && (
                            <p className="text-xs text-slate-500">
                                密码要求：至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase">确认密码</label>
                         <input 
                            type="password" 
                            value={registerConfirmPassword}
                            onChange={e => setRegisterConfirmPassword(e.target.value)}
                            placeholder="请再次输入密码以确认"
                            className={`w-full bg-slate-800 border rounded-lg py-3 px-4 text-white focus:outline-none transition-all ${
                                registerConfirmPassword.length > 0
                                    ? registerPassword === registerConfirmPassword
                                        ? 'border-green-500 focus:border-green-400'
                                        : 'border-red-500 focus:border-red-400'
                                    : 'border-slate-700 focus:border-blue-500'
                            }`}
                        />
                        {/* 密码匹配提示 */}
                        {registerConfirmPassword.length > 0 && (
                            <p className={`text-xs ${
                                registerPassword === registerConfirmPassword ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {registerPassword === registerConfirmPassword ? '✓ 密码匹配' : '✗ 密码不匹配'}
                            </p>
                        )}
                    </div>

                    {inviteCodeRequired && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">邀请码 <span className="text-red-400">*</span></label>
                            <input 
                                type="text" 
                                value={registerInviteCode}
                                onChange={e => setRegisterInviteCode(e.target.value.toUpperCase())}
                                placeholder="请输入邀请码"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-blue-500 outline-none transition-all uppercase font-mono tracking-wider"
                                maxLength={8}
                            />
                            <p className="text-xs text-slate-500">当前需要邀请码才能注册</p>
                        </div>
                    )}
                    
                    {registerError && <p className="text-red-400 text-xs text-center animate-pulse">{registerError}</p>}

                    <Button onClick={handleRegisterSubmit} fullWidth className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/20 mt-2" disabled={isRegistering}>
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
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin" />
                        ) : qrStatus === 'expired' ? (
                            <div className="text-center text-slate-500">
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
                            <div className="text-center text-slate-500">
                                <p className="text-sm">加载中...</p>
                            </div>
                        )}
                        
                        {qrStatus === 'scanned' && (
                             <div className="absolute inset-0 flex items-center justify-center z-10">
                                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                     </svg>
                                 </div>
                             </div>
                        )}

                        {qrStatus === 'confirmed' && (
                             <div className="absolute inset-0 flex items-center justify-center z-10 bg-green-500/20 rounded-xl">
                                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                     </svg>
                                 </div>
                             </div>
                        )}
                    </div>
                    
                    <div className="text-center">
                        <p className="text-white font-bold mb-1">
                            {qrStatus === 'loading' ? '正在生成二维码...' :
                             qrStatus === 'scanned' ? '已扫描，请在手机上确认' :
                             qrStatus === 'confirmed' ? '登录成功！' :
                             qrStatus === 'expired' ? '二维码已过期' :
                             '使用微信扫码登录'}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            {qrStatus === 'scanned' ? '正在同步您的心域数据...' : 
                             qrStatus === 'expired' ? '请点击刷新重新生成二维码' :
                             '安全、快捷、无需记忆密码'}
                        </p>
                    </div>

                    {(qrStatus === 'expired' || qrStatus === 'ready') && (
                        <button 
                            onClick={refreshQrCode}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >
                            {qrStatus === 'expired' ? '刷新二维码' : '重新生成'}
                        </button>
                    )}
                </div>
            )}
        </div>
        
        <div className="bg-slate-950 p-3 sm:p-4 text-center border-t border-slate-800 flex-shrink-0">
             <p className="text-[10px] text-slate-600">
                 登录即代表您同意 <span 
                   className="text-indigo-400 cursor-pointer hover:underline"
                   onClick={() => setAgreementModalType('terms')}
                 >《心域用户协议》</span> 及 <span 
                   className="text-indigo-400 cursor-pointer hover:underline"
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
