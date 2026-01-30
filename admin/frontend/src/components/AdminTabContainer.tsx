import React from 'react';
import { TabInfo, SectionType } from '../contexts/AdminStateContext';
import { AdminTabBar } from './AdminTabBar';
import { adminApi } from '../services/api';
import { showAlert } from '../utils/dialog';
import { DashboardView } from './DashboardView';
import { ErasManagement } from './ErasManagement';
import { MainStoriesManagement } from './MainStoriesManagement';
import { UsersManagement } from './UsersManagement';
import { CharactersManagement } from './CharactersManagement';
import { ScenariosManagement } from './ScenariosManagement';
import { EventsManagement } from './EventsManagement';
import { ItemsManagement } from './ItemsManagement';
import { InviteCodesManagement } from './InviteCodesManagement';
import { ApiKeysManagement } from './ApiKeysManagement';
import { ResourcesManagement } from './ResourcesManagement';
import { ImageManagement } from './ImageManagement';
import { VideoManagement } from './VideoManagement';
import { SubscriptionPlansManagement } from './SubscriptionPlansManagement';
import { EmailConfigManagement } from './EmailConfigManagement';
import { SettingsManagement } from './SettingsManagement';
import { AdminsManagement } from './AdminsManagement';
import { BillingManagement } from './billing';
import { HeartSphereConnectionManagement } from './heartSphereConnection';
import { MemoryManagement } from './memory';
import { GraphManagement } from './GraphManagement';
import { SkillsManagement } from './SkillsManagement';
import { ChronosLettersManagement } from './ChronosLettersManagement';
import { PluginManagement } from './PluginManagement';
import { PromptManagement } from './PromptManagement';
// 已禁用：AgentScope 演示管理（仅用于演示，不用于生产部署）
// import { AgentScopeDemoAdmin } from './AgentScopeDemoAdmin';
import { MentisManagementPage } from './MentisManagementPage';
import { McpConfigManagement } from './McpConfigManagement';
import { DevOpsWorkbench } from './DevOpsWorkbench/DevOpsWorkbench';
import AgentMindManagementPage from '../pages/AgentMindManagementPage';
import MultiAgentManagementPage from '../pages/MultiAgentManagementPage';
import {
    AdminDashboardPage as EduDashboardPage,
    AdminStudentManagePage as EduStudentManagePage,
    AdminTeacherManagePage as EduTeacherManagePage,
    AdminContentManagePage as EduContentManagePage,
    ContentReviewQueuePage as EduContentReviewQueuePage,
    AdminAnalyticsPage as EduAnalyticsPage,
    AdminSettingsPage as EduSettingsPage
} from '../pages/edu';

interface AdminTabContainerProps {
    adminToken: string | null;
    openTabs: TabInfo[];
    activeTabId: string | null;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onCloseOtherTabs: (tabId: string) => void;
    onCloseAllTabs: () => void;
    systemWorlds: any[];
    systemEras: any[];
    systemCharacters: any[];
    systemScripts: any[];
    systemMainStories: any[];
    loadSystemData: (token: string) => Promise<void>;
}

export const AdminTabContainer: React.FC<AdminTabContainerProps> = ({
    adminToken,
    openTabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onCloseOtherTabs,
    onCloseAllTabs,
    systemWorlds,
    systemEras,
    systemCharacters,
    systemScripts,
    systemMainStories,
    loadSystemData,
}) => {
    const handleTabClose = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onTabClose(tabId);
    };

    const renderTabContent = (tab: TabInfo) => {
        const isActive = tab.id === activeTabId;
        
        // 只渲染活动标签页的内容，其他标签页保持挂载但不显示
        const content = (
            <div
                key={tab.id}
                style={{ display: isActive ? 'block' : 'none' }}
                className="h-full"
            >
                {renderSectionContent(tab.section)}
            </div>
        );
        
        return content;
    };

    const renderSectionContent = (section: SectionType) => {
        switch (section) {
            case 'dashboard':
                return <DashboardView adminToken={adminToken} />;
            case 'eras':
                return (
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
                    />
                );
            case 'characters':
                return (
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
                );
            case 'scenarios':
                return (
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
                );
            case 'events':
                return (
                    <EventsManagement
                        eras={systemEras}
                        systemEras={systemEras}
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'items':
                return (
                    <ItemsManagement
                        eras={systemEras}
                        systemEras={systemEras}
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'invite-codes':
                return (
                    <InviteCodesManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'api-keys':
                return (
                    <ApiKeysManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'resources':
                return (
                    <ResourcesManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'images':
                return <ImageManagement adminToken={adminToken} />;
            case 'videos':
                return <VideoManagement adminToken={adminToken} />;
            case 'subscription-plans':
                return (
                    <SubscriptionPlansManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'email-config':
                return (
                    <EmailConfigManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'users':
                return (
                    <UsersManagement
                        adminToken={adminToken}
                        onRefresh={() => {
                            if (adminToken) {
                                loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'admins':
                return (
                    <AdminsManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'settings':
                return (
                    <SettingsManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'billing':
                return (
                    <BillingManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'heartsphere-connection':
                return (
                    <HeartSphereConnectionManagement
                        adminToken={adminToken}
                        onRefresh={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'memory':
                return <MemoryManagement adminToken={adminToken} />;
            case 'graph':
                return <GraphManagement adminToken={adminToken} />;
            case 'skills':
                return <SkillsManagement adminToken={adminToken} />;
            case 'chronos-letters':
                return (
                    <ChronosLettersManagement
                        adminToken={adminToken}
                        onRefresh={() => {
                            if (adminToken) {
                                loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'plugins':
                return (
                    <PluginManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            case 'prompts':
                return (
                    <PromptManagement
                        adminToken={adminToken}
                        onReload={async () => {
                            if (adminToken) {
                                await loadSystemData(adminToken);
                            }
                        }}
                    />
                );
            // 已禁用：AgentScope 演示管理（仅用于演示，不用于生产部署）
            // case 'agentscope-demo':
            //     return <AgentScopeDemoAdmin adminToken={adminToken} />;
            case 'main-stories':
                return (
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
                );
            case 'edu-dashboard':
                return <EduDashboardPage />;
            case 'edu-students':
                return <EduStudentManagePage />;
            case 'edu-teachers':
                return <EduTeacherManagePage />;
            case 'edu-content':
                return <EduContentManagePage />;
            case 'edu-content-review':
                return <EduContentReviewQueuePage />;
            case 'edu-analytics':
                return <EduAnalyticsPage />;
            case 'edu-settings':
                return <EduSettingsPage />;
            case 'mcp-management':
                return <McpConfigManagement />;
            case 'mentis-management':
                return <MentisManagementPage />;
            case 'agent-mind-management':
                return <AgentMindManagementPage />;
            case 'devops-workbench':
            case 'devops-overview':
            case 'devops-scan':
            case 'devops-test':
            case 'devops-build':
            case 'devops-database':
            case 'devops-server':
            case 'devops-scheduled':
            case 'devops-pipeline':
            case 'devops-cmdb':
                return <DevOpsWorkbench />;
            case 'devops-autofix':
                return <DevOpsWorkbench />;
            case 'multi-agent-management':
                return <MultiAgentManagementPage />;
            default:
                return <div>未知的功能模块: {section}</div>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <AdminTabBar
                tabs={openTabs}
                activeTabId={activeTabId}
                onTabClick={onTabClick}
                onTabClose={handleTabClose}
                onCloseOther={onCloseOtherTabs}
                onCloseAll={onCloseAllTabs}
            />
            <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
                {openTabs.map(tab => renderTabContent(tab))}
            </div>
        </div>
    );
};
