import {randomUUID} from 'node:crypto';
import type {AppDatabase} from './database';

export type AdminUserServices={
 database:AppDatabase;
 isAdmin:()=>Promise<boolean>;
 sameOrigin:(request:Request)=>boolean;
 allowCreation:()=>Promise<boolean>;
 readObject:(request:Request,maxBytes:number)=>Promise<Record<string,unknown>|null>;
 hashPassword:(password:string)=>Promise<string>;
 reservedUsername:()=>string;
};
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers});

export async function listAdminUsers(services:AdminUserServices){
 try{
  if(!await services.isAdmin())return json({error:'Acceso restringido.'},403);
  const users=await services.database.prepare('SELECT id,name,username,active,created_at FROM admin_users ORDER BY created_at DESC LIMIT 100').all();
  return json({users:users.results,serverUsername:services.reservedUsername()});
 }catch{return json({error:'No se pudieron cargar los usuarios administradores.'},503);}
}

export async function createAdminUser(request:Request,services:AdminUserServices){
 if(!services.sameOrigin(request))return json({error:'Solicitud no permitida.'},403);
 try{
  if(!await services.isAdmin())return json({error:'Acceso restringido.'},403);
  if(!await services.allowCreation())return json({error:'Demasiados registros. Intenta en 15 minutos.'},429);
  const body=await services.readObject(request,3000);
  if(!body||typeof body.name!=='string'||typeof body.username!=='string'||typeof body.password!=='string'||typeof body.confirmPassword!=='string')return json({error:'Completa el nombre, usuario y contraseña.'},400);
  const name=body.name.trim(),username=body.username.trim().toLowerCase(),password=body.password;
  if(name.length<2||name.length>100||/[\u0000-\u001f\u007f]/.test(name))return json({error:'Escribe un nombre de 2 a 100 caracteres.'},400);
  if(!/^[a-z0-9][a-z0-9._-]{2,49}$/.test(username))return json({error:'Usa un usuario de 3 a 50 letras, números, puntos, guiones o guiones bajos.'},400);
  if(password.length<16||password.length>128)return json({error:'La contraseña debe tener de 16 a 128 caracteres.'},400);
  if(password!==body.confirmPassword)return json({error:'Las contraseñas no coinciden.'},400);
  if(username===services.reservedUsername().trim().toLowerCase())return json({error:'Ese nombre de usuario ya está en uso.'},409);
  const existing=await services.database.prepare('SELECT id FROM admin_users WHERE username=?').bind(username).first();
  if(existing)return json({error:'Ese nombre de usuario ya está en uso.'},409);
  const id=randomUUID(),created=new Date().toISOString();
  const passwordHash=await services.hashPassword(password);
  try{await services.database.prepare('INSERT INTO admin_users(id,name,username,password_hash,active,created_at) VALUES(?,?,?,?,1,?)').bind(id,name,username,passwordHash,created).run();}
  catch(error){if((error as {code?:string})?.code==='ER_DUP_ENTRY')return json({error:'Ese nombre de usuario ya está en uso.'},409);throw error;}
  return json({ok:true,user:{id,name,username,active:1,created_at:created}},201);
 }catch{return json({error:'No se pudo crear el usuario. Intenta nuevamente.'},503);}
}
