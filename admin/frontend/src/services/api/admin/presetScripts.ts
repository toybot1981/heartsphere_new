// 预置剧本生成API
import { request } from "../request";

export interface GenerateScriptsResponse {
  success: boolean;
  message: string;
  count: number;
}

/**
 * 预置剧本生成API
 */
export const adminPresetScriptsApi = {
  /**
   * 为所有预置场景生成剧本
   * @param token - 管理员token
   */
  generate: (token: string): Promise<GenerateScriptsResponse> => {
    return request<GenerateScriptsResponse>('/preset-scripts/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};




