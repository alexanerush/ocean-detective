import rasterio
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path


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

    print("IMAGE")
    print("Shape:", image.shape)
    print("Bands:", src.count)
    print("CRS:", src.crs)


# -------------------------
# READ CLASS MASK
# -------------------------

with rasterio.open(mask_path) as src:
    mask = src.read(1)

    unique, counts = np.unique(mask, return_counts=True)

    print("\nCLASS COUNTS")

    for class_id, count in zip(unique, counts):
        print(f"Class {int(class_id)}: {count} pixels")


# -------------------------
# READ CONFIDENCE MASK
# -------------------------

with rasterio.open(confidence_path) as src:
    confidence = src.read(1)

    print("\nCONFIDENCE MASK")
    print("Shape:", confidence.shape)
    print("Unique confidence values:", np.unique(confidence))

    unique_conf, counts_conf = np.unique(
        confidence,
        return_counts=True
    )

    print("\nCONFIDENCE COUNTS")

    for value, count in zip(unique_conf, counts_conf):
        print(f"Confidence {int(value)}: {count} pixels")


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

print("\nSaved: results/class_mask.png")


# -------------------------
# CREATE RGB IMAGE
# -------------------------

rgb = image[[3, 2, 1], :, :]
rgb = np.transpose(rgb, (1, 2, 0))

rgb = np.clip(
    rgb,
    0,
    np.percentile(rgb, 99)
)

rgb = rgb / rgb.max()


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
    results_dir / "marine_debris_overlay.png",
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print("Saved: results/marine_debris_overlay.png")


# -------------------------
# FINISHED
# -------------------------

print("\nAnalysis completed successfully.")
print("Generated visualizations are available in the results/ directory.")