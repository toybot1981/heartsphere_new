import React, { memo, useState, useEffect } from 'react';
import { wechatApi } from '../../services/api';
import QRCode from 'qrcode';
import { MobileTouchableButton } from './MobileTouchableButton';
import { MobileLoadingSpinner } from './MobileLoadingSpinner';
import {
  MobileRadius,
  MobileSpacing,
  MobileTypography,
  MobileColors,
} from './MobileStyleGuide';

interface MobileWechatLoginProps {
  onLoginSuccess: (method: 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => void;
  onError?: (error: string) => void;
}

/**
 * Mobile微信扫码登录组件
 * 提供微信二维码扫码登录功能
 */
export const MobileWechatLogin: React.FC<MobileWechatLoginProps> = memo(({
  onLoginSuccess,
  onError,
}) => {
  const [qrStatus, setQrStatus] = useState<'loading' | 'ready' | 'scanned' | 'confirmed' | 'expired'>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrState, setQrState] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // 加载微信二维码
  useEffect(() => {
    loadQrCode();

    // 清理函数：组件卸载时停止轮询
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 加载二维码
  const loadQrCode = async () => {
    setQrStatus('loading');
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
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
        setQrStatus('ready');
      } catch (qrErr) {
        console.error('生成二维码图片失败:', qrErr);
        setQrStatus('ready');
      }

      // 开始轮询登录状态
      startPolling(response.state);
    } catch (err) {
      console.error('获取微信二维码失败:', err);
      setQrStatus('expired');
      onError?.('获取微信二维码失败，请稍后重试');
    }
  };

  // 轮询登录状态
  const startPolling = (state: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const status = await wechatApi.checkStatus(state);
        
        // 添加调试日志
        console.log({
          state,
          status: status.status,
          hasToken: !!status.token,
          hasError: !!status.error,
          timestamp: new Date().toISOString()
        });

        if (status.status === 'confirmed') {
          // 登录成功
          clearInterval(interval);
          setPollingInterval(null);
          setQrStatus('confirmed');

          // 保存token
          if (status.token) {
            localStorage.setItem('auth_token', status.token);
          } else {
            console.warn('[MobileWechatLogin] 登录成功但未收到token！');
          }

          // 确保token已保存后再调用登录成功回调
          await new Promise((resolve) => setTimeout(resolve, 50));

          const savedToken = localStorage.getItem('auth_token');
          if (!savedToken) {
            const errorMsg = '登录成功，但保存登录信息失败，请重新登录';
            console.error('[MobileWechatLogin]', errorMsg);
            setQrStatus('expired');
            onError?.(errorMsg);
            return;
          }

          onLoginSuccess('wechat', status.username || 'wechat_user', status.isFirstLogin, status.worlds);
        } else if (status.status === 'scanned') {
          setQrStatus('scanned');
        } else if (status.status === 'waiting') {
          // 保持等待状态，不更新UI
        } else if (status.status === 'expired' || status.status === 'error') {
          const errorMsg = status.error || '登录失败或已过期';
          console.error('[MobileWechatLogin] 登录失败:', errorMsg);
          clearInterval(interval);
          setPollingInterval(null);
          setQrStatus('expired');
          onError?.(errorMsg);
        }
      } catch (err) {
        console.error('[MobileWechatLogin] 检查登录状态失败:', err);
        // 不要因为网络错误就停止轮询，继续尝试
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

  // 刷新二维码
  const refreshQrCode = async () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    await loadQrCode();
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 py-8 ${MobileSpacing.padding.md}`}>
      <div
        className={`w-64 h-64 bg-white p-3 ${MobileRadius.lg} flex items-center justify-center relative transition-all ${
          qrStatus === 'scanned' ? 'opacity-50 blur-sm' : qrStatus === 'expired' ? 'opacity-30' : 'opacity-100'
        }`}
        role="img"
        aria-label="微信登录二维码"
      >
        {qrStatus === 'loading' ? (
          <MobileLoadingSpinner size="large" />
        ) : qrStatus === 'expired' ? (
          <div className="text-center text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className={MobileTypography.fontSize.sm}>二维码已过期</p>
          </div>
        ) : qrCodeDataUrl ? (
          <img src={qrCodeDataUrl} alt="微信登录二维码" className="w-full h-full" />
        ) : (
          <div className="text-center text-slate-500">
            <p className={MobileTypography.fontSize.sm}>加载中...</p>
          </div>
        )}

        {qrStatus === 'scanned' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 rounded-2xl">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded">
              请在手机上确认登录
            </p>
          </div>
        )}

        {qrStatus === 'confirmed' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-green-500/20 rounded-2xl">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className={`${MobileTypography.fontSize.lg} ${MobileTypography.fontWeight.bold} ${MobileColors.text.primary} mb-1`}>
          {qrStatus === 'loading'
            ? '正在生成二维码...'
            : qrStatus === 'scanned'
            ? '已扫描，请在手机上确认'
            : qrStatus === 'confirmed'
            ? '登录成功！'
            : qrStatus === 'expired'
            ? '二维码已过期'
            : '使用微信扫码登录'}
        </p>
        <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.secondary} mt-1`}>
          {qrStatus === 'scanned'
            ? '正在同步您的心域数据...'
            : qrStatus === 'expired'
            ? '请点击刷新重新生成二维码'
            : '安全、快捷、无需记忆密码'}
        </p>
      </div>

      {(qrStatus === 'expired' || qrStatus === 'ready') && (
        <MobileTouchableButton variant="primary" size="lg" onClick={refreshQrCode} aria-label="刷新二维码">
          {qrStatus === 'expired' ? '刷新二维码' : '重新生成'}
        </MobileTouchableButton>
      )}
    </div>
  );
});

MobileWechatLogin.displayName = 'MobileWechatLogin';
