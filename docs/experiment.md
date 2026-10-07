# Ocean Detective — Experiment Report

## 1. Research Objective

The objective of this experiment is to investigate whether additional Sentinel-2 spectral bands improve Marine Debris detection compared with RGB imagery.

Research question:

> Do additional Sentinel-2 spectral bands improve Marine Debris detection compared with RGB imagery when the same Random Forest configuration is used?

The experiment compares two feature representations while keeping the machine-learning algorithm and its configuration constant.

---

## 2. Dataset

The experiment uses the MARIDA (Marine Debris Archive) dataset.

The official MARIDA dataset split is preserved:

| Split | Patches |
|---|---:|
| Training | 694 |
| Validation | 328 |
| Test | 359 |
| Total | 1381 |

The training split is used for model fitting.

The validation split is used for the current quantitative comparison.

The test split remains untouched and is reserved for final evaluation.

---

## 3. Input Data

Each MARIDA patch contains Sentinel-2 multispectral imagery with 11 spectral bands and corresponding semantic annotations.

Image dimensions:

```text
256 × 256 pixels
```

Available spectral bands:

```text
B01
B02
B03
B04
B05
B06
B07
B08
B8A
B11
B12
```

MARIDA also provides:

- semantic class masks
- annotation confidence masks

Marine Debris corresponds to semantic class:

```text
1
```

Class `0` is treated as an unannotated region and is excluded from training and quantitative evaluation.

---

## 4. Experimental Setup

Two Random Forest models are compared.

### Experiment A — RGB

Input features:

```text
B02
B03
B04
```

Number of features:

```text
3
```

### Experiment B — Multispectral

Input features:

```text
B01
B02
B03
B04
B05
B06
B07
B08
B8A
B11
B12
```

Number of features:

```text
11
```

The feature representation is the primary experimental variable.

---

## 5. Random Forest Configuration

Both models use the same `RandomForestClassifier` configuration:

```text
n_estimators     = 100
max_depth        = 20
min_samples_leaf = 2
class_weight     = balanced
random_state     = 42
n_jobs           = -1
```

Using the same model configuration makes it possible to isolate the effect of the input spectral representation in this baseline comparison.

---

## 6. Training Data

Only annotated pixels (`class > 0`) are used.

Training data:

```text
429,412 annotated pixels
```

Marine Debris training pixels:

```text
1,943
```

Marine Debris therefore represents approximately:

```text
0.45%
```

of the annotated training pixels.

This demonstrates substantial class imbalance.

The Random Forest configuration uses:

```text
class_weight = balanced
```

to partially address this imbalance.

---

## 7. Validation Data

The official MARIDA validation split contains:

```text
328 patches
213,102 annotated pixels
1,075 Marine Debris pixels
```

Marine Debris represents approximately:

```text
0.50%
```

of annotated validation pixels.

---

## 8. Evaluation

Although the Random Forest performs multiclass prediction, Marine Debris is evaluated using a one-vs-rest interpretation.

For Marine Debris:

```text
Positive = class 1
Negative = other annotated semantic classes
```

Unannotated pixels (`class = 0`) are excluded.

The following metrics are calculated:

- Precision
- Recall
- F1-score
- Intersection over Union (IoU)
- True Positives
- False Positives
- False Negatives

---

## 9. Validation Results

### RGB Model

| Metric | Result |
|---|---:|
| Precision | 10.12% |
| Recall | 12.09% |
| F1-score | 11.02% |
| IoU | 5.83% |
| True Positives | 130 |
| False Positives | 1154 |
| False Negatives | 945 |
| Training time | 9.01 s |

### Multispectral Model

| Metric | Result |
|---|---:|
| Precision | 80.46% |
| Recall | 86.98% |
| F1-score | 83.59% |
| IoU | 71.81% |
| True Positives | 935 |
| False Positives | 227 |
| False Negatives | 140 |
| Training time | 16.86 s |

---

## 10. Comparison

| Metric | RGB | Multispectral |
|---|---:|---:|
| Precision | 10.12% | 80.46% |
| Recall | 12.09% | 86.98% |
| F1-score | 11.02% | 83.59% |
| IoU | 5.83% | 71.81% |

F1-score difference:

```text
+72.57 percentage points
```

IoU difference:

```text
+65.98 percentage points
```

The multispectral model also produced substantially fewer false positives and false negatives.

---

## 11. Result Interpretation

In this baseline validation experiment, the Random Forest using all 11 Sentinel-2 spectral bands substantially outperformed the RGB-only Random Forest for Marine Debris detection.

Because both models use the same Random Forest configuration and differ primarily in their input feature representation, the experiment provides evidence that additional spectral information is useful for this task under the tested conditions.

This conclusion is limited to the current dataset, validation split, preprocessing procedure and baseline model configuration.

The test split has not been used to tune or select the current models.

---

## 12. Prediction Visualization

A validation patch is also used to visually compare model predictions.

Selected patch:

```text
14-3-20_18QYF_4
```

The patch contains:

```text
229 annotated pixels
99 Marine Debris pixels
65307 unannotated pixels
```

Unannotated pixels are excluded from TP, FP and FN calculations.

### RGB prediction on the selected patch

```text
TP = 13
FP = 0
FN = 86

Precision = 1.0000
Recall    = 0.1313
F1        = 0.2321
IoU       = 0.1313
```

### Multispectral prediction on the selected patch

```text
TP = 98
FP = 0
FN = 1

Precision = 1.0000
Recall    = 0.9899
F1        = 0.9949
IoU       = 0.9899
```

These patch-level results are used only as qualitative and visual evidence.

They must not be interpreted as overall model performance.

Overall performance is represented by the metrics calculated across the complete validation split.

---

## 13. Reproducibility

The experiment is implemented in:

```text
ml/scripts/baseline_rf.py
```

Prediction visualization is implemented in:

```text
ml/scripts/visualize_predictions.py
```

Data inspection and ground-truth visualization are implemented in:

```text
ml/scripts/inspect_marida.py
```

Dependencies are listed in:

```text
ml/requirements.txt
```

Experiment metrics are stored in:

```text
results/baseline_rf_results.json
```

The comparison visualization is stored in:

```text
results/validation_model_comparison.png
```

Trained model binaries are generated locally and excluded from Git because of their size.

---

## 14. Current Limitations

The current implementation is intentionally a simplified research baseline.

The following limitations remain:

1. Only raw Sentinel-2 spectral bands are used as model features.
2. Spectral indices are not included.
3. Texture features are not included.
4. Annotation confidence is not currently used as a training sample weight.
5. The class aggregation strategy used by the official MARIDA Random Forest implementation is not reproduced.
6. The official test split has not yet been evaluated.
7. The web application currently analyzes a configured local MARIDA sample rather than arbitrary browser-uploaded GeoTIFF files.
8. The prototype is not designed for live or global satellite monitoring.

These limitations define possible directions for future experiments.

---

## 15. Current Conclusion

The research question for the current milestone was:

> Do additional Sentinel-2 spectral bands improve Marine Debris detection compared with RGB imagery?

For the current Random Forest baseline on the official MARIDA validation split, the answer is **yes**.

The multispectral model achieved:

```text
F1  = 83.59%
IoU = 71.81%
```

compared with:

```text
F1  = 11.02%
IoU = 5.83%
```

for the RGB baseline.

The result supports continuing the project with multispectral Sentinel-2 information while preserving the official test split for final evaluation.