// Notion配置组件

import React, { useState } from 'react';
import { InputGroup, TextInput, ConfigSection } from '../AdminUIComponents';
import { adminApi } from "../../services/api";
import { showAlert } from "../../utils/dialog";
import type { NotionConfig as NotionConfigType } from '../../services/api/admin/types';

interface NotionConfigProps {
    adminToken: string | null;
    notionConfig: NotionConfigType | null;
    onReload: () => Promise<void>;
}

export const NotionConfig: React.FC<NotionConfigProps> = ({
    adminToken,
    notionConfig,
    onReload,
}) => {
    const [localConfig, setLocalConfig] = useState<{
        clientId: string;
        clientSecret: string;
        redirectUri: string;
        syncButtonEnabled: boolean;
    }>({
        clientId: notionConfig?.clientId || '',
        clientSecret: notionConfig?.clientSecret === '******' ? '' : (notionConfig?.clientSecret || ''),
        redirectUri: notionConfig?.redirectUri || '',
        syncButtonEnabled: notionConfig?.syncButtonEnabled || false,
    });

    // 当 notionConfig 更新时，同步到本地状态
    React.useEffect(() => {
        if (notionConfig) {
            setLocalConfig({
                clientId: notionConfig.clientId || '',
                clientSecret: notionConfig.clientSecret === '******' ? '' : (notionConfig.clientSecret || ''),
                redirectUri: notionConfig.redirectUri || '',
                syncButtonEnabled: notionConfig.syncButtonEnabled || false,
            });
        }
    }, [notionConfig]);

    const handleSaveNotionConfig = async () => {
        if (!adminToken) return;
        try {
            await adminApi.config.setNotionConfig({
                clientId: localConfig.clientId,
                clientSecret: localConfig.clientSecret || undefined,
                redirectUri: localConfig.redirectUri,
                syncButtonEnabled: localConfig.syncButtonEnabled,
            }, adminToken);
            await onReload();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    return (
        <ConfigSection title="Notion 配置">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    配置 Notion OAuth 集成以同步笔记数据
                </span>
                <a
                    href="https://developers.notion.com/docs/getting-started"
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
            <InputGroup label="Client ID">
                <TextInput
                    value={localConfig.clientId}
                    onChange={(e) =>
                        setLocalConfig({ ...localConfig, clientId: e.target.value })
                    }
                    placeholder="输入 Notion Client ID"
                />
            </InputGroup>
            <InputGroup label="Client Secret">
                <TextInput
                    type="password"
                    value={localConfig.clientSecret}
                    onChange={(e) =>
                        setLocalConfig({ ...localConfig, clientSecret: e.target.value })
                    }
                    placeholder="输入 Notion Client Secret"
                />
            </InputGroup>
            <InputGroup label="Redirect URI">
                <TextInput
                    value={localConfig.redirectUri}
                    onChange={(e) =>
                        setLocalConfig({ ...localConfig, redirectUri: e.target.value })
                    }
                    placeholder="输入 Redirect URI"
                />
            </InputGroup>
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="checkbox"
                    checked={localConfig.syncButtonEnabled}
                    onChange={(e) =>
                        setLocalConfig({ ...localConfig, syncButtonEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
                />
                <label className="text-sm text-slate-300">启用同步按钮</label>
            </div>
            <button
                onClick={handleSaveNotionConfig}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                保存配置
            </button>
        </ConfigSection>
    );
};

