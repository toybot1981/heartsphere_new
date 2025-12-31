import React, { useState, useMemo } from 'react';
import { AdminSidebarItem } from './AdminUIComponents';

type SectionType = 'dashboard' | 'eras' | 'characters' | 'scenarios' | 'events' | 'items' | 'main-stories' | 'invite-codes' | 'api-keys' | 'settings' | 'resources' | 'subscription-plans' | 'email-config' | 'users' | 'admins' | 'billing' | 'heartsphere-connection' | 'memory';

interface AdminSidebarProps {
    activeSection: SectionType;
    onSectionChange: (section: SectionType) => void;
    onResourcesLoad?: () => void;
    adminRole?: 'SUPER_ADMIN' | 'ADMIN' | null;
}

interface MenuGroup {
    id: string;
    label: string;
    icon: string;
    items: Array<{
        section: SectionType;
        label: string;
        icon: string;
        adminOnly?: boolean;
    }>;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange, onResourcesLoad, adminRole }) => {
    // 调试日志
    React.useEffect(() => {
        console.log('[AdminSidebar] adminRole:', adminRole);
    }, [adminRole]);

    const handleSectionClick = (section: SectionType) => {
        onSectionChange(section);
        if (section === 'resources' && onResourcesLoad) {
            onResourcesLoad();
        }
    };

    const toggleGroup = (groupId: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    // 菜单分组配置 - 使用 useMemo 优化性能
    const menuGroups: MenuGroup[] = useMemo(() => [
        {
            id: 'main',
            label: '概览',
            icon: '📊',
            items: [
                { section: 'dashboard', label: '概览 Dashboard', icon: '📊' }
            ]
        },
        {
            id: 'content',
            label: '内容管理',
            icon: '📚',
            items: [
                { section: 'eras', label: '场景管理', icon: '🌍' },
                { section: 'characters', label: '角色管理', icon: '👥' },
                { section: 'scenarios', label: '互动剧本', icon: '📜' },
                { section: 'events', label: '剧本事件', icon: '🎯' },
                { section: 'items', label: '剧本物品', icon: '🎁' },
                { section: 'main-stories', label: '主线剧情', icon: '📖' }
            ]
        },
        {
            id: 'user',
            label: '用户管理',
            icon: '👥',
            items: [
                { section: 'users', label: '用户管理', icon: '👤' },
                ...(adminRole === 'SUPER_ADMIN' ? [{ section: 'admins' as SectionType, label: '管理员管理', icon: '🔐', adminOnly: true }] : [])
            ]
        },
        {
            id: 'system',
            label: '系统配置',
            icon: '⚙️',
            items: [
                { section: 'resources', label: '资源管理', icon: '🖼️' },
                { section: 'invite-codes', label: '邀请码管理', icon: '🎫' },
                { section: 'api-keys', label: 'API Key管理', icon: '🔑' },
                { section: 'subscription-plans', label: '会员配置', icon: '💎' },
                { section: 'email-config', label: '邮箱配置', icon: '📧' },
                { section: 'settings', label: '全局配置', icon: '⚙️' },
                { section: 'billing', label: '计费管理', icon: '💳' }
            ]
        },
        {
            id: 'connection',
            label: '连接服务',
            icon: '🔗',
            items: [
                { section: 'heartsphere-connection', label: '心域连接', icon: '🔗' },
                { section: 'memory', label: '记忆系统', icon: '🧠' }
            ]
        }
    ], [adminRole]);

    // 可收起的分类状态 - 默认展开包含当前激活项的分类
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
        const defaultCollapsed = new Set<string>();
        // 找到包含当前激活项的分类，默认展开
        const activeGroup = menuGroups.find(group => 
            group.items.some(item => item.section === activeSection)
        );
        if (activeGroup) {
            // 默认收起其他所有分类
            menuGroups.forEach(group => {
                if (group.id !== activeGroup.id) {
                    defaultCollapsed.add(group.id);
                }
            });
        } else {
            // 如果没有找到，默认收起所有分类（除了第一个）
            menuGroups.slice(1).forEach(group => {
                defaultCollapsed.add(group.id);
            });
        }
        return defaultCollapsed;
    });

    // 当激活项改变时，自动展开对应的分类
    React.useEffect(() => {
        const activeGroup = menuGroups.find(group => 
            group.items.some(item => item.section === activeSection)
        );
        if (activeGroup) {
            setCollapsedGroups(prev => {
                const next = new Set(prev);
                next.delete(activeGroup.id);
                return next;
            });
        }
    }, [activeSection, menuGroups]);

    return (
        <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            <div className="h-16 flex items-center px-4 border-b border-slate-800">
                <h1 className="text-lg font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">HEARTSPHERE</h1>
            </div>

            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
                {menuGroups.map((group) => {
                    // 如果分类只有一项，直接显示菜单项，不显示分类标题
                    if (group.items.length === 1) {
                        const item = group.items[0];
                        return (
                            <div key={group.id} className="mb-1">
                                <button 
                                    onClick={() => handleSectionClick(item.section)}
                                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        activeSection === item.section
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 border-r-2 border-white' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                                >
                                    <span className="text-base flex-shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.label}</span>
                                </button>
                            </div>
                        );
                    }
                    
                    // 多项分类显示展开/收起功能
                    const isCollapsed = collapsedGroups.has(group.id);
                    const hasActiveItem = group.items.some(item => activeSection === item.section);
                    
                    return (
                        <div key={group.id} className="mb-1">
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-slate-300 uppercase tracking-wider hover:text-slate-200 transition-colors ${
                                    hasActiveItem ? 'text-indigo-400' : ''
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{group.icon}</span>
                                    <span>{group.label}</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            {!isCollapsed && (
                                <div className="mt-1">
                                    {group.items.map((item) => (
                                        <AdminSidebarItem
                                            key={item.section}
                                            label={item.label}
                                            icon={item.icon}
                                            active={activeSection === item.section}
                                            onClick={() => handleSectionClick(item.section)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">Administrator</p>
                        <p className="text-[10px] text-slate-500 truncate">System Root</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

