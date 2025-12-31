import React from 'react';

/**
 * 温暖感的按钮组件
 * 根据设计文档实现温度感按钮系统
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 ease-out cursor-pointer inline-flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-warm-pink to-warm-pink-light text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed',
    secondary: 'bg-white border-2 border-warm-pink text-warm-pink hover:bg-warm-pink-lightest active:scale-95 disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed',
    text: 'bg-transparent text-warm-pink hover:text-warm-pink-light hover:bg-warm-pink-lightest/30 active:scale-95',
    icon: 'bg-transparent text-warm-pink hover:bg-warm-pink-lightest/30 rounded-full p-2 active:scale-90',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const iconSizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const disabledStyles = disabled || loading ? 'opacity-60 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${variant === 'icon' ? iconSizeStyles[size] : sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;



