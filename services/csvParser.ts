import type { CsvData } from '../types';

/**
 * Parses a CSV file into an array of objects with lowercase keys.
 * @param file The CSV file to parse.
 * @returns A promise that resolves to the parsed data.
 */
export function parseCSV(file: File): Promise<CsvData> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Файл не предоставлен.'));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split(/\r\n|\n/);
        
        if (lines.length < 2) {
            return reject(new Error("CSV-файл должен содержать заголовок и хотя бы одну строку данных."));
        }

        // Normalize header to lowercase to handle inconsistencies like 'Label' vs 'label'
        const header = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(/[,;]/);
          return header.reduce((obj, nextKey, index) => {
            const rawValue = values[index] ? values[index].trim() : '0';
            // Convert to number if possible, otherwise keep as string
            const numericValue = parseFloat(rawValue.replace(',', '.')); // Handle decimal commas
            obj[nextKey] = isNaN(numericValue) ? rawValue : numericValue;
            return obj;
          }, {} as Record<string, string | number>);
        });
        resolve(data);
      } catch (error) {
        reject(new Error("Ошибка при обработке файла. Убедитесь, что он имеет корректный CSV-формат."));
      }
    };

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл.'));
    };

    reader.readAsText(file);
  });
}