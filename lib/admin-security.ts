import { timingSafeEqual, createHash } from 'node:crypto';
import type {AppDatabase} from './database';
export function configuredCredentials(){const username=process.env.ADMIN_USERNAME?.trim()||'admin';const password=process.env.ADMIN_PASSWORD||'';return password.length>=16&&password.length<=128?{username,password}:null;}
export function credentialVersion(){const c=configuredCredentials();return c?createHash('sha256').update(c.username+'\0'+c.password).digest('hex'):null;}
export function verifyCredentials(username:string,password:string){
 const configured=configuredCredentials();
 if(!configured||password.length>128||username.length>100)return false;
 const candidate=createHash('sha256').update(username+'\0'+password).digest();
 const expected=createHash('sha256').update(configured.username+'\0'+configured.password).digest();
 return timingSafeEqual(candidate,expected);
}
export function permittedOrigin(req:Request,appUrl=process.env.APP_URL){
 const origin=req.headers.get('origin');if(!origin)return false;
 try{const expected=appUrl?new URL(appUrl).origin:process.env.NODE_ENV==='production'?null:new URL(req.url).origin;return Boolean(expected)&&new URL(origin).origin===expected&&origin===new URL(origin).origin;}catch{return false}
}
export async function sessionAdmin(database:AppDatabase,token:string|undefined,now=Date.now()){
 const version=credentialVersion();if(!version||!token||!/^[-a-f0-9]{72}$/.test(token))return false;
 const hash=createHash('sha256').update(token).digest('hex');
 const row=await database.prepare('SELECT credential_version FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(hash,now).first<{credential_version:string}>();
 return row?.credential_version===version;
}
