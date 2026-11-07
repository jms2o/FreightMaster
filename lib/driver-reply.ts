import {translate} from './i18n.ts';
export type Stop={id:string;driver_id:string;date:string;sequence:number;operation:string;location:string;planned_time:string;reference:string;instructions:string;requirements:string;active:number};
export function localDate(offset=0,now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Tijuana',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const get=(key:string)=>parts.find(x=>x.type===key)!.value;const date=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10)}
export const operationName:Record<string,string>={pickup:'Pickup / recolección',delivery:'Entrega / drop',drop_and_hook:'Drop and hook'};
export function driverReply(message:string,name:string,date:string,stops:Stop[],locale:'es'|'en'='es'){
 const en=locale==='en',tr=(text:string)=>translate(text,locale);
 const text=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/emergencia|accidente|peligro|asalto|emergency|accident|danger|robbery/.test(text))return tr('Prioriza tu seguridad. Si hay una emergencia, contacta a los servicios de emergencia y a tu coordinador por el canal operativo. Este chat no despacha ayuda ni monitorea emergencias.');
 if(/document|requisit|necesit|ocupo|llevar|papel|requirement|need|paper/.test(text)){
  if(!stops.length)return en?`No stops are assigned for ${date}, and no requirements are recorded for your operation. Ask your coordinator to update your itinerary.`:`No hay paradas asignadas para ${date}; tampoco tengo requisitos registrados para tu operación. Pide al coordinador que actualice tu itinerario.`;
  const intro=en?`Recorded requirements for your stops on ${date}:\n\n`:`Requisitos registrados para tus paradas del ${date}:\n\n`;
  return intro+stops.map(stop=>`${stop.sequence}. ${tr(operationName[stop.operation])} · ${stop.location}\n${stop.requirements||tr('El coordinador no ha registrado requisitos para esta parada.')}`).join('\n\n')+'\n\n'+tr('Si falta un requisito, confírmalo con el coordinador antes de realizar la maniobra.');
 }
 if(/hoy|manana|ruta|itinerario|carga|hacer|parada|pickup|pick up|drop|donde|destino|mover|instruccion|today|tomorrow|route|itinerary|load|doing|task|stop|where|destination|instruction|delivery/.test(text)){
  if(!stops.length)return en?`${name}, you have no recorded stops for ${date}. This does not confirm that you have no work: ask your coordinator to add or update your itinerary.`:`${name}, no tienes paradas registradas para ${date}. Esto no confirma que no tengas trabajo: pide al coordinador que cargue o actualice tu itinerario.`;
  const intro=en?`${name}, this is your recorded itinerary for ${date}. Times are in the Tijuana / Mexicali time zone.\n\n`:`${name}, este es tu itinerario registrado para ${date}. Horarios de la zona de Tijuana / Mexicali.\n\n`;
  return intro+stops.map(stop=>`${stop.sequence}. ${tr(operationName[stop.operation])}${stop.planned_time?' · '+stop.planned_time:tr(' · Horario sin confirmar')}\n${en?'Location':'Ubicación'}: ${stop.location}${stop.reference?'\n'+(en?'Reference':'Referencia')+': '+stop.reference:''}\n${en?'Instructions':'Instrucciones'}: ${stop.instructions||tr('Sin instrucciones registradas.')}`).join('\n\n')+'\n\n'+tr('Sigue las instrucciones confirmadas de tu coordinador. El chat no tiene tráfico ni navegación en vivo.');
 }
 return tr('Puedo consultar el itinerario que el equipo te asignó, las instrucciones de cada parada y sus requisitos. Prueba «¿Qué hago hoy?», «¿Qué tengo mañana?» o «¿Qué documentos necesito?». Solo consulto la información asociada a tu acceso.');
}
