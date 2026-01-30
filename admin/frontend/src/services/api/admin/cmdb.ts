import { request } from '../request';

/**
 * 资产类型
 */
export interface AssetType {
  id: number;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  attributesSchema?: string;
}

/**
 * 资产
 */
export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED' | 'DELETED';
  version?: string;
  location?: string;
  ownerId?: number;
  ownerName?: string;
  description?: string;
  attributes?: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 关系类型
 */
export interface RelationshipType {
  id: number;
  name: string;
  code: string;
  description?: string;
  isDirectional: boolean;
}

/**
 * 资产关系
 */
export interface AssetRelationship {
  id: number;
  sourceAssetId: number;
  sourceAssetName: string;
  targetAssetId: number;
  targetAssetName: string;
  relationshipType: RelationshipType;
  properties?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 资产历史
 */
export interface AssetHistory {
  id: number;
  assetId: number;
  assetName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changedBy?: number;
  changedByName?: string;
  oldValue?: string;
  newValue?: string;
  changeSummary?: string;
  timestamp: string;
}

/**
 * 资产审计日志
 */
export interface AssetAuditLog {
  id: number;
  assetId?: number;
  assetName?: string;
  operation: string;
  operatorId?: number;
  operatorName?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * 资产搜索请求
 */
export interface AssetSearchRequest {
  name?: string;
  typeId?: number;
  status?: string;
  ownerId?: number;
  page?: number;
  size?: number;
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * CMDB API
 */
export const cmdbApi = {
  /**
   * 获取所有资产类型
   */
  getAssetTypes: async (token: string): Promise<AssetType[]> => {
    return request<AssetType[]>(`/cmdb/asset-types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取资产类型详情
   */
  getAssetType: async (token: string, id: number): Promise<AssetType> => {
    return request<AssetType>(`/cmdb/asset-types/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建资产
   */
  createAsset: async (token: string, asset: Partial<Asset>): Promise<Asset> => {
    return request<Asset>(`/cmdb/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset),
    });
  },

  /**
   * 更新资产
   */
  updateAsset: async (token: string, id: number, asset: Partial<Asset>): Promise<Asset> => {
    return request<Asset>(`/cmdb/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset),
    });
  },

  /**
   * 删除资产
   */
  deleteAsset: async (token: string, id: number): Promise<void> => {
    return request<void>(`/cmdb/assets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取资产详情
   */
  getAsset: async (token: string, id: number): Promise<Asset> => {
    return request<Asset>(`/cmdb/assets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 搜索资产
   */
  searchAssets: async (token: string, request: AssetSearchRequest): Promise<PageResponse<Asset>> => {
    return request<PageResponse<Asset>>(`/cmdb/assets/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  },

  /**
   * 获取资产列表
   */
  getAssets: async (
    token: string,
    params?: {
      name?: string;
      typeId?: number;
      status?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<Asset>> => {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append('name', params.name);
    if (params?.typeId) queryParams.append('typeId', params.typeId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const url = `/cmdb/assets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return request<PageResponse<Asset>>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建资产关系
   */
  createRelationship: async (token: string, relationship: Partial<AssetRelationship>): Promise<AssetRelationship> => {
    return request<AssetRelationship>(`/cmdb/relationships`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(relationship),
    });
  },

  /**
   * 获取资产的所有关系
   */
  getAssetRelationships: async (token: string, assetId: number): Promise<AssetRelationship[]> => {
    return request<AssetRelationship[]>(`/cmdb/assets/${assetId}/relationships`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取资产历史
   */
  getAssetHistory: async (token: string, assetId: number): Promise<AssetHistory[]> => {
    return request<AssetHistory[]>(`/cmdb/assets/${assetId}/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取审计日志
   */
  getAuditLogs: async (
    token: string,
    params?: {
      assetId?: number;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<AssetAuditLog>> => {
    const queryParams = new URLSearchParams();
    if (params?.assetId) queryParams.append('assetId', params.assetId.toString());
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const url = `/cmdb/audit-logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return request<PageResponse<AssetAuditLog>>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
