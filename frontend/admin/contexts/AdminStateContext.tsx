import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SectionType = 
    | 'dashboard' 
    | 'eras' 
    | 'characters' 
    | 'scenarios' 
    | 'main-stories'
    | 'invite-codes' 
    | 'settings' 
    | 'resources' 
    | 'subscription-plans' 
    | 'email-config' 
    | 'users';

export type ViewMode = 'list' | 'edit' | 'create';

interface AdminStateContextType {
    // Navigation
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
    settingsTab: 'general' | 'models';
    setSettingsTab: (tab: 'general' | 'models' | 'email') => void;
    
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
}

const AdminStateContext = createContext<AdminStateContextType | undefined>(undefined);

export const AdminStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
    const [settingsTab, setSettingsTab] = useState<'general' | 'models' | 'email'>('models');
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

    const value: AdminStateContextType = {
        activeSection,
        setActiveSection,
        settingsTab,
        setSettingsTab,
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

