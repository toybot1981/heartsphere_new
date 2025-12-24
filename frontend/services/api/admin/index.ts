// 管理后台API模块统一导出

export * from './types';

// 导入各个子模块
import { adminAuthApi } from './auth';
import { adminWorldsApi } from './worlds';
import { adminErasApi } from './eras';
import { adminCharactersApi } from './characters';
import { adminMainStoriesApi } from './mainStories';
import { adminInviteCodesApi } from './inviteCodes';
import { adminConfigApi } from './config';
import { adminAIModelsApi, adminAIRoutingStrategiesApi } from './aiConfig';
import { adminResourcesApi } from './resources';
import { adminScriptsApi } from './scripts';
import { adminSubscriptionPlansApi } from './subscriptionPlans';
import { adminUsersApi } from './users';
import { adminSystemAdminsApi } from './admins';

// 导出子模块API（供需要单独使用的场景）
export {
  adminAuthApi,
  adminWorldsApi,
  adminErasApi,
  adminCharactersApi,
  adminMainStoriesApi,
  adminInviteCodesApi,
  adminConfigApi,
  adminAIModelsApi,
  adminAIRoutingStrategiesApi,
  adminResourcesApi,
  adminScriptsApi,
  adminSubscriptionPlansApi,
  adminUsersApi,
  adminSystemAdminsApi,
};

// 为了向后兼容，创建一个包含所有旧接口的 adminApi 对象
// 这样现有的代码可以继续使用 adminApi.login, adminApi.worlds.getAll 等
export const adminApi = {
  // 管理员登录
  login: adminAuthApi.login,

  // 系统世界管理
  worlds: adminWorldsApi,

  // 系统场景管理
  eras: adminErasApi,

  // 系统角色管理
  characters: adminCharactersApi,

  // 系统主线剧情管理
  mainStories: adminMainStoriesApi,

  // 邀请码管理
  inviteCodes: adminInviteCodesApi,

  // 系统配置
  config: adminConfigApi,

  // AI配置管理
  aiConfig: {
    models: adminAIModelsApi,
    routingStrategies: adminAIRoutingStrategiesApi,
  },

  // 系统资源管理
  resources: adminResourcesApi,

  // 用户剧本管理（管理员专用）
  scripts: adminScriptsApi,

  // 订阅计划管理
  subscriptionPlans: adminSubscriptionPlansApi,

  // 用户管理
  users: adminUsersApi,

  // 系统管理员管理
  admins: adminSystemAdminsApi,
};

