// 微信支付配置组件

import React, { useState, useEffect } from 'react';
import { InputGroup, TextInput, ConfigSection } from '../AdminUIComponents';
import { Button } from "../../components/Button";
import { adminApi } from "../../services/api";
import { showAlert } from "../../utils/dialog";

interface WechatPayConfigProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const WechatPayConfig: React.FC<WechatPayConfigProps> = ({
    adminToken,
    onReload,
}) => {
    const [wechatPayConfig, setWechatPayConfig] = useState<{
        appId: string;
        mchId: string;
        apiKey: string;
        apiV3Key: string;
        certPath: string;
        notifyUrl: string;
    }>({
        appId: '',
        mchId: '',
        apiKey: '',
        apiV3Key: '',
        certPath: '',
        notifyUrl: '',
    });

    useEffect(() => {
        loadWechatPayConfig();
    }, [adminToken]);

    const loadWechatPayConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getWechatPayConfig(adminToken);
            setWechatPayConfig(data);
        } catch (error: any) {
            console.error('加载微信支付配置失败:', error);
        }
    };

    const handleSaveWechatPayConfig = async () => {
        if (!adminToken) return;
        try {
            await adminApi.config.setWechatPayConfig(wechatPayConfig, adminToken);
            await loadWechatPayConfig();
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
        <ConfigSection title="微信支付配置">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    配置微信支付以启用支付功能
                </span>
                <a
                    href="https://pay.weixin.qq.com/"
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
            <InputGroup label="AppID（商户号对应的AppID）">
                <TextInput
                    value={wechatPayConfig.appId}
                    onChange={(e) =>
                        setWechatPayConfig({
                            ...wechatPayConfig,
                            appId: e.target.value,
                        })
                    }
                    placeholder="输入微信支付AppID"
                />
            </InputGroup>
            <InputGroup label="商户号（MchId）">
                <TextInput
                    value={wechatPayConfig.mchId}
                    onChange={(e) =>
                        setWechatPayConfig({
                            ...wechatPayConfig,
                            mchId: e.target.value,
                        })
                    }
                    placeholder="输入微信支付商户号"
                />
            </InputGroup>
            <InputGroup label="API密钥（用于签名）">
                <TextInput
                    type="password"
                    value={wechatPayConfig.apiKey}
                    onChange={(e) =>
                        setWechatPayConfig({
                            ...wechatPayConfig,
                            apiKey: e.target.value,
                        })
                    }
                    placeholder="输入微信支付API密钥"
                />
            </InputGroup>
            <InputGroup label="API v3密钥">
                <TextInput
                    type="password"
                    value={wechatPayConfig.apiV3Key}
                    onChange={(e) =>
                        setWechatPayConfig({
                            ...wechatPayConfig,
                            apiV3Key: e.target.value,
                        })
                    }
                    placeholder="输入微信支付API v3密钥"
                />
            </InputGroup>
            <InputGroup label="证书路径（可选）">
                <TextInput
                    value={wechatPayConfig.certPath || ''}
                    onChange={(e) =>
                        setWechatPayConfig({
                            ...wechatPayConfig,
                            certPath: e.target.value,
                        })
                    }
                    placeholder="输入微信支付证书路径（可选）"
                />
            </InputGroup>
            <InputGroup label="回调通知地址">
                <TextInput
                    value={wechatPayConfig.notifyUrl}
                    onChange={(e) =>
                        setWechatPayConfig({
                            ...wechatPayConfig,
                            notifyUrl: e.target.value,
                        })
                    }
                    placeholder="例如：http://yourdomain.com/api/payment/wechat/notify"
                />
            </InputGroup>
            <div className="flex justify-end mt-4">
                <Button
                    onClick={handleSaveWechatPayConfig}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    保存配置
                </Button>
            </div>
        </ConfigSection>
    );
};

