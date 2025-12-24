// AI配置管理API
import { request } from '../base/request';
import type {
  AIModelConfig,
  RoutingStrategy,
  RoutingStrategyType,
  FallbackChainItem,
  EconomyConfig,
} from './types';

/**
 * AI模型配置管理API
 */
export const adminAIModelsApi = {
  /**
   * 获取所有AI模型配置
   */
  getAll: (token: string): Promise<AIModelConfig[]> => {
    return request<AIModelConfig[]>('/admin/system/ai-config/models', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据能力获取AI模型配置
   */
  getByCapability: (capability: string, token: string): Promise<AIModelConfig[]> => {
    return request<AIModelConfig[]>(
      `/admin/system/ai-config/models/${capability}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 根据提供商和能力获取AI模型配置
   */
  getByProviderAndCapability: (
    capability: string,
    provider: string,
    token: string
  ): Promise<AIModelConfig[]> => {
    return request<AIModelConfig[]>(
      `/admin/system/ai-config/models/${capability}/${provider}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 创建AI模型配置
   */
  create: (
    data: {
      provider: string;
      modelName: string;
      capability: string;
      apiKey: string;
      baseUrl?: string;
      modelParams?: string;
      isDefault?: boolean;
      priority?: number;
      costPerToken?: number;
      isActive?: boolean;
      description?: string;
    },
    token: string
  ): Promise<AIModelConfig> => {
    return request<AIModelConfig>('/admin/system/ai-config/models', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新AI模型配置
   */
  update: (
    id: number,
    data: {
      provider?: string;
      modelName?: string;
      capability?: string;
      apiKey?: string;
      baseUrl?: string;
      modelParams?: string;
      isDefault?: boolean;
      priority?: number;
      costPerToken?: number;
      isActive?: boolean;
      description?: string;
    },
    token: string
  ): Promise<AIModelConfig> => {
    return request<AIModelConfig>(`/admin/system/ai-config/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除AI模型配置
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/ai-config/models/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 设置默认AI模型
   */
  setDefault: (
    id: number,
    token: string
  ): Promise<{
    id: number;
    provider: string;
    modelName: string;
    capability: string;
    isDefault: boolean;
  }> => {
    return request<{
      id: number;
      provider: string;
      modelName: string;
      capability: string;
      isDefault: boolean;
    }>(`/admin/system/ai-config/models/${id}/set-default`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

/**
 * AI路由策略管理API
 */
export const adminAIRoutingStrategiesApi = {
  /**
   * 获取所有路由策略
   */
  getAll: (token: string): Promise<RoutingStrategy[]> => {
    return request<RoutingStrategy[]>(
      '/admin/system/ai-config/routing-strategies',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 根据能力获取路由策略
   */
  getByCapability: (capability: string, token: string): Promise<RoutingStrategy> => {
    return request<RoutingStrategy>(
      `/admin/system/ai-config/routing-strategies/${capability}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 保存路由策略
   */
  save: (
    data: {
      capability: string;
      strategyType: RoutingStrategyType;
      isActive?: boolean;
      description?: string;
      defaultProvider?: string;
      defaultModel?: string;
      fallbackChain?: FallbackChainItem[];
      economyConfig?: EconomyConfig;
    },
    token: string
  ): Promise<{
    id: number;
    capability: string;
    strategyType: RoutingStrategyType;
    config: any;
    isActive: boolean;
  }> => {
    return request<{
      id: number;
      capability: string;
      strategyType: RoutingStrategyType;
      config: any;
      isActive: boolean;
    }>('/admin/system/ai-config/routing-strategies', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新路由策略
   */
  update: (
    id: number,
    data: {
      capability?: string;
      strategyType?: RoutingStrategyType;
      isActive?: boolean;
      description?: string;
      defaultProvider?: string;
      defaultModel?: string;
      fallbackChain?: FallbackChainItem[];
      economyConfig?: EconomyConfig;
    },
    token: string
  ): Promise<{
    id: number;
    capability: string;
    strategyType: RoutingStrategyType;
    config: any;
    isActive: boolean;
  }> => {
    return request<{
      id: number;
      capability: string;
      strategyType: RoutingStrategyType;
      config: any;
      isActive: boolean;
    }>(`/admin/system/ai-config/routing-strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除路由策略
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/ai-config/routing-strategies/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

