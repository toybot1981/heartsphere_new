import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Button } from "../components/Button";
import { InputGroup, TextInput, ConfigSection } from './AdminUIComponents';
import { useAdminData } from '../hooks/useAdminData';
import { showAlert } from "../utils/dialog";

interface EmailConfigManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const EmailConfigManagement: React.FC<EmailConfigManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { emailVerificationRequired, loadSystemData } = useAdminData(adminToken);
    
    // 邮箱配置状态
    const [emailConfig, setEmailConfig] = useState<{ type: string; host: string; port: string; username: string; password: string; from: string }>({
        type: '163',
        host: '',
        port: '',
        username: '',
        password: '',
        from: '',
    });
    
    const [loading, setLoading] = useState(false);

    // 加载邮箱配置
    const loadEmailConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getEmailConfig(adminToken);
            // 如果 password 是 "******"（隐藏的密码占位符），则设置为空字符串
            setEmailConfig({
                ...data,
                type: data.type || '163',
                password: data.password === '******' ? '' : data.password
            });
        } catch (error: any) {
            console.error('加载邮箱配置失败:', error);
        }
    };

    useEffect(() => {
        if (adminToken) {
            loadEmailConfig();
        }
    }, [adminToken]);

    // 保存邮箱配置
    const handleSaveEmailConfig = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            // 如果 password 是 "******"（隐藏的密码占位符），则不发送
            const configToSave = {
                ...emailConfig,
                password: emailConfig.password === '******' ? undefined : emailConfig.password
            };
            await adminApi.config.setEmailConfig(configToSave, adminToken);
            await loadEmailConfig();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // 处理邮箱类型变更
    const handleEmailTypeChange = (type: string) => {
        let newConfig = { ...emailConfig, type };
        
        // 根据邮箱类型自动填充SMTP配置（仅在切换类型时自动填充）
        if (type === '163') {
            // 如果当前配置不是163的配置，则自动填充
            if (emailConfig.host !== 'smtp.163.com' || emailConfig.port !== '25') {
                newConfig.host = 'smtp.163.com';
                newConfig.port = '25';
            }
        } else if (type === 'qq') {
            // 如果当前配置不是QQ的配置，则自动填充
            if (emailConfig.host !== 'smtp.qq.com' || emailConfig.port !== '587') {
                newConfig.host = 'smtp.qq.com';
                newConfig.port = '587';
            }
        }
        // custom类型不自动填充，由用户手动配置
        
        setEmailConfig(newConfig);
    };

    const handleToggleVerification = async (checked: boolean) => {
        if (!adminToken) return;
        try {
            await adminApi.config.setEmailVerificationRequired(checked, adminToken);
            await loadSystemData(adminToken);
            showAlert('设置成功', '成功', 'success');
        } catch (error: any) {
            showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* 邮箱验证开关 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-4">邮箱验证设置</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-300 mb-1">注册是否需要邮箱验证</p>
                        <p className="text-xs text-slate-500">开启后，用户注册时必须验证邮箱</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={emailVerificationRequired}
                            onChange={(e) => handleToggleVerification(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            {/* SMTP 邮箱配置 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-100 mb-2">SMTP 邮箱配置</h3>
                    <p className="text-sm text-slate-400">
                        配置SMTP邮箱用于发送验证码和通知邮件。只能配置一个邮箱作为SMTP邮箱。
                    </p>
                </div>
                
                <ConfigSection title="邮箱配置">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">选择邮箱类型后，系统将自动填充对应的SMTP配置</span>
                        <span className="text-xs text-yellow-400">⚠️ 只能配置一个邮箱作为SMTP邮箱</span>
                    </div>
                    <InputGroup label="邮箱类型 *">
                        <select
                            value={emailConfig.type}
                            onChange={(e) => handleEmailTypeChange(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="163">163邮箱</option>
                            <option value="qq">QQ邮箱</option>
                            <option value="custom">自定义</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            {emailConfig.type === '163' && '选择163邮箱后，将自动填充SMTP配置（smtp.163.com:25）'}
                            {emailConfig.type === 'qq' && '选择QQ邮箱后，将自动填充SMTP配置（smtp.qq.com:587）'}
                            {emailConfig.type === 'custom' && '选择自定义后，需要手动配置所有SMTP参数'}
                        </p>
                    </InputGroup>
                    <InputGroup label="SMTP服务器地址 *">
                        {emailConfig.type === 'custom' ? (
                            <TextInput
                                value={emailConfig.host}
                                onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                                placeholder="smtp.example.com"
                            />
                        ) : (
                            <div className="p-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300">
                                {emailConfig.type === '163' ? 'smtp.163.com' : 'smtp.qq.com'}
                                <span className="text-xs text-slate-500 ml-2">（自动配置，不可修改）</span>
                            </div>
                        )}
                    </InputGroup>
                    <InputGroup label="SMTP端口 *">
                        {emailConfig.type === 'custom' ? (
                            <TextInput
                                value={emailConfig.port}
                                onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                                placeholder="587"
                            />
                        ) : (
                            <div className="p-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-300">
                                {emailConfig.type === '163' ? '25' : '587'}
                                <span className="text-xs text-slate-500 ml-2">（自动配置，不可修改）</span>
                            </div>
                        )}
                    </InputGroup>
                    <InputGroup label="发件人邮箱（用户名）*">
                        <TextInput
                            type="email"
                            value={emailConfig.username}
                            onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })}
                            placeholder="your-email@163.com 或 your-email@qq.com"
                        />
                    </InputGroup>
                    <InputGroup label="授权码（密码）*">
                        <TextInput
                            type="password"
                            value={emailConfig.password}
                            onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                            placeholder="输入邮箱授权码（不是登录密码）"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            💡 提示：需要在邮箱设置中开启SMTP服务并生成授权码
                        </p>
                    </InputGroup>
                    <InputGroup label="发件人显示邮箱 *">
                        <TextInput
                            type="email"
                            value={emailConfig.from}
                            onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                            placeholder="通常与发件人邮箱相同"
                        />
                    </InputGroup>
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleSaveEmailConfig} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? '保存中...' : '保存配置'}
                        </Button>
                    </div>
                </ConfigSection>
            </div>
        </div>
    );
};
