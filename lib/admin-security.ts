import { timingSafeEqual, createHash, randomBytes, scrypt } from 'node:crypto';
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
const passwordPattern=/^scrypt\$32768\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
const dummyPasswordHash='scrypt$32768$8$1$'+'0'.repeat(32)+'$'+'0'.repeat(128);
function passwordKey(password:string,salt:string){
 return new Promise<Buffer>((resolve,reject)=>scrypt(password,Buffer.from(salt,'hex'),64,{N:32768,r:8,p:1,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
}
export async function hashAdminPassword(password:string){
 if(password.length<16||password.length>128)throw Error('La contraseña debe tener de 16 a 128 caracteres.');
 const salt=randomBytes(16).toString('hex');
 return `scrypt$32768$8$1$${salt}$${(await passwordKey(password,salt)).toString('hex')}`;
}
export async function verifyAdminPassword(password:string,encoded:string){
 const match=passwordPattern.exec(encoded);
 if(!match||password.length>128)return false;
 return timingSafeEqual(await passwordKey(password,match[1]),Buffer.from(match[2],'hex'));
}
export function userCredentialVersion(id:string,passwordHash:string){return createHash('sha256').update(id+'\0'+passwordHash).digest('hex');}
export type AdminIdentity={kind:'server';version:string}|{kind:'user';id:string;version:string};
export async function authenticateAdmin(database:AppDatabase,username:string,password:string):Promise<AdminIdentity|null>{
 if(!username||username.length>100||!password||password.length>128)return null;
 const configured=configuredCredentials();
 // The server account remains reserved, even when a database row has the same name.
 if(configured&&username.trim().toLowerCase()===configured.username.toLowerCase())return verifyCredentials(username,password)?{kind:'server',version:credentialVersion()!}:null;
 const user=await database.prepare('SELECT id,password_hash,active FROM admin_users WHERE username=?').bind(username.trim().toLowerCase()).first<{id:string;password_hash:string;active:number}>();
 const valid=await verifyAdminPassword(password,user?.password_hash||dummyPasswordHash);
 return valid&&user?.active===1?{kind:'user',id:user.id,version:userCredentialVersion(user.id,user.password_hash)}:null;
}
export function permittedOrigin(req:Request,appUrl=process.env.APP_URL){
 const origin=req.headers.get('origin');if(!origin)return false;
 try{const expected=appUrl?new URL(appUrl).origin:process.env.NODE_ENV==='production'?null:new URL(req.url).origin;return Boolean(expected)&&new URL(origin).origin===expected&&origin===new URL(origin).origin;}catch{return false}
}
export async function sessionAdmin(database:AppDatabase,token:string|undefined,now=Date.now()){
 if(!token||!/^[-a-f0-9]{72}$/.test(token))return false;
 const hash=createHash('sha256').update(token).digest('hex');
 const row=await database.prepare('SELECT credential_version FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(hash,now).first<{credential_version:string}>();
 const version=credentialVersion();if(row&&version&&row.credential_version===version)return true;
 const user=await database.prepare('SELECT u.id,u.username,u.password_hash,s.credential_version FROM admin_user_sessions s JOIN admin_users u ON u.id=s.admin_user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1').bind(hash,now).first<{id:string;username:string;password_hash:string;credential_version:string}>();
 if(!user)return false;
 const configured=configuredCredentials();if(configured&&user.username.toLowerCase()===configured.username.toLowerCase())return false;
 return user.credential_version===userCredentialVersion(user.id,user.password_hash);
}
