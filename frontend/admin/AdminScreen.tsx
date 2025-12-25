import React from 'react';
import { GameState } from '../types';
import { adminApi } from '../services/api';
import { AdminHeader } from './components';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminLogin } from './components/AdminLogin';
import { DashboardView } from './components/DashboardView';
import { ErasManagement } from './components/ErasManagement';
import { MainStoriesManagement } from './components/MainStoriesManagement';
import { UsersManagement } from './components/UsersManagement';
import { CharactersManagement } from './components/CharactersManagement';
import { ScenariosManagement } from './components/ScenariosManagement';
import { InviteCodesManagement } from './components/InviteCodesManagement';
import { ResourcesManagement } from './components/ResourcesManagement';
import { SubscriptionPlansManagement } from './components/SubscriptionPlansManagement';
import { EmailConfigManagement } from './components/EmailConfigManagement';
import { SettingsManagement } from './components/SettingsManagement';
import { AdminsManagement } from './components/AdminsManagement';
import { BillingManagement } from './components/billing';
import { useAdminData } from './hooks';
import { AdminStateProvider, useAdminState } from './contexts/AdminStateContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { showAlert } from '../utils/dialog';

interface AdminScreenProps {
    gameState: GameState;
    onUpdateGameState: (newState: GameState) => void;
    onResetWorld: () => void;
    onBack: () => void;
}

// Sidebar包装组件
const AdminSidebarWrapper: React.FC = () => {
    const { activeSection, setActiveSection } = useAdminState();
    const { adminRole } = useAdminAuth();
    return (
        <AdminSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            adminRole={adminRole}
        />
    );
};

// 内部组件：使用Context
const AdminScreenContent: React.FC<AdminScreenProps> = ({ gameState, onResetWorld, onBack }) => {
    const { adminToken, logout } = useAdminAuth();
    const { activeSection } = useAdminState();
    const { systemWorlds, systemEras, systemCharacters, systemScripts, systemMainStories, loadSystemData } = useAdminData(adminToken);

    const handleLogout = () => {
        logout();
        onBack();
    };

    const getTitle = () => {
        const titles: Record<string, string> = {
            'dashboard': '系统概览',
            'eras': '场景管理',
            'characters': 'E-Soul 角色数据库',
            'scenarios': '互动剧本库',
            'main-stories': '主线剧情管理',
            'invite-codes': '邀请码管理',
            'resources': '资源管理',
            'subscription-plans': '会员配置管理',
            'email-config': '邮箱配置',
            'users': '用户管理',
            'admins': '系统管理员管理',
            'settings': '系统全局设置',
            'billing': '计费管理',
        };
        return titles[activeSection] || '管理后台';
    };

        return (
        <div className="flex h-screen bg-slate-950 text-white">
            <AdminSidebarWrapper />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader 
                    title={getTitle()} 
                onBack={onBack}
                    onLogout={handleLogout} 
                />
                <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
                    {activeSection === 'dashboard' && (
                        <DashboardView adminToken={adminToken} />
                    )}
                    {activeSection === 'eras' && (
                        <ErasManagement
                            eras={systemEras}
                            adminToken={adminToken}
                            onSave={async (data, editingId) => {
                                if (!adminToken) return;
                                try {
                                const dto = {
                                    name: data.name || '未命名场景',
                                    description: data.description || '',
                                    imageUrl: data.imageUrl || '',
                                    startYear: data.startYear || null,
                                    endYear: data.endYear || null,
                                    isActive: data.isActive !== undefined ? data.isActive : true,
                                    sortOrder: data.sortOrder || 0
                                };
                                if (editingId && typeof editingId === 'number') {
                                    await adminApi.eras.update(editingId, dto, adminToken);
                                } else {
                                    await adminApi.eras.create(dto, adminToken);
                                    }
                                    await loadSystemData(adminToken);
                                    showAlert('保存成功', '成功', 'success');
                                } catch (error: any) {
                                    showAlert('保存失败: ' + (error.message || '未知错误'), '错误', 'error');
                                }
                            }}
                            onDelete={async (id) => {
                                if (!adminToken) return;
                                try {
                                await adminApi.eras.delete(id, adminToken);
                                    await loadSystemData(adminToken);
                                    showAlert('删除成功', '成功', 'success');
                                } catch (error: any) {
                                    showAlert('删除失败: ' + (error.message || '未知错误'), '错误', 'error');
                                }
                            }}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'main-stories' && (
                        <MainStoriesManagement
                            mainStories={systemMainStories.map(story => ({
                                ...story,
                                systemEraName: systemEras.find(e => e.id === story.systemEraId)?.name
                            }))}
                            eras={systemEras}
                            characters={systemCharacters}
                            adminToken={adminToken}
                            onSave={async (data, editingId) => {
                                if (!adminToken) return;
                                // MainStoriesManagement内部已处理保存逻辑
                            }}
                            onDelete={async (id) => {
                                if (!adminToken) return;
                                // MainStoriesManagement内部已处理删除逻辑
                            }}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'users' && (
                        <UsersManagement
                            adminToken={adminToken}
                            onRefresh={() => {
                                if (adminToken) {
                                    loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'characters' && (
                        <CharactersManagement
                            characters={systemCharacters}
                            eras={systemEras}
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'scenarios' && (
                        <ScenariosManagement
                            scripts={systemScripts}
                            eras={systemEras}
                            characters={systemCharacters}
                            worlds={systemWorlds}
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'invite-codes' && (
                        <InviteCodesManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'resources' && (
                        <ResourcesManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'subscription-plans' && (
                        <SubscriptionPlansManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'email-config' && (
                        <EmailConfigManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'admins' && (
                        <AdminsManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                    await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'settings' && (
                        <SettingsManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                                                        await loadSystemData(adminToken);
                                }
                            }}
                        />
                    )}
                    {activeSection === 'billing' && (
                        <BillingManagement
                            adminToken={adminToken}
                            onReload={async () => {
                                if (adminToken) {
                                                        await loadSystemData(adminToken);
                                }
                            }}
                        />
                                                    )}
                                                </div>
                                        </div>
                                </div>
    );
};

// 登录包装组件
const AdminLoginWrapper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { loginError, loading, login } = useAdminAuth();
    
    const handleLogin = async (username: string, password: string) => {
        await login(username, password);
    };

    return (
        <AdminLogin
            onLogin={handleLogin}
            onBack={onBack}
            loginError={loginError}
            loading={loading}
        />
    );
};

// 主组件
export const AdminScreen: React.FC<AdminScreenProps> = (props) => {
    return (
        <AdminAuthProvider>
            <AdminScreenWithAuth {...props} />
        </AdminAuthProvider>
    );
};

// 内部组件：检查认证状态
const AdminScreenWithAuth: React.FC<AdminScreenProps> = (props) => {
    const { isAuthenticated } = useAdminAuth();

    if (!isAuthenticated) {
        return <AdminLoginWrapper onBack={props.onBack} />;
    }

    return (
        <AdminStateProvider>
            <AdminScreenContent {...props} />
        </AdminStateProvider>
    );
};

