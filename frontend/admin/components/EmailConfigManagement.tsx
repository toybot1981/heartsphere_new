import React from 'react';
import { adminApi, authApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import { InputGroup, TextInput } from './AdminUIComponents';
import { Button } from '../../components/Button';

interface EmailConfigManagementProps {
    emailVerificationRequired: boolean;
    setEmailVerificationRequired: (value: boolean) => void;
    emailConfig: {
        emailType: 'qq' | '163';
        host: string;
        port: string;
        username: string;
        password: string;
        from: string;
    };
    setEmailConfig: (config: any) => void;
    isLoadingEmailConfig: boolean;
    setIsLoadingEmailConfig: (loading: boolean) => void;
    showAuthCodeGuide: boolean;
    setShowAuthCodeGuide: (show: boolean) => void;
    notionConfig: {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
        syncButtonEnabled: boolean;
    };
    setNotionConfig: (config: any) => void;
    isLoadingNotionConfig: boolean;
    setIsLoadingNotionConfig: (loading: boolean) => void;
    adminToken: string | null;
}

export const EmailConfigManagement: React.FC<EmailConfigManagementProps> = ({
    emailVerificationRequired,
    setEmailVerificationRequired,
    emailConfig,
    setEmailConfig,
    isLoadingEmailConfig,
    setIsLoadingEmailConfig,
    showAuthCodeGuide,
    setShowAuthCodeGuide,
    notionConfig,
    setNotionConfig,
    isLoadingNotionConfig,
    setIsLoadingNotionConfig,
    adminToken
}) => {
    const handleToggleEmailVerification = async (checked: boolean) => {
        if (!adminToken) {
            console.error("[EmailConfigManagement] 没有管理员token");
            return;
        }
        const newValue = checked;
        console.log("[EmailConfigManagement] 切换邮箱验证状态:", {
            当前值: emailVerificationRequired,
            新值: newValue
        });
        
        // 立即更新UI状态（乐观更新）
        setEmailVerificationRequired(newValue);
        
        try {
            const response = await adminApi.config.setEmailVerificationRequired(newValue, adminToken);
            console.log("[EmailConfigManagement] API调用成功，响应:", response);
            // 确保状态与服务器响应一致
            if (response && response.emailVerificationRequired !== undefined) {
                setEmailVerificationRequired(response.emailVerificationRequired);
            }
            showAlert('邮箱验证设置已更新', '设置成功', 'success');
        } catch (error: any) {
            console.error("[EmailConfigManagement] 更新邮箱验证状态失败:", error);
            // 回滚状态
            setEmailVerificationRequired(!newValue);
            showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
        }
    };

    const handleSaveEmailConfig = async () => {
        if (!adminToken) return;
        setIsLoadingEmailConfig(true);
        try {
            await adminApi.config.setEmailConfig({
                host: emailConfig.host,
                port: emailConfig.port,
                username: emailConfig.username,
                password: emailConfig.password,
                from: emailConfig.from
            }, adminToken);
            showAlert('邮箱配置已保存', '保存成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setIsLoadingEmailConfig(false);
        }
    };

    const handleSendTestEmail = async () => {
        const testEmail = (document.getElementById('test-email-input') as HTMLInputElement)?.value;
        if (!testEmail || !testEmail.includes('@')) {
            showAlert('请输入有效的邮箱地址', '输入错误', 'error');
            return;
        }
        if (!adminToken) return;
        try {
            await authApi.sendEmailVerificationCode(testEmail);
            showAlert('测试邮件已发送，请查收', '发送成功', 'success');
        } catch (error: any) {
            showAlert('发送失败: ' + (error.message || '未知错误'), '发送失败', 'error');
        }
    };

    const handleSaveNotionConfig = async () => {
        if (!adminToken) return;
        setIsLoadingNotionConfig(true);
        try {
            await adminApi.config.setNotionConfig({
                clientId: notionConfig.clientId,
                clientSecret: notionConfig.clientSecret,
                redirectUri: notionConfig.redirectUri,
                syncButtonEnabled: notionConfig.syncButtonEnabled
            }, adminToken);
            showAlert('Notion 配置已保存', '保存成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setIsLoadingNotionConfig(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* 邮箱验证开关 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-4">邮箱验证设置</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-300 mb-1">注册是否需要邮箱验证码</p>
                        <p className="text-xs text-slate-500">开启后，用户注册时必须输入有效的邮箱验证码</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={emailVerificationRequired}
                            onChange={(e) => handleToggleEmailVerification(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-6">邮箱配置</h3>
                
                {/* 邮箱类型选择 */}
                <div className="mb-6">
                    <InputGroup label="邮箱类型">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="emailType"
                                    value="163"
                                    checked={emailConfig.emailType === '163'}
                                    onChange={(e) => {
                                        setEmailConfig({
                                            emailType: '163',
                                            host: 'smtp.163.com',
                                            port: '25',
                                            username: 'tongyexin@163.com',
                                            password: emailConfig.password,
                                            from: 'tongyexin@163.com'
                                        });
                                    }}
                                    className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                                />
                                <span className="text-white">163邮箱</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="emailType"
                                    value="qq"
                                    checked={emailConfig.emailType === 'qq'}
                                    onChange={(e) => {
                                        setEmailConfig({
                                            emailType: 'qq',
                                            host: 'smtp.qq.com',
                                            port: '587',
                                            username: 'heartsphere@qq.com',
                                            password: emailConfig.password,
                                            from: 'heartsphere@qq.com'
                                        });
                                    }}
                                    className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 focus:ring-indigo-500"
                                />
                                <span className="text-white">QQ邮箱</span>
                            </label>
                        </div>
                    </InputGroup>
                </div>

                {/* SMTP配置 */}
                <div className="space-y-4">
                    <InputGroup label="SMTP服务器">
                        <TextInput
                            value={emailConfig.host}
                            onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                            placeholder={emailConfig.emailType === 'qq' ? 'smtp.qq.com' : 'smtp.163.com'}
                        />
                    </InputGroup>
                    <InputGroup label="SMTP端口">
                        <TextInput
                            type="number"
                            value={emailConfig.port}
                            onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                            placeholder={emailConfig.emailType === 'qq' ? '587' : '25'}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {emailConfig.emailType === 'qq' 
                                ? 'QQ邮箱使用587端口（推荐）或465端口（SSL）' 
                                : '163邮箱使用25端口（推荐）或465端口（SSL）'}
                        </p>
                    </InputGroup>
                    <InputGroup label="邮箱用户名">
                        <TextInput
                            value={emailConfig.username}
                            onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })}
                            placeholder={emailConfig.emailType === 'qq' ? 'your-email@qq.com' : 'your-email@163.com'}
                        />
                        <p className="text-xs text-slate-500 mt-1">通常是完整的邮箱地址</p>
                    </InputGroup>
                    <InputGroup label="邮箱密码/授权码">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <TextInput
                                    type="password"
                                    value={emailConfig.password}
                                    onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                                    placeholder="请输入授权码"
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => setShowAuthCodeGuide(!showAuthCodeGuide)}
                                    className="bg-blue-600 hover:bg-blue-700 text-sm whitespace-nowrap"
                                >
                                    {showAuthCodeGuide ? '隐藏' : '获取授权码'}
                                </Button>
                            </div>
                            {showAuthCodeGuide && (
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                                    {emailConfig.emailType === '163' ? (
                                        <>
                                            <h4 className="text-sm font-bold text-white">163邮箱获取授权码步骤：</h4>
                                            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                                                <li>登录163邮箱网页版</li>
                                                <li>点击右上角"设置" → 选择"POP3/SMTP/IMAP"</li>
                                                <li>开启"POP3/SMTP服务"或"IMAP/SMTP服务"</li>
                                                <li>点击"生成授权码"，按提示完成验证</li>
                                                <li>复制生成的授权码（16位字符），粘贴到上方"邮箱密码/授权码"输入框</li>
                                                <li><strong className="text-yellow-400">注意：授权码不是登录密码，需要单独生成</strong></li>
                                            </ol>
                                            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                                                <p className="text-xs text-yellow-300">
                                                    <strong>重要提示：</strong>如果25端口被防火墙阻止，可以将端口改为465（SSL加密端口）
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="text-sm font-bold text-white">QQ邮箱获取授权码步骤：</h4>
                                            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                                                <li>登录QQ邮箱网页版</li>
                                                <li>点击右上角"设置" → 选择"账户"</li>
                                                <li>找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"</li>
                                                <li>开启"POP3/SMTP服务"或"IMAP/SMTP服务"</li>
                                                <li>点击"生成授权码"，按提示完成验证（可能需要手机验证）</li>
                                                <li>复制生成的授权码（16位字符），粘贴到上方"邮箱密码/授权码"输入框</li>
                                                <li><strong className="text-yellow-400">注意：授权码不是QQ密码，需要单独生成</strong></li>
                                            </ol>
                                            <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                                                <p className="text-xs text-yellow-300">
                                                    <strong>重要提示：</strong>QQ邮箱推荐使用587端口，如果被阻止可以使用465端口（SSL）
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </InputGroup>
                    <InputGroup label="发件人邮箱">
                        <TextInput
                            value={emailConfig.from}
                            onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
                            placeholder={emailConfig.emailType === 'qq' ? 'your-email@qq.com' : 'your-email@163.com'}
                        />
                        <p className="text-xs text-slate-500 mt-1">用于发送验证码邮件的发件人地址</p>
                    </InputGroup>
                </div>

                {/* 保存按钮 */}
                <div className="flex justify-end mt-6">
                    <Button
                        onClick={handleSaveEmailConfig}
                        disabled={isLoadingEmailConfig}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoadingEmailConfig ? '保存中...' : '保存配置'}
                    </Button>
                </div>
            </div>

            {/* 测试邮件发送 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-4">测试邮件发送</h3>
                <p className="text-sm text-slate-400 mb-4">配置完成后，可以发送测试邮件验证配置是否正确</p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="输入测试邮箱地址"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:border-indigo-500 outline-none"
                        id="test-email-input"
                    />
                    <Button
                        onClick={handleSendTestEmail}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        发送测试邮件
                    </Button>
                </div>
            </div>

            {/* Notion 配置 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-6">Notion 配置</h3>
                <p className="text-sm text-slate-400 mb-4">
                    配置 Notion API 密钥，用于笔记同步功能。需要先在 <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Notion 开发者门户</a> 创建 OAuth 集成。
                </p>
                
                <div className="space-y-4">
                    <InputGroup label="Client ID (OAuth Client ID)">
                        <TextInput
                            value={notionConfig.clientId}
                            onChange={(e) => setNotionConfig({ ...notionConfig, clientId: e.target.value })}
                            placeholder="输入 Client ID"
                        />
                        <p className="text-xs text-slate-500 mt-1">在 Notion 集成中获取的 OAuth Client ID</p>
                    </InputGroup>
                    
                    <InputGroup label="Client Secret (OAuth Client Secret)">
                        <TextInput
                            type="password"
                            value={notionConfig.clientSecret}
                            onChange={(e) => setNotionConfig({ ...notionConfig, clientSecret: e.target.value })}
                            placeholder="输入 Client Secret"
                        />
                        <p className="text-xs text-slate-500 mt-1">在 Notion 集成中获取的 OAuth Client Secret</p>
                    </InputGroup>
                    
                    <InputGroup label="回调地址 (Redirect URI)">
                        <TextInput
                            value={notionConfig.redirectUri}
                            onChange={(e) => setNotionConfig({ ...notionConfig, redirectUri: e.target.value })}
                            placeholder="http://localhost:8081/api/notes/notion/callback"
                        />
                        <p className="text-xs text-slate-500 mt-1">OAuth 回调地址，需要在 Notion 集成配置中设置此地址（Redirect URI）</p>
                    </InputGroup>
                    
                    <InputGroup label="笔记同步按钮显示">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-300 mb-1">是否在前端显示笔记同步按钮</p>
                                <p className="text-xs text-slate-500">关闭后，用户将无法看到和使用笔记同步功能</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notionConfig.syncButtonEnabled}
                                    onChange={(e) => setNotionConfig({ ...notionConfig, syncButtonEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </InputGroup>
                </div>

                {/* 保存按钮 */}
                <div className="flex justify-end mt-6">
                    <Button
                        onClick={handleSaveNotionConfig}
                        disabled={isLoadingNotionConfig}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoadingNotionConfig ? '保存中...' : '保存配置'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

