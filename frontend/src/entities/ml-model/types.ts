export interface ModelMetrics {
  precision: number;

  recall: number;

  f1: number;

  iou: number;

  true_positive: number;

  false_positive: number;

  false_negative: number;

  training_seconds: number;
}

export interface ModelComparisonResponse {
  status: string;

  experiment: {
    name: string;

    dataset: string;

    split: string;

    target_class: string;
  };

  results: {
    experiment: string;

    dataset: string;

    split: {
      train_patches: number;

      validation_patches: number;

      test_patches: number;

      test_used: boolean;
    };

    features: {
      rgb: string[];

      multispectral: string[];
    };

    random_forest: {
      n_estimators: number;

      max_depth: number;

      min_samples_leaf: number;

      class_weight: string;

      random_state: number;

      n_jobs: number;
    };

    validation: {
      rgb: ModelMetrics;

      multispectral: ModelMetrics;
    };
  };

  visualization: string;
}
