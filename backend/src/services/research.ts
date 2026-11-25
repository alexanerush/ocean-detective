import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';
import { HttpError } from '../middleware/errors';
export const projectRoot=path.resolve(__dirname,'../../..');
const run=promisify(execFile);
let busy=false;
export async function analyzeSample(){if(busy)throw new HttpError(409,'SAMPLE_BUSY','Sample analysis already running');busy=true;try{const {stdout}=await run(env.python,[path.join(projectRoot,'ml/scripts/inspect_marida.py')],{cwd:projectRoot,timeout:60000,maxBuffer:2*1024*1024});const analysis=JSON.parse(await readFile(path.join(projectRoot,'results/analysis.json'),'utf8'));return {status:'success',message:'Satellite image analysis completed',analysis,output:stdout};}finally{busy=false;}}
export async function modelComparison(){const results=JSON.parse(await readFile(path.join(projectRoot,'results/baseline_rf_results.json'),'utf8'));return {status:'success',experiment:{name:'RGB vs Multispectral Random Forest',dataset:'MARIDA',split:'validation',target_class:'Marine Debris'},results,visualization:'/results/validation_model_comparison.png'};}
