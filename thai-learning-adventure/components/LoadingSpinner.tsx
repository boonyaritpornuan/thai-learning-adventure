
import React from 'react';

const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({ message = "กำลังโหลด...", size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-t-4 border-b-4',
    lg: 'h-16 w-16 border-t-4 border-b-4',
  };
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-sky-500`}></div>
      {message && <p className="mt-4 text-sky-600 text-base sm:text-lg font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;