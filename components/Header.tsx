import React from 'react';
import { FlaskIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center justify-center bg-gray-800 p-4 rounded-full border-2 border-cyan-500 shadow-cyan-500/20 shadow-lg">
        <FlaskIcon className="h-10 w-10 text-cyan-400" />
      </div>
      <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
        Интерактивный Классификатор
      </h1>
      <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">
        Обучите модель на ваших данных и получите прогноз горючести с детальным объяснением результата.
      </p>
    </header>
  );
};
