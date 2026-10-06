# ML and Satellite Data Analysis

This module contains the satellite imagery analysis and data processing part of the **Ocean Detective** project.

## Purpose

The module is responsible for reading and analyzing Sentinel-2 satellite imagery from the **MARIDA (Marine Debris Archive)** dataset.

The current implementation performs an initial analysis of a MARIDA image fragment and its corresponding ground-truth masks.

## Current Functionality

The `inspect_marida.py` script:

- reads a multi-band Sentinel-2 GeoTIFF image;
- extracts image dimensions, number of spectral bands, and coordinate reference system (CRS);
- reads the MARIDA class mask;
- calculates the number of pixels belonging to each class;
- reads the confidence mask;
- analyzes annotation confidence levels;
- creates an RGB visualization from the satellite bands;
- generates a visualization of the ground-truth class mask;
- highlights marine debris pixels on the RGB image;
- saves generated visualizations to the `results/` directory.

## Structure

```text
ml/
├── scripts/
│   └── inspect_marida.py
├── notebooks/
├── requirements.txt
└── README.md
```

- `scripts/` — Python scripts for satellite image processing and analysis.
- `notebooks/` — experimental analysis and future research notebooks.
- `requirements.txt` — Python dependencies required by the module.

## Requirements

The current analysis uses:

- Python 3
- Rasterio
- NumPy
- Matplotlib

Dependencies are listed in:

```text
ml/requirements.txt
```

## Running the Analysis

Run the script from the root directory of the project:

```bash
python3 ml/scripts/inspect_marida.py
```

The script analyzes the satellite image and corresponding masks and prints image metadata, class distribution, and confidence statistics to the terminal.

## Generated Results

Generated visualizations are automatically saved to:

```text
results/
```

The current script generates:

```text
results/
├── class_mask.png
├── rgb_image.png
└── marine_debris_overlay.png
```

### `rgb_image.png`

RGB visualization generated from selected spectral bands of the Sentinel-2 satellite image.

### `class_mask.png`

Visualization of the MARIDA ground-truth class mask showing the spatial distribution of annotated classes.

### `marine_debris_overlay.png`

Visualization of pixels labeled as marine debris overlaid on the RGB satellite image.

## Current Stage

The current implementation represents the **data exploration, validation, and preprocessing stage** of the Ocean Detective project.

At this stage, the project can:

1. load multi-band satellite imagery;
2. inspect its spatial and spectral structure;
3. analyze ground-truth annotations;
4. inspect annotation confidence;
5. identify pixels labeled as marine debris;
6. generate visual results for further analysis.

## Future Development

The next stages of the project include:

- automated marine debris classification;
- model training and evaluation;
- comparison between predicted and ground-truth masks;
- calculation of classification metrics;
- integration of the Python analysis module with the backend API;
- visualization of analysis results through the web interface.