// API服务，用于处理与后端的通信

const API_BASE_URL = 'http://localhost:8081/api';

// 管理后台API
export const adminApi = {
  // 管理员登录
  login: (username: string, password: string) => {
    return request<{
      token: string;
      username: string;
      email: string;
      adminId: number;
    }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // 系统世界管理
  worlds: {
    getAll: (token: string) => {
      return request<Array<{
        id: number;
        name: string;
        description: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>>('/admin/system/worlds', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/worlds/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>('/admin/system/worlds', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/worlds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/worlds/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },

  // 系统时代管理
  eras: {
    getAll: (token: string) => {
      return request<Array<{
        id: number;
        name: string;
        description: string;
        startYear: number | null;
        endYear: number | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>>('/admin/system/eras', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        startYear: number | null;
        endYear: number | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/eras/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        startYear: number | null;
        endYear: number | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>('/admin/system/eras', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        startYear: number | null;
        endYear: number | null;
        imageUrl: string | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/eras/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/eras/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },

  // 系统角色管理
  characters: {
    getAll: (token: string) => {
      return request<Array<{
        id: number;
        name: string;
        description: string;
        age: number | null;
        gender: string | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        mbti: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        relationships: string | null;
        systemEraId: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>>('/admin/system/characters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        age: number | null;
        gender: string | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        mbti: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        relationships: string | null;
        systemEraId: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/characters/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        age: number | null;
        gender: string | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        mbti: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        relationships: string | null;
        systemEraId: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>('/admin/system/characters', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        description: string;
        age: number | null;
        gender: string | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        mbti: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        relationships: string | null;
        systemEraId: number | null;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/characters/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },

  // 邀请码管理
  inviteCodes: {
    getAll: (token: string) => {
      return request<Array<{
        id: number;
        code: string;
        isUsed: boolean;
        usedByUserId: number | null;
        usedAt: string | null;
        expiresAt: string;
        createdByAdminId: number | null;
        createdAt: string;
        updatedAt: string;
      }>>('/admin/system/invite-codes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    generate: (quantity: number, expiresAt: string, token: string) => {
      return request<Array<{
        id: number;
        code: string;
        isUsed: boolean;
        usedByUserId: number | null;
        usedAt: string | null;
        expiresAt: string;
        createdByAdminId: number | null;
        createdAt: string;
        updatedAt: string;
      }>>('/admin/system/invite-codes/generate', {
        method: 'POST',
        body: JSON.stringify({ quantity, expiresAt }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },

  // 系统配置
  config: {
    getInviteCodeRequired: (token: string) => {
      return request<{ inviteCodeRequired: boolean }>('/admin/system/config/invite-code-required', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setInviteCodeRequired: (required: boolean, token: string) => {
      return request<{ inviteCodeRequired: boolean }>('/admin/system/config/invite-code-required', {
        method: 'PUT',
        body: JSON.stringify({ inviteCodeRequired: required }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    getWechatConfig: (token: string) => {
      return request<{ appId: string; appSecret: string; redirectUri: string }>('/admin/system/config/wechat', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setWechatConfig: (config: { appId?: string; appSecret?: string; redirectUri?: string }, token: string) => {
      return request<{ appId: string; appSecret: string; redirectUri: string }>('/admin/system/config/wechat', {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },

  // 系统资源管理
  resources: {
    getAll: (category?: string, token: string) => {
      const url = category ? `/admin/system/resources?category=${category}` : '/admin/system/resources';
      return request<Array<{
        id: number;
        name: string;
        url: string;
        category: string;
        description?: string;
        prompt?: string;
        tags?: string;
        fileSize?: number;
        mimeType?: string;
        width?: number;
        height?: number;
        createdAt: string;
      }>>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        name: string;
        url: string;
        category: string;
        description?: string;
        prompt?: string;
        tags?: string;
      }>(`/admin/system/resources/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (file: File, category: string, name?: string, description?: string, prompt?: string, tags?: string, token?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (name) formData.append('name', name);
      if (description) formData.append('description', description);
      if (prompt) formData.append('prompt', prompt);
      if (tags) formData.append('tags', tags);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return request<{
        id: number;
        name: string;
        url: string;
        category: string;
      }>('/admin/system/resources', {
        method: 'POST',
        body: formData,
        headers: headers,
      });
    },
    update: (id: number, data: { name?: string; description?: string; prompt?: string; tags?: string; url?: string }, token: string) => {
      return request<{
        id: number;
        name: string;
        url: string;
        category: string;
      }>(`/admin/system/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/resources/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};

// 通用请求函数
// 核心request函数 - 简化版本，确保Content-Type正确设置
const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const fullUrl = `${API_BASE_URL}${url}`;
  const method = options?.method?.toUpperCase() || 'GET';
  
  // 日志记录
  console.log(`=== [API Request] ${requestId} 开始 ===`);
  console.log(`[${requestId}] 基本信息:`, {
    url: fullUrl,
    method: method,
    hasBody: !!options?.body,
    timestamp: new Date().toISOString()
  });
  
  try {
    // 1. 确保请求体正确处理
    let requestBody = undefined;
    let contentType: string | undefined = 'application/json';
    
    if (options?.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (options.body instanceof FormData) {
        requestBody = options.body;
        contentType = undefined; // 让浏览器自动设置
      } else {
        requestBody = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
      }
    }
    
    // 2. 构建headers对象 - 直接使用对象字面量确保Content-Type正确
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    // 只在需要时设置Content-Type (不是FormData)
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    // 3. 合并自定义headers
    if (options?.headers) {
      console.log(`[${requestId}] 原始自定义headers:`, options.headers);
      
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'content-type' && lowerKey !== 'accept') {
            headers[key] = value;
          }
        });
      } else if (typeof options.headers === 'object' && options.headers !== null) {
        const customHeaders = options.headers as Record<string, unknown>;
        Object.entries(customHeaders).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey !== 'content-type' && lowerKey !== 'accept' && value != null) {
            headers[key] = String(value);
          }
        });
      }
    }
    
    // 4. 调试：显示最终的headers
    console.log(`[${requestId}] 最终headers:`, headers);
    console.log(`[${requestId}] 请求体:`, requestBody);
    
    // 5. 发起网络请求 - 使用最简单的配置
    console.log(`[${requestId}] 正在发送请求...`);
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: requestBody,
      credentials: options?.credentials || 'include',
      cache: options?.cache || 'no-cache',
      redirect: options?.redirect || 'follow',
      referrer: options?.referrer,
      referrerPolicy: options?.referrerPolicy,
      mode: options?.mode || 'cors',
      signal: options?.signal
    });
    
    // 调试：显示响应状态
    console.log(`[${requestId}] 响应状态:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 6. 处理响应
    if (!response.ok) {
      // 尝试解析错误响应
      let errorText = '';
      try {
        errorText = await response.text();
        console.error(`[${requestId}] 错误响应文本:`, errorText);
      } catch (e) {
        console.error(`[${requestId}] 解析错误响应失败:`, e);
      }
      
      throw new Error(errorText || `请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[${requestId}] 请求成功，响应数据:`, data);
    console.log(`=== [API Request] ${requestId} 完成 ===`);
    
    return data;
  } catch (error: any) {
    console.error(`[${requestId}] 请求失败 - 异常:`, error);
    console.error(`[${requestId}] 异常详情:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // 处理网络错误
    if (error.name === 'TypeError') {
      throw new Error('网络连接失败，请检查服务器是否正在运行');
    }
    throw error;
  }
};

// 认证相关API
export const authApi = {
  // 用户登录
  login: (username: string, password: string) => {
    return request<{
      token: string;
      type: string;
      id: number;
      username: string;
      email: string;
      nickname: string;
      avatar: string;
      isFirstLogin?: boolean;
      worlds?: Array<{
        id: number;
        name: string;
        description: string;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // 用户注册
  register: (username: string, email: string, password: string, nickname?: string, inviteCode?: string) => {
    return request<{
      token: string;
      type: string;
      id: number;
      username: string;
      email: string;
      nickname: string;
      avatar: string;
      isFirstLogin?: boolean;
      worlds?: Array<{
        id: number;
        name: string;
        description: string;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, nickname: nickname || username, inviteCode }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // 检查是否需要邀请码
  isInviteCodeRequired: () => {
    return request<{ inviteCodeRequired: boolean }>('/auth/invite-code-required');
  },

  // 获取当前用户信息
  getCurrentUser: (token: string) => {
    return request<{
      id: number;
      username: string;
      email: string;
      nickname: string;
      avatar: string;
    }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// 微信登录API
export const wechatApi = {
  // 获取微信登录二维码URL
  getQrCodeUrl: () => {
    return request<{
      qrCodeUrl: string;
      state: string;
    }>('/wechat/qr-code');
  },

  // 检查登录状态
  checkStatus: (state: string) => {
    return request<{
      status: 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error';
      token?: string;
      userId?: number;
      username?: string;
      nickname?: string;
      avatar?: string;
      isFirstLogin?: boolean;
      worlds?: Array<{
        id: number;
        name: string;
        description: string;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>;
      error?: string;
    }>(`/wechat/status/${state}`);
  },

  // 获取微信AppID（兼容旧接口）
  getAppId: () => {
    return request<{ appid: string }>('/wechat/appid');
  },
};

// 世界相关API
export const worldApi = {
  // 获取所有世界
  getAllWorlds: (token: string) => {
    return request<Array<{
      id: number;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    }>>('/worlds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取单个世界
  getWorldById: (id: number, token: string) => {
    return request<{
      id: number;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    }>(`/worlds/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 创建世界
  createWorld: (name: string, description: string, token: string) => {
    return request<{
      id: number;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    }>('/worlds', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 更新世界
  updateWorld: (id: number, name: string, description: string, token: string) => {
    return request<{
      id: number;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
    }>(`/worlds/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 删除世界
  deleteWorld: (id: number, token: string) => {
    return request<void>(`/worlds/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// 记录相关API
export const journalApi = {
  // 获取所有记录
  getAllJournalEntries: (token: string) => {
    console.log("[journalApi] 开始获取日志列表");
    try {
      const result = request<Array<{
        id: string;
        title: string;
        content: string;
        entryDate: string;
        worldId?: number;
        eraId?: number;
        characterId?: number;
        createdAt: string;
        updatedAt: string;
      }>>('/journal-entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[journalApi] 获取日志列表请求已发送");
      return result;
    } catch (error) {
      console.error("[journalApi] 获取日志列表失败:", error);
      throw error;
    }
  },

  // 获取单个记录
  getJournalEntryById: (id: string, token: string) => {
    console.log(`[journalApi] 开始获取日志记录，ID: ${id}`);
    try {
      const result = request<{
        id: string;
        title: string;
        content: string;
        entryDate: string;
        worldId?: number;
        eraId?: number;
        characterId?: number;
        createdAt: string;
        updatedAt: string;
      }>(`/journal-entries/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[journalApi] 获取日志记录请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[journalApi] 获取日志记录失败，ID: ${id}`, error);
      throw error;
    }
  },

  // 创建记录
  createJournalEntry: async (data: {
    title: string;
    content: string;
    entryDate?: string;
    worldId?: number;
    eraId?: number;
    characterId?: number;
  }, token: string) => {
    console.log("[journalApi] 开始创建新日志");
    console.log("[journalApi] 创建日志参数:", {
      title: data.title,
      contentLength: data.content.length,
      entryDate: data.entryDate
    });
    
    try {
      // 确保data是一个有效的对象
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data provided to createJournalEntry");
      }
      
      // 确保title和content存在
      if (!data.title || !data.content) {
        throw new Error("Title and content are required fields");
      }
      
      // 构建requestOptions - 将data转换为JSON字符串
      const requestOptions: RequestInit = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      console.log("[journalApi] 调用request函数");
      console.log("[journalApi] requestOptions:", {
        method: requestOptions.method,
        hasBody: !!requestOptions.body,
        bodyType: typeof requestOptions.body,
        isObject: typeof requestOptions.body === 'object',
        headers: requestOptions.headers,
      });
      
      const result = await request<{
        id: string;
        title: string;
        content: string;
        entryDate: string;
        worldId?: number;
        eraId?: number;
        characterId?: number;
        createdAt: string;
        updatedAt: string;
      }>('/journal-entries', requestOptions);
      
      console.log("[journalApi] 创建日志成功");
      console.log("[journalApi] 创建日志结果:", {
        id: result.id,
        title: result.title,
        contentLength: result.content.length,
        entryDate: result.entryDate
      });
      
      return result;
    } catch (error) {
      console.error("[journalApi] 创建日志失败:", error);
      console.error("[journalApi] 错误详情:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  },

  // 更新记录
  updateJournalEntry: (id: string, data: {
    title: string;
    content: string;
    entryDate?: string;
    tags?: string;
    worldId?: number;
    eraId?: number;
    characterId?: number;
  }, token: string) => {
    console.log("[journalApi] 开始更新日志");
    console.log("[journalApi] 更新日志参数:", {
      id: id,
      title: data.title,
      contentLength: data.content.length,
      entryDate: data.entryDate
    });
    try {
      const result = request<{
        id: string;
        title: string;
        content: string;
        entryDate: string;
        worldId?: number;
        eraId?: number;
        characterId?: number;
        createdAt: string;
        updatedAt: string;
      }>(`/journal-entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[journalApi] 更新日志请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[journalApi] 更新日志失败，ID: ${id}`, error);
      throw error;
    }
  },

  // 删除记录
  deleteJournalEntry: (id: string, token: string) => {
    console.log("[journalApi] 开始删除日志");
    console.log("[journalApi] 删除日志ID:", id);
    try {
      const result = request<void>(`/journal-entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[journalApi] 删除日志请求已发送，ID: ${id}`);
      return result;
    } catch (error) {
      console.error(`[journalApi] 删除日志失败，ID: ${id}`, error);
      throw error;
    }
  },
};

// 时代相关API
export const eraApi = {
  // 获取所有时代
  getAllEras: (token: string) => {
    return request<Array<{
      id: number;
      name: string;
      description: string;
      startYear: number | null;
      endYear: number | null;
      imageUrl: string | null;
      worldId: number;
      userId: number;
      createdAt: string;
      updatedAt: string;
    }>>('/eras', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取指定世界的所有时代
  getErasByWorldId: (worldId: number, token: string) => {
    return request<Array<{
      id: number;
      name: string;
      description: string;
      startYear: number | null;
      endYear: number | null;
      imageUrl: string | null;
      worldId: number;
      userId: number;
      createdAt: string;
      updatedAt: string;
    }>>(`/eras/world/${worldId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 创建时代
  createEra: (data: {
    name: string;
    description: string;
    startYear?: number;
    endYear?: number;
    worldId: number;
    imageUrl?: string;
  }, token: string) => {
    return request<{
      id: number;
      name: string;
      description: string;
      startYear: number | null;
      endYear: number | null;
      imageUrl: string | null;
      worldId: number;
      createdAt: string;
      updatedAt: string;
    }>('/eras', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 更新时代
  updateEra: (id: number, data: {
    name: string;
    description: string;
    startYear?: number;
    endYear?: number;
    worldId: number;
    imageUrl?: string;
  }, token: string) => {
    return request<{
      id: number;
      name: string;
      description: string;
      startYear: number | null;
      endYear: number | null;
      imageUrl: string | null;
      worldId: number;
      createdAt: string;
      updatedAt: string;
    }>(`/eras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 删除时代
  deleteEra: (id: number, token: string) => {
    return request<void>(`/eras/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// 角色相关API
export const characterApi = {
  // 获取所有角色
  getAllCharacters: (token: string) => {
    console.log("========== [characterApi] 获取所有角色 ==========");
    console.log("[characterApi] 请求参数: token存在=" + !!token);
    try {
      const result = request<Array<{
      id: number;
      name: string;
      description: string;
      age: number;
      gender: string;
      role: string;
      bio: string;
      avatarUrl: string;
      backgroundUrl: string;
      themeColor: string;
      colorAccent: string;
      firstMessage: string;
      systemInstruction: string;
      voiceName: string;
      mbti: string;
      tags: string;
      speechStyle: string;
      catchphrases: string;
      secrets: string;
      motivations: string;
      relationships: string;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>>('/characters', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("[characterApi] 获取所有角色请求已发送");
    return result;
    } catch (error) {
      console.error("[characterApi] 获取所有角色失败:", error);
      throw error;
    }
  },

  // 获取指定世界的所有角色
  getCharactersByWorldId: (worldId: number, token: string) => {
    console.log(`========== [characterApi] 获取世界的角色 ========== WorldID: ${worldId}`);
    console.log(`[characterApi] 请求参数: worldId=${worldId}, token存在=${!!token}`);
    try {
      const result = request<Array<{
      id: number;
      name: string;
      description: string;
      age: number;
      gender: string;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>>(`/characters/world/${worldId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[characterApi] 获取世界角色请求已发送，WorldID: ${worldId}`);
    return result;
    } catch (error) {
      console.error(`[characterApi] 获取世界角色失败，WorldID: ${worldId}`, error);
      throw error;
    }
  },

  // 获取指定时代的所有角色
  getCharactersByEraId: (eraId: number, token: string) => {
    return request<Array<{
      id: number;
      name: string;
      description: string;
      age: number;
      gender: string;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>>(`/characters/era/${eraId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 创建角色
  createCharacter: (data: {
    name: string;
    description: string;
    age?: number;
    gender?: string;
    worldId: number;
    eraId?: number;
  }, token: string) => {
    console.log("========== [characterApi] 创建角色 ==========");
    console.log("[characterApi] 请求参数:", {
      name: data.name,
      worldId: data.worldId,
      eraId: data.eraId,
      role: (data as any).role,
      age: data.age,
      token存在: !!token
    });
    try {
      const result = request<{
      id: number;
      name: string;
      description: string;
      age: number;
      gender: string;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>('/characters', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("[characterApi] 创建角色请求已发送");
    return result;
    } catch (error) {
      console.error("[characterApi] 创建角色失败:", error);
      throw error;
    }
  },

  // 更新角色
  updateCharacter: (id: number, data: {
    name: string;
    description: string;
    age?: number;
    gender?: string;
    worldId: number;
    eraId?: number;
  }, token: string) => {
    console.log(`========== [characterApi] 更新角色 ========== ID: ${id}`);
    console.log("[characterApi] 请求参数:", {
      id: id,
      name: data.name,
      worldId: data.worldId,
      eraId: data.eraId,
      role: (data as any).role,
      age: data.age,
      token存在: !!token
    });
    try {
      const result = request<{
      id: number;
      name: string;
      description: string;
      age: number;
      gender: string;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[characterApi] 更新角色请求已发送，ID: ${id}`);
    return result;
    } catch (error) {
      console.error(`[characterApi] 更新角色失败，ID: ${id}`, error);
      throw error;
    }
  },

  // 删除角色
  deleteCharacter: (id: number, token: string) => {
    console.log(`========== [characterApi] 删除角色 ========== ID: ${id}`);
    console.log(`[characterApi] 请求参数: id=${id}, token存在=${!!token}`);
    try {
      const result = request<void>(`/characters/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`[characterApi] 删除角色请求已发送，ID: ${id}`);
    return result;
    } catch (error) {
      console.error(`[characterApi] 删除角色失败，ID: ${id}`, error);
      throw error;
    }
  },
};

// 剧本相关API
export const scriptApi = {
  // 获取所有剧本
  getAllScripts: (token: string) => {
    return request<Array<{
      id: number;
      title: string;
      content: string;
      sceneCount: number;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>>('/scripts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取指定世界的所有剧本
  getScriptsByWorldId: (worldId: number, token: string) => {
    return request<Array<{
      id: number;
      title: string;
      content: string;
      sceneCount: number;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>>(`/scripts/world/${worldId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取指定时代的所有剧本
  getScriptsByEraId: (eraId: number, token: string) => {
    return request<Array<{
      id: number;
      title: string;
      content: string;
      sceneCount: number;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>>(`/scripts/era/${eraId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 创建剧本
  createScript: (data: {
    title: string;
    content: string;
    sceneCount?: number;
    worldId: number;
    eraId?: number;
  }, token: string) => {
    return request<{
      id: number;
      title: string;
      content: string;
      sceneCount: number;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>('/scripts', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 更新剧本
  updateScript: (id: number, data: {
    title: string;
    content: string;
    sceneCount?: number;
    worldId: number;
    eraId?: number;
  }, token: string) => {
    return request<{
      id: number;
      title: string;
      content: string;
      sceneCount: number;
      worldId: number;
      eraId: number;
      createdAt: string;
      updatedAt: string;
    }>(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 删除剧本
  deleteScript: (id: number, token: string) => {
    return request<void>(`/scripts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};



// 存储和获取token
export const tokenStorage = {
  // 保存token
  saveToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  // 获取token
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  // 移除token
  removeToken: () => {
    localStorage.removeItem('auth_token');
  },
};

// 图片上传API
// 回收站 API
export const recycleBinApi = {
  // 获取回收站数据
  getRecycleBin: (token: string) => {
    return request<{
      characters: Array<any>;
      worlds: Array<any>;
      eras: Array<any>;
      scripts: Array<any>;
    }>('/recycle-bin', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 恢复角色
  restoreCharacter: (id: number, token: string) => {
    return request<void>(`/recycle-bin/characters/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 恢复世界
  restoreWorld: (id: number, token: string) => {
    return request<void>(`/recycle-bin/worlds/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 恢复时代
  restoreEra: (id: number, token: string) => {
    return request<void>(`/recycle-bin/eras/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 恢复剧本
  restoreScript: (id: number, token: string) => {
    return request<void>(`/recycle-bin/scripts/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 永久删除角色
  permanentlyDeleteCharacter: (id: number, token: string) => {
    return request<void>(`/recycle-bin/characters/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 永久删除世界
  permanentlyDeleteWorld: (id: number, token: string) => {
    return request<void>(`/recycle-bin/worlds/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 永久删除时代
  permanentlyDeleteEra: (id: number, token: string) => {
    return request<void>(`/recycle-bin/eras/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 永久删除剧本
  permanentlyDeleteScript: (id: number, token: string) => {
    return request<void>(`/recycle-bin/scripts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export const imageApi = {
  // 上传图片文件
  uploadImage: (file: File, category: string = 'general', token?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<{
      success: boolean;
      url: string;
      message: string;
      error?: string;
    }>('/images/upload', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  },

  // 上传Base64图片
  uploadBase64Image: (base64Data: string, category: string = 'general', token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<{
      success: boolean;
      url: string;
      message: string;
      error?: string;
    }>('/images/upload-base64', {
      method: 'POST',
      body: JSON.stringify({ base64: base64Data, category }),
      headers: headers,
    });
  },

  // 删除图片
  deleteImage: (imageUrl: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<{
      success: boolean;
      message: string;
      error?: string;
    }>(`/images/delete?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
      headers: headers,
    });
  },
};
