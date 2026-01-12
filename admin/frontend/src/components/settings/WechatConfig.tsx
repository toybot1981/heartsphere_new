// 微信开放平台配置组件

import React, { useState, useEffect } from 'react';
import { InputGroup, TextInput, ConfigSection } from '../AdminUIComponents';
import { Button } from "../../components/Button";
import { adminApi } from "../../services/api";
import { showAlert } from "../../utils/dialog";
import { getApiUrl } from '../../services/api/config';

interface WechatConfigProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const WechatConfig: React.FC<WechatConfigProps> = ({
    adminToken,
    onReload,
}) => {
    const [wechatConfig, setWechatConfig] = useState<{
        appId: string;
        appSecret: string;
        redirectUri: string;
    }>({
        appId: '',
        appSecret: '',
        redirectUri: '',
    });

    useEffect(() => {
        loadWechatConfig();
    }, [adminToken]);

    const loadWechatConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getWechatConfig(adminToken);
            // 如果 appSecret 是 "******"（隐藏的密码占位符），则设置为空字符串
            setWechatConfig({
                ...data,
                appSecret: data.appSecret === '******' ? '' : data.appSecret,
            });
        } catch (error: any) {
            console.error('加载微信配置失败:', error);
        }
    };

    const handleSaveWechatConfig = async () => {
        if (!adminToken) return;
        try {
            // 如果 appSecret 是 "******"（隐藏的密码占位符），则不发送
            const configToSave = {
                ...wechatConfig,
                appSecret:
                    wechatConfig.appSecret === '******'
                        ? undefined
                        : wechatConfig.appSecret,
            };
            await adminApi.config.setWechatConfig(configToSave, adminToken);
            await loadWechatConfig();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert(
                '保存失败: ' + (error.message || '未知错误'),
                '保存失败',
                'error'
            );
        }
    };

    return (
        <ConfigSection title="微信开放平台配置（用于扫码登录）">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    配置微信开放平台网站应用以启用扫码登录
                </span>
                <a
                    href="https://open.weixin.qq.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                    📖 如何申请
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                </a>
            </div>
            <InputGroup label="AppID">
                <TextInput
                    value={wechatConfig.appId}
                    onChange={(e) =>
                        setWechatConfig({
                            ...wechatConfig,
                            appId: e.target.value,
                        })
                    }
                    placeholder="输入微信开放平台网站应用的AppID"
                />
            </InputGroup>
            <InputGroup label="AppSecret">
                <TextInput
                    type="password"
                    value={wechatConfig.appSecret}
                    onChange={(e) =>
                        setWechatConfig({
                            ...wechatConfig,
                            appSecret: e.target.value,
                        })
                    }
                    placeholder="输入微信开放平台网站应用的AppSecret"
                />
            </InputGroup>
            <InputGroup label="回调地址（Redirect URI）">
                <TextInput
                    value={wechatConfig.redirectUri}
                    onChange={(e) =>
                        setWechatConfig({
                            ...wechatConfig,
                            redirectUri: e.target.value,
                        })
                    }
                    placeholder={`例如：${getApiUrl('/wechat/callback')}`}
                />
            </InputGroup>
            <div className="flex justify-end mt-4">
                <Button
                    onClick={handleSaveWechatConfig}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    保存配置
                </Button>
            </div>
        </ConfigSection>
    );
};

