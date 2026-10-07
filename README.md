# Ocean Detective

**Research web application for marine debris detection and analysis using Sentinel-2 satellite imagery.**

Ocean Detective is an internship research prototype built around the MARIDA dataset. The project investigates whether additional Sentinel-2 spectral bands improve Marine Debris detection compared with an RGB-only baseline.

The current version combines satellite image inspection, ground-truth visualization, a reproducible Random Forest experiment, quantitative validation metrics, prediction/error visualization, and a web interface for presenting the results.

---

## Research Question

**Do additional Sentinel-2 spectral bands improve Marine Debris detection compared with RGB imagery?**

Two Random Forest models are compared under the same training configuration:

- **RGB baseline:** B02, B03, B04
- **Multispectral baseline:** all 11 available Sentinel-2 bands

The experiment uses the official MARIDA train/validation/test split.

---

## Dataset

The project uses the **MARIDA (Marine Debris Archive)** dataset based on Sentinel-2 satellite imagery.

Official dataset split:

| Split | Patches |
|---|---:|
| Train | 694 |
| Validation | 328 |
| Test | 359 |
| **Total** | **1381** |

Each image patch contains:

- 11 Sentinel-2 spectral bands
- semantic class mask
- annotation confidence mask
- spatial dimensions of 256 × 256 pixels

The spectral bands used in the multispectral experiment are:

`B01, B02, B03, B04, B05, B06, B07, B08, B8A, B11, B12`

The MARIDA TIFF files are intentionally excluded from Git because of their size.

---

## Experiment Design

Two `RandomForestClassifier` models are trained using the same configuration.

```text
n_estimators:     100
max_depth:        20
min_samples_leaf: 2
class_weight:     balanced
random_state:     42
n_jobs:           -1
```

The primary controlled difference between the two baseline models is the input feature set.

### RGB model

Uses three visible bands:

```text
B02 — Blue
B03 — Green
B04 — Red
```

### Multispectral model

Uses all 11 available Sentinel-2 bands:

```text
B01 B02 B03 B04 B05 B06 B07 B08 B8A B11 B12
```

Both models are trained on the official MARIDA training split and evaluated on the official validation split.

The test split is currently kept untouched for final evaluation.

---

## Evaluation Protocol

Only annotated MARIDA pixels are used for training and quantitative evaluation.

Pixels with:

```text
class = 0
```

are treated as unannotated regions and excluded from TP, FP and FN calculations.

Marine Debris corresponds to:

```text
class = 1
```

The multiclass Random Forest predictions are evaluated for Marine Debris using a one-vs-rest interpretation.

Main metrics:

- Precision
- Recall
- F1-score
- Intersection over Union (IoU)
- True Positives
- False Positives
- False Negatives

---

## Validation Results

Results on the official MARIDA validation split:

| Metric | RGB | Multispectral |
|---|---:|---:|
| Precision | 10.12% | **80.46%** |
| Recall | 12.09% | **86.98%** |
| F1-score | 11.02% | **83.59%** |
| IoU | 5.83% | **71.81%** |
| True Positives | 130 | **935** |
| False Positives | 1154 | **227** |
| False Negatives | 945 | **140** |

F1 improvement:

```text
+72.57 percentage points
```

In this baseline validation experiment, the 11-band multispectral representation substantially outperformed the RGB-only representation for Marine Debris detection.

These results apply specifically to the current baseline configuration and validation protocol and should not be interpreted as general performance on unseen data.

---

## Prediction Visualization

The project also provides qualitative prediction and error visualization for a MARIDA validation patch.

The visualization contains:

- RGB satellite image
- ground-truth Marine Debris mask
- RGB model prediction
- multispectral model prediction
- RGB error map
- multispectral error map

Error maps distinguish:

```text
TP — True Positive
FP — False Positive
FN — False Negative
```

Unannotated MARIDA pixels (`class = 0`) are excluded from patch-level quantitative evaluation.

The selected validation patch is used as a visual example only. Overall model performance is represented by the full validation-set metrics above.

---

## Web Application

The current prototype provides a web interface for presenting the analysis pipeline and experimental results.

The interface includes:

- satellite image selection UI
- MARIDA sample analysis
- image metadata
- RGB visualization
- semantic class mask
- annotation confidence mask
- Marine Debris ground-truth overlay
- class distribution
- confidence distribution
- RGB vs multispectral model comparison
- validation metrics
- prediction/error visualization
- experiment configuration

### Current analysis pipeline

```text
Web interface
      ↓
Node.js / Express API
      ↓
Python analysis scripts
      ↓
MARIDA GeoTIFF
      ↓
Generated JSON + visualizations
      ↓
Web interface
```

The current prototype analyzes a configured local MARIDA sample on the backend.

The browser file-selection component demonstrates the intended interaction, but arbitrary browser-selected TIFF files are not yet uploaded to or processed by the backend.

---

## Architecture

```text
ocean-detective/
│
├── backend/
│   └── Node.js + Express + TypeScript API
│
├── frontend/
│   └── Vite + TypeScript web interface
│
├── ml/
│   ├── scripts/
│   │   ├── inspect_marida.py
│   │   ├── baseline_rf.py
│   │   └── visualize_predictions.py
│   │
│   └── models/
│       └── locally generated Random Forest models
│
├── data/
│   └── local MARIDA sample files
│
├── results/
│   ├── experiment metrics
│   └── generated visualizations
│
└── docs/
    └── project documentation
```

---

## Main Technologies

### Machine Learning and Data Processing

- Python
- NumPy
- Rasterio
- scikit-learn
- Matplotlib
- joblib

### Backend

- Node.js
- Express
- TypeScript

### Frontend

- Vite
- TypeScript
- HTML/CSS

### Data

- Sentinel-2 multispectral imagery
- GeoTIFF
- MARIDA dataset

---

## Reproducing the ML Experiment

Install Python dependencies:

```bash
pip install -r ml/requirements.txt
```

The full MARIDA dataset must be available locally.

Run the baseline experiment:

```bash
python3 ml/scripts/baseline_rf.py
```

The script trains both Random Forest models and produces validation metrics.

Generated model files are stored locally and intentionally excluded from Git because of their size.

Run prediction visualization:

```bash
python3 ml/scripts/visualize_predictions.py
```

Run the configured MARIDA sample inspection:

```bash
python3 ml/scripts/inspect_marida.py
```

---

## Current Limitations

This project is a research prototype rather than an operational marine-monitoring system.

Current limitations include:

- arbitrary browser-selected GeoTIFF files are not yet processed by the backend
- the Random Forest experiment uses raw spectral bands only
- spectral indices and texture features are not included
- MARIDA annotation-confidence values are not currently used as training sample weights
- class aggregation used by the official MARIDA Random Forest implementation is not reproduced
- the final test split has not yet been evaluated
- the application does not process live satellite streams
- the system does not estimate the physical mass or quantity of plastic
- the system is not intended for global real-time ocean monitoring

These constraints are intentional for the current research prototype and provide directions for future development.

---

## Reproducibility

The repository contains:

- data inspection code
- ML training code
- prediction visualization code
- experiment configuration
- validation metrics
- web application
- generated comparison artifacts
- dependency list

Large datasets and trained model binaries are excluded from Git and can be reproduced locally from the provided scripts.

---

## Use of AI Tools

AI-assisted development was used during the project for:

- discussing architecture and implementation alternatives
- code drafting and refactoring
- debugging
- documentation support
- experiment planning

Experimental decisions, execution, validation of outputs, interpretation of results, and integration were performed and reviewed as part of the project work.

AI-generated suggestions were treated as implementation assistance rather than experimental evidence.

---

## Project Status

Current completed milestone:

**Research prototype demonstrating RGB vs multispectral Random Forest comparison for Marine Debris detection on MARIDA, integrated into a web interface.**

Current experimental conclusion:

> In the validation experiment, using all 11 Sentinel-2 spectral bands produced substantially better Marine Debris detection results than using RGB bands alone.

The official MARIDA test split remains reserved for final evaluation.