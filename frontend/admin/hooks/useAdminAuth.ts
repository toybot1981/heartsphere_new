import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';

export const useAdminAuth = () => {
    const onDataLoadRef = useRef<((token: string) => void) | null>(null);
    
    const setOnDataLoad = (callback: (token: string) => void) => {
        onDataLoadRef.current = callback;
    };
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    // 检查本地存储的token
    useEffect(() => {
        console.log("========== [useAdminAuth] 检查本地token ==========");
        const token = localStorage.getItem('admin_token');
        console.log("[useAdminAuth] 本地token存在:", !!token);
        if (token) {
            console.log("[useAdminAuth] 发现本地token，自动登录...");
            setAdminToken(token);
            setIsAuthenticated(true);
            if (onDataLoadRef.current) {
                onDataLoadRef.current(token);
            }
        } else {
            console.log("[useAdminAuth] 未找到本地token，显示登录界面");
        }

        // 监听 token 过期事件
        const handleTokenExpired = () => {
            console.warn("[useAdminAuth] 收到 token 过期事件，清除认证状态");
            handleLogout();
            showAlert('登录已过期，请重新登录', '登录过期', 'warning');
        };

        window.addEventListener('admin-token-expired', handleTokenExpired);
        return () => {
            window.removeEventListener('admin-token-expired', handleTokenExpired);
        };
    }, []);

    const handleLogin = async (loginUsername: string, loginPassword: string) => {
        console.log("========== [useAdminAuth] 管理员登录 ==========");
        console.log("[useAdminAuth] 接收到的用户名:", loginUsername);
        console.log("[useAdminAuth] 接收到的密码长度:", loginPassword ? loginPassword.length : 0);
        setLoginError('');
        setLoading(true);
        try {
            console.log("[useAdminAuth] 调用adminApi.login...");
            const response = await adminApi.login(loginUsername, loginPassword);
            console.log("[useAdminAuth] 登录成功，收到token:", !!response.token);
            setAdminToken(response.token);
            localStorage.setItem('admin_token', response.token);
            setIsAuthenticated(true);
            console.log("[useAdminAuth] 认证状态已更新，开始加载系统数据...");
            if (onDataLoadRef.current) {
                await onDataLoadRef.current(response.token);
            }
            console.log("[useAdminAuth] 登录流程完成");
        } catch (error: any) {
            console.error('[useAdminAuth] 登录失败:', error);
            console.error('[useAdminAuth] 错误详情:', error.message || error);
            setLoginError(error.message || '登录失败，请检查用户名和密码');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    // 检查错误是否是 token 验证失败，如果是则清除 token
    const checkAndHandleTokenError = (error: any): boolean => {
        const errorMessage = error?.message || '';
        if (errorMessage.includes('未授权') || 
            errorMessage.includes('token') || 
            errorMessage.includes('Token') || 
            errorMessage.includes('JWT') ||
            errorMessage.includes('无效的管理员token')) {
            console.warn('[useAdminAuth] 检测到 token 验证失败，清除认证状态');
            handleLogout();
            showAlert('登录已过期，请重新登录', '登录过期', 'warning');
            return true;
        }
        return false;
    };

    return {
        isAuthenticated,
        username,
        setUsername,
        password,
        setPassword,
        adminToken,
        loginError,
        loading,
        handleLogin,
        handleLogout,
        checkAndHandleTokenError,
        setOnDataLoad
    };
};

