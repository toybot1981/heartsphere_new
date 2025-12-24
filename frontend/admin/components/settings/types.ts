// SettingsManagement 相关类型定义

export interface AIModelConfig {
    id?: number;
    provider: string;
    modelName: string;
    capability: 'text' | 'image' | 'audio' | 'video';
    apiKey: string;
    baseUrl?: string;
    modelParams?: string;
    isDefault: boolean;
    priority: number;
    costPerToken?: number;
    isActive: boolean;
    description?: string;
}

export interface RoutingStrategy {
    id?: number;
    capability: 'text' | 'image' | 'audio' | 'video';
    strategyType: 'single' | 'fallback' | 'economy';
    isActive: boolean;
    description?: string;
    defaultProvider?: string;
    defaultModel?: string;
    fallbackChain?: Array<{
        provider: string;
        model: string;
        priority: number;
    }>;
    economyConfig?: {
        enabled: boolean;
        preferredProvider?: string;
        maxCostPerToken?: number;
    };
}

export interface ProviderOption {
    label: string;
    value: string;
}

