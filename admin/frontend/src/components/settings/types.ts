// SettingsManagement 相关类型定义

// 重新导出 AIModelConfig，统一使用 services/api/admin/types 中的定义
export type { AIModelConfig } from '../../services/api/admin/types';

// RoutingStrategy 类型保持在此文件中，因为它是前端特有的配置类型
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

