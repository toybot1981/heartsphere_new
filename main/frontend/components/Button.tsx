
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 min-h-[44px] rounded-xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation";
  
  const variants = {
    primary: "gradient-button shadow-lg hover:-translate-y-0.5 border border-transparent",
    secondary: "backdrop-blur-md border",
    ghost: "bg-transparent"
  };
  
  // 使用CSS变量设置样式
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary-button)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-lg)',
    },
    secondary: {
      backgroundColor: 'var(--bg-overlay-alpha)',
      borderColor: 'var(--border-color-overlay)',
      color: 'var(--text-primary)',
    },
    ghost: {
      color: 'var(--text-secondary)',
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    secondary: {
      backgroundColor: 'var(--bg-hover)',
    },
    ghost: {
      backgroundColor: 'var(--bg-hover)',
    },
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={variantStyles[variant]}
      onMouseEnter={(e) => {
        if (variant === 'secondary' || variant === 'ghost') {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary' || variant === 'ghost') {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};