import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import rasterio


# -------------------------
# PATHS
# -------------------------

image_path = "data/S2_14-12-20_18QYF_0.tif"
mask_path = "data/S2_14-12-20_18QYF_0_cl.tif"
confidence_path = "data/S2_14-12-20_18QYF_0_conf.tif"

# Folder for generated results
results_dir = Path("results")
results_dir.mkdir(parents=True, exist_ok=True)


# -------------------------
# READ SATELLITE IMAGE
# -------------------------

with rasterio.open(image_path) as src:
    image = src.read()

    image_width = src.width
    image_height = src.height
    image_bands = src.count
    image_crs = str(src.crs)

    print("IMAGE")
    print("Shape:", image.shape)
    print("Bands:", image_bands)
    print("CRS:", image_crs)


# -------------------------
# READ CLASS MASK
# -------------------------

with rasterio.open(mask_path) as src:
    mask = src.read(1)

    unique, counts = np.unique(
        mask,
        return_counts=True
    )

    print("\nCLASS COUNTS")

    for class_id, count in zip(unique, counts):
        print(
            f"Class {int(class_id)}: "
            f"{int(count)} pixels"
        )


# -------------------------
# READ CONFIDENCE MASK
# -------------------------

with rasterio.open(confidence_path) as src:
    confidence = src.read(1)

    print("\nCONFIDENCE MASK")
    print("Shape:", confidence.shape)
    print(
        "Unique confidence values:",
        np.unique(confidence)
    )

    unique_conf, counts_conf = np.unique(
        confidence,
        return_counts=True
    )

    print("\nCONFIDENCE COUNTS")

    for value, count in zip(
        unique_conf,
        counts_conf
    ):
        print(
            f"Confidence {int(value)}: "
            f"{int(count)} pixels"
        )


# -------------------------
# ANALYSIS STATISTICS
# -------------------------

marine_debris_pixels = int(
    np.sum(mask == 1)
)

class_counts = {
    str(int(class_id)): int(count)
    for class_id, count in zip(
        unique,
        counts
    )
}

confidence_counts = {
    str(int(value)): int(count)
    for value, count in zip(
        unique_conf,
        counts_conf
    )
}


analysis_data = {
    "image": {
        "width": image_width,
        "height": image_height,
        "bands": image_bands,
        "crs": image_crs
    },
    "marine_debris_pixels": marine_debris_pixels,
    "classes": class_counts,
    "confidence": confidence_counts
}


# -------------------------
# SAVE ANALYSIS JSON
# -------------------------

analysis_json_path = (
    results_dir / "analysis.json"
)

with open(
    analysis_json_path,
    "w",
    encoding="utf-8"
) as json_file:
    json.dump(
        analysis_data,
        json_file,
        indent=2
    )

print(
    "\nSaved: results/analysis.json"
)


# -------------------------
# SAVE CLASS MASK
# -------------------------

plt.figure(figsize=(6, 6))

plt.imshow(
    mask,
    cmap="tab20"
)

plt.title("MARIDA Class Mask")
plt.colorbar(label="Class ID")
plt.axis("off")

plt.savefig(
    results_dir / "class_mask.png",
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print("Saved: results/class_mask.png")


# -------------------------
# SAVE CONFIDENCE MASK
# -------------------------

plt.figure(figsize=(6, 6))

plt.imshow(
    confidence,
    cmap="viridis",
    vmin=0,
    vmax=3
)

plt.title("MARIDA Confidence Mask")
plt.colorbar(label="Confidence Level")
plt.axis("off")

plt.savefig(
    results_dir / "confidence_mask.png",
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(
    "Saved: results/confidence_mask.png"
)


# -------------------------
# CREATE RGB IMAGE
# -------------------------

rgb = image[[3, 2, 1], :, :]

rgb = np.transpose(
    rgb,
    (1, 2, 0)
)

rgb = np.clip(
    rgb,
    0,
    np.percentile(rgb, 99)
)

rgb_max = rgb.max()

if rgb_max > 0:
    rgb = rgb / rgb_max


plt.figure(figsize=(6, 6))

plt.imshow(rgb)

plt.title("MARIDA RGB Image")
plt.axis("off")

plt.savefig(
    results_dir / "rgb_image.png",
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print("Saved: results/rgb_image.png")


# -------------------------
# MARINE DEBRIS OVERLAY
# -------------------------

marine_debris = mask == 1

plt.figure(figsize=(6, 6))

plt.imshow(rgb)

plt.imshow(
    marine_debris,
    alpha=0.6,
    cmap="Reds"
)

plt.title("Marine Debris Overlay")
plt.axis("off")

plt.savefig(
    results_dir
    / "marine_debris_overlay.png",
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(
    "Saved: results/"
    "marine_debris_overlay.png"
)


# -------------------------
# FINISHED
# -------------------------

print(
    "\nAnalysis completed successfully."
)

print(
    "Generated visualizations and "
    "statistics are available in "
    "the results/ directory."
)