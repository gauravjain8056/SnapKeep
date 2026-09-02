import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-blue-500/20 border-t-blue-500 animate-spin`}
      />
      {message && <p className="text-sm text-slate-400 font-medium">{message}</p>}
    </div>
  );
};
