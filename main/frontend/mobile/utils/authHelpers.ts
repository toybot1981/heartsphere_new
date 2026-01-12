/**
 * Mobile登录注册辅助工具函数
 * 提供验证、密码强度检测等功能
 */

export type PasswordStrength = 'weak' | 'medium' | 'strong' | null;

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

export interface RequiredFieldsValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * 验证密码强度
 */
export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('密码至少需要8个字符');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }

  if (!/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符(@$!%*?&)');
  }

  // 计算密码强度
  let strength: PasswordStrength = null;
  if (errors.length === 0) {
    const hasAllTypes = /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&]/.test(password);
    if (password.length >= 12 && hasAllTypes) {
      strength = 'strong';
    } else if (password.length >= 8 && hasAllTypes) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证必填字段
 */
export const validateRequiredFields = (fields: Record<string, string>): RequiredFieldsValidation => {
  const errors: string[] = [];
  Object.entries(fields).forEach(([name, value]) => {
    if (!value || !value.trim()) {
      errors.push(`请填写${name}`);
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 验证密码匹配
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

/**
 * 提取API响应数据（处理可能的ApiResponse包装）
 */
export const extractApiResponse = <T>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};
