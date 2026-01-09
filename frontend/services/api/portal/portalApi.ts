/**
 * 传送门API服务
 * 参考heartconnect.ts的实现模式
 */

import { request } from '../base/request';
import type {
  PortalConfig,
  CreatePortalRequest,
  UpdatePortalRequest,
  PortalPreview,
  TeleportationRequest,
  TeleportationResult,
  InviteUserRequest,
} from './types';
import { ApiResponse } from '../base/types';

/**
 * 创建传送门
 */
export async function createPortal(data: CreatePortalRequest): Promise<PortalConfig> {
  // request 函数会自动提取 ApiResponse 的 data 字段
  const response = await request<PortalConfig>('/portal', {
    method: 'POST',
    body: data,
  });
  return response;
}

/**
 * 更新传送门
 */
export async function updatePortal(
  portalId: number,
  data: UpdatePortalRequest
): Promise<PortalConfig> {
  // request 函数会自动提取 ApiResponse 的 data 字段
  const response = await request<PortalConfig>(`/portal/${portalId}`, {
    method: 'PUT',
    body: data,
  });
  return response;
}

/**
 * 删除传送门
 */
export async function deletePortal(portalId: number): Promise<void> {
  await request<ApiResponse<void>>(`/portal/${portalId}`, {
    method: 'DELETE',
  });
}

/**
 * 获取场景传送门列表
 */
export async function getPortalsByScene(
  sceneId: number,
  onlyActive?: boolean
): Promise<PortalConfig[]> {
  const params = new URLSearchParams();
  if (onlyActive !== undefined) {
    params.append('onlyActive', onlyActive.toString());
  }
  const queryString = params.toString();
  const url = `/portal/scene/${sceneId}${queryString ? `?${queryString}` : ''}`;
  
  // request 函数会自动提取 ApiResponse 的 data 字段，所以直接传入 PortalConfig[]
  const response = await request<PortalConfig[]>(url, {
    method: 'GET',
  });
  // 确保返回的是数组
  return Array.isArray(response) ? response : [];
}

/**
 * 获取传送门详情
 */
export async function getPortalById(portalId: number): Promise<PortalConfig> {
  // request 函数会自动提取 ApiResponse 的 data 字段
  const response = await request<PortalConfig>(`/portal/${portalId}`, {
    method: 'GET',
  });
  return response;
}

/**
 * 获取传送门预览
 */
export async function getPortalPreview(portalId: number): Promise<PortalPreview> {
  // request 函数会自动提取 ApiResponse 的 data 字段
  const response = await request<PortalPreview>(`/portal/${portalId}/preview`, {
    method: 'GET',
  });
  return response;
}

/**
 * 执行传送
 */
export async function executeTeleportation(
  portalId: number,
  request?: TeleportationRequest
): Promise<TeleportationResult> {
  // request 函数会自动提取 ApiResponse 的 data 字段
  const response = await request<TeleportationResult>(
    `/portal/${portalId}/teleport`,
    {
      method: 'POST',
      body: request || {},
    }
  );
  return response;
}

/**
 * 请求传送权限
 */
export async function requestPortalPermission(portalId: number): Promise<void> {
  await request<ApiResponse<void>>(`/portal/${portalId}/request`, {
    method: 'POST',
  });
}

/**
 * 发送传送门邀请
 */
export async function inviteUser(
  portalId: number,
  data: InviteUserRequest
): Promise<void> {
  await request<ApiResponse<void>>(`/portal/${portalId}/invite`, {
    method: 'POST',
    body: data,
  });
}
