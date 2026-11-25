import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError } from 'sequelize';
import { User } from '../db/models';
import { HttpError } from '../middleware/errors';
const secret = process.env.JWT_SECRET ?? '';
if (Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET must contain at least 32 bytes');
export const cookieName = 'od_session';
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api' };
export function credentials(body: unknown) {
 const b = body as Record<string, unknown> | null;
 if (!b || typeof b.email !== 'string' || typeof b.password !== 'string') throw new HttpError(400,'INVALID_INPUT','Email and password are required');
 const email=b.email.trim().toLowerCase(), password=b.password;
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || password.length<12 || password.length>128) throw new HttpError(400,'INVALID_INPUT','Enter a valid email and a password of 12–128 characters');
 return {email,password};
}
function profile(user: InstanceType<typeof User>) { return {id:String(user.get('user_id')),email:String(user.get('email'))}; }
export async function register(body: unknown) {
 const {email,password}=credentials(body);
 const password_hash=await argon2.hash(password,{type:argon2.argon2id});
 try { return profile(await User.create({email,password_hash})); } catch(e) { if(e instanceof UniqueConstraintError) throw new HttpError(409,'EMAIL_EXISTS','Email already registered'); throw e; }
}
export async function login(body: unknown) {
 const {email,password}=credentials(body);
 const user=await User.findOne({where:{email}});
 if(!user || !(await argon2.verify(String(user.get('password_hash')),password))) throw new HttpError(401,'INVALID_CREDENTIALS','Invalid email or password');
 return profile(user);
}
export function token(id:string) { return jwt.sign({},secret,{subject:id,algorithm:'HS256',expiresIn:'1h',issuer:'ocean-detective',audience:'ocean-detective-web'}); }
export async function currentUser(value:unknown) {
 if(typeof value!=='string') throw new HttpError(401,'UNAUTHORIZED','Sign in required');
 let id: string | undefined;
 try { const decoded=jwt.verify(value,secret,{algorithms:['HS256'],issuer:'ocean-detective',audience:'ocean-detective-web'}); if(typeof decoded!=='string') id=decoded.sub; } catch { throw new HttpError(401,'UNAUTHORIZED','Session expired or invalid'); }
 if(!id || !/^\d+$/.test(id)) throw new HttpError(401,'UNAUTHORIZED','Invalid session');
 const user=await User.findByPk(id); if(!user) throw new HttpError(401,'UNAUTHORIZED','Sign in required'); return profile(user);
}
