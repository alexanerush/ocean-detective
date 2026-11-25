import { Router } from 'express';
import { analyze,comparison } from '../controllers/research';
import { db } from '../db/connection';
export const api=Router();
api.get('/health',async(req,res)=>{try{await db.authenticate();res.json({status:'ok',service:'ocean-detective-backend',database:'connected'});}catch{res.status(503).json({status:'error',message:'Database unavailable'});}});
api.post('/analyze',analyze);
api.get('/model-comparison',comparison);
