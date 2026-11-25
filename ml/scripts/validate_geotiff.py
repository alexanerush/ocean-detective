import json
import sys
import rasterio
import numpy as np
from rasterio.windows import Window

try:
    with rasterio.Env(GDAL_CACHEMAX=32*1024*1024, GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR'):
        with rasterio.open(sys.argv[1], driver='GTiff') as src:
            if src.driver != 'GTiff' or not src.crs:
                raise ValueError('A georeferenced TIFF is required')
            w,h,b = src.width,src.height,src.count
            if not (1 <= w <= 1024 and 1 <= h <= 1024 and 1 <= b <= 11):
                raise ValueError('Raster dimensions or band count exceed limits')
            sizes = [np.dtype(d).itemsize for d in src.dtypes]
            if w*h*sum(sizes) > 128*1024*1024:
                raise ValueError('Decoded raster exceeds 128 MiB')
            for band in range(1,b+1):
                for y in range(0,h,256):
                    for x in range(0,w,256):
                        src.read(band, window=Window(x,y,min(256,w-x),min(256,h-y)))
            print(json.dumps({'width':w,'height':h,'bands':b}))
except Exception:
    print('Invalid or unsupported GeoTIFF', file=sys.stderr)
    sys.exit(2)
