import React from 'react';
import type { Prediction } from '../types';
import { FlameIcon, ShieldIcon, RestartIcon, InsightIcon } from './IconComponents';
import { FEATURE_COLUMNS_MLP } from '../constants';

interface ResultDisplayProps {
  prediction: Prediction;
  onRestart: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ prediction, onRestart }) => {
  const { result, probability, explanation, inputData } = prediction;
  const isCombustible = result === 1;
  const probabilityPercent = (probability * 100).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className={`p-6 rounded-full border-4 ${isCombustible ? 'border-red-500 bg-red-500/20' : 'border-green-500 bg-green-500/20'}`}>
        {isCombustible ? <FlameIcon className="h-16 w-16 text-red-400" /> : <ShieldIcon className="h-16 w-16 text-green-400" />}
      </div>
      <h3 className={`mt-6 text-3xl font-bold ${isCombustible ? 'text-red-400' : 'text-green-400'}`}>
        {isCombustible ? 'Горючий' : 'Негорючий'}
      </h3>
      <p className="mt-2 text-lg text-gray-300">
        Вероятность горючести: <span className="font-bold text-white">{probabilityPercent}%</span>
      </p>
      <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className={`h-2.5 rounded-full ${isCombustible ? 'bg-gradient-to-r from-yellow-500 to-red-600' : 'bg-green-500'}`}
            style={{ width: `${isCombustible ? probabilityPercent : 100 - parseFloat(probabilityPercent)}%` }}
        ></div>
      </div>
      
      <div className="mt-8 text-left w-full bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <h4 className="font-semibold text-lg text-cyan-400 flex items-center gap-2">
            <InsightIcon className="w-6 h-6" />
            Обоснование прогноза
        </h4>
        <p className="mt-2 text-sm text-gray-300">{explanation}</p>
      </div>

       <div className="mt-6 text-left w-full">
         <h4 className="font-semibold text-md text-gray-400">Входные данные для анализа:</h4>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-900/50 p-3 rounded-md">
            {FEATURE_COLUMNS_MLP.map(key => (
              <div key={key}>
                <span className="font-medium text-gray-500">{key}: </span>
                <span className="font-mono text-gray-200">{Number(inputData[key] || 0).toFixed(2)}%</span>
              </div>
            ))}
          </div>
       </div>

      <button
        onClick={onRestart}
        className="w-full mt-8 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 transition-colors duration-200"
      >
        <RestartIcon className="w-5 h-5 mr-2"/>
        Проверить другой материал
      </button>
    </div>
  );
};
