import type { CsvData, ModelMetrics, Prediction } from '../types';

// Simulate training delay
const TRAINING_DELAY = 2500; // ms

// Constants for chemical conversion from oxide to element based on molar masses
const CONVERSION_FACTORS = {
  mgo: 0.603, //  Mg / MgO
  al2o3: 0.529, // Al2 / Al2O3
  sio2: 0.467, // Si / SiO2
};

/**
 * Pre-processes a single data sample from the parsed CSV.
 * It converts oxides to elements and ensures all required feature columns are present.
 * This function is the core of making the app robust to different CSV header formats.
 * @param rawSample A single row from the CSV parser (with lowercase keys).
 * @returns A processed sample with consistent keys ('Mg', 'Al', etc.) and numeric values.
 */
function preprocessSample(rawSample: Record<string, any>): Record<string, number> {
    const processed: Record<string, number> = {};

    // Handle oxide conversions: use oxide value if present, otherwise look for elemental value.
    processed.Mg = rawSample.mgo !== undefined ? (Number(rawSample.mgo) || 0) * CONVERSION_FACTORS.mgo : (Number(rawSample.mg) || 0);
    processed.Al = rawSample.al2o3 !== undefined ? (Number(rawSample.al2o3) || 0) * CONVERSION_FACTORS.al2o3 : (Number(rawSample.al) || 0);
    processed.Si = rawSample.sio2 !== undefined ? (Number(rawSample.sio2) || 0) * CONVERSION_FACTORS.sio2 : (Number(rawSample.si) || 0);
    
    // Copy other feature columns, defaulting to 0 if not present
    const otherFeatures = ['P', 'S', 'Cl', 'K', 'Ca', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Ni', 'Cu', 'Zn'];
    otherFeatures.forEach(feature => {
        processed[feature] = Number(rawSample[feature.toLowerCase()]) || 0;
    });

    // Copy label if it exists, ensuring consistent key "Label"
    if (rawSample.hasOwnProperty('label')) {
        processed.Label = Number(rawSample.label);
    }

    return processed;
}


/**
 * Simulates training an MLP model on the provided data.
 * @param rawData The unprocessed training data from the CSV file.
 * @returns A promise that resolves to the model's performance metrics.
 */
export function trainModel(rawData: CsvData): Promise<ModelMetrics> {
  return new Promise((resolve, reject) => {
    if (!rawData || rawData.length === 0) {
        return reject(new Error("Некорректные или пустые обучающие данные."));
    }
    
    // Preprocess the data to handle oxides, missing values, and case inconsistencies
    const data = rawData.map(preprocessSample);

    if (!data[0].hasOwnProperty('Label')) {
        return reject(new Error("В обучающих данных отсутствует обязательная колонка 'label'."));
    }

    setTimeout(() => {
      const totalSamples = data.length;
      const combustibleSamples = data.filter(row => Number(row.Label) === 1).length;
      
      // Simulate confusion matrix values
      const tp = Math.round(combustibleSamples * (0.9 + Math.random() * 0.09)); // 90-99% recall
      const fn = combustibleSamples - tp;
      
      const nonCombustibleSamples = totalSamples - combustibleSamples;
      const tn = Math.round(nonCombustibleSamples * (0.92 + Math.random() * 0.07)); // 92-99% specificity
      const fp = nonCombustibleSamples - tn;

      const accuracy = (tp + tn) / totalSamples;
      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;

      resolve({
        accuracy,
        precision,
        recall,
        f1,
        confusionMatrix: { tn, fp, fn, tp },
        auc: 0.94 + Math.random() * 0.05, // Simulate high AUC
        totalSamples,
      });
    }, TRAINING_DELAY);
  });
}

/**
 * Simulates a prediction based on key elemental indicators.
 * It dynamically generates an explanation for the result.
 * @param rawSample The single data row to predict.
 * @param rawTrainingData The original training data, used here to provide context.
 * @returns A promise that resolves to a detailed prediction object.
 */
export function predict(rawSample: Record<string, string | number>, rawTrainingData: CsvData): Promise<Prediction> {
    return new Promise((resolve, reject) => {
        if (!rawSample) {
            return reject(new Error("Нет данных для прогноза."));
        }

        // Preprocess both the sample and the training data for consistent analysis
        const sample = preprocessSample(rawSample);
        const trainingData = rawTrainingData.map(preprocessSample);

        const mg = sample.Mg || 0;
        const ca = sample.Ca || 0;
        const fe = sample.Fe || 0;
        const ti = sample.Ti || 0;

        let score = 0;
        let explanationParts: string[] = [];

        // Simple scoring based on the provided correlations
        const avgTi = trainingData.reduce((acc, row) => acc + (Number(row.Ti) || 0), 0) / trainingData.length;
        const avgCa = trainingData.reduce((acc, row) => acc + (Number(row.Ca) || 0), 0) / trainingData.length;

        if (ti > avgTi * 1.2 && avgTi > 0) {
            score += 0.4;
            explanationParts.push(`высокое содержание титана (Ti: ${ti.toFixed(2)}%), который является сильным индикатором горючести`);
        }
        if (ca < avgCa * 0.8 && avgCa > 0) {
            score += 0.2;
        } else if (ca > avgCa * 1.2) {
            score -= 0.3;
            explanationParts.push(`повышенное содержание кальция (Ca: ${ca.toFixed(2)}%), способствующего негорючести`);
        }

        if (fe > 0.5) { // Assuming Fe presence is a good sign
             score -= 0.2;
             explanationParts.push(`наличие железа (Fe: ${fe.toFixed(2)}%)`);
        }
        if (mg > 0.5) { // Assuming Mg presence is a good sign
            score -= 0.2;
            explanationParts.push(`присутствие магния (Mg: ${mg.toFixed(2)}%)`);
        }

        const probability = Math.max(0, Math.min(1, 0.4 + score)); // Base probability + score
        const result = probability >= 0.3 ? 1 : 0;
        
        let finalExplanation = `Материал классифицирован как '${result === 1 ? 'Горючий' : 'Негорючий'}' на основе анализа его элементного состава. `;
        if (explanationParts.length > 0) {
            finalExplanation += `Ключевые факторы, повлиявшие на решение: ${explanationParts.join(', ')}.`;
        } else {
            finalExplanation += "Элементный состав не показал явных отклонений, указывающих на аномальную горючесть, и соответствует профилю негорючих материалов.";
        }


        setTimeout(() => {
            resolve({
                result,
                probability,
                explanation: finalExplanation,
                inputData: sample, // Return the PROCESSED data for accurate display
            });
        }, 1000);
    });
}