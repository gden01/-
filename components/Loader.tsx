import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = 'Идет анализ...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
      <p className="mt-4 text-lg font-semibold text-cyan-400">{text}</p>
      <p className="text-sm text-gray-400">Пожалуйста, подождите.</p>
    </div>
  );
};
