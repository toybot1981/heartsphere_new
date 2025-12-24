// API Key申请引导模态框组件

import React from 'react';
import { Button } from '../../../components/Button';

interface ApiKeyGuideModalProps {
    show: boolean;
    provider: string;
    onClose: () => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({
    show,
    provider,
    onClose,
}) => {
    if (!show) return null;

    const providerUrls: Record<string, string> = {
        gemini: 'https://makersuite.google.com/app/apikey',
        openai: 'https://platform.openai.com/api-keys',
        qwen: 'https://dashscope.console.aliyun.com/',
        doubao: 'https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint',
    };

    const getProviderTitle = () => {
        switch (provider) {
            case 'gemini':
                return 'Google Gemini API Key 申请指南';
            case 'openai':
                return 'OpenAI API Key 申请指南';
            case 'qwen':
                return '通义千问 (DashScope) API Key 申请指南';
            case 'doubao':
                return '豆包 (Doubao) API Key 申请指南';
            default:
                return 'API Key 申请指南';
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-100">
                        {getProviderTitle()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4 text-sm text-slate-300">
                    {provider === 'gemini' && (
                        <>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    1. 访问 Google AI Studio
                                </h4>
                                <p className="mb-2">
                                    访问{' '}
                                    <a
                                        href="https://makersuite.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Google AI Studio
                                    </a>{' '}
                                    并登录您的 Google 账号。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    2. 创建 API Key
                                </h4>
                                <p className="mb-2">
                                    点击"Create API Key"按钮，选择或创建 Google
                                    Cloud 项目。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    3. 复制 API Key
                                </h4>
                                <p className="mb-2">
                                    创建成功后，复制生成的 API Key（通常以字母开头）。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    4. 配置到系统
                                </h4>
                                <p>
                                    将复制的 API Key 粘贴到上方的"API
                                    Key"输入框中，然后保存配置。
                                </p>
                            </div>
                            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                                <p className="text-xs text-blue-300">
                                    💡 <strong>提示：</strong> Gemini API Key
                                    是免费的，但有一定的使用限额。如需更高限额，可以升级到付费计划。
                                </p>
                            </div>
                        </>
                    )}

                    {provider === 'openai' && (
                        <>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    1. 访问 OpenAI Platform
                                </h4>
                                <p className="mb-2">
                                    访问{' '}
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        OpenAI Platform
                                    </a>{' '}
                                    并登录您的 OpenAI 账号。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    2. 创建 API Key
                                </h4>
                                <p className="mb-2">
                                    点击"Create new secret key"按钮，输入密钥名称（可选），然后点击"Create
                                    secret key"。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    3. 复制 API Key
                                </h4>
                                <p className="mb-2">
                                    创建成功后，立即复制 API Key（以{' '}
                                    <code className="bg-slate-800 px-1 rounded">
                                        sk-
                                    </code>{' '}
                                    开头）。
                                    <strong className="text-yellow-400">
                                        注意：
                                    </strong>
                                    关闭对话框后将无法再次查看完整密钥。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    4. 配置到系统
                                </h4>
                                <p>
                                    将复制的 API Key 粘贴到上方的"API
                                    Key"输入框中，然后保存配置。
                                </p>
                            </div>
                            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                                <p className="text-xs text-yellow-300">
                                    ⚠️ <strong>注意：</strong> OpenAI API
                                    是付费服务，按使用量计费。请确保账户有足够的余额。
                                </p>
                            </div>
                        </>
                    )}

                    {provider === 'qwen' && (
                        <>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    1. 访问阿里云 DashScope
                                </h4>
                                <p className="mb-2">
                                    访问{' '}
                                    <a
                                        href="https://dashscope.console.aliyun.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        阿里云 DashScope 控制台
                                    </a>{' '}
                                    并登录您的阿里云账号。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    2. 开通服务
                                </h4>
                                <p className="mb-2">
                                    首次使用需要开通 DashScope
                                    服务，按照页面提示完成开通流程。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    3. 创建 API Key
                                </h4>
                                <p className="mb-2">
                                    在控制台中找到"API-KEY管理"，点击"创建新的API-KEY"，输入名称后创建。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    4. 复制 API Key
                                </h4>
                                <p className="mb-2">
                                    创建成功后，复制生成的 API Key（以{' '}
                                    <code className="bg-slate-800 px-1 rounded">
                                        sk-
                                    </code>{' '}
                                    开头）。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    5. 配置到系统
                                </h4>
                                <p>
                                    将复制的 API Key 粘贴到上方的"API
                                    Key"输入框中，然后保存配置。
                                </p>
                            </div>
                            <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded">
                                <p className="text-xs text-green-300">
                                    💡 <strong>提示：</strong>{' '}
                                    通义千问提供免费额度，超出后按使用量计费。新用户通常有免费试用额度。
                                </p>
                            </div>
                        </>
                    )}

                    {provider === 'doubao' && (
                        <>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    1. 访问火山引擎控制台
                                </h4>
                                <p className="mb-2">
                                    访问{' '}
                                    <a
                                        href="https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        火山引擎控制台
                                    </a>{' '}
                                    并登录您的火山引擎账号。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    2. 创建推理接入点
                                </h4>
                                <p className="mb-2">
                                    在控制台中找到"推理接入点"，点击"创建推理接入点"，选择模型和配置，创建后获取
                                    Endpoint ID。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    3. 创建 API Key
                                </h4>
                                <p className="mb-2">
                                    在"API密钥管理"中创建新的 API Key，复制生成的密钥（UUID
                                    格式）。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    4. 配置到系统
                                </h4>
                                <p className="mb-2">
                                    将 API Key 填入"API Key"输入框。模型名称可以使用：
                                </p>
                                <ul className="list-disc list-inside ml-4 mb-2 space-y-1 text-xs">
                                    <li>
                                        <code className="bg-slate-800 px-1 rounded">
                                            doubao-1-5-pro-32k-250115
                                        </code>{' '}
                                        - 最新Pro 32K模型（推荐）
                                    </li>
                                    <li>
                                        <code className="bg-slate-800 px-1 rounded">
                                            doubao-pro-4k
                                        </code>{' '}
                                        - Pro 4K模型
                                    </li>
                                    <li>
                                        <code className="bg-slate-800 px-1 rounded">
                                            doubao-pro-32k
                                        </code>{' '}
                                        - Pro 32K模型
                                    </li>
                                    <li>
                                        <code className="bg-slate-800 px-1 rounded">
                                            doubao-lite-4k
                                        </code>{' '}
                                        - Lite 4K模型（经济型）
                                    </li>
                                </ul>
                                <p className="mb-2">
                                    或者使用推理接入点的 Endpoint ID（格式：{' '}
                                    <code className="bg-slate-800 px-1 rounded">
                                        ep-2024...
                                    </code>
                                    ）。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100 mb-2">
                                    5. 配置 Base URL
                                </h4>
                                <p>
                                    Base URL 固定为：{' '}
                                    <code className="bg-slate-800 px-1 rounded">
                                        https://ark.cn-beijing.volces.com/api/v3
                                    </code>
                                </p>
                            </div>
                            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
                                <p className="text-xs text-blue-300">
                                    💡 <strong>提示：</strong>{' '}
                                    豆包提供免费额度，超出后按使用量计费。请查看火山引擎的定价页面了解详细计费信息。
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        onClick={onClose}
                        className="bg-slate-700 hover:bg-slate-600"
                    >
                        关闭
                    </Button>
                    {provider && providerUrls[provider] && (
                        <Button
                            onClick={() => {
                                window.open(providerUrls[provider], '_blank');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            前往申请页面
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

