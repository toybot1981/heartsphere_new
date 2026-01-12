// 认证相关 API 服务

import { request } from './request';
import { tokenStorage } from '@heartsphere/shared-frontend';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  ageGroup?: 'elementary' | 'middle';
  grade?: string;
  school?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    studentId?: number;
  };
}

/**
 * 用户登录
 * @param credentials 登录凭据
 * @returns 认证响应（包含 token 和用户信息）
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // 尝试使用主后端的认证 API（主后端运行在 8081 端口）
    const mainApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    
    console.log('[Auth] 尝试登录:', { url: `${mainApiUrl}/auth/login`, username: credentials.username });
    
    const response = await fetch(`${mainApiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('[Auth] 登录响应状态:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `登录失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // 如果响应不是 JSON，使用默认错误信息
      }
      console.error('[Auth] 登录失败:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[Auth] 登录响应数据:', data);
    
    // 主后端返回格式: { code: 200, message: "...", data: { token: "...", id: ..., ... } }
    let responseData = data;
    if (data.data) {
      responseData = data.data;
    }
    
    // 保存 token
    let token: string | null = null;
    if (responseData.token) {
      token = responseData.token;
    } else if (data.token) {
      token = data.token;
    }

    if (token) {
      await tokenStorage.saveToken(token);
      console.log('[Auth] Token 已保存');
    } else {
      console.warn('[Auth] 响应中未找到 token');
    }

    // 构造 AuthResponse 格式
    const authResponse: AuthResponse = {
      token: token || '',
      user: {
        id: responseData.id || 0,
        username: responseData.username || credentials.username,
        email: responseData.email || '',
        role: 'student', // 主后端可能没有 role 字段，默认为 student
        studentId: responseData.id, // 使用 id 作为 studentId
      },
    };

    return authResponse;
  } catch (error: any) {
    console.error('[Auth] 登录异常:', error);
    // 如果是网络错误，提供更友好的提示
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('无法连接到服务器，请检查网络连接或确保后端服务已启动');
    }
    throw error;
  }
};

/**
 * 用户注册
 * @param userData 注册信息
 * @returns 认证响应（包含 token 和用户信息）
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    // 尝试使用主后端的认证 API（主后端运行在 8081 端口）
    const mainApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    
    console.log('[Auth] 尝试注册:', { url: `${mainApiUrl}/auth/register`, username: userData.username });
    
    const response = await fetch(`${mainApiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('[Auth] 注册响应状态:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `注册失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // 如果响应不是 JSON，使用默认错误信息
      }
      console.error('[Auth] 注册失败:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[Auth] 注册响应数据:', data);
    
    // 主后端返回格式: { code: 200, message: "...", data: { token: "...", id: ..., ... } }
    let responseData = data;
    if (data.data) {
      responseData = data.data;
    }
    
    // 保存 token
    let token: string | null = null;
    if (responseData.token) {
      token = responseData.token;
    } else if (data.token) {
      token = data.token;
    }

    if (token) {
      await tokenStorage.saveToken(token);
      console.log('[Auth] Token 已保存');
    } else {
      console.warn('[Auth] 响应中未找到 token');
    }

    // 构造 AuthResponse 格式
    const authResponse: AuthResponse = {
      token: token || '',
      user: {
        id: responseData.id || 0,
        username: responseData.username || userData.username,
        email: responseData.email || userData.email,
        role: 'student', // 主后端可能没有 role 字段，默认为 student
        studentId: responseData.id, // 使用 id 作为 studentId
      },
    };

    return authResponse;
  } catch (error: any) {
    console.error('[Auth] 注册异常:', error);
    // 如果是网络错误，提供更友好的提示
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('无法连接到服务器，请检查网络连接或确保后端服务已启动');
    }
    throw error;
  }
};

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  try {
    await tokenStorage.removeToken();
  } catch (error) {
    console.error('登出失败:', error);
  }
};

/**
 * 检查当前用户是否已登录
 * @returns 是否已登录
 */
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await tokenStorage.getToken();
    return !!token;
  } catch (error) {
    return false;
  }
};
