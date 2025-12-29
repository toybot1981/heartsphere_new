import React from 'react';
import { AdminSidebarItem } from './AdminUIComponents';

type SectionType = 'dashboard' | 'eras' | 'characters' | 'scenarios' | 'events' | 'items' | 'main-stories' | 'invite-codes' | 'api-keys' | 'settings' | 'resources' | 'subscription-plans' | 'email-config' | 'users' | 'admins' | 'billing';

interface AdminSidebarProps {
    activeSection: SectionType;
    onSectionChange: (section: SectionType) => void;
    onResourcesLoad?: () => void;
    adminRole?: 'SUPER_ADMIN' | 'ADMIN' | null;
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

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">HEARTSPHERE</h1>
            </div>

            <div className="flex-1 py-6 space-y-1">
                <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main</p>
                <AdminSidebarItem 
                    label="概览 Dashboard" 
                    icon="📊" 
                    active={activeSection === 'dashboard'} 
                    onClick={() => handleSectionClick('dashboard')} 
                />
                
                <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Content</p>
                <AdminSidebarItem 
                    label="场景管理 Scenes" 
                    icon="🌍" 
                    active={activeSection === 'eras'} 
                    onClick={() => handleSectionClick('eras')} 
                />
                <AdminSidebarItem 
                    label="角色管理 E-Souls" 
                    icon="👥" 
                    active={activeSection === 'characters'} 
                    onClick={() => handleSectionClick('characters')} 
                />
                <AdminSidebarItem 
                    label="互动剧本 Stories" 
                    icon="📜" 
                    active={activeSection === 'scenarios'} 
                    onClick={() => handleSectionClick('scenarios')} 
                />
                <AdminSidebarItem 
                    label="剧本事件 Events" 
                    icon="🎯" 
                    active={activeSection === 'events'} 
                    onClick={() => handleSectionClick('events')} 
                />
                <AdminSidebarItem 
                    label="剧本物品 Items" 
                    icon="🎁" 
                    active={activeSection === 'items'} 
                    onClick={() => handleSectionClick('items')} 
                />
                <AdminSidebarItem 
                    label="主线剧情 Main Story" 
                    icon="📖" 
                    active={activeSection === 'main-stories'} 
                    onClick={() => handleSectionClick('main-stories')} 
                />
                
                <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">System</p>
                <AdminSidebarItem 
                    label="用户管理 Users" 
                    icon="👤" 
                    active={activeSection === 'users'} 
                    onClick={() => handleSectionClick('users')} 
                />
                {adminRole === 'SUPER_ADMIN' && (
                    <AdminSidebarItem 
                        label="管理员管理 Admins" 
                        icon="🔐" 
                        active={activeSection === 'admins'} 
                        onClick={() => handleSectionClick('admins')} 
                    />
                )}
                <AdminSidebarItem 
                    label="资源管理 Resources" 
                    icon="🖼️" 
                    active={activeSection === 'resources'} 
                    onClick={() => handleSectionClick('resources')} 
                />
                <AdminSidebarItem 
                    label="邀请码管理 Invite" 
                    icon="🎫" 
                    active={activeSection === 'invite-codes'} 
                    onClick={() => handleSectionClick('invite-codes')} 
                />
                <AdminSidebarItem 
                    label="API Key管理" 
                    icon="🔑" 
                    active={activeSection === 'api-keys'} 
                    onClick={() => handleSectionClick('api-keys')} 
                />
                <AdminSidebarItem 
                    label="会员配置 Plans" 
                    icon="💎" 
                    active={activeSection === 'subscription-plans'} 
                    onClick={() => handleSectionClick('subscription-plans')} 
                />
                <AdminSidebarItem 
                    label="邮箱配置 Email" 
                    icon="📧" 
                    active={activeSection === 'email-config'} 
                    onClick={() => handleSectionClick('email-config')} 
                />
                <AdminSidebarItem 
                    label="全局配置 Config" 
                    icon="⚙️" 
                    active={activeSection === 'settings'} 
                    onClick={() => handleSectionClick('settings')} 
                />
                <AdminSidebarItem 
                    label="计费管理 Billing" 
                    icon="💳" 
                    active={activeSection === 'billing'} 
                    onClick={() => handleSectionClick('billing')} 
                />
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Administrator</p>
                        <p className="text-xs text-slate-500 truncate">System Root</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

