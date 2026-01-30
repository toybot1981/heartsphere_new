import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';
import { showAlert } from "../utils/dialog";
import { startHandlingTokenExpiry, completeHandlingTokenExpiry } from '../utils/tokenExpiryHandler';
import { tokenStorage } from '@heartsphere/shared-frontend';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    adminToken: string | null;
    adminRole: 'SUPER_ADMIN' | 'ADMIN' | null;
    username: string;
    password: string;
    loginError: string;
    loading: boolean;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    login: (user?: string, pass?: string) => Promise<void>;
    logout: () => void;
}

// 创建 Context，初始值为 undefined
// 使用 undefined 作为默认值，这样可以在 useAdminAuth 中检查是否在 Provider 内部
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [adminRole, setAdminRole] = useState<'SUPER_ADMIN' | 'ADMIN' | null>(null);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    // 检查本地存储的token
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const role = localStorage.getItem('admin_role') as 'SUPER_ADMIN' | 'ADMIN' | null;
        if (token) {
            setAdminToken(token);
            if (role) {
                setAdminRole(role);
            }
            setIsAuthenticated(true);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_role');
        tokenStorage.removeAdminToken().catch(() => {});
        setAdminToken(null);
        setAdminRole(null);
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
        setLoginError('');
    }, []);

    // 监听 token 失效/过期事件：清除认证并强制返回登录页
    useEffect(() => {
        const handleTokenExpired = (event?: Event) => {
            if (!startHandlingTokenExpiry()) {
                console.log('[AdminAuthContext] Token过期事件已在处理中，跳过重复处理');
                return;
            }
            console.log('[AdminAuthContext] Token 已失效，清除认证状态并返回登录页面', event);
            logout();
            // 跳转到根路径，未认证时 AppContent 会渲染登录页
            navigate('/', { replace: true });
            setTimeout(() => {
                showAlert('登录已过期，请重新登录', '提示', 'warning');
            }, 300);
        };

        window.addEventListener('admin-token-expired', handleTokenExpired);
        return () => {
            window.removeEventListener('admin-token-expired', handleTokenExpired);
        };
    }, [logout, navigate]);

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
            const role = response.role as 'SUPER_ADMIN' | 'ADMIN' | undefined;
            
            console.log('[AdminAuthContext] 登录响应:', { token: token?.substring(0, 20) + '...', role, response });
            
            localStorage.setItem('admin_token', token);
            if (role) {
                localStorage.setItem('admin_role', role);
                setAdminRole(role);
                console.log('[AdminAuthContext] 角色已保存:', role);
            } else {
                console.warn('[AdminAuthContext] 登录响应中未包含role字段');
            }
            setAdminToken(token);
            setIsAuthenticated(true);
            setUsername('');
            setPassword('');
            
            // 登录成功后，重置 token 过期处理状态
            completeHandlingTokenExpiry();
        } catch (error: any) {
            console.error('登录失败:', error);
            setLoginError(error.message || '登录失败，请检查用户名和密码');
            showAlert(error.message || '登录失败', '登录错误', 'error');
        } finally {
            setLoading(false);
        }
    }, [username, password]);

    // 使用 useMemo 稳定 context 值，避免不必要的重新渲染
    const contextValue = useMemo(() => ({
        isAuthenticated,
        adminToken,
        adminRole,
        username,
        password,
        loginError,
        loading,
        setUsername,
        setPassword,
        login,
        logout,
    }), [isAuthenticated, adminToken, adminRole, username, password, loginError, loading, login, logout]);

    return (
        <AdminAuthContext.Provider value={contextValue}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};


