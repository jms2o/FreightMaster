import {db,sameOrigin,fail,digest,cookieFlags} from '@/lib/access';
export async function POST(req:Request){
 if(!sameOrigin(req))return fail('Solicitud no permitida',403);
 const token=req.headers.get('cookie')?.match(/(?:^|; )fm_admin=([^;]+)/)?.[1];
 try{if(token&&token.length<=100){const hash=await digest(token);await db().prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(hash).run();await db().prepare('DELETE FROM admin_user_sessions WHERE token_hash=?').bind(hash).run();}}catch{return fail('No se pudo cerrar la sesión. Intenta nuevamente.',503);}
 return Response.json({ok:true},{headers:{'Set-Cookie':`fm_admin=; Path=/; ${cookieFlags()}Max-Age=0`,'Cache-Control':'no-store'}});
}
