# Dataset

This directory is used for satellite imagery and annotation data required by the **Ocean Detective** analysis module.

## MARIDA Dataset

The current experiment uses data from the **MARIDA (Marine Debris Archive)** dataset, which contains Sentinel-2 satellite imagery and corresponding annotations for marine debris and other surface classes.

## Files Used in the Current Experiment

The current analysis expects the following files:

```text
data/
├── S2_14-12-20_18QYF_0.tif
├── S2_14-12-20_18QYF_0_cl.tif
└── S2_14-12-20_18QYF_0_conf.tif
```

### Satellite Image

`S2_14-12-20_18QYF_0.tif`

A multi-band Sentinel-2 satellite image used as the input for the analysis.

### Class Mask

`S2_14-12-20_18QYF_0_cl.tif`

Ground-truth segmentation mask containing the MARIDA class labels for individual pixels.

### Confidence Mask

`S2_14-12-20_18QYF_0_conf.tif`

Annotation confidence mask containing confidence levels associated with the labeled pixels.

## Dataset Storage

Raw GeoTIFF dataset files are not stored in this repository.

The `data/` directory is excluded from Git tracking to avoid committing large dataset files. Only this documentation and the directory structure are included in the repository.

To run the current analysis locally, the required GeoTIFF files must be placed in the `data/` directory.

## Current Input Structure

The current test image has the following properties:

```text
Image shape: 11 × 256 × 256
Spectral bands: 11
Coordinate reference system: EPSG:32618
```

The data is processed by:

```text
ml/scripts/inspect_marida.py
```