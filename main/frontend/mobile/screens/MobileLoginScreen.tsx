import React, { useState, useEffect } from 'react';
import { MobileBackButton } from '../components/MobileBackButton';
import { MobileLoginForm } from '../components/MobileLoginForm';
import { MobileRegisterForm } from '../components/MobileRegisterForm';
import { MobileWechatLogin } from '../components/MobileWechatLogin';
import { AgreementModal } from '../../components/AgreementModal';
import {
  MobileColors,
  MobileSpacing,
  MobileRadius,
  MobileTypography,
  MobileSafeArea,
} from '../components/MobileStyleGuide';

interface MobileLoginScreenProps {
  onLoginSuccess: (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  onCancel: () => void;
  initialNickname?: string; // 从访客状态传入的昵称
}

/**
 * Mobile版本登录注册页面
 * 参照PC版本LoginModal，按照Mobile风格重新设计
 * 设计理念：扁平化、简洁、科技感、温馨
 */
export const MobileLoginScreen: React.FC<MobileLoginScreenProps> = ({
  onLoginSuccess,
  onCancel,
  initialNickname,
}) => {
  // 标签页状态（如果有初始昵称，默认显示注册标签）
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'wechat'>(
    initialNickname ? 'register' : 'login'
  );

  // 协议模态框状态
  const [agreementModalType, setAgreementModalType] = useState<'terms' | 'privacy' | null>(null);
  const [error, setError] = useState('');

  // 当initialNickname变化时，自动切换到注册标签
  useEffect(() => {
    if (initialNickname) {
      setActiveTab('register');
    }
  }, [initialNickname]);

  // 处理登录成功
  const handleLoginSuccess = (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => {
    setError('');
    onLoginSuccess(method, identifier, isFirstLogin, worlds);
  };

  // 处理错误
  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // 处理标签切换
  const handleTabChange = (tab: 'login' | 'register' | 'wechat') => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <>
      <div className={`h-screen w-full ${MobileColors.background.slate} ${MobileSafeArea.top} ${MobileSafeArea.bottom} flex flex-col`}>
        {/* 顶部栏 */}
        <div className={`flex items-center justify-between ${MobileSpacing.padding.md} border-b ${MobileColors.border.default}`}>
          <MobileBackButton onClick={onCancel} aria-label="返回" />
          <h1 className={`${MobileTypography.fontSize.xl} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary}`}>
            身份连接
          </h1>
          <div className="w-10" /> {/* 占位，保持标题居中 */}
        </div>

        {/* 标签页切换 */}
        <div className={`flex border-b ${MobileColors.border.default}`} role="tablist" aria-label="登录方式选择">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 pb-3 ${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} transition-colors ${
              activeTab === 'login'
                ? `${MobileColors.text.primary} border-b-2 border-purple-500`
                : `${MobileColors.text.secondary} hover:${MobileColors.text.primary}`
            }`}
            aria-label="登录"
            aria-selected={activeTab === 'login'}
            role="tab"
          >
            登录
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 pb-3 ${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} transition-colors ${
              activeTab === 'register'
                ? `${MobileColors.text.primary} border-b-2 border-purple-500`
                : `${MobileColors.text.secondary} hover:${MobileColors.text.primary}`
            }`}
            aria-label="注册"
            aria-selected={activeTab === 'register'}
            role="tab"
          >
            注册
          </button>
          <button
            onClick={() => handleTabChange('wechat')}
            className={`flex-1 pb-3 ${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} transition-colors ${
              activeTab === 'wechat'
                ? `${MobileColors.text.primary} border-b-2 border-purple-500`
                : `${MobileColors.text.secondary} hover:${MobileColors.text.primary}`
            }`}
            aria-label="微信登录"
            aria-selected={activeTab === 'wechat'}
            role="tab"
          >
            微信
          </button>
        </div>

        {/* 内容区域 */}
        <div className={`flex-1 overflow-y-auto ${MobileSpacing.padding.md}`}>
          {/* 登录表单 */}
          {activeTab === 'login' && (
            <MobileLoginForm
              onLoginSuccess={(method, identifier, isFirstLogin, worlds) =>
                handleLoginSuccess(method, identifier, isFirstLogin, worlds)
              }
              onError={handleError}
            />
          )}

          {/* 注册表单 */}
          {activeTab === 'register' && (
            <MobileRegisterForm
              initialNickname={initialNickname}
              onRegisterSuccess={(method, identifier, isFirstLogin, worlds) =>
                handleLoginSuccess(method, identifier, isFirstLogin, worlds)
              }
              onError={handleError}
            />
          )}

          {/* 微信登录 */}
          {activeTab === 'wechat' && (
            <MobileWechatLogin
              onLoginSuccess={(method, identifier, isFirstLogin, worlds) =>
                handleLoginSuccess(method, identifier, isFirstLogin, worlds)
              }
              onError={handleError}
            />
          )}
        </div>

        {/* 底部协议提示 */}
        <div className={`${MobileColors.background.dark} ${MobileSpacing.padding.sm} text-center border-t ${MobileColors.border.default} ${MobileSafeArea.bottom}`}>
          <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.muted}`}>
            登录即代表您同意{' '}
            <button
              onClick={() => setAgreementModalType('terms')}
              className={`${MobileColors.text.accent} hover:underline underline-offset-2`}
              aria-label="查看用户协议"
            >
              《心域用户协议》
            </button>{' '}
            及{' '}
            <button
              onClick={() => setAgreementModalType('privacy')}
              className={`${MobileColors.text.accent} hover:underline underline-offset-2`}
              aria-label="查看隐私政策"
            >
              《隐私政策》
            </button>
          </p>
        </div>
      </div>

      {/* 协议模态框 */}
      {agreementModalType && (
        <AgreementModal
          type={agreementModalType}
          onClose={() => setAgreementModalType(null)}
        />
      )}
    </>
  );
};
