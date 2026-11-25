import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { SatelliteImage } from '../db/models';
import { env } from '../config/env';
import { HttpError } from '../middleware/errors';
import { projectRoot } from './research';
export const storageRoot = path.resolve(process.env.UPLOAD_DIR || path.join(projectRoot,'private-uploads'));
export const maxBytes = 25*1024*1024;
const attributes=['image_id','original_filename','file_size_bytes','width_pixels','height_pixels','band_count','uploaded_at'];
export async function saveUpload(userId:string,file:Express.Multer.File){
 try {
  if(!file.size || !/\.tiff?$/i.test(file.originalname)) throw new HttpError(415,'INVALID_FILE','Only nonempty GeoTIFF files are accepted');
  let meta:{width:number;height:number;bands:number};
  try { const {stdout}=await promisify(execFile)(env.python,[path.join(projectRoot,'ml/scripts/validate_geotiff.py'),file.path],{timeout:60000,maxBuffer:16384}); meta=JSON.parse(stdout); } catch(e) { if((e as {code?:unknown}).code===2) throw new HttpError(422,'INVALID_RASTER','Invalid GeoTIFF or raster exceeds limits'); throw new HttpError(503,'VALIDATOR_FAILED','Raster validation unavailable'); }
  const hash=createHash('sha256'); for await(const chunk of createReadStream(file.path)) hash.update(chunk);
  const row=await SatelliteImage.create({user_id:userId,original_filename:path.basename(file.originalname),storage_uri:file.filename,sha256:hash.digest('hex'),file_size_bytes:file.size,width_pixels:meta.width,height_pixels:meta.height,band_count:meta.bands});
  return Object.fromEntries(attributes.map(key=>[key,row.get(key)]));
 } catch(e){await unlink(file.path).catch(()=>{});throw e;}
}
export async function listUploads(userId:string,page:number){return SatelliteImage.findAndCountAll({where:{user_id:userId},attributes,order:[['uploaded_at','DESC'],['image_id','DESC']],limit:20,offset:page*20});}
