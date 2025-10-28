import React, { useState, useCallback, useEffect } from 'react';
import type { ModelMetrics, CsvData, Prediction } from './types';
import { AppStage } from './types';
import { trainModel, predict } from './services/modelService';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { TrainingProgress } from './components/TrainingProgress';
import { ModelEvaluation } from './components/ModelEvaluation';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.UPLOAD_TRAIN_DATA);
  const [trainingData, setTrainingData] = useState<CsvData | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrainFile = useCallback((data: CsvData) => {
    setTrainingData(data);
    setStage(AppStage.TRAINING);
    setError(null);
  }, []);

  const handlePredictFile = useCallback(async (data: CsvData) => {
    if (!trainingData || !modelMetrics) {
      setError("Модель не обучена. Пожалуйста, начните сначала.");
      setStage(AppStage.UPLOAD_TRAIN_DATA);
      return;
    }
    setStage(AppStage.PREDICTING);
    setError(null);
    try {
      const predictionResult = await predict(data[0], trainingData);
      setPrediction(predictionResult);
      setStage(AppStage.SHOW_PREDICTION);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'Произошла ошибка во время прогнозирования.');
       setStage(AppStage.UPLOAD_PREDICT_DATA);
    }
  }, [trainingData, modelMetrics]);

  const handleRestart = () => {
    setStage(AppStage.UPLOAD_TRAIN_DATA);
    setTrainingData(null);
    setModelMetrics(null);
    setPrediction(null);
    setError(null);
  };
  
  useEffect(() => {
    if (stage === AppStage.TRAINING && trainingData) {
      const performTraining = async () => {
        try {
          const metrics = await trainModel(trainingData);
          setModelMetrics(metrics);
          setStage(AppStage.SHOW_RESULTS);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Произошла ошибка во время обучения.');
          setStage(AppStage.UPLOAD_TRAIN_DATA);
        }
      };
      performTraining();
    }
  }, [stage, trainingData]);

  const renderContent = () => {
    switch (stage) {
      case AppStage.UPLOAD_TRAIN_DATA:
        return (
          <FileUpload
            onFileUpload={handleTrainFile}
            title="Шаг 1: Загрузите обучающий CSV-файл"
            description="Выберите файл с данными для обучения модели. Файл должен содержать колонки элементов и колонку 'Label' (0 - Негорючий, 1 - Горючий)."
            onError={setError}
          />
        );
      case AppStage.TRAINING:
        return <TrainingProgress />;
      case AppStage.SHOW_RESULTS:
        return modelMetrics ? (
          <ModelEvaluation 
            metrics={modelMetrics} 
            onComplete={() => setStage(AppStage.UPLOAD_PREDICT_DATA)}
          />
        ) : <Loader />;
       case AppStage.UPLOAD_PREDICT_DATA:
        return (
          <FileUpload
            onFileUpload={handlePredictFile}
            title="Шаг 2: Загрузите CSV-файл для прогноза"
            description="Выберите файл с одним образцом материала для анализа. Структура колонок должна соответствовать обучающему файлу."
            onError={setError}
            isSingleRow
          />
        );
      case AppStage.PREDICTING:
        return <Loader text="Выполняется прогноз..." />;
      case AppStage.SHOW_PREDICTION:
        return prediction ? (
          <ResultDisplay 
            prediction={prediction}
            onRestart={handleRestart}
          />
        ) : <Loader />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Ошибка: </strong>
              <span className="block sm:inline">{error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </span>
            </div>
          )}
          <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 min-h-[400px]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
