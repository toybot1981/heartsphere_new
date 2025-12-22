import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { useAdminData } from '../hooks/useAdminData';
import { showAlert } from '../../utils/dialog';

interface EmailConfigManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const EmailConfigManagement: React.FC<EmailConfigManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { emailConfig, emailVerificationRequired, loadSystemData } = useAdminData(adminToken);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (emailConfig) {
            setFormData(emailConfig);
        }
    }, [emailConfig]);

    const handleSave = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            await adminApi.config.updateEmailConfig(formData, adminToken);
            await loadSystemData(adminToken);
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setLoading(false);
        }
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

            {/* 邮箱配置 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-4">SMTP 邮箱配置</h3>
                <div className="space-y-4">
                    <InputGroup label="SMTP 主机">
                        <TextInput
                            value={formData.host || ''}
                            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                            placeholder="smtp.example.com"
                        />
                    </InputGroup>
                    <InputGroup label="SMTP 端口">
                        <TextInput
                            type="number"
                            value={formData.port || ''}
                            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 587 })}
                            placeholder="587"
                        />
                    </InputGroup>
                    <InputGroup label="发件人邮箱">
                        <TextInput
                            type="email"
                            value={formData.from || ''}
                            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                            placeholder="noreply@example.com"
                        />
                    </InputGroup>
                    <InputGroup label="发件人名称">
                        <TextInput
                            value={formData.fromName || ''}
                            onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                            placeholder="HeartSphere"
                        />
                    </InputGroup>
                    <InputGroup label="用户名">
                        <TextInput
                            value={formData.username || ''}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="SMTP 用户名"
                        />
                    </InputGroup>
                    <InputGroup label="密码">
                        <TextInput
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="SMTP 密码"
                        />
                    </InputGroup>
                    <InputGroup label="是否启用 TLS">
                        <label className="flex items-center gap-2 text-slate-300">
                            <input
                                type="checkbox"
                                checked={formData.enableTls !== false}
                                onChange={(e) => setFormData({ ...formData, enableTls: e.target.checked })}
                                className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                            />
                            启用 TLS/SSL
                        </label>
                    </InputGroup>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading ? '保存中...' : '保存配置'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


