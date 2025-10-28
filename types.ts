export enum AppStage {
  UPLOAD_TRAIN_DATA,
  TRAINING,
  SHOW_RESULTS,
  UPLOAD_PREDICT_DATA,
  PREDICTING,
  SHOW_PREDICTION,
}

export type CsvData = Record<string, string | number>[];

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  auc: number;
  totalSamples: number;
}

export interface Prediction {
  result: 0 | 1;
  probability: number;
  explanation: string;
  inputData: Record<string, string | number>;
}
