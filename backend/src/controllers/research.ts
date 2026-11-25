import { RequestHandler } from 'express';
import { analyzeSample,modelComparison } from '../services/research';
export const analyze:RequestHandler=async(req,res)=>{res.json(await analyzeSample());};
export const comparison:RequestHandler=async(req,res)=>{res.json(await modelComparison());};
