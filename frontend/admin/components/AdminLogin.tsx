import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { TextInput } from './AdminUIComponents';

interface AdminLoginProps {
    onLogin: (username: string, password: string) => Promise<void>;
    onBack: () => void;
    loginError?: string;
    loading?: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack, loginError, loading = false }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        await onLogin(username, password);
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">管理后台登录</h1>
                    <p className="text-slate-500 text-sm mt-2">HeartSphere Admin Console</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">用户名</label>
                        <TextInput
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="请输入用户名"
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">密码</label>
                        <TextInput
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    {loginError && (
                        <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded px-3 py-2">
                            {loginError}
                        </div>
                    )}
                    <Button
                        onClick={handleLogin}
                        disabled={loading || !username || !password}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3"
                    >
                        {loading ? '登录中...' : '进入系统'}
                    </Button>
                    <button onClick={onBack} className="w-full text-xs text-slate-600 hover:text-slate-400 mt-4">返回应用首页</button>
                </div>
            </div>
        </div>
    );
};


