from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import rasterio
from matplotlib.colors import ListedColormap


# =========================================================
# Configuration
# =========================================================

MARIDA_ROOT = Path.home() / "Datasets" / "MARIDA"
PATCHES_DIR = MARIDA_ROOT / "patches"

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODELS_DIR = PROJECT_ROOT / "ml" / "models"
RESULTS_DIR = PROJECT_ROOT / "results"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)

RGB_MODEL_PATH = (
    MODELS_DIR / "random_forest_rgb.joblib"
)

MULTISPECTRAL_MODEL_PATH = (
    MODELS_DIR / "random_forest_multispectral.joblib"
)

# Validation patch with 99 Marine Debris pixels
PATCH_ID = "14-3-20_18QYF_4"

# B02, B03, B04
RGB_INDICES = [1, 2, 3]

MARINE_DEBRIS_CLASS = 1

# MARIDA class 0 is not a semantic class.
# It represents an unannotated region and must therefore
# be excluded from quantitative evaluation.
UNANNOTATED_CLASS = 0


# =========================================================
# Paths
# =========================================================

def get_patch_paths(patch_id: str):
    date, tile, number = patch_id.split("_")

    folder = (
        PATCHES_DIR
        / f"S2_{date}_{tile}"
    )

    base_name = (
        f"S2_{date}_{tile}_{number}"
    )

    image_path = (
        folder
        / f"{base_name}.tif"
    )

    class_path = (
        folder
        / f"{base_name}_cl.tif"
    )

    return image_path, class_path


# =========================================================
# Load patch
# =========================================================

def load_patch(patch_id: str):
    image_path, class_path = (
        get_patch_paths(patch_id)
    )

    with rasterio.open(image_path) as src:
        image = (
            src.read()
            .astype(np.float32)
        )

    with rasterio.open(class_path) as src:
        class_mask = src.read(1)

    return image, class_mask


# =========================================================
# Create RGB image for display
# =========================================================

def create_rgb_image(image):
    # Sentinel-2 true-color:
    # B04 = Red
    # B03 = Green
    # B02 = Blue

    rgb = image[
        [3, 2, 1],
        :,
        :
    ]

    rgb = np.moveaxis(
        rgb,
        0,
        -1
    )

    rgb_display = np.zeros_like(
        rgb,
        dtype=np.float32
    )

    # Contrast stretch for display only
    for channel in range(3):
        band = rgb[:, :, channel]

        low = np.percentile(
            band,
            2
        )

        high = np.percentile(
            band,
            98
        )

        if high > low:
            normalized = (
                (band - low)
                / (high - low)
            )
        else:
            normalized = (
                np.zeros_like(band)
            )

        rgb_display[
            :,
            :,
            channel
        ] = np.clip(
            normalized,
            0,
            1
        )

    return rgb_display


# =========================================================
# Model prediction
# =========================================================

def predict_patch(
    model,
    image,
    feature_indices
):
    height = image.shape[1]
    width = image.shape[2]

    image_hwc = np.moveaxis(
        image,
        0,
        -1
    )

    pixels = image_hwc.reshape(
        -1,
        image_hwc.shape[-1]
    )

    selected_features = pixels[
        :,
        feature_indices
    ]

    predictions = model.predict(
        selected_features
    )

    prediction_mask = (
        predictions.reshape(
            height,
            width
        )
    )

    return prediction_mask


# =========================================================
# Valid evaluation mask
# =========================================================

def create_valid_mask(ground_truth):
    """
    MARIDA class 0 represents an unannotated region.

    Only pixels with a semantic ground-truth class (> 0)
    are valid for quantitative evaluation.
    """

    return (
        ground_truth
        != UNANNOTATED_CLASS
    )


# =========================================================
# Error map
# =========================================================

def create_error_map(
    ground_truth,
    prediction
):
    valid_mask = (
        create_valid_mask(
            ground_truth
        )
    )

    gt_debris = (
        ground_truth
        == MARINE_DEBRIS_CLASS
    )

    pred_debris = (
        prediction
        == MARINE_DEBRIS_CLASS
    )

    error_map = np.zeros(
        ground_truth.shape,
        dtype=np.uint8
    )

    # 0 = background / unannotated / correct non-debris
    # 1 = True Positive
    # 2 = False Positive
    # 3 = False Negative

    true_positive = (
        valid_mask
        & gt_debris
        & pred_debris
    )

    false_positive = (
        valid_mask
        & ~gt_debris
        & pred_debris
    )

    false_negative = (
        valid_mask
        & gt_debris
        & ~pred_debris
    )

    error_map[
        true_positive
    ] = 1

    error_map[
        false_positive
    ] = 2

    error_map[
        false_negative
    ] = 3

    return error_map


# =========================================================
# Patch metrics
# =========================================================

def calculate_patch_metrics(
    ground_truth,
    prediction
):
    valid_mask = (
        create_valid_mask(
            ground_truth
        )
    )

    gt_debris = (
        ground_truth
        == MARINE_DEBRIS_CLASS
    )

    pred_debris = (
        prediction
        == MARINE_DEBRIS_CLASS
    )

    tp = int(
        np.sum(
            valid_mask
            & gt_debris
            & pred_debris
        )
    )

    fp = int(
        np.sum(
            valid_mask
            & ~gt_debris
            & pred_debris
        )
    )

    fn = int(
        np.sum(
            valid_mask
            & gt_debris
            & ~pred_debris
        )
    )

    precision = (
        tp / (tp + fp)
        if tp + fp > 0
        else 0.0
    )

    recall = (
        tp / (tp + fn)
        if tp + fn > 0
        else 0.0
    )

    f1 = (
        2 * precision * recall
        / (precision + recall)
        if precision + recall > 0
        else 0.0
    )

    iou = (
        tp / (tp + fp + fn)
        if tp + fp + fn > 0
        else 0.0
    )

    return {
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "iou": iou,
    }


# =========================================================
# Save binary mask
# =========================================================

def save_binary_mask(
    mask,
    path,
    title
):
    plt.figure(
        figsize=(6, 6)
    )

    plt.imshow(
        mask,
        cmap="gray",
        vmin=0,
        vmax=1
    )

    plt.title(title)
    plt.axis("off")
    plt.tight_layout()

    plt.savefig(
        path,
        dpi=200,
        bbox_inches="tight"
    )

    plt.close()


# =========================================================
# Save error map
# =========================================================

def save_error_map(
    error_map,
    path,
    title
):
    cmap = ListedColormap([
        "black",   # background
        "lime",    # TP
        "red",     # FP
        "yellow",  # FN
    ])

    plt.figure(
        figsize=(6, 6)
    )

    plt.imshow(
        error_map,
        cmap=cmap,
        vmin=0,
        vmax=3
    )

    plt.title(title)
    plt.axis("off")
    plt.tight_layout()

    plt.savefig(
        path,
        dpi=200,
        bbox_inches="tight"
    )

    plt.close()


# =========================================================
# Main
# =========================================================

def main():
    print()
    print("OCEAN DETECTIVE")
    print("Prediction visualization")
    print("=" * 50)

    print()
    print(
        "Validation patch:",
        PATCH_ID
    )

    # -----------------------------------------------------
    # Load trained models
    # -----------------------------------------------------

    print()
    print("Loading trained models...")

    rgb_model = joblib.load(
        RGB_MODEL_PATH
    )

    multispectral_model = (
        joblib.load(
            MULTISPECTRAL_MODEL_PATH
        )
    )

    print("Models loaded.")

    # -----------------------------------------------------
    # Load validation patch
    # -----------------------------------------------------

    image, ground_truth = (
        load_patch(PATCH_ID)
    )

    print()
    print(
        "Image shape:",
        image.shape
    )

    valid_mask = (
        create_valid_mask(
            ground_truth
        )
    )

    valid_pixel_count = int(
        np.sum(valid_mask)
    )

    unannotated_pixel_count = int(
        np.sum(~valid_mask)
    )

    ground_truth_debris_count = int(
        np.sum(
            ground_truth
            == MARINE_DEBRIS_CLASS
        )
    )

    print(
        "Annotated evaluation pixels:",
        valid_pixel_count
    )

    print(
        "Unannotated pixels excluded:",
        unannotated_pixel_count
    )

    print(
        "Ground truth debris pixels:",
        ground_truth_debris_count
    )

    # -----------------------------------------------------
    # Run predictions
    # -----------------------------------------------------

    print()
    print("Running RGB prediction...")

    rgb_prediction = predict_patch(
        rgb_model,
        image,
        RGB_INDICES
    )

    print(
        "Running multispectral prediction..."
    )

    multispectral_prediction = (
        predict_patch(
            multispectral_model,
            image,
            list(range(11))
        )
    )

    # -----------------------------------------------------
    # Binary debris masks
    # -----------------------------------------------------

    gt_debris = (
        ground_truth
        == MARINE_DEBRIS_CLASS
    )

    # Predictions are generated for the complete patch.
    # For evaluation visualizations, however, class-0
    # regions are excluded because they are unannotated.

    rgb_debris = (
        rgb_prediction
        == MARINE_DEBRIS_CLASS
    )

    ms_debris = (
        multispectral_prediction
        == MARINE_DEBRIS_CLASS
    )

    rgb_debris_evaluation = (
        rgb_debris
        & valid_mask
    )

    ms_debris_evaluation = (
        ms_debris
        & valid_mask
    )

    # -----------------------------------------------------
    # Metrics
    # -----------------------------------------------------

    rgb_metrics = (
        calculate_patch_metrics(
            ground_truth,
            rgb_prediction
        )
    )

    ms_metrics = (
        calculate_patch_metrics(
            ground_truth,
            multispectral_prediction
        )
    )

    print()
    print(
        "RGB PATCH RESULTS "
        "(ANNOTATED PIXELS ONLY)"
    )

    print("-" * 50)

    for key, value in rgb_metrics.items():
        if isinstance(value, float):
            print(
                f"{key}: {value:.4f}"
            )
        else:
            print(
                f"{key}: {value}"
            )

    print()

    print(
        "MULTISPECTRAL PATCH RESULTS "
        "(ANNOTATED PIXELS ONLY)"
    )

    print("-" * 50)

    for key, value in ms_metrics.items():
        if isinstance(value, float):
            print(
                f"{key}: {value:.4f}"
            )
        else:
            print(
                f"{key}: {value}"
            )

    # -----------------------------------------------------
    # Error maps
    # -----------------------------------------------------

    rgb_error = create_error_map(
        ground_truth,
        rgb_prediction
    )

    ms_error = create_error_map(
        ground_truth,
        multispectral_prediction
    )

    # -----------------------------------------------------
    # RGB visualization
    # -----------------------------------------------------

    rgb_display = (
        create_rgb_image(image)
    )

    rgb_image_path = (
        RESULTS_DIR
        / "validation_rgb_image.png"
    )

    plt.figure(
        figsize=(6, 6)
    )

    plt.imshow(
        rgb_display
    )

    plt.title(
        f"Sentinel-2 RGB — {PATCH_ID}"
    )

    plt.axis("off")
    plt.tight_layout()

    plt.savefig(
        rgb_image_path,
        dpi=200,
        bbox_inches="tight"
    )

    plt.close()

    # -----------------------------------------------------
    # Save masks
    # -----------------------------------------------------

    save_binary_mask(
        gt_debris.astype(
            np.uint8
        ),
        RESULTS_DIR
        / "validation_ground_truth.png",
        "Ground Truth — Marine Debris"
    )

    save_binary_mask(
        rgb_debris_evaluation.astype(
            np.uint8
        ),
        RESULTS_DIR
        / "validation_rgb_prediction.png",
        (
            "RGB Random Forest Prediction "
            "— Annotated Pixels"
        )
    )

    save_binary_mask(
        ms_debris_evaluation.astype(
            np.uint8
        ),
        RESULTS_DIR
        / "validation_multispectral_prediction.png",
        (
            "Multispectral Random Forest Prediction "
            "— Annotated Pixels"
        )
    )

    save_error_map(
        rgb_error,
        RESULTS_DIR
        / "validation_rgb_error.png",
        (
            "RGB Error Map "
            "— Annotated Pixels"
        )
    )

    save_error_map(
        ms_error,
        RESULTS_DIR
        / "validation_multispectral_error.png",
        (
            "Multispectral Error Map "
            "— Annotated Pixels"
        )
    )

    # -----------------------------------------------------
    # Combined comparison
    # -----------------------------------------------------

    figure, axes = plt.subplots(
        2,
        3,
        figsize=(15, 10)
    )

    # Satellite RGB
    axes[0, 0].imshow(
        rgb_display
    )

    axes[0, 0].set_title(
        "Sentinel-2 RGB"
    )

    # Ground truth
    axes[0, 1].imshow(
        gt_debris,
        cmap="gray",
        vmin=0,
        vmax=1
    )

    axes[0, 1].set_title(
        "Ground Truth — Marine Debris"
    )

    # Information
    axes[0, 2].axis("off")

    axes[0, 2].text(
        0.05,
        0.84,
        "Validation comparison",
        fontsize=16,
        weight="bold"
    )

    axes[0, 2].text(
        0.05,
        0.69,
        f"Patch: {PATCH_ID}",
        fontsize=12
    )

    axes[0, 2].text(
        0.05,
        0.59,
        (
            "Ground-truth debris: "
            f"{ground_truth_debris_count} pixels"
        ),
        fontsize=12
    )

    axes[0, 2].text(
        0.05,
        0.49,
        (
            "Annotated evaluation pixels: "
            f"{valid_pixel_count}"
        ),
        fontsize=11
    )

    axes[0, 2].text(
        0.05,
        0.39,
        (
            "Class 0 excluded: "
            f"{unannotated_pixel_count} pixels"
        ),
        fontsize=11
    )

    axes[0, 2].text(
        0.05,
        0.20,
        (
            "Error map:\n"
            "Green = True Positive\n"
            "Red = False Positive\n"
            "Yellow = False Negative"
        ),
        fontsize=10
    )

    error_cmap = ListedColormap([
        "black",
        "lime",
        "red",
        "yellow",
    ])

    # RGB errors
    axes[1, 0].imshow(
        rgb_error,
        cmap=error_cmap,
        vmin=0,
        vmax=3
    )

    axes[1, 0].set_title(
        (
            "RGB Error Map — Annotated Pixels\n"
            f"F1={rgb_metrics['f1']:.3f}, "
            f"IoU={rgb_metrics['iou']:.3f}"
        )
    )

    # Multispectral errors
    axes[1, 1].imshow(
        ms_error,
        cmap=error_cmap,
        vmin=0,
        vmax=3
    )

    axes[1, 1].set_title(
        (
            "Multispectral Error Map "
            "— Annotated Pixels\n"
            f"F1={ms_metrics['f1']:.3f}, "
            f"IoU={ms_metrics['iou']:.3f}"
        )
    )

    # Multispectral prediction
    axes[1, 2].imshow(
        ms_debris_evaluation,
        cmap="gray",
        vmin=0,
        vmax=1
    )

    axes[1, 2].set_title(
        (
            "Multispectral Prediction "
            "— Annotated Pixels"
        )
    )

    for axis in axes.flat:
        axis.set_xticks([])
        axis.set_yticks([])

    figure.suptitle(
        (
            "Ocean Detective — "
            "RGB vs Multispectral Validation"
        ),
        fontsize=18
    )

    figure.tight_layout()

    comparison_path = (
        RESULTS_DIR
        / "validation_model_comparison.png"
    )

    figure.savefig(
        comparison_path,
        dpi=200,
        bbox_inches="tight"
    )

    plt.close(
        figure
    )

    # -----------------------------------------------------
    # Finished
    # -----------------------------------------------------

    print()
    print("=" * 50)

    print(
        "Visualization completed."
    )

    print()

    print(
        "IMPORTANT: patch metrics were calculated "
        "only on annotated MARIDA pixels (class > 0)."
    )

    print(
        "Class 0 regions were excluded from "
        "TP / FP / FN evaluation."
    )

    print()

    print("Saved:")
    print(comparison_path)

    print(
        RESULTS_DIR
        / "validation_rgb_image.png"
    )

    print(
        RESULTS_DIR
        / "validation_ground_truth.png"
    )

    print(
        RESULTS_DIR
        / "validation_rgb_prediction.png"
    )

    print(
        RESULTS_DIR
        / "validation_multispectral_prediction.png"
    )

    print(
        RESULTS_DIR
        / "validation_rgb_error.png"
    )

    print(
        RESULTS_DIR
        / "validation_multispectral_error.png"
    )


if __name__ == "__main__":
    main()