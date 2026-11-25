import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir,readFile,rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Model } from 'sequelize';
import { Analysis,SatelliteImage,MlModel,ObjectClass,Detection } from '../db/models';
import { db } from '../db/connection';
import { env } from '../config/env';
import { HttpError } from '../middleware/errors';
import { projectRoot } from './research';
import { storageRoot } from './uploads';
const root=path.resolve(projectRoot,'private-analyses');
export const artifacts=['rgb.png','segmentation.png','overlay.png','confidence.png','mask.tif','confidence.tif','analysis.json','confidence-values.png'];
function id(value:string){if(!/^[1-9][0-9]{0,18}$/.test(value)||BigInt(value)>9223372036854775807n)throw new HttpError(400,'INVALID_ID','Invalid identifier');return value;}
async function image(user:string,imageId:string){const row=await SatelliteImage.findOne({where:{image_id:id(imageId),user_id:user}});if(!row)throw new HttpError(404,'NOT_FOUND','Image not found');return row;}
export async function ownedAnalysis(user:string,analysisId:string){const row=await Analysis.findByPk(id(analysisId));if(!row)throw new HttpError(404,'NOT_FOUND','Analysis not found');await image(user,String(row.get('image_id')));return row;}
export async function listAnalyses(user:string,imageId:string){await image(user,imageId);return Analysis.findAll({where:{image_id:imageId},attributes:['analysis_id','status','submitted_at','completed_at'],order:[['analysis_id','DESC']],limit:100});}
export function artifactPath(row:Model,name:string){const uri=String(row.get('mask_storage_uri'));if(row.get('status')!=='COMPLETED'||!/^[a-f0-9-]{36}\/mask\.tif$/.test(uri))throw new HttpError(404,'NOT_FOUND','Artifact unavailable');return path.join(root,path.dirname(uri),name);}
let busy=false;
type Summary={class_id:number;pixel_count:number;mean_confidence:number|null};
export async function runAnalysis(user:string,imageId:string){
 if(busy)throw new HttpError(429,'ANALYSIS_BUSY','Another analysis is running');busy=true;
 let row:Model|undefined;const key=randomUUID();const output=path.join(root,key);
 try{const img=await image(user,imageId);if(Number(img.get('band_count'))!==11)throw new HttpError(422,'BANDS_REQUIRED','Exactly 11 MARIDA bands required');const filename=String(img.get('storage_uri'));if(!/^[a-f0-9-]{36}\.tif$/.test(filename))throw new HttpError(500,'STORAGE_ERROR','Invalid storage reference');const model=await MlModel.findOne({where:{model_name:'Multispectral Random Forest',version:'1.0'}});const classes=await ObjectClass.findAll();if(!model||classes.length!==15)throw new HttpError(503,'CATALOG_REQUIRED','Apply model catalog migration');
 await mkdir(root,{recursive:true,mode:0o700});row=await Analysis.create({image_id:imageId,model_id:model.get('model_id'),status:'RUNNING'});
 try{await promisify(execFile)(env.python,[path.join(projectRoot,'ml/scripts/predict_multiclass.py'),path.join(storageRoot,filename),output,'--confirm-marida'],{timeout:60000,killSignal:'SIGKILL',maxBuffer:65536});}catch{throw new HttpError(422,'INFERENCE_FAILED','Inference failed or exceeded 60 seconds');}
 const result=JSON.parse(await readFile(path.join(output,'analysis.json'),'utf8')) as {classes:Summary[];valid_pixels:number};const summaries=result.classes;
 if(!Array.isArray(summaries)||summaries.length!==15||new Set(summaries.map(s=>s.class_id)).size!==15||summaries.some(s=>!Number.isInteger(s.class_id)||s.class_id<1||s.class_id>15||!Number.isInteger(s.pixel_count)||s.pixel_count<0||(s.pixel_count===0?s.mean_confidence!==null:typeof s.mean_confidence!=='number'||!Number.isFinite(s.mean_confidence)||s.mean_confidence<0||s.mean_confidence>1))||summaries.reduce((n,s)=>n+s.pixel_count,0)!==result.valid_pixels)throw new Error('Invalid inference summary');
 const analysisId=row.get('analysis_id');await db.transaction(async transaction=>{await Detection.bulkCreate(summaries.map(s=>({analysis_id:analysisId,class_id:classes.find(c=>Number(c.get('class_code'))===s.class_id)!.get('class_id'),pixel_count:s.pixel_count,mean_confidence:s.mean_confidence})),{transaction});await Analysis.update({status:'COMPLETED',completed_at:new Date(),mask_storage_uri:key+'/mask.tif'},{where:{analysis_id:analysisId,status:'RUNNING'},transaction});});return {analysis_id:String(analysisId),status:'COMPLETED'};
 }catch(e){if(row){await Analysis.update({status:'FAILED',completed_at:new Date(),error_message:'Analysis failed'},{where:{analysis_id:row.get('analysis_id'),status:'RUNNING'}}).catch(()=>{});await rm(output,{recursive:true,force:true}).catch(()=>{});}throw e;}finally{busy=false;}
}
