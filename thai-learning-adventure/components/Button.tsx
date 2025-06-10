
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  ...props
}) => {
  const baseStyle = "font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2";

  const variantStyles = {
    primary: 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400 disabled:bg-sky-300',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 disabled:bg-red-300',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400 disabled:bg-green-300',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 disabled:bg-yellow-300',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300 shadow-none',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2 text-xl', // For icon-only buttons
  };

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    icon: 'h-5 w-5',
  }

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className={`animate-spin rounded-full border-2 border-t-transparent ${spinnerSizes[size]} ${variant === 'primary' || variant === 'danger' || variant === 'success' || variant === 'warning' ? 'border-white' : 'border-slate-700'}`}></div>
      ) : (
        <>
          {leftIcon}
          {children && <span>{children}</span>}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;