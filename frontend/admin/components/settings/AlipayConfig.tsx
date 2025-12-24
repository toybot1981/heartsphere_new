// 支付宝支付配置组件

import React, { useState, useEffect } from 'react';
import { InputGroup, TextInput, TextArea, ConfigSection } from '../AdminUIComponents';
import { Button } from '../../../components/Button';
import { adminApi } from '../../../services/api';
import { showAlert } from '../../../utils/dialog';

interface AlipayConfigProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const AlipayConfig: React.FC<AlipayConfigProps> = ({
    adminToken,
    onReload,
}) => {
    const [alipayConfig, setAlipayConfig] = useState<{
        appId: string;
        privateKey: string;
        publicKey: string;
        notifyUrl: string;
        returnUrl: string;
        gatewayUrl: string;
    }>({
        appId: '',
        privateKey: '',
        publicKey: '',
        notifyUrl: '',
        returnUrl: '',
        gatewayUrl: 'https://openapi.alipay.com/gateway.do',
    });

    useEffect(() => {
        loadAlipayConfig();
    }, [adminToken]);

    const loadAlipayConfig = async () => {
        if (!adminToken) return;
        try {
            const data = await adminApi.config.getAlipayConfig(adminToken);
            setAlipayConfig(data);
        } catch (error: any) {
            console.error('加载支付宝配置失败:', error);
        }
    };

    const handleSaveAlipayConfig = async () => {
        if (!adminToken) return;
        try {
            await adminApi.config.setAlipayConfig(alipayConfig, adminToken);
            await loadAlipayConfig();
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
        <ConfigSection title="支付宝支付配置">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    配置支付宝支付以启用支付功能
                </span>
                <a
                    href="https://open.alipay.com/"
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
            <InputGroup label="应用AppID">
                <TextInput
                    value={alipayConfig.appId}
                    onChange={(e) =>
                        setAlipayConfig({
                            ...alipayConfig,
                            appId: e.target.value,
                        })
                    }
                    placeholder="输入支付宝应用AppID"
                />
            </InputGroup>
            <InputGroup label="应用私钥（RSA2）">
                <TextArea
                    value={alipayConfig.privateKey}
                    onChange={(e) =>
                        setAlipayConfig({
                            ...alipayConfig,
                            privateKey: e.target.value,
                        })
                    }
                    placeholder="输入支付宝应用私钥（RSA2格式）"
                    rows={4}
                    className="font-mono text-xs"
                />
            </InputGroup>
            <InputGroup label="支付宝公钥（用于验签）">
                <TextArea
                    value={alipayConfig.publicKey}
                    onChange={(e) =>
                        setAlipayConfig({
                            ...alipayConfig,
                            publicKey: e.target.value,
                        })
                    }
                    placeholder="输入支付宝公钥"
                    rows={4}
                    className="font-mono text-xs"
                />
            </InputGroup>
            <InputGroup label="异步回调通知地址">
                <TextInput
                    value={alipayConfig.notifyUrl}
                    onChange={(e) =>
                        setAlipayConfig({
                            ...alipayConfig,
                            notifyUrl: e.target.value,
                        })
                    }
                    placeholder="例如：http://yourdomain.com/api/payment/alipay/notify"
                />
            </InputGroup>
            <InputGroup label="同步返回地址">
                <TextInput
                    value={alipayConfig.returnUrl}
                    onChange={(e) =>
                        setAlipayConfig({
                            ...alipayConfig,
                            returnUrl: e.target.value,
                        })
                    }
                    placeholder="例如：http://yourdomain.com/payment/return"
                />
            </InputGroup>
            <InputGroup label="网关地址">
                <TextInput
                    value={alipayConfig.gatewayUrl}
                    onChange={(e) =>
                        setAlipayConfig({
                            ...alipayConfig,
                            gatewayUrl: e.target.value,
                        })
                    }
                    placeholder="默认：https://openapi.alipay.com/gateway.do"
                />
            </InputGroup>
            <div className="flex justify-end mt-4">
                <Button
                    onClick={handleSaveAlipayConfig}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    保存配置
                </Button>
            </div>
        </ConfigSection>
    );
};

