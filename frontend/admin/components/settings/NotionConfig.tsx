// Notion配置组件

import React from 'react';
import { InputGroup, TextInput, ConfigSection } from '../AdminUIComponents';
import { adminApi } from '../../../services/api';
import { showAlert } from '../../../utils/dialog';

interface NotionConfigProps {
    adminToken: string | null;
    notionConfig: {
        integrationToken?: string;
        databaseId?: string;
    } | null;
    onReload: () => Promise<void>;
}

export const NotionConfig: React.FC<NotionConfigProps> = ({
    adminToken,
    notionConfig,
    onReload,
}) => {
    const handleSaveNotionConfig = async (config: {
        integrationToken?: string;
        databaseId?: string;
    }) => {
        if (!adminToken) return;
        try {
            await adminApi.config.setNotionConfig(config, adminToken);
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
                    配置 Notion 集成以同步笔记数据
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
            <InputGroup label="Notion Integration Token">
                <TextInput
                    type="password"
                    value={notionConfig?.integrationToken || ''}
                    onChange={(e) =>
                        handleSaveNotionConfig({
                            ...notionConfig,
                            integrationToken: e.target.value,
                        })
                    }
                    placeholder="输入 Notion Integration Token"
                />
            </InputGroup>
            <InputGroup label="Notion Database ID">
                <TextInput
                    value={notionConfig?.databaseId || ''}
                    onChange={(e) =>
                        handleSaveNotionConfig({
                            ...notionConfig,
                            databaseId: e.target.value,
                        })
                    }
                    placeholder="输入 Notion Database ID"
                />
            </InputGroup>
        </ConfigSection>
    );
};

