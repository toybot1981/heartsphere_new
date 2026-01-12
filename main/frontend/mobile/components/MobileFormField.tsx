import React, { memo, useId } from 'react';
import { MobileInputStyles, MobileTypography, MobileStatusStyles, MobileColors } from './MobileStyleGuide';

interface MobileFormFieldProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  'aria-describedby'?: string;
}

/**
 * Mobile版本统一表单字段组件
 * 提供统一的表单字段样式和验证提示
 * 符合扁平化、简洁、科技感的设计风格
 */
export const MobileFormField: React.FC<MobileFormFieldProps> = memo(({
  label,
  error,
  success,
  hint,
  required = false,
  children,
  className = '',
  'aria-describedby': ariaDescribedBy,
}) => {
  const id = useId();
  const labelId = `label-${id}`;
  const errorId = `error-${id}`;
  const hintId = `hint-${id}`;
  const describedBy = [
    ariaDescribedBy,
    error && errorId,
    hint && hintId,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 标签 */}
      {label && (
        <label
          id={labelId}
          htmlFor={id}
          className={`${MobileTypography.fontSize.sm} ${MobileTypography.fontWeight.semibold} text-white block`}
        >
          {label}
          {required && (
            <span className="text-red-400 ml-1" aria-label="必填">*</span>
          )}
        </label>
      )}

      {/* 输入区域 */}
      <div className="relative">
        {React.Children.map(children, (child) => {
          // 只对 input 元素添加 id 和 aria 属性
          if (React.isValidElement(child)) {
            const childType = child.type;
            // 检查是否是原生 input 元素
            if (childType === 'input' || (typeof childType === 'string' && childType === 'input')) {
              return React.cloneElement(child as React.ReactElement<any>, {
                id,
                'aria-describedby': describedBy,
                'aria-invalid': error ? 'true' : undefined,
                'aria-required': required ? 'true' : undefined,
              });
            }
          }
          // 其他元素（如 MobilePasswordStrengthIndicator）直接返回
          return child;
        })}
      </div>

      {/* 提示信息 */}
      {hint && !error && !success && (
        <p
          id={hintId}
          className={`${MobileTypography.fontSize.xs} text-slate-400`}
        >
          {hint}
        </p>
      )}

      {/* 成功提示 */}
      {success && (
        <div
          id={`success-${id}`}
          className={`${MobileStatusStyles.success.container} ${MobileStatusStyles.success.text}`}
          role="status"
          aria-live="polite"
        >
          {success}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div
          id={errorId}
          className={`${MobileStatusStyles.error.container} ${MobileStatusStyles.error.text}`}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
});

MobileFormField.displayName = 'MobileFormField';
