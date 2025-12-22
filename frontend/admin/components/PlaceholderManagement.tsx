import React from 'react';

interface PlaceholderManagementProps {
    title: string;
    description?: string;
}

/**
 * 占位管理组件 - 用于尚未完全迁移的功能模块
 */
export const PlaceholderManagement: React.FC<PlaceholderManagementProps> = ({ title, description }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">{title}</h2>
                {description && (
                    <p className="text-slate-400 mb-6">{description}</p>
                )}
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-sm text-yellow-300">
                        ⚠️ 此功能模块正在重构中，完整功能将逐步迁移。
                    </p>
                </div>
            </div>
        </div>
    );
};


