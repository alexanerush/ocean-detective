import { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
export const requestLog: RequestHandler = (req,res,next) => {const requestId=randomUUID(); const start=Date.now(); res.locals.requestId=requestId; res.setHeader('X-Request-ID',requestId); res.on('finish',()=>console.log(JSON.stringify({level:'info',requestId,method:req.method,path:req.path,status:res.statusCode,durationMs:Date.now()-start})));next();};
