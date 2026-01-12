import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  ageGroup?: 'elementary' | 'middle';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  ageGroup = 'elementary',
  className = '',
  ...props
}) => {
  const baseClasses = ageGroup === 'elementary' 
    ? 'btn-elementary' 
    : 'btn-middle';
  
  const variantClasses = {
    primary: ageGroup === 'elementary'
      ? 'bg-primary-elementary-500 text-white hover:bg-primary-elementary-600'
      : 'bg-primary-middle-500 text-white hover:bg-primary-middle-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};