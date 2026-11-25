"""Pixel-wise inference for MARIDA-compatible reflectance rasters."""
import argparse
import json
import time
from pathlib import Path

import joblib
import numpy as np
import rasterio
from rasterio.windows import Window
from matplotlib import image as mpimg
from matplotlib import colormaps

ROOT = Path(__file__).resolve().parents[2]
BANDS = ['B01','B02','B03','B04','B05','B06','B07','B08','B8A','B11','B12']
# Numeric IDs are authoritative; names must be verified against dataset documentation.
COLORS = np.array([[0,0,0],[239,68,68],[234,179,8],[163,166,53],[249,115,22],[168,85,247],[248,250,252],[30,64,175],[146,64,14],[132,204,22],[148,163,184],[34,197,94],[56,189,248],[71,85,105],[22,163,74],[250,204,21]], dtype=np.uint8)


def run(source, output, model_path, confirmed):
    start = time.monotonic()
    with rasterio.open(source) as src:
        if src.driver != 'GTiff' or src.count != 11 or not src.crs:
            raise ValueError('Expected a georeferenced 11-band GeoTIFF')
        if not (1 <= src.width <= 1024 and 1 <= src.height <= 1024):
            raise ValueError('Maximum dimensions: 1024 x 1024')
        if src.width * src.height * sum(np.dtype(d).itemsize for d in src.dtypes) > 128*1024**2:
            raise ValueError('Decoded raster exceeds 128 MiB')
        if not confirmed:
            raise ValueError('Confirm MARIDA band order and reflectance preprocessing with --confirm-marida')
        model = joblib.load(model_path)  # trusted local artifact only
        if model.n_features_in_ != 11 or not np.array_equal(model.classes_, np.arange(1,16)):
            raise ValueError('Incompatible model')
        model.n_jobs = 2
        h,w = src.height,src.width
        mask = np.zeros((h,w), np.uint8)
        confidence = np.full((h,w), -1, np.float32)
        rgb = np.zeros((h,w,3), np.float32)
        for y in range(0,h,256):
            for x in range(0,w,256):
                win = Window(x,y,min(256,w-x),min(256,h-y))
                data = src.read(window=win, masked=True).astype(np.float32)
                a = np.moveaxis(data.filled(np.nan),0,-1)
                valid = np.isfinite(a).all(axis=-1)
                sl = np.s_[y:y+int(win.height),x:x+int(win.width)]
                rgb[sl] = a[:,:,[3,2,1]]
                if valid.any():
                    p = model.predict_proba(a[valid])
                    mask[sl][valid] = model.classes_[p.argmax(axis=1)]
                    confidence[sl][valid] = p.max(axis=1)
        profile = dict(driver='GTiff',width=w,height=h,count=1,crs=src.crs,transform=src.transform,compress='deflate')
        crs = str(src.crs)
    valid = mask > 0
    if not valid.any():
        raise ValueError('No valid pixels')
    output.mkdir(parents=True,exist_ok=False)
    for name,arr,dtype,nodata in [('mask.tif',mask,'uint8',0),('confidence.tif',confidence,'float32',-1)]:
        with rasterio.open(output/name,'w',**profile,dtype=dtype,nodata=nodata) as dst:
            dst.write(arr,1)
    for c in range(3):
        lo,hi = np.percentile(rgb[:,:,c][valid],[2,98])
        rgb[:,:,c] = np.clip((rgb[:,:,c]-lo)/max(float(hi-lo),1e-8),0,1)
    rgb[~valid] = 0
    seg = COLORS[mask]/255.0
    overlay = 0.55*rgb + 0.45*seg
    heat = colormaps['viridis'](np.clip(confidence,0,1))
    heat[~valid,3] = 0
    for name,arr in [('rgb.png',rgb),('segmentation.png',seg),('overlay.png',overlay),('confidence.png',heat)]:
        mpimg.imsave(output/name,arr)
    # Encode probability in RGB for exact client-side thresholding (8-bit).
    encoded = np.zeros((h,w,3), dtype=np.uint8)
    encoded[:,:,0] = np.rint(np.clip(confidence,0,1)*255).astype(np.uint8)
    encoded[:,:,1] = valid.astype(np.uint8)*255
    mpimg.imsave(output/'confidence-values.png',encoded)
    counts = []
    for i in range(1,16):
        selected = mask == i
        n = int(selected.sum())
        counts.append(dict(class_id=i,pixel_count=n,mean_confidence=float(confidence[selected].mean()) if n else None))
    result = dict(model='Multispectral Random Forest',width=w,height=h,bands=BANDS,crs=crs,valid_pixels=int(valid.sum()),nodata_pixels=int((~valid).sum()),classes=counts,processing_seconds=round(time.monotonic()-start,3),confidence_definition='Maximum Random Forest predict_proba; not calibrated',band_compatibility='User confirmed MARIDA order and preprocessing')
    (output/'analysis.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2))

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('source',type=Path)
    p.add_argument('output',type=Path)
    p.add_argument('--model',type=Path,default=ROOT/'ml/models/random_forest_multispectral.joblib')
    p.add_argument('--confirm-marida',action='store_true')
    a=p.parse_args()
    run(a.source,a.output,a.model,a.confirm_marida)
