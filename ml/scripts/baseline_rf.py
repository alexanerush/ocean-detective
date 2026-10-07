from pathlib import Path
from collections import Counter
import json
import time

import joblib
import numpy as np
import rasterio

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    jaccard_score,
)


# =========================================================
# Configuration
# =========================================================

MARIDA_ROOT = Path.home() / "Datasets" / "MARIDA"

PATCHES_DIR = MARIDA_ROOT / "patches"
SPLITS_DIR = MARIDA_ROOT / "splits"

TRAIN_SPLIT = SPLITS_DIR / "train_X.txt"
VAL_SPLIT = SPLITS_DIR / "val_X.txt"
TEST_SPLIT = SPLITS_DIR / "test_X.txt"

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RESULTS_DIR = PROJECT_ROOT / "results"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"

RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODELS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# MARIDA configuration
# =========================================================

BAND_NAMES = [
    "B01",
    "B02",
    "B03",
    "B04",
    "B05",
    "B06",
    "B07",
    "B08",
    "B8A",
    "B11",
    "B12",
]

RGB_INDICES = [1, 2, 3]

MARINE_DEBRIS_CLASS = 1

CLASS_NAMES = {
    1: "Marine Debris",
    2: "Dense Sargassum",
    3: "Sparse Sargassum",
    4: "Natural Organic Material",
    5: "Ship",
    6: "Clouds",
    7: "Marine Water",
    8: "Sediment-Laden Water",
    9: "Foam",
    10: "Turbid Water",
    11: "Shallow Water",
    12: "Waves",
    13: "Cloud Shadows",
    14: "Wakes",
    15: "Mixed Water",
}


# =========================================================
# Random Forest configuration
# =========================================================

RF_CONFIG = {
    "n_estimators": 100,
    "max_depth": 20,
    "min_samples_leaf": 2,
    "class_weight": "balanced",
    "random_state": 42,
    "n_jobs": -1,
}


# =========================================================
# Split loading
# =========================================================

def load_split(
    split_path: Path
) -> list[str]:

    with open(
        split_path,
        "r",
        encoding="utf-8"
    ) as file:

        return [
            line.strip()
            for line in file
            if line.strip()
        ]


# =========================================================
# Path construction
# =========================================================

def get_patch_paths(
    patch_id: str
) -> tuple[Path, Path, Path]:

    parts = patch_id.split("_")

    date = parts[0]
    tile = parts[1]
    patch_number = parts[2]

    folder_name = (
        f"S2_{date}_{tile}"
    )

    file_name = (
        f"S2_{date}_{tile}_{patch_number}"
    )

    folder = (
        PATCHES_DIR
        / folder_name
    )

    image_path = (
        folder
        / f"{file_name}.tif"
    )

    class_path = (
        folder
        / f"{file_name}_cl.tif"
    )

    confidence_path = (
        folder
        / f"{file_name}_conf.tif"
    )

    return (
        image_path,
        class_path,
        confidence_path
    )


# =========================================================
# Patch loading
# =========================================================

def load_patch(
    patch_id: str
) -> tuple[
    np.ndarray,
    np.ndarray,
    np.ndarray
]:

    (
        image_path,
        class_path,
        confidence_path
    ) = get_patch_paths(
        patch_id
    )

    with rasterio.open(
        image_path
    ) as src:

        image = (
            src
            .read()
            .astype(np.float32)
        )

    with rasterio.open(
        class_path
    ) as src:

        class_mask = (
            src.read(1)
        )

    with rasterio.open(
        confidence_path
    ) as src:

        confidence_mask = (
            src.read(1)
        )

    return (
        image,
        class_mask,
        confidence_mask
    )


# =========================================================
# Dataset preparation
# =========================================================

def prepare_dataset(
    patch_ids: list[str],
    split_name: str
) -> tuple[
    np.ndarray,
    np.ndarray,
    np.ndarray
]:

    rgb_parts = []
    multispectral_parts = []
    label_parts = []

    total_patches = len(
        patch_ids
    )

    print()
    print(
        f"Preparing "
        f"{split_name} dataset..."
    )

    for index, patch_id in enumerate(
        patch_ids,
        start=1
    ):

        (
            image,
            class_mask,
            _
        ) = load_patch(
            patch_id
        )

        # Only annotated MARIDA pixels.
        # Class 0 is excluded.
        valid_mask = (
            class_mask > 0
        )

        if not np.any(
            valid_mask
        ):
            continue

        image_hwc = np.moveaxis(
            image,
            0,
            -1
        )

        multispectral_pixels = (
            image_hwc[
                valid_mask
            ]
        )

        rgb_pixels = (
            multispectral_pixels[
                :,
                RGB_INDICES
            ]
        )

        labels = (
            class_mask[
                valid_mask
            ]
            .astype(np.uint8)
        )

        rgb_parts.append(
            rgb_pixels
        )

        multispectral_parts.append(
            multispectral_pixels
        )

        label_parts.append(
            labels
        )

        if (
            index % 100 == 0
            or index == total_patches
        ):
            print(
                f"  {index}/"
                f"{total_patches} patches"
            )

    X_rgb = np.concatenate(
        rgb_parts,
        axis=0
    )

    X_multispectral = (
        np.concatenate(
            multispectral_parts,
            axis=0
        )
    )

    y = np.concatenate(
        label_parts,
        axis=0
    )

    return (
        X_rgb,
        X_multispectral,
        y
    )


# =========================================================
# Dataset summary
# =========================================================

def print_dataset_summary(
    name: str,
    X_rgb: np.ndarray,
    X_multispectral: np.ndarray,
    y: np.ndarray
):

    print()
    print(
        f"{name.upper()} SUMMARY"
    )
    print("-" * 50)

    print(
        "RGB:",
        X_rgb.shape
    )

    print(
        "Multispectral:",
        X_multispectral.shape
    )

    print(
        "Labels:",
        y.shape
    )

    debris_count = int(
        np.sum(
            y == MARINE_DEBRIS_CLASS
        )
    )

    print(
        "Marine Debris pixels:",
        debris_count
    )

    print(
        "Marine Debris percentage:",
        f"{debris_count / len(y) * 100:.4f}%"
    )


# =========================================================
# Model creation
# =========================================================

def create_random_forest():
    return RandomForestClassifier(
        **RF_CONFIG
    )


# =========================================================
# Marine Debris evaluation
# =========================================================

def evaluate_marine_debris(
    y_true: np.ndarray,
    y_pred: np.ndarray
) -> dict:

    true_binary = (
        y_true
        == MARINE_DEBRIS_CLASS
    )

    pred_binary = (
        y_pred
        == MARINE_DEBRIS_CLASS
    )

    precision = precision_score(
        true_binary,
        pred_binary,
        zero_division=0
    )

    recall = recall_score(
        true_binary,
        pred_binary,
        zero_division=0
    )

    f1 = f1_score(
        true_binary,
        pred_binary,
        zero_division=0
    )

    iou = jaccard_score(
        true_binary,
        pred_binary,
        zero_division=0
    )

    true_positive = int(
        np.sum(
            true_binary
            & pred_binary
        )
    )

    false_positive = int(
        np.sum(
            ~true_binary
            & pred_binary
        )
    )

    false_negative = int(
        np.sum(
            true_binary
            & ~pred_binary
        )
    )

    return {
        "precision": float(
            precision
        ),
        "recall": float(
            recall
        ),
        "f1": float(
            f1
        ),
        "iou": float(
            iou
        ),
        "true_positive": (
            true_positive
        ),
        "false_positive": (
            false_positive
        ),
        "false_negative": (
            false_negative
        ),
    }


# =========================================================
# Result printing
# =========================================================

def print_metrics(
    model_name: str,
    metrics: dict,
    training_seconds: float
):

    print()
    print(
        f"{model_name} RESULTS"
    )
    print("=" * 50)

    print(
        "Training time:",
        f"{training_seconds:.2f} s"
    )

    print()

    print(
        "Precision:",
        f"{metrics['precision']:.4f}"
    )

    print(
        "Recall:",
        f"{metrics['recall']:.4f}"
    )

    print(
        "F1:",
        f"{metrics['f1']:.4f}"
    )

    print(
        "IoU:",
        f"{metrics['iou']:.4f}"
    )

    print()

    print(
        "True positives:",
        metrics[
            "true_positive"
        ]
    )

    print(
        "False positives:",
        metrics[
            "false_positive"
        ]
    )

    print(
        "False negatives:",
        metrics[
            "false_negative"
        ]
    )


# =========================================================
# Main experiment
# =========================================================

def main():

    print()
    print(
        "OCEAN DETECTIVE"
    )

    print(
        "RGB vs Multispectral "
        "Random Forest"
    )

    print("=" * 50)

    train_ids = load_split(
        TRAIN_SPLIT
    )

    val_ids = load_split(
        VAL_SPLIT
    )

    test_ids = load_split(
        TEST_SPLIT
    )

    print()
    print(
        "Official MARIDA split"
    )
    print("-" * 50)

    print(
        "Train:",
        len(train_ids)
    )

    print(
        "Validation:",
        len(val_ids)
    )

    print(
        "Test:",
        len(test_ids)
    )

    print()
    print(
        "Test split remains reserved."
    )

    # -----------------------------------------------------
    # Prepare data
    # -----------------------------------------------------

    (
        X_train_rgb,
        X_train_ms,
        y_train
    ) = prepare_dataset(
        train_ids,
        "train"
    )

    (
        X_val_rgb,
        X_val_ms,
        y_val
    ) = prepare_dataset(
        val_ids,
        "validation"
    )

    print_dataset_summary(
        "train",
        X_train_rgb,
        X_train_ms,
        y_train
    )

    print_dataset_summary(
        "validation",
        X_val_rgb,
        X_val_ms,
        y_val
    )

    # -----------------------------------------------------
    # RGB model
    # -----------------------------------------------------

    print()
    print("=" * 50)
    print(
        "Training RGB Random Forest..."
    )

    rgb_model = (
        create_random_forest()
    )

    start = time.time()

    rgb_model.fit(
        X_train_rgb,
        y_train
    )

    rgb_training_seconds = (
        time.time()
        - start
    )

    print(
        "Predicting validation split..."
    )

    rgb_predictions = (
        rgb_model.predict(
            X_val_rgb
        )
    )

    rgb_metrics = (
        evaluate_marine_debris(
            y_val,
            rgb_predictions
        )
    )

    print_metrics(
        "RGB",
        rgb_metrics,
        rgb_training_seconds
    )

    # -----------------------------------------------------
    # Multispectral model
    # -----------------------------------------------------

    print()
    print("=" * 50)

    print(
        "Training Multispectral "
        "Random Forest..."
    )

    multispectral_model = (
        create_random_forest()
    )

    start = time.time()

    multispectral_model.fit(
        X_train_ms,
        y_train
    )

    ms_training_seconds = (
        time.time()
        - start
    )

    print(
        "Predicting validation split..."
    )

    ms_predictions = (
        multispectral_model.predict(
            X_val_ms
        )
    )

    ms_metrics = (
        evaluate_marine_debris(
            y_val,
            ms_predictions
        )
    )

    print_metrics(
        "MULTISPECTRAL",
        ms_metrics,
        ms_training_seconds
    )

    # -----------------------------------------------------
    # Comparison
    # -----------------------------------------------------

    print()
    print("=" * 50)
    print(
        "RGB VS MULTISPECTRAL"
    )
    print("=" * 50)

    print(
        f"{'Metric':<15}"
        f"{'RGB':>12}"
        f"{'Multispectral':>18}"
    )

    print("-" * 45)

    for metric in [
        "precision",
        "recall",
        "f1",
        "iou"
    ]:

        print(
            f"{metric.capitalize():<15}"
            f"{rgb_metrics[metric]:>12.4f}"
            f"{ms_metrics[metric]:>18.4f}"
        )

    # -----------------------------------------------------
    # Save models
    # -----------------------------------------------------

    rgb_model_path = (
        MODELS_DIR
        / "random_forest_rgb.joblib"
    )

    ms_model_path = (
        MODELS_DIR
        / "random_forest_multispectral.joblib"
    )

    joblib.dump(
        rgb_model,
        rgb_model_path
    )

    joblib.dump(
        multispectral_model,
        ms_model_path
    )

    # -----------------------------------------------------
    # Save experiment results
    # -----------------------------------------------------

    results = {
        "experiment": (
            "RGB vs multispectral "
            "Random Forest"
        ),
        "dataset": "MARIDA",
        "split": {
            "train_patches": (
                len(train_ids)
            ),
            "validation_patches": (
                len(val_ids)
            ),
            "test_patches": (
                len(test_ids)
            ),
            "test_used": False,
        },
        "features": {
            "rgb": [
                BAND_NAMES[index]
                for index
                in RGB_INDICES
            ],
            "multispectral": (
                BAND_NAMES
            ),
        },
        "random_forest": (
            RF_CONFIG
        ),
        "validation": {
            "rgb": {
                **rgb_metrics,
                "training_seconds": (
                    rgb_training_seconds
                ),
            },
            "multispectral": {
                **ms_metrics,
                "training_seconds": (
                    ms_training_seconds
                ),
            },
        },
    }

    results_path = (
        RESULTS_DIR
        / "baseline_rf_results.json"
    )

    with open(
        results_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            results,
            file,
            indent=2
        )

    print()
    print("=" * 50)

    print(
        "Experiment completed."
    )

    print(
        "Results:",
        results_path
    )

    print(
        "RGB model:",
        rgb_model_path
    )

    print(
        "Multispectral model:",
        ms_model_path
    )

    print()
    print(
        "IMPORTANT: test split "
        "has NOT been evaluated."
    )


if __name__ == "__main__":
    main()