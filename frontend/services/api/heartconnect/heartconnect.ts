/**
 * 心域共享API服务
 */

import { request } from '../base/request';
import type {
  ShareConfig,
  CreateShareConfigRequest,
  UpdateShareConfigRequest,
  ConnectionRequest,
  CreateConnectionRequestRequest,
  ResponseConnectionRequestRequest,
  SharedHeartSphere,
} from './types';

/**
 * 创建共享配置
 */
export async function createShareConfig(data: CreateShareConfigRequest): Promise<ShareConfig> {
  const response = await request<ShareConfig>('/heartconnect/config', {
    method: 'POST',
    body: data,
  });
  return response;
}

/**
 * 更新共享配置
 */
export async function updateShareConfig(
  configId: number,
  data: UpdateShareConfigRequest
): Promise<ShareConfig> {
  const response = await request<ShareConfig>(`/heartconnect/config/${configId}`, {
    method: 'PUT',
    body: data,
  });
  return response;
}

/**
 * 获取我的共享配置
 */
export async function getMyShareConfig(): Promise<ShareConfig> {
  const response = await request<ShareConfig>('/heartconnect/config/my');
  return response;
}

/**
 * 根据共享码获取共享配置
 */
export async function getShareConfigByCode(shareCode: string): Promise<ShareConfig> {
  const response = await request<ShareConfig>(`/heartconnect/config/by-code/${shareCode}`);
  return response;
}

/**
 * 重新生成共享码
 */
export async function regenerateShareCode(configId: number): Promise<ShareConfig> {
  const response = await request<ShareConfig>(`/heartconnect/config/${configId}/regenerate-code`, {
    method: 'POST',
  });
  return response;
}

/**
 * 删除共享配置
 */
export async function deleteShareConfig(configId: number): Promise<void> {
  await request<void>(`/heartconnect/config/${configId}`, {
    method: 'DELETE',
  });
}

/**
 * 创建连接请求
 */
export async function createConnectionRequest(data: CreateConnectionRequestRequest): Promise<ConnectionRequest> {
  const response = await request<ConnectionRequest>('/heartconnect/requests', {
    method: 'POST',
    body: data,
  });
  return response;
}

/**
 * 响应连接请求
 */
export async function responseConnectionRequest(
  requestId: number,
  data: ResponseConnectionRequestRequest
): Promise<ConnectionRequest> {
  const response = await request<ConnectionRequest>(
    `/heartconnect/requests/${requestId}/response`,
    {
      method: 'POST',
      body: data,
    }
  );
  return response;
}

/**
 * 获取共享配置的连接请求列表
 */
export async function getConnectionRequests(
  shareConfigId: number,
  status?: string
): Promise<ConnectionRequest[]> {
  let url = `/heartconnect/requests/share-config/${shareConfigId}`;
  if (status) {
    url += `?status=${encodeURIComponent(status)}`;
  }
  const response = await request<ConnectionRequest[]>(url);
  return response;
}

/**
 * 获取我的连接请求列表
 */
export async function getMyConnectionRequests(): Promise<ConnectionRequest[]> {
  const response = await request<ConnectionRequest[]>('/heartconnect/requests/my');
  return response;
}

/**
 * 取消连接请求
 */
export async function cancelConnectionRequest(requestId: number): Promise<void> {
  await request<void>(`/heartconnect/requests/${requestId}/cancel`, {
    method: 'POST',
  });
}

/**
 * 获取公开的共享心域列表（发现页面）
 */
export async function getPublicSharedHeartSpheres(): Promise<SharedHeartSphere[]> {
  const response = await request<SharedHeartSphere[]>('/heartconnect/discover');
  return response;
}

