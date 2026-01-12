// 认证模块统一导出

export * from './types';

// 导入各个子模块
import { authApi as baseAuthApi } from './auth';
import { emailApi } from './email';
import { authConfigApi } from './email';

// 导出子模块API（供需要单独使用的场景）
export { emailApi, authConfigApi };

// 为了向后兼容，创建一个包含所有旧接口的 authApi 对象
// 这样现有的代码可以继续使用 authApi.sendEmailVerificationCode 等
export const authApi = {
  // 基础认证方法
  login: baseAuthApi.login,
  register: baseAuthApi.register,
  getCurrentUser: baseAuthApi.getCurrentUser,
  // 邮箱验证方法（保持旧接口名称）
  sendEmailVerificationCode: emailApi.sendVerificationCode,
  verifyEmailCode: emailApi.verifyCode,
  // 配置检查方法（保持旧接口名称）
  isInviteCodeRequired: authConfigApi.isInviteCodeRequired,
  isEmailVerificationRequired: authConfigApi.isEmailVerificationRequired,
};

