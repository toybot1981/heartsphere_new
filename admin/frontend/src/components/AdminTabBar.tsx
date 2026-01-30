import React from 'react';
import { TabInfo } from '../contexts/AdminStateContext';

interface AdminTabBarProps {
    tabs: TabInfo[];
    activeTabId: string | null;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string, e: React.MouseEvent) => void;
    onCloseOther?: (tabId: string) => void;
    onCloseAll?: () => void;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onCloseOther,
    onCloseAll,
}) => {
    const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
        e.preventDefault();
        // 可以在这里实现右键菜单
    };

    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-900 border-b border-slate-800 overflow-x-auto">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                    <div
                        key={tab.id}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer transition-all
                            ${isActive 
                                ? 'bg-slate-950 text-white border-t border-l border-r border-slate-700' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                            }
                        `}
                        onClick={() => onTabClick(tab.id)}
                        onContextMenu={(e) => handleContextMenu(e, tab.id)}
                    >
                        <span className="text-sm flex-shrink-0">{tab.icon}</span>
                        <span className="text-sm font-medium whitespace-nowrap">{tab.title}</span>
                        {tabs.length > 1 && (
                            <button
                                onClick={(e) => onTabClose(tab.id, e)}
                                className={`
                                    ml-1 w-4 h-4 flex items-center justify-center rounded hover:bg-slate-600
                                    ${isActive ? 'text-slate-300' : 'text-slate-500'}
                                `}
                                title="关闭标签页"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            })}
            
            {/* 右键菜单功能可以在这里添加 */}
            {tabs.length > 1 && onCloseAll && (
                <div className="ml-auto flex items-center gap-1">
                    {tabs.length > 1 && activeTabId && onCloseOther && (
                        <button
                            onClick={() => onCloseOther(activeTabId)}
                            className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                            title="关闭其他标签页"
                        >
                            关闭其他
                        </button>
                    )}
                    <button
                        onClick={onCloseAll}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="关闭所有标签页"
                    >
                        关闭所有
                    </button>
                </div>
            )}
        </div>
    );
};
