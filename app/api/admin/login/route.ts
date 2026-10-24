import {randomBytes} from 'node:crypto';
import {configuredCredentials,verifyCredentials,credentialVersion} from '@/lib/admin-security';
import {db,sameOrigin,fail,rate,digest,cookieFlags} from '@/lib/access';
import {readObject} from '@/lib/api-input';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return fail('Solicitud no permitida',403);
 if(!configuredCredentials())return fail('Configura primero la administración en Hostinger.',503);
 const b=await readObject(req);if(!b||typeof b.username!=='string'||typeof b.password!=='string'||b.username.length>100||b.password.length>128)return fail('Revisa el usuario y la contraseña.');
 try{
  if(!await rate('admin:login',8))return fail('Demasiados intentos. Intenta en 15 minutos.',429);
  if(!verifyCredentials(b.username,b.password))return fail('Usuario o contraseña incorrectos.',401);
  const token=randomBytes(36).toString('hex');
  await db().prepare('INSERT INTO admin_sessions(token_hash,credential_version,expires_at) VALUES(?,?,?)').bind(await digest(token),credentialVersion(),Date.now()+3600000).run();
  return Response.json({ok:true},{headers:{'Set-Cookie':`fm_admin=${token}; Path=/; ${cookieFlags()}Max-Age=3600`,'Cache-Control':'no-store'}});
 }catch{return fail('No se pudo conectar con la base de datos. Revisa la configuración de Hostinger.',503);}
}
