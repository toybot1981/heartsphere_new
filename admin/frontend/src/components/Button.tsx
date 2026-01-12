import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'warning';
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
    primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 border border-transparent",
    secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
    success: "bg-green-600 text-white shadow-lg hover:bg-green-700 hover:-translate-y-0.5 border border-transparent",
    danger: "bg-red-600 text-white shadow-lg hover:bg-red-700 hover:-translate-y-0.5 border border-transparent",
    warning: "bg-yellow-600 text-white shadow-lg hover:bg-yellow-700 hover:-translate-y-0.5 border border-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
