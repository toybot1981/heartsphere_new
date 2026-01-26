import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';
import { showAlert } from "../utils/dialog";

export const useAdminAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    // 检查本地存储的token
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            setAdminToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    // 注意：token过期事件现在由 AdminAuthContext 统一处理
    // 这个 hook 主要用于向后兼容，实际应该使用 AdminAuthContext 中的 useAdminAuth

    const login = useCallback(async (user?: string, pass?: string) => {
        const finalUsername = user || username;
        const finalPassword = pass || password;
        
        if (!finalUsername.trim() || !finalPassword.trim()) {
            setLoginError('请输入用户名和密码');
            return;
        }

        setLoading(true);
        setLoginError('');

        try {
            const response = await adminApi.login(finalUsername, finalPassword);
            const token = response.token;
            
            localStorage.setItem('admin_token', token);
            setAdminToken(token);
            setIsAuthenticated(true);
            setUsername('');
            setPassword('');
        } catch (error: any) {
            console.error('登录失败:', error);
            setLoginError(error.message || '登录失败，请检查用户名和密码');
            showAlert(error.message || '登录失败', '登录错误', 'error');
        } finally {
            setLoading(false);
        }
    }, [username, password]);

    const logout = useCallback(() => {
        localStorage.removeItem('admin_token');
        setAdminToken(null);
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
        setLoginError('');
    }, []);

    return {
        isAuthenticated,
        adminToken,
        username,
        password,
        loginError,
        loading,
        setUsername,
        setPassword,
        login,
        logout,
    };
};

