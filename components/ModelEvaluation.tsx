import React from 'react';
import { ModelMetrics } from '../types';
import { ChartBarIcon } from './IconComponents';

const MetricCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600 h-full flex flex-col justify-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-cyan-400 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);

const ConfusionMatrix: React.FC<{ matrix: ModelMetrics['confusionMatrix'] }> = ({ matrix }) => (
     <div className="flex justify-center">
        <div className="relative grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-x-4 gap-y-2 items-center font-mono">
            <div className="col-start-2 text-center text-sm font-semibold text-gray-300">Прогноз: НГ</div>
            <div className="text-center text-sm font-semibold text-gray-300">Прогноз: Г</div>
            <div className="row-start-2 text-sm font-semibold text-gray-300 -rotate-90 transform origin-center whitespace-nowrap">Факт: НГ</div>
            <div className="row-start-3 text-sm font-semibold text-gray-300 -rotate-90 transform origin-center whitespace-nowrap">Факт: Г</div>
            
            <div className="row-start-2 col-start-2 bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-lg flex flex-col items-center justify-center min-w-[120px]">
                <div className="text-2xl font-bold">{matrix.tn}</div>
                <div className="text-xs mt-1">(TN)</div>
            </div>
            <div className="row-start-2 col-start-3 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg flex flex-col items-center justify-center min-w-[120px]">
                <div className="text-2xl font-bold">{matrix.fp}</div>
                <div className="text-xs mt-1">(FP)</div>
            </div>
            <div className="row-start-3 col-start-2 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg flex flex-col items-center justify-center min-w-[120px]">
                <div className="text-2xl font-bold">{matrix.fn}</div>
                <div className="text-xs mt-1">(FN)</div>
            </div>
            <div className="row-start-3 col-start-3 bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-lg flex flex-col items-center justify-center min-w-[120px]">
                <div className="text-2xl font-bold">{matrix.tp}</div>
                <div className="text-xs mt-1">(TP)</div>
            </div>
        </div>
    </div>
);

interface ModelEvaluationProps {
    metrics: ModelMetrics;
    onComplete: () => void;
}

export const ModelEvaluation: React.FC<ModelEvaluationProps> = ({ metrics, onComplete }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3">
                 <ChartBarIcon className="h-8 w-8 text-cyan-400" />
                 <h2 className="text-2xl font-bold text-cyan-400">Результаты обучения модели</h2>
            </div>
            <p className="text-gray-400 mt-2 mb-6">
                Модель была обучена на ваших данных ({metrics.totalSamples} образцов). Ниже представлены ключевые метрики ее производительности.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MetricCard title="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} description="Доля верных прогнозов" />
                <MetricCard title="Precision (Горючий)" value={`${(metrics.precision * 100).toFixed(1)}%`} description="Точность определения класса 'Горючий'" />
                <MetricCard title="Recall (Горючий)" value={`${(metrics.recall * 100).toFixed(1)}%`} description="Полнота охвата класса 'Горючий'" />
                <MetricCard title="F1-Score" value={metrics.f1.toFixed(3)} description="Гармоническое среднее Precision и Recall" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Матрица ошибок</h3>
                    <ConfusionMatrix matrix={metrics.confusionMatrix} />
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Принцип работы модели (MLP)</h3>
                    <p className="text-sm text-gray-400 space-y-2">
                        <span>
                            <b>Многослойный персептрон (MLP)</b> — это нейронная сеть, которая учится находить сложные, нелинейные зависимости в данных.
                        </span>
                        <span>
                            В процессе обучения модель анализирует элементный состав каждого образца и корректирует свои внутренние параметры (веса), чтобы минимизировать ошибку предсказания горючести. Это позволяет ей выявлять скрытые закономерности, недоступные простому статистическому анализу.
                        </span>
                    </p>
                </div>
            </div>
            
            <div className="mt-8 text-center">
                 <button
                    onClick={onComplete}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 transition-colors duration-200"
                >
                    Перейти к прогнозированию
                </button>
            </div>
        </div>
    );
};
