import React, { memo } from 'react';
import { MobileTypography, MobileStatusStyles } from './MobileStyleGuide';
import type { PasswordStrength } from '../utils/authHelpers';

interface MobilePasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrength;
  errors: string[];
}

/**
 * Mobile密码强度指示器组件
 * 显示密码强度条和错误提示
 */
export const MobilePasswordStrengthIndicator: React.FC<MobilePasswordStrengthIndicatorProps> = memo(({
  password,
  strength,
  errors,
}) => {
  if (password.length === 0) {
    return (
      <p className={`${MobileTypography.fontSize.xs} text-slate-500 mt-2`}>
        密码要求：至少8位，包含大小写字母、数字和特殊字符(@$!%*?&)
      </p>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {/* 强度条 */}
      <div className="flex gap-1 h-1.5">
        <div
          className={`flex-1 rounded ${
            strength === 'strong'
              ? 'bg-green-500'
              : strength === 'medium'
              ? 'bg-yellow-500'
              : errors.length > 0
              ? 'bg-red-500'
              : 'bg-slate-600'
          }`}
          role="progressbar"
          aria-valuenow={strength === 'strong' ? 100 : strength === 'medium' ? 66 : 33}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div
          className={`flex-1 rounded ${
            strength === 'strong' || strength === 'medium'
              ? strength === 'strong'
                ? 'bg-green-500'
                : 'bg-yellow-500'
              : 'bg-slate-600'
          }`}
        />
        <div
          className={`flex-1 rounded ${strength === 'strong' ? 'bg-green-500' : 'bg-slate-600'}`}
        />
      </div>

      {/* 强度文字提示 */}
      {strength && (
        <p
          className={`${MobileTypography.fontSize.xs} ${
            strength === 'strong'
              ? MobileStatusStyles.success.text
              : strength === 'medium'
              ? MobileStatusStyles.warning.text
              : MobileStatusStyles.error.text
          }`}
        >
          {strength === 'strong'
            ? '✓ 密码强度：强'
            : strength === 'medium'
            ? '⚠ 密码强度：中'
            : '✗ 密码强度：弱'}
        </p>
      )}

      {/* 错误提示 */}
      {errors.length > 0 && (
        <ul className={`${MobileTypography.fontSize.xs} ${MobileStatusStyles.error.text} space-y-0.5`} role="list">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
});

MobilePasswordStrengthIndicator.displayName = 'MobilePasswordStrengthIndicator';
