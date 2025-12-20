// API服务，用于处理与后端的通信
// 注意：此文件正在逐步迁移到模块化结构（services/api/）
// 新的API模块位于 services/api/ 目录下

// 从新模块导入API（已完成迁移）
// 场景模块
export { eraApi } from './api/scene';
export type { SystemEra, UserEra, CreateEraDTO, UpdateEraDTO } from './api/scene/types';

// 角色模块
export { characterApi } from './api/character';
export type { SystemCharacter, UserCharacter, CreateCharacterDTO, UpdateCharacterDTO } from './api/character/types';

// 剧本模块
export { scriptApi, presetScriptApi, systemScriptApi } from './api/script';
export type { UserScript, SystemScript, CreateScriptDTO, UpdateScriptDTO } from './api/script/types';

// 主线剧情模块
export { userMainStoryApi, presetMainStoryApi, systemMainStoryApi } from './api/mainStory';
export type { UserMainStory, SystemMainStory, CreateUserMainStoryDTO, UpdateUserMainStoryDTO } from './api/mainStory/types';

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

  // 系统场景管理
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

  // 系统主线剧情管理
  mainStories: {
    getAll: (token: string) => {
      return request<Array<{
        id: number;
        systemEraId: number;
        systemEraName: string | null;
        name: string;
        age: number | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        isActive: boolean;
        sortOrder: number;
      }>>('/admin/system/main-stories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        systemEraId: number;
        systemEraName: string | null;
        name: string;
        age: number | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        isActive: boolean;
        sortOrder: number;
      }>(`/admin/system/main-stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getByEraId: (eraId: number, token: string) => {
      return request<{
        id: number;
        systemEraId: number;
        systemEraName: string | null;
        name: string;
        age: number | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        isActive: boolean;
        sortOrder: number;
      }>(`/admin/system/main-stories/era/${eraId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (data: any, token: string) => {
      return request<{
        id: number;
        systemEraId: number;
        systemEraName: string | null;
        name: string;
        age: number | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        isActive: boolean;
        sortOrder: number;
      }>('/admin/system/main-stories', {
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
        systemEraId: number;
        systemEraName: string | null;
        name: string;
        age: number | null;
        role: string | null;
        bio: string | null;
        avatarUrl: string | null;
        backgroundUrl: string | null;
        themeColor: string | null;
        colorAccent: string | null;
        firstMessage: string | null;
        systemInstruction: string | null;
        voiceName: string | null;
        tags: string | null;
        speechStyle: string | null;
        catchphrases: string | null;
        secrets: string | null;
        motivations: string | null;
        isActive: boolean;
        sortOrder: number;
      }>(`/admin/system/main-stories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/main-stories/${id}`, {
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
    getEmailVerificationRequired: (token: string) => {
      return request<{ emailVerificationRequired: boolean }>('/admin/system/config/email-verification-required', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setEmailVerificationRequired: (required: boolean, token: string) => {
      return request<{ emailVerificationRequired: boolean }>('/admin/system/config/email-verification-required', {
        method: 'PUT',
        body: JSON.stringify({ emailVerificationRequired: required }),
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
    getWechatPayConfig: (token: string) => {
      return request<{ appId: string; mchId: string; apiKey: string; apiV3Key: string; certPath: string; notifyUrl: string }>('/admin/system/config/wechat-pay', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setWechatPayConfig: (config: { appId?: string; mchId?: string; apiKey?: string; apiV3Key?: string; certPath?: string; notifyUrl?: string }, token: string) => {
      return request<{ appId: string; mchId: string; apiKey: string; apiV3Key: string; certPath: string; notifyUrl: string }>('/admin/system/config/wechat-pay', {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    getAlipayConfig: (token: string) => {
      return request<{ appId: string; privateKey: string; publicKey: string; gatewayUrl: string; notifyUrl: string; returnUrl: string }>('/admin/system/config/alipay', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setAlipayConfig: (config: { appId?: string; privateKey?: string; publicKey?: string; gatewayUrl?: string; notifyUrl?: string; returnUrl?: string }, token: string) => {
      return request<{ appId: string; privateKey: string; publicKey: string; gatewayUrl: string; notifyUrl: string; returnUrl: string }>('/admin/system/config/alipay', {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    getGuideConfigLink: (token: string) => {
      return request<{ link: string }>('/admin/system/config/guide-link', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setGuideConfigLink: (link: string, token: string) => {
      return request<{ link: string }>('/admin/system/config/guide-link', {
        method: 'PUT',
        body: JSON.stringify({ link }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    getEmailConfig: (token: string) => {
      return request<{ host: string; port: string; username: string; password: string; from: string }>('/admin/system/config/email', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setEmailConfig: (config: { host?: string; port?: string; username?: string; password?: string; from?: string }, token: string) => {
      return request<{ host: string; port: string; username: string; password: string; from: string }>('/admin/system/config/email', {
        method: 'PUT',
        body: JSON.stringify(config),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    getNotionConfig: (token: string) => {
      return request<{ clientId: string; clientSecret: string; redirectUri: string; syncButtonEnabled: boolean }>('/admin/system/config/notion', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    setNotionConfig: (config: { clientId?: string; clientSecret?: string; redirectUri?: string; syncButtonEnabled?: boolean }, token: string) => {
      return request<{ clientId: string; clientSecret: string; redirectUri: string; syncButtonEnabled: boolean }>('/admin/system/config/notion', {
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
    matchAndUpdate: (token: string) => {
      return request<{
        eraMatchedCount: number;
        characterAvatarMatchedCount: number;
        characterBackgroundMatchedCount: number;
        eraMatched: string[];
        characterMatched: string[];
        eraNotFound: string[];
        characterNotFound: string[];
        totalEras: number;
        totalCharacters: number;
      }>('/admin/system/resources/match-and-update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },

  // 用户剧本管理（管理员专用）
  scripts: {
    getAll: (token: string) => {
      return request<Array<{
        id: number;
        title: string;
        content: string;
        sceneCount: number;
        worldId: number;
        eraId: number;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>>('/admin/system/scripts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        title: string;
        content: string;
        sceneCount: number;
        worldId: number;
        eraId: number;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/scripts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (data: {
      title: string;
      content: string;
      sceneCount?: number;
      worldId: number;
      eraId?: number;
      userId: number;
    }, token: string) => {
      return request<{
        id: number;
        title: string;
        content: string;
        sceneCount: number;
        worldId: number;
        eraId: number;
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>('/admin/system/scripts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: {
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
        userId: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/scripts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/scripts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },

  // 订阅计划管理
  subscriptionPlans: {
    getAll: async (token: string) => {
      try {
        return await request<Array<{
          id: number;
          name: string;
          type: string;
          billingCycle: string;
          price: number;
          originalPrice?: number;
          discountPercent?: number;
          pointsPerMonth: number;
          maxImagesPerMonth?: number;
          maxVideosPerMonth?: number;
          maxTextGenerationsPerMonth?: number;
          maxAudioGenerationsPerMonth?: number;
          allowedAiModels?: string;
          maxImageResolution?: string;
          maxVideoDuration?: number;
          allowPriorityQueue: boolean;
          allowWatermarkRemoval: boolean;
          allowBatchProcessing: boolean;
          allowApiAccess: boolean;
          maxApiCallsPerDay?: number;
          aiBenefits?: string;
          features?: string;
          isActive: boolean;
          sortOrder: number;
          createdAt: string;
          updatedAt: string;
        }>>('/admin/system/subscription-plans', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err: any) {
        // 如果是404错误，说明端点未实现，静默返回空数组
        const errorMessage = err?.message || err?.toString() || '';
        if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
          // 静默处理，不输出错误日志
          return [];
        }
        // 其他错误也返回空数组，避免阻塞其他数据加载
        console.warn('[API] 订阅计划加载失败:', errorMessage);
        return [];
      }
    },
    getById: (id: number, token: string) => {
      return request<{
        id: number;
        name: string;
        type: string;
        billingCycle: string;
        price: number;
        originalPrice?: number;
        discountPercent?: number;
        pointsPerMonth: number;
        maxImagesPerMonth?: number;
        maxVideosPerMonth?: number;
        maxTextGenerationsPerMonth?: number;
        maxAudioGenerationsPerMonth?: number;
        allowedAiModels?: string;
        maxImageResolution?: string;
        maxVideoDuration?: number;
        allowPriorityQueue: boolean;
        allowWatermarkRemoval: boolean;
        allowBatchProcessing: boolean;
        allowApiAccess: boolean;
        maxApiCallsPerDay?: number;
        aiBenefits?: string;
        features?: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/subscription-plans/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    create: (data: any, token: string) => {
      return request<{
        id: number;
        name: string;
        type: string;
        billingCycle: string;
        price: number;
        originalPrice?: number;
        discountPercent?: number;
        pointsPerMonth: number;
        maxImagesPerMonth?: number;
        maxVideosPerMonth?: number;
        maxTextGenerationsPerMonth?: number;
        maxAudioGenerationsPerMonth?: number;
        allowedAiModels?: string;
        maxImageResolution?: string;
        maxVideoDuration?: number;
        allowPriorityQueue: boolean;
        allowWatermarkRemoval: boolean;
        allowBatchProcessing: boolean;
        allowApiAccess: boolean;
        maxApiCallsPerDay?: number;
        aiBenefits?: string;
        features?: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>('/admin/system/subscription-plans', {
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
        type: string;
        billingCycle: string;
        price: number;
        originalPrice?: number;
        discountPercent?: number;
        pointsPerMonth: number;
        maxImagesPerMonth?: number;
        maxVideosPerMonth?: number;
        maxTextGenerationsPerMonth?: number;
        maxAudioGenerationsPerMonth?: number;
        allowedAiModels?: string;
        maxImageResolution?: string;
        maxVideoDuration?: number;
        allowPriorityQueue: boolean;
        allowWatermarkRemoval: boolean;
        allowBatchProcessing: boolean;
        allowApiAccess: boolean;
        maxApiCallsPerDay?: number;
        aiBenefits?: string;
        features?: string;
        isActive: boolean;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
      }>(`/admin/system/subscription-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`/admin/system/subscription-plans/${id}`, {
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
  
  // 检查是否是 subscription-plans 的请求（用于静默处理404）
  const isSubscriptionPlansRequest = url.includes('/subscription-plans');
  
  // 日志记录（对于 subscription-plans 的请求，静默处理）
  if (!isSubscriptionPlansRequest) {
    console.log(`=== [API Request] ${requestId} 开始 ===`);
    console.log(`[${requestId}] 基本信息:`, {
      url: fullUrl,
      method: method,
      hasBody: !!options?.body,
      timestamp: new Date().toISOString()
    });
  }
  
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
      if (!isSubscriptionPlansRequest) {
        console.log(`[${requestId}] 原始自定义headers:`, options.headers);
      }
      
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
    
    // 4. 调试：显示最终的headers（对于 subscription-plans 的请求，静默处理）
    if (!isSubscriptionPlansRequest) {
      console.log(`[${requestId}] 最终headers:`, headers);
      console.log(`[${requestId}] 请求体:`, requestBody);
      console.log(`[${requestId}] 正在发送请求...`);
    }
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
    
    // 调试：显示响应状态（对于 subscription-plans 的 404 错误，静默处理）
    if (!(isSubscriptionPlansRequest && response.status === 404)) {
      console.log(`[${requestId}] 响应状态:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    // 6. 处理响应
    if (!response.ok) {
      // 尝试解析错误响应
      let errorText = '';
      let errorMessage = '';
      try {
        errorText = await response.text();
        
        // 对于 subscription-plans 的 404 错误，静默处理（不输出错误日志）
        const isSubscriptionPlans404 = response.status === 404 && url.includes('/subscription-plans');
        if (!isSubscriptionPlans404) {
          console.error(`[${requestId}] 错误响应文本:`, errorText);
        }
        
        // 尝试解析JSON错误响应
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          // 如果不是JSON，直接使用文本
          errorMessage = errorText;
        }
      } catch (e) {
        if (!(response.status === 404 && url.includes('/subscription-plans'))) {
          console.error(`[${requestId}] 解析错误响应失败:`, e);
        }
      }
      
      // 对于 subscription-plans 的 404，直接抛出错误让调用方处理
      if (response.status === 404 && url.includes('/subscription-plans')) {
        throw new Error('Not Found');
      }
      
      // 根据状态码提供更友好的错误信息
      if (response.status === 403) {
        errorMessage = errorMessage || '权限不足：您没有权限执行此操作';
      } else if (response.status === 404) {
        errorMessage = errorMessage || '资源不存在或已被删除';
      } else if (response.status === 401) {
        errorMessage = errorMessage || '未授权：请重新登录';
        // 清除认证 token
        console.warn('[API] 检测到 token 验证失败，清除本地 token');
        localStorage.removeItem('auth_token');
        // 如果是管理后台相关的请求，清除 admin token
        if (url.includes('/admin/')) {
          localStorage.removeItem('admin_token');
          // 触发自定义事件，通知 AdminScreen 清除 token
          window.dispatchEvent(new CustomEvent('admin-token-expired'));
        }
        // 触发自定义事件，通知应用需要重新登录
        window.dispatchEvent(new CustomEvent('auth-token-expired'));
      } else if (response.status === 500) {
        errorMessage = errorMessage || '服务器内部错误，请稍后重试';
        // 如果是管理后台相关的请求且错误信息包含 token 验证失败，清除 admin token
        if (url.includes('/admin/') && (errorText.includes('token') || errorText.includes('Token') || errorText.includes('JWT'))) {
          console.warn('[API] 检测到管理后台 token 验证失败（500错误），清除本地 token');
          localStorage.removeItem('admin_token');
          window.dispatchEvent(new CustomEvent('admin-token-expired'));
        }
      } else {
        errorMessage = errorMessage || `请求失败: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // 检查响应是否有内容（204 No Content 等状态码没有响应体）
    const responseContentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // 如果是 204 No Content，直接返回（不尝试读取响应体）
    if (response.status === 204) {
      console.log(`[${requestId}] 请求成功，无响应体 (204 No Content)`);
      console.log(`=== [API Request] ${requestId} 完成 ===`);
      return undefined;
    }

    // 尝试读取响应体
    const text = await response.text();
    
    // 如果响应体为空，直接返回
    if (!text || text.trim() === '') {
      console.log(`[${requestId}] 请求成功，响应体为空`);
      console.log(`=== [API Request] ${requestId} 完成 ===`);
      return undefined;
    }

    // 检查内容类型是否为 JSON，或者尝试解析为 JSON
    if (responseContentType && responseContentType.includes('application/json')) {
      try {
        const data = JSON.parse(text);
        console.log(`[${requestId}] 请求成功，响应数据:`, data);
        
        // 如果响应是 ApiResponse 格式（包含 code, message, data），提取 data 部分
        if (data && typeof data === 'object' && 'data' in data && 'code' in data) {
          console.log(`[${requestId}] 检测到 ApiResponse 格式，提取 data 字段`);
          console.log(`[${requestId}] ApiResponse code:`, data.code, 'message:', data.message);
          console.log(`[${requestId}] ApiResponse data:`, data.data);
          console.log(`=== [API Request] ${requestId} 完成 ===`);
          return data.data;
        }
        
        console.log(`=== [API Request] ${requestId} 完成 ===`);
        return data;
      } catch (e) {
        // JSON 解析失败，返回文本
        console.warn(`[${requestId}] JSON 解析失败，返回文本:`, e);
        console.log(`[${requestId}] 请求成功，响应文本:`, text);
        console.log(`=== [API Request] ${requestId} 完成 ===`);
        return text;
      }
    } else {
      // 非 JSON 响应，返回文本
      console.log(`[${requestId}] 请求成功，响应文本:`, text);
      console.log(`=== [API Request] ${requestId} 完成 ===`);
      return text;
    }
  } catch (error: any) {
    // 对于 subscription-plans 的 404 错误，静默处理（不输出错误日志）
    const isSubscriptionPlans404 = error?.message?.includes('Not Found') && url.includes('/subscription-plans');
    if (!isSubscriptionPlans404) {
      console.error(`[${requestId}] 请求失败 - 异常:`, error);
      console.error(`[${requestId}] 异常详情:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    
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
  register: (username: string, email: string, password: string, nickname?: string, inviteCode?: string, emailVerificationCode?: string) => {
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
      body: JSON.stringify({ 
        username, 
        email, 
        password, 
        nickname: nickname || username, 
        inviteCode,
        emailVerificationCode 
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // 发送邮箱验证码
  sendEmailVerificationCode: (email: string) => {
    return request<{ message: string }>('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // 验证邮箱验证码
  verifyEmailCode: (email: string, code: string) => {
    return request<{ message: string }>('/auth/email/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // 检查是否需要邀请码
  isInviteCodeRequired: () => {
    return request<{ inviteCodeRequired: boolean }>('/auth/invite-code-required');
  },

  // 检查是否需要邮箱验证
  isEmailVerificationRequired: () => {
    return request<{ emailVerificationRequired: boolean }>('/auth/email-verification-required');
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

  // 恢复场景
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

  // 永久删除场景
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

// 会员相关API
export const membershipApi = {
  // 获取当前用户的会员信息
  getCurrent: (token: string) => {
    return request<{
      id: number;
      planType: string;
      billingCycle: string;
      status: string;
      startDate: string;
      endDate: string | null;
      autoRenew: boolean;
      nextRenewalDate: string | null;
      currentPoints: number;
      totalPointsEarned: number;
      totalPointsUsed: number;
    }>('/membership/current', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取所有订阅计划
  getPlans: (billingCycle?: string, token?: string) => {
    const url = billingCycle 
      ? `/membership/plans?billingCycle=${billingCycle}`
      : '/membership/plans';
    return request<Array<{
      id: number;
      name: string;
      type: string;
      billingCycle: string;
      price: number;
      originalPrice: number | null;
      discountPercent: number | null;
      pointsPerMonth: number;
      maxImagesPerMonth: number | null;
      maxVideosPerMonth: number | null;
      features: string;
    }>>(url, {
      headers: token ? {
        Authorization: `Bearer ${token}`,
      } : undefined,
    });
  },
};

// 支付相关API
// 资源API - 供普通用户使用（不需要管理员权限）
export const resourceApi = {
  // 获取所有资源（按分类筛选）
  getAll: (category?: string, token: string) => {
    const url = category ? `/resources?category=${category}` : '/resources';
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
      updatedAt: string;
    }>>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  // 根据ID获取资源详情
  getById: (id: number, token: string) => {
    return request<{
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
      updatedAt: string;
    }>(`/resources/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// 笔记同步相关API
export const noteSyncApi = {
  // 获取 Notion 授权URL
  getNotionAuthUrl: (callbackUrl: string, token: string) => {
    return request<{
      authorizationUrl: string;
      state: string;
    }>(`/notes/notion/authorize?callbackUrl=${encodeURIComponent(callbackUrl)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 更新 Notion 数据库 ID
  updateNotionDatabaseId: (databaseId: string, token: string) => {
    return request<{
      databaseId: string;
      message: string;
    }>('/notes/syncs/notion/database-id', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ databaseId }),
    });
  },

  // 获取笔记同步配置列表
  getSyncs: (token: string) => {
    return request<Array<{
      id: number;
      userId: number;
      provider: string;
      isActive: boolean;
      lastSyncAt: string | null;
      syncStatus: string | null;
      syncError: string | null;
      createdAt: string;
      updatedAt: string;
    }>>('/notes/syncs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取指定provider的同步状态
  getSyncStatus: (provider: string, token: string) => {
    return request<{
      authorized: boolean;
      lastSyncAt?: string;
      syncStatus?: string;
    }>(`/notes/syncs/${provider}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 同步笔记
  syncNotes: (provider: string, token: string) => {
    return request<{
      success: boolean;
      syncedCount: number;
      error: string | null;
    }>(`/notes/syncs/${provider}/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 撤销授权
  revokeAuthorization: (provider: string, token: string) => {
    return request<void>(`/notes/syncs/${provider}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 获取笔记列表
  getNotes: (provider?: string, token?: string) => {
    const url = provider ? `/notes?provider=${provider}` : '/notes';
    return request<Array<{
      id: number;
      userId: number;
      provider: string;
      providerNoteId: string;
      title: string;
      content: string;
      contentType: string | null;
      notebookName: string | null;
      tags: string | null;
      url: string | null;
      createdAtProvider: string | null;
      updatedAtProvider: string | null;
      createdAt: string;
      updatedAt: string;
    }>>(url, {
      headers: token ? {
        Authorization: `Bearer ${token}`,
      } : undefined,
    });
  },

  // 获取单个笔记详情
  getNoteById: (id: number, token: string) => {
    return request<{
      id: number;
      userId: number;
      provider: string;
      providerNoteId: string;
      title: string;
      content: string;
      contentType: string | null;
      notebookName: string | null;
      tags: string | null;
      url: string | null;
      createdAtProvider: string | null;
      updatedAtProvider: string | null;
      createdAt: string;
      updatedAt: string;
    }>(`/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export const paymentApi = {
  // 创建支付订单
  createOrder: (planId: number, paymentType: 'wechat' | 'alipay', token: string) => {
    return request<{
      orderNo: string;
      amount: number;
      paymentType: string;
      status: string;
      qrCodeUrl: string | null;
      paymentUrl: string | null;
      expiresAt: string;
    }>('/payment/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, paymentType }),
    });
  },

  // 查询订单状态
  getOrder: (orderNo: string, token: string) => {
    return request<{
      orderNo: string;
      amount: number;
      paymentType: string;
      status: string;
      qrCodeUrl: string | null;
      paymentUrl: string | null;
      expiresAt: string;
      paidAt: string | null;
    }>(`/payment/order/${orderNo}`, {
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
