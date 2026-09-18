import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-purple-900/30 border-t-purple-500 animate-spin`}
      />
      {message && <p className="text-sm text-zinc-500 font-medium">{message}</p>}
    </div>
  );
};
