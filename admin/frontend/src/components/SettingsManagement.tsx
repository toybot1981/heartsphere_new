import React, { useEffect } from 'react';
import { useAdminState } from '../contexts/AdminStateContext';
import { GeneralSettings } from './settings/GeneralSettings';
import { RoutingStrategies } from './settings/RoutingStrategies';

interface SettingsManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { settingsTab, setSettingsTab } = useAdminState();
    
    // 如果settingsTab未设置或不是有效的tab，默认显示'general'
    useEffect(() => {
        if (!settingsTab || (settingsTab !== 'general' && settingsTab !== 'routing')) {
            setSettingsTab('general');
        }
    }, [settingsTab, setSettingsTab]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 标签页切换 */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSettingsTab('general')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            settingsTab === 'general'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        通用设置
                    </button>
                    <button
                        onClick={() => setSettingsTab('routing')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            settingsTab === 'routing'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        路由策略
                    </button>
                </div>
            </div>

            {/* 通用设置 */}
            {settingsTab === 'general' && (
                <GeneralSettings adminToken={adminToken} onReload={onReload} />
            )}

            {/* 路由策略 */}
            {settingsTab === 'routing' && (
                <RoutingStrategies adminToken={adminToken} onReload={onReload} />
            )}
        </div>
    );
};
