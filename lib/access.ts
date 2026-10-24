import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export function db(){ if(!env.DB)throw new Error('Base de datos no disponible'); return env.DB; }
export async function admin(){ const user=await getChatGPTUser();if(!user)return false; const row=await db().prepare('SELECT user_id FROM owners WHERE slot=1').first<{user_id:string}>();return row?.user_id===user.userId; }
// Initialization occurs only on the owner-private control screen, before any public rollout.
export async function initializeOwner(){ const user=await getChatGPTUser();if(!user)return false;await db().prepare('INSERT OR IGNORE INTO owners(slot,user_id) VALUES(1,?)').bind(user.userId).run();return admin(); }
export function sameOrigin(req:Request){ return req.headers.get('origin')===new URL(req.url).origin; }
export const fail=(message:string,status=400)=>Response.json({error:message},{status});
export async function digest(s:string){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(buf),x=>x.toString(16).padStart(2,'0')).join('');}
export async function pinHash(pin:string,salt:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256);return Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('');}
export async function rate(key:string,max:number){const now=Date.now();await db().prepare('INSERT INTO login_attempts(key,count,until) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<? THEN 1 ELSE count+1 END, until=CASE WHEN until<? THEN excluded.until ELSE until END').bind(key,now+900000,now,now).run();const r=await db().prepare('SELECT count FROM login_attempts WHERE key=?').bind(key).first<{count:number}>();return (r?.count||0)<=max;}
