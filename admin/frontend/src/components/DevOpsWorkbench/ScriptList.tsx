import React from 'react';
import type { ScriptInfo } from '../../services/api/admin/devops';

interface ScriptListProps {
    scripts: ScriptInfo[];
    category?: string;
    onExecute: (script: ScriptInfo) => void;
}

export const ScriptList: React.FC<ScriptListProps> = ({ scripts, category, onExecute }) => {
    const filteredScripts = category 
        ? scripts.filter(s => s.category === category)
        : scripts;

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'build': return '📦';
            case 'deploy': return '🚀';
            case 'test': return '✅';
            case 'scan': return '🔍';
            case 'database': return '🗄️';
            case 'server': return '🖥️';
            default: return '📝';
        }
    };

    if (filteredScripts.length === 0) {
        return (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                <p className="text-slate-400 text-lg mb-2">
                    {category ? `暂无 ${category} 类别的脚本` : '暂无可用脚本'}
                </p>
                <p className="text-slate-500 text-sm">
                    请检查脚本配置文件或联系管理员
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScripts.map((script) => (
                <div
                    key={script.id}
                    className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getCategoryIcon(script.category)}</span>
                            <h3 className="text-lg font-bold text-white">{script.name}</h3>
                        </div>
                        {script.riskLevel === 'high' && (
                            <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">高风险</span>
                        )}
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-4">{script.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                            {script.category}
                        </span>
                        {script.timeout && (
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                超时: {script.timeout}s
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={() => onExecute(script)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        执行
                    </button>
                </div>
            ))}
        </div>
    );
};
