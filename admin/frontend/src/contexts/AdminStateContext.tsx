import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getSectionMetadata, isValidSection } from '../utils/sectionMetadata';

export type SectionType = 
    | 'dashboard' 
    | 'eras' 
    | 'characters' 
    | 'scenarios' 
    | 'main-stories'
    | 'invite-codes'
    | 'api-keys'
    | 'settings' 
    | 'resources' 
    | 'subscription-plans' 
    | 'email-config' 
    | 'users'
    | 'admins'
    | 'billing'
    | 'events'
    | 'items'
    | 'images'
    | 'videos'
    | 'heartsphere-connection'
    | 'memory'
    | 'graph'
    | 'skills'
    | 'chronos-letters'
    | 'plugins'
    | 'prompts'
    // | 'agentscope-demo' // 已禁用：仅用于演示，不用于生产部署
    | 'edu-dashboard'
    | 'edu-students'
    | 'edu-teachers'
    | 'edu-content'
    | 'edu-content-review'
    | 'edu-analytics'
    | 'edu-settings'
    | 'mentis-management'
    | 'mcp-management'
    | 'agent-mind-management'
    | 'devops-workbench'
    | 'devops-overview'
    | 'devops-scan'
    | 'devops-test'
    | 'devops-build'
    | 'devops-database'
    | 'devops-server'
    | 'devops-scheduled'
    | 'devops-pipeline'
    | 'devops-cmdb'
    | 'devops-autofix'
    | 'multi-agent-management';

export type ViewMode = 'list' | 'edit' | 'create';

export interface TabInfo {
    id: string;              // 唯一标识（如：section + timestamp）
    section: SectionType;     // 功能模块类型
    title: string;           // 标签页标题
    icon: string;           // 图标
    timestamp: number;        // 打开时间戳
}

const MAX_TABS = 10;
const STORAGE_KEY = 'admin_open_tabs';
const STORAGE_ACTIVE_TAB_KEY = 'admin_active_tab_id';

interface AdminStateContextType {
    // Navigation
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
    settingsTab: 'general' | 'routing' | 'models' | 'email';
    setSettingsTab: (tab: 'general' | 'routing' | 'models' | 'email') => void;
    
    // Tab Management
    openTabs: TabInfo[];
    activeTabId: string | null;
    openTab: (section: SectionType) => void;
    closeTab: (tabId: string) => void;
    switchTab: (tabId: string) => void;
    closeOtherTabs: (tabId: string) => void;
    closeAllTabs: () => void;
    
    // CRUD State
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    showScenarioBuilder: boolean;
    setShowScenarioBuilder: (show: boolean) => void;
    selectedNodeId: string | undefined;
    setSelectedNodeId: (id: string | undefined) => void;
    
    // Form Data
    formData: any;
    setFormData: (data: any) => void;
    
    // Subscription Plan State
    editingPlan: any | null;
    setEditingPlan: (plan: any | null) => void;
    planFormData: any;
    setPlanFormData: (data: any) => void;
    
    // Filters
    characterEraFilter: number | 'all';
    setCharacterEraFilter: (filter: number | 'all') => void;
    scenarioEraFilter: number | 'all';
    setScenarioEraFilter: (filter: number | 'all') => void;
    resourceCategory: string;
    setResourceCategory: (category: string) => void;
    inviteCodeFilter: 'all' | 'available' | 'used' | 'expired';
    setInviteCodeFilter: (filter: 'all' | 'available' | 'used' | 'expired') => void;
    
    // Selected User ID (for navigation from user management)
    selectedUserId: number | null;
    setSelectedUserId: (userId: number | null) => void;
    
    // Sub-section navigation (for nested sections like billing, memory)
    billingSubSection: string | null;
    setBillingSubSection: (section: string | null) => void;
    memoryTab: number | null;
    setMemoryTab: (tab: number | null) => void;
}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

// 从 localStorage 恢复标签页状态
const loadTabsFromStorage = (): TabInfo[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const tabs = JSON.parse(stored) as TabInfo[];
            // 验证数据格式
            return tabs.filter(tab => tab.id && tab.section && tab.title);
        }
    } catch (e) {
        console.error('Failed to load tabs from storage:', e);
    }
    return [];
};

// 保存标签页状态到 localStorage
const saveTabsToStorage = (tabs: TabInfo[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch (e) {
        console.error('Failed to save tabs to storage:', e);
    }
};

// 从 localStorage 恢复活动标签页ID
const loadActiveTabIdFromStorage = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_ACTIVE_TAB_KEY);
    } catch (e) {
        console.error('Failed to load active tab ID from storage:', e);
        return null;
    }
};

// 保存活动标签页ID到 localStorage
const saveActiveTabIdToStorage = (tabId: string | null) => {
    try {
        if (tabId) {
            localStorage.setItem(STORAGE_ACTIVE_TAB_KEY, tabId);
        } else {
            localStorage.removeItem(STORAGE_ACTIVE_TAB_KEY);
        }
    } catch (e) {
        console.error('Failed to save active tab ID to storage:', e);
    }
};

export const AdminStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 初始化标签页状态（从 localStorage 恢复）
    const initialTabs = (() => {
        const storedTabs = loadTabsFromStorage();
        // 如果没有存储的标签页，创建默认的 dashboard 标签页
        if (storedTabs.length === 0) {
            const defaultSection: SectionType = 'dashboard';
            const metadata = getSectionMetadata(defaultSection);
            return [{
                id: `${defaultSection}-${Date.now()}`,
                section: defaultSection,
                title: metadata.title,
                icon: metadata.icon,
                timestamp: Date.now(),
            }];
        }
        return storedTabs;
    })();
    
    const [openTabs, setOpenTabs] = useState<TabInfo[]>(initialTabs);
    
    const initialActiveTabId = (() => {
        const storedActiveTabId = loadActiveTabIdFromStorage();
        // 如果存储的活动标签页ID不存在于当前标签页列表中，使用第一个标签页
        if (storedActiveTabId && initialTabs.some(tab => tab.id === storedActiveTabId)) {
            return storedActiveTabId;
        }
        return initialTabs.length > 0 ? initialTabs[0].id : null;
    })();
    
    const [activeTabId, setActiveTabId] = useState<string | null>(initialActiveTabId);
    
    const initialActiveSection = (() => {
        const activeTab = initialTabs.find(tab => tab.id === initialActiveTabId);
        return activeTab?.section || 'dashboard';
    })();
    
    const [activeSection, setActiveSection] = useState<SectionType>(initialActiveSection);
    const [settingsTab, setSettingsTab] = useState<'general' | 'routing' | 'models' | 'email'>('general');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [formData, setFormData] = useState<any>({});
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [planFormData, setPlanFormData] = useState<any>({});
    const [characterEraFilter, setCharacterEraFilter] = useState<number | 'all'>('all');
    const [scenarioEraFilter, setScenarioEraFilter] = useState<number | 'all'>('all');
    const [resourceCategory, setResourceCategory] = useState<string>('all');
    const [inviteCodeFilter, setInviteCodeFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [billingSubSection, setBillingSubSection] = useState<string | null>(null);
    const [memoryTab, setMemoryTab] = useState<number | null>(null);
    
    // 标签页管理方法
    const openTab = useCallback((section: SectionType) => {
        setOpenTabs(prevTabs => {
            // 检查是否已达到最大标签页数量
            if (prevTabs.length >= MAX_TABS) {
                // 移除最旧的标签页（除了 dashboard）
                const tabsToKeep = prevTabs.filter(tab => tab.section === 'dashboard');
                const otherTabs = prevTabs.filter(tab => tab.section !== 'dashboard').slice(1);
                prevTabs = [...tabsToKeep, ...otherTabs];
            }
            
            // 检查该 section 是否已打开
            const existingTab = prevTabs.find(tab => tab.section === section);
            if (existingTab) {
                // 如果已打开，切换到该标签页
                setActiveTabId(existingTab.id);
                setActiveSection(section);
                return prevTabs;
            }
            
            // 创建新标签页
            const metadata = getSectionMetadata(section);
            const newTab: TabInfo = {
                id: `${section}-${Date.now()}`,
                section,
                title: metadata.title,
                icon: metadata.icon,
                timestamp: Date.now(),
            };
            
            const newTabs = [...prevTabs, newTab];
            setActiveTabId(newTab.id);
            setActiveSection(section);
            return newTabs;
        });
    }, []);
    
    const closeTab = useCallback((tabId: string) => {
        setOpenTabs(prevTabs => {
            if (prevTabs.length <= 1) {
                // 至少保留一个标签页，如果尝试关闭最后一个，打开 dashboard
                const dashboardTab = prevTabs.find(tab => tab.section === 'dashboard');
                if (!dashboardTab) {
                    const metadata = getSectionMetadata('dashboard');
                    const newTab: TabInfo = {
                        id: `dashboard-${Date.now()}`,
                        section: 'dashboard',
                        title: metadata.title,
                        icon: metadata.icon,
                        timestamp: Date.now(),
                    };
                    setActiveTabId(newTab.id);
                    setActiveSection('dashboard');
                    return [newTab];
                }
                return prevTabs;
            }
            
            const tabIndex = prevTabs.findIndex(tab => tab.id === tabId);
            if (tabIndex === -1) return prevTabs;
            
            const newTabs = prevTabs.filter(tab => tab.id !== tabId);
            
            // 如果关闭的是当前活动标签页，切换到相邻标签页
            if (activeTabId === tabId) {
                if (tabIndex < newTabs.length) {
                    // 优先切换到右侧标签页
                    setActiveTabId(newTabs[tabIndex].id);
                    setActiveSection(newTabs[tabIndex].section);
                } else if (newTabs.length > 0) {
                    // 如果右侧没有，切换到左侧（最后一个）
                    const lastTab = newTabs[newTabs.length - 1];
                    setActiveTabId(lastTab.id);
                    setActiveSection(lastTab.section);
                }
            }
            
            return newTabs;
        });
    }, [activeTabId]);
    
    const switchTab = useCallback((tabId: string) => {
        setOpenTabs(prevTabs => {
            const tab = prevTabs.find(t => t.id === tabId);
            if (tab) {
                setActiveTabId(tabId);
                setActiveSection(tab.section);
            }
            return prevTabs;
        });
    }, []);
    
    const closeOtherTabs = useCallback((tabId: string) => {
        setOpenTabs(prevTabs => {
            const tabToKeep = prevTabs.find(tab => tab.id === tabId);
            if (!tabToKeep) return prevTabs;
            
            setActiveTabId(tabId);
            setActiveSection(tabToKeep.section);
            return [tabToKeep];
        });
    }, []);
    
    const closeAllTabs = useCallback(() => {
        const metadata = getSectionMetadata('dashboard');
        const dashboardTab: TabInfo = {
            id: `dashboard-${Date.now()}`,
            section: 'dashboard',
            title: metadata.title,
            icon: metadata.icon,
            timestamp: Date.now(),
        };
        setOpenTabs([dashboardTab]);
        setActiveTabId(dashboardTab.id);
        setActiveSection('dashboard');
    }, []);
    
    // 持久化标签页状态
    useEffect(() => {
        saveTabsToStorage(openTabs);
    }, [openTabs]);

    // 深链：URL ?section=xxx 时打开对应 section（挂载或 search 变化时，便于 e2e 与直接链接）
    const location = useLocation();
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sectionParam = params.get('section');
        if (sectionParam && isValidSection(sectionParam)) {
            openTab(sectionParam);
        }
    }, [location.search, openTab]);
    
    useEffect(() => {
        saveActiveTabIdToStorage(activeTabId);
    }, [activeTabId]);

    const value: AdminStateContextType = {
        activeSection,
        setActiveSection,
        settingsTab,
        setSettingsTab,
        openTabs,
        activeTabId,
        openTab,
        closeTab,
        switchTab,
        closeOtherTabs,
        closeAllTabs,
        viewMode,
        setViewMode,
        editingId,
        setEditingId,
        showScenarioBuilder,
        setShowScenarioBuilder,
        selectedNodeId,
        setSelectedNodeId,
        formData,
        setFormData,
        editingPlan,
        setEditingPlan,
        planFormData,
        setPlanFormData,
        characterEraFilter,
        setCharacterEraFilter,
        scenarioEraFilter,
        setScenarioEraFilter,
        resourceCategory,
        setResourceCategory,
        inviteCodeFilter,
        setInviteCodeFilter,
        selectedUserId,
        setSelectedUserId,
        billingSubSection,
        setBillingSubSection,
        memoryTab,
        setMemoryTab,
    };

    return (
        <AdminStateContext.Provider value={value}>
            {children}
        </AdminStateContext.Provider>
    );
};

export const useAdminState = () => {
    const context = useContext(AdminStateContext);
    if (context === undefined) {
        throw new Error('useAdminState must be used within an AdminStateProvider');
    }
    return context;
};

