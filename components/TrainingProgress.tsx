import React, { useState, useEffect } from 'react';

export const TrainingProgress: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress === 100) {
                    clearInterval(timer);
                    return 100;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 200);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Обучение модели MLP...</h2>
            <p className="text-gray-400 mb-6">Анализ закономерностей в предоставленных данных. Это может занять несколько секунд.</p>
            <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-4 rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="mt-4 text-lg font-mono text-cyan-300">{Math.round(progress)}%</p>
        </div>
    );
};
