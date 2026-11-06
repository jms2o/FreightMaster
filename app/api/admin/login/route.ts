import {randomBytes} from 'node:crypto';
import {authenticateAdmin} from '@/lib/admin-security';
import {db,sameOrigin,fail,rate,digest,cookieFlags} from '@/lib/access';
import {readObject} from '@/lib/api-input';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return fail('Solicitud no permitida',403);
 const b=await readObject(req);if(!b||typeof b.username!=='string'||typeof b.password!=='string'||b.username.length>100||b.password.length>128)return fail('Revisa el usuario y la contraseña.');
 try{
  if(!await rate('admin:login',100)||!await rate('admin:login:account:'+await digest(b.username.trim().toLowerCase()),8))return fail('Demasiados intentos. Intenta en 15 minutos.',429);
  const identity=await authenticateAdmin(db(),b.username,b.password);
  if(!identity)return fail('Usuario o contraseña incorrectos.',401);
  const token=randomBytes(36).toString('hex');
  const expires=Date.now()+3600000;
  if(identity.kind==='server')await db().prepare('INSERT INTO admin_sessions(token_hash,credential_version,expires_at) VALUES(?,?,?)').bind(await digest(token),identity.version,expires).run();
  else await db().prepare('INSERT INTO admin_user_sessions(token_hash,admin_user_id,credential_version,expires_at) VALUES(?,?,?,?)').bind(await digest(token),identity.id,identity.version,expires).run();
  return Response.json({ok:true},{headers:{'Set-Cookie':`fm_admin=${token}; Path=/; ${cookieFlags()}Max-Age=3600`,'Cache-Control':'no-store'}});
 }catch{return fail('No se pudo conectar con la base de datos. Revisa la configuración de Hostinger.',503);}
}
