// utils/api.js
// 微信小程序 API 服务

const API_BASE_URL = 'https://your-backend-domain.com/api'; // 请替换为实际的后端地址

// 通用请求函数
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('auth_token') || '';
    
    wx.request({
      url: API_BASE_URL + url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 认证 API
export const authApi = {
  // 密码登录
  login: (phoneNumber, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password })
    });
  },

  // 微信登录
  wechatLogin: (code) => {
    return request('/auth/wechat/login', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  // 注册
  register: (phoneNumber, password, nickname) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password, nickname })
    });
  },

  // 获取当前用户
  getCurrentUser: (token) => {
    return request('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// 日记 API
export const journalApi = {
  // 获取所有日记
  getAllJournalEntries: (token) => {
    return request('/journals', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 创建日记
  createJournalEntry: (token, data) => {
    return request('/journals', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 更新日记
  updateJournalEntry: (token, id, data) => {
    return request(`/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 删除日记
  deleteJournalEntry: (token, id) => {
    return request(`/journals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// 世界 API
export const worldApi = {
  // 获取所有世界
  getAllWorlds: (token) => {
    return request('/worlds', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// 场景 API
export const eraApi = {
  // 获取所有场景
  getAllEras: (token) => {
    return request('/eras', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// 角色 API
export const characterApi = {
  // 获取所有角色
  getAllCharacters: (token) => {
    return request('/characters', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// 系统剧本 API
export const systemScriptApi = {
  // 根据场景ID获取剧本
  getByEraId: (eraId) => {
    return request(`/system-scripts/era/${eraId}`);
  }
};

// 导出所有 API
export default {
  authApi,
  journalApi,
  worldApi,
  eraApi,
  characterApi,
  systemScriptApi
};

