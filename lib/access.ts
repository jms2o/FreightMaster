import {cookies} from 'next/headers';
import {getDatabase} from './database';
import {permittedOrigin,sessionAdmin} from './admin-security';
export const db=getDatabase;
export async function admin(){return sessionAdmin(db(),(await cookies()).get('fm_admin')?.value);}
export const sameOrigin=permittedOrigin;
export const fail=(message:string,status=400)=>Response.json({error:message},{status});
export async function digest(s:string){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(buf),x=>x.toString(16).padStart(2,'0')).join('');}
export async function pinHash(pin:string,salt:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256);return Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('');}
export async function rate(key:string,max:number){const now=Date.now();await db().prepare('INSERT INTO login_attempts(`key`,`count`,`until`) VALUES(?,1,?) ON DUPLICATE KEY UPDATE `count`=CASE WHEN `until`<? THEN 1 ELSE `count`+1 END, `until`=CASE WHEN `until`<? THEN VALUES(`until`) ELSE `until` END').bind(key,now+900000,now,now).run();const r=await db().prepare('SELECT `count` FROM login_attempts WHERE `key`=?').bind(key).first<{count:number}>();return (r?.count||0)<=max;}
export function cookieFlags(){return 'HttpOnly; SameSite=Strict; '+(process.env.NODE_ENV==='production'?'Secure; ':'');}
