import type { RequestHandler } from 'express';
import { currentUser, cookieName } from '../services/auth';
export const requireAuth: RequestHandler = async (req,res,next) => { res.locals.user=await currentUser(req.cookies?.[cookieName]); next(); };
