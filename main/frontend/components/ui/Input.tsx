import React, { useState } from 'react';

/**
 * 温暖感的输入框组件
 * 实现焦点光晕效果和友好的输入反馈
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  showCount = false,
  maxLength,
  className = '',
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const inputClasses = `
    w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ease-out
    ${isFocused ? 'border-warm-pink ring-4 ring-warm-pink/10' : 'border-warm-beige-dark/50'}
    ${error ? 'border-warm-pink ring-4 ring-warm-pink/10' : ''}
    ${error ? 'bg-warm-pink-lightest/10' : 'bg-warm-beige-lightest/30'}
    focus:outline-none
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;
  
  const characterCount = typeof value === 'string' ? value.length : 0;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          className={inputClasses}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          maxLength={maxLength}
          {...props}
        />
        
        {showCount && maxLength && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <p className="text-xs text-text-tertiary mt-1">
          {helperText}
        </p>
      )}
      
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-warm-pink mt-1 animate-fade-in">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;




