// 通用设置组件

import React from 'react';
import { NotionConfig } from './NotionConfig';
import { WechatConfig } from './WechatConfig';
import { WechatPayConfig } from './WechatPayConfig';
import { AlipayConfig } from './AlipayConfig';
import { useAdminData } from '../../hooks/useAdminData';

interface GeneralSettingsProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
    adminToken,
    onReload,
}) => {
    const { notionConfig } = useAdminData(adminToken);

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">通用设置</h3>

            {/* Notion 配置 */}
            <NotionConfig
                adminToken={adminToken}
                notionConfig={notionConfig}
                onReload={onReload}
            />

            {/* 微信开放平台配置 */}
            <WechatConfig adminToken={adminToken} onReload={onReload} />

            {/* 微信支付配置 */}
            <WechatPayConfig adminToken={adminToken} onReload={onReload} />

            {/* 支付宝支付配置 */}
            <AlipayConfig adminToken={adminToken} onReload={onReload} />
        </div>
    );
};

