import {asLocale,requestLocale,translate} from '@/lib/i18n';
import {readObject} from '@/lib/api-input';
import {sameOrigin,fail,db} from '@/lib/access';
import {reply} from '@/lib/replies';
export async function POST(req:Request){
 if(!sameOrigin(req))return fail('Solicitud no permitida',403);
 const body=await readObject(req);
 if(!body)return fail('Solicitud JSON no válida o demasiado grande.');
 if(typeof body.message!=='string'||body.message.length>500)return fail('Mensaje no válido');
 const locale=body.locale===undefined?requestLocale(req):asLocale(body.locale);
 const text=body.message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 let key='';
 if(/ubicacion|ubicados|direccion|donde estan|donde se encuentran|location|address|where.*(you|office|located)/.test(text))key='address';
 else if(/segur|confiab|garantia|riesgo|cobertura|security|safety|coverage|insurance|risk/.test(text))key='security';
 if(key){
  const lookup=(name:string)=>db().prepare('SELECT value FROM company_settings WHERE `key`=?').bind(name).first<{value:string}>();
  const localized=locale==='en'?await lookup(key+'_en'):null;
  if(localized?.value)return Response.json({message:localized.value});
  const original=await lookup(key);
  const fallback=key==='address'?'El equipo aún no ha registrado una ubicación oficial en este asistente. Solicita que te confirmen la dirección al atender tu cotización.':'El equipo aún no ha publicado aquí sus condiciones de seguridad y cobertura. Solicita confirmarlas para tu operación; no puedo garantizar cobertura ni ausencia de riesgos.';
  return Response.json({message:original?.value?(locale==='en'?'Information provided by the Freight Master team (original text):\n':'')+original.value:translate(fallback,locale)});
 }
 return Response.json({message:reply(body.message,false,locale)});
}
