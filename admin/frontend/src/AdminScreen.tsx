import React from 'react';
import { AdminHeader } from './components';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminLogin } from './components/AdminLogin';
import { useAdminData } from './hooks';
import { AdminStateProvider, useAdminState, SectionType } from './contexts/AdminStateContext';
import { useAdminAuth } from './contexts/AdminAuthContext';
import { AdminTabContainer } from './components/AdminTabContainer';

// AdminScreen 现在作为独立的管理后台，不需要 gameState 等 props
interface AdminScreenProps {
    // 可选：如果需要，可以添加额外的 props
}

// Sidebar包装组件
const AdminSidebarWrapper: React.FC = () => {
    const { activeSection, openTabs, openTab, switchTab } = useAdminState();
    const { adminRole } = useAdminAuth();
    
    const handleSectionChange = (section: SectionType) => {
        // 智能标签页管理：如果功能模块已打开，则切换到该标签页；否则打开新标签页
        const existingTab = openTabs.find(tab => tab.section === section);
        if (existingTab) {
            switchTab(existingTab.id);
        } else {
            openTab(section);
        }
    };
    
    return (
        <AdminSidebar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            adminRole={adminRole}
        />
    );
};

// 内部组件：使用Context
const AdminScreenContent: React.FC = () => {
    const { adminToken, logout } = useAdminAuth();
    const { 
        activeSection, 
        setSettingsTab,
        openTabs,
        activeTabId,
        closeTab,
        switchTab,
        closeOtherTabs,
        closeAllTabs
    } = useAdminState();
    
    // 当切换到settings时，确保默认显示'general' tab
    React.useEffect(() => {
        if (activeSection === 'settings') {
            setSettingsTab('general');
        }
    }, [activeSection, setSettingsTab]);
    const { systemWorlds, systemEras, systemCharacters, systemScripts, systemMainStories, loadSystemData } = useAdminData(adminToken);

    const handleLogout = () => {
        logout();
        // onBack removed - admin is standalone
    };

    const getTitle = () => {
        const activeTab = openTabs.find(tab => tab.id === activeTabId);
        return activeTab?.title || '管理后台';
    };

        return (
        <div className="flex h-screen bg-slate-950 text-white">
            <AdminSidebarWrapper />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader 
                    title={getTitle()} 
                    onLogout={handleLogout} 
                />
                <AdminTabContainer
                    adminToken={adminToken}
                    openTabs={openTabs}
                    activeTabId={activeTabId}
                    onTabClick={switchTab}
                    onTabClose={closeTab}
                    onCloseOtherTabs={closeOtherTabs}
                    onCloseAllTabs={closeAllTabs}
                    systemWorlds={systemWorlds}
                    systemEras={systemEras}
                    systemCharacters={systemCharacters}
                    systemScripts={systemScripts}
                    systemMainStories={systemMainStories}
                    loadSystemData={loadSystemData}
                />
            </div>
        </div>
    );
};

// 登录包装组件
const AdminLoginWrapper: React.FC = () => {
    const { loginError, loading, login } = useAdminAuth();
    
    const handleLogin = async (username: string, password: string) => {
        await login(username, password);
    };

    return (
        <AdminLogin
            onLogin={handleLogin}
            onBack={() => window.location.href = "/"}
            loginError={loginError}
            loading={loading}
        />
    );
};

// 主组件
// 注意：不再包装 AdminAuthProvider，因为 App.tsx 已经有了
export const AdminScreen: React.FC<AdminScreenProps> = () => {
    const { isAuthenticated } = useAdminAuth();

    if (!isAuthenticated) {
        return <AdminLoginWrapper />;
    }

    return (
        <AdminStateProvider>
            <AdminScreenContent />
        </AdminStateProvider>
    );
};

