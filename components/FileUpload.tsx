import React, { useState, useCallback } from 'react';
import { parseCSV } from '../services/csvParser';
import type { CsvData } from '../types';
import { UploadIcon, CsvFileIcon } from './IconComponents';

interface FileUploadProps {
  onFileUpload: (data: CsvData) => void;
  title: string;
  description: string;
  onError: (error: string) => void;
  isSingleRow?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, title, description, onError, isSingleRow = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    onError('');

    try {
      const parsedData = await parseCSV(file);
      if (isSingleRow && parsedData.length !== 1) {
          throw new Error(`Файл для прогноза должен содержать ровно одну строку данных (обнаружено ${parsedData.length}).`);
      }
      onFileUpload(parsedData);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Произошла неизвестная ошибка.');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, [onFileUpload, onError, isSingleRow]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">{title}</h2>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`w-full max-w-lg p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${isDragging ? 'border-cyan-500 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-600'}`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv"
          onChange={onFileChange}
          disabled={isLoading}
        />
        {isLoading ? (
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
                <p className="text-gray-300">Обработка файла...</p>
            </div>
        ) : fileName ? (
            <div className="flex flex-col items-center text-green-400">
                <CsvFileIcon className="w-16 h-16 mb-4"/>
                <p className="font-semibold">Файл загружен:</p>
                <p className="text-sm text-gray-300">{fileName}</p>
            </div>
        ) : (
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadIcon className="w-12 h-12 text-gray-500 mb-4"/>
              <span className="font-semibold text-cyan-400">Выберите файл</span>
              <span className="text-gray-400"> или перетащите его сюда</span>
              <span className="text-xs text-gray-500 mt-2">(.csv)</span>
            </label>
        )}
      </div>
    </div>
  );
};
