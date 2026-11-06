import type {AppDatabase} from './database';

export const DRIVER_REQUIREMENTS = [
  {key:'w9', label:'W9', description:'Formulario W9.'},
  {key:'authority', label:'Operational Authority (MC / DOT)', description:'Documento de autoridad operativa MC / DOT.'},
  {key:'insurance', label:'Current Insurance', description:'Certificado de seguro vigente con el Certificate holder indicado.'},
  {key:'voided_check', label:'Voided Check', description:'Cheque anulado.'},
  {key:'cdl', label:'CDL (Driver License)', description:'Licencia de conducir comercial.'},
  {key:'registration', label:'Registration', description:'Documento de registro.'},
] as const;
export const CERTIFICATE_HOLDER = 'FREIGHTMASTER USA';
export const CERTIFICATE_ADDRESS = '950 Houston Northcutt Blvd, Mount Pleasant, SC 29464';
export const MAX_DOCUMENT_BYTES = 3 * 1024 * 1024;
export const MAX_APPLICATION_BYTES = 19 * 1024 * 1024;
export const APPLICATION_STATUSES = ['new','reviewing','contacted','closed'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];
export const STATUS_LABELS:Record<ApplicationStatus,string> = {new:'Nueva',reviewing:'En revisión',contacted:'Contactado',closed:'Cerrada'};
export type RequirementKey = typeof DRIVER_REQUIREMENTS[number]['key'];
type DocumentUpload = {kind:RequirementKey;filename:string;mime:string;bytes:Uint8Array};
export type ValidApplication = {name:string;email:string;phone:string;company:string;documents:DocumentUpload[]};
export type RecruitmentServices = {
  database:AppDatabase;
  transaction:<T>(work:(database:AppDatabase)=>Promise<T>)=>Promise<T>;
  isAdmin:()=>Promise<boolean>;
  sameOrigin:(request:Request)=>boolean;
  allowSubmission:(request:Request)=>Promise<boolean>;
  readObject:(request:Request,maxBytes:number)=>Promise<Record<string,unknown>|null>;
};
class ApplicationError extends Error {
  status:number;
  constructor(message:string,status=400){super(message);this.status=status;}
}
const privateHeaders = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:privateHeaders});
const uuidPattern=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

async function limitedFormData(request:Request){
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data;'))throw new ApplicationError('Envía la solicitud junto con sus documentos.');
  const size=Number(request.headers.get('content-length')||0);
  if(size>MAX_APPLICATION_BYTES)throw new ApplicationError('La solicitud supera el tamaño permitido.',413);
  const reader=request.body?.getReader();
  if(!reader)throw new ApplicationError('La solicitud está vacía.');
  const chunks:Uint8Array[]=[];let total=0;
  while(true){
    const {done,value}=await reader.read();if(done)break;
    total+=value.byteLength;
    if(total>MAX_APPLICATION_BYTES){await reader.cancel();throw new ApplicationError('La solicitud supera el tamaño permitido.',413);}
    chunks.push(value);
  }
  const bytes=new Uint8Array(total);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return await new Response(bytes,{headers:{'content-type':request.headers.get('content-type')!}}).formData();}
  catch{throw new ApplicationError('No se pudo leer la solicitud. Vuelve a seleccionar tus documentos.');}
}
function textField(form:FormData,key:string,max:number,required=true){
  const entries=form.getAll(key);
  if(entries.length>1||entries.some(value=>typeof value!=='string'))throw new ApplicationError('Revisa los datos de contacto.');
  const value=String(entries[0]??'').trim();
  if((required&&value.length<2)||value.length>max||/[\u0000-\u001f\u007f]/.test(value))throw new ApplicationError('Completa los datos de contacto con valores válidos.');
  return value;
}
export async function validateApplication(form:FormData):Promise<ValidApplication>{
  if(form.get('website'))throw new ApplicationError('No se pudo procesar la solicitud.');
  const allowed=new Set(['name','email','phone','company','consent','website',...DRIVER_REQUIREMENTS.map(r=>r.key)]);
  for(const key of form.keys())if(!allowed.has(key))throw new ApplicationError('La solicitud contiene campos no permitidos.');
  const name=textField(form,'name',100),email=textField(form,'email',254),phone=textField(form,'phone',40),company=textField(form,'company',150,false);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[+\d().\s-]{7,40}$/.test(phone)||phone.replace(/\D/g,'').length<7)throw new ApplicationError('Revisa el correo y el teléfono de contacto.');
  if(form.getAll('consent').length!==1||form.get('consent')!=='yes')throw new ApplicationError('Confirma que autorizas la revisión de tu solicitud.');
  const documents:DocumentUpload[]=[];
  for(const requirement of DRIVER_REQUIREMENTS){
    const entries=form.getAll(requirement.key),file=entries[0];
    if(entries.length!==1||!(file instanceof File)||file.size===0)throw new ApplicationError(`Adjunta el documento ${requirement.label}.`);
    if(file.size>MAX_DOCUMENT_BYTES)throw new ApplicationError(`${requirement.label}: el máximo por archivo es 3 MB.`,413);
    const bytes=new Uint8Array(await file.arrayBuffer());
    const ext=file.name.split('.').pop()?.toLowerCase();let mime='';
    if(ext==='pdf'&&new TextDecoder().decode(bytes.slice(0,5))==='%PDF-')mime='application/pdf';
    else if((ext==='jpg'||ext==='jpeg')&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';
    else if(ext==='png'&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))mime='image/png';
    if(!mime||(file.type&&file.type!==mime&&file.type!=='application/octet-stream'))throw new ApplicationError(`${requirement.label}: usa un PDF, JPG o PNG válido.`);
    // The original filename is never used as a path or a download header.
    documents.push({kind:requirement.key,filename:`${requirement.key}.${mime==='application/pdf'?'pdf':mime==='image/png'?'png':'jpg'}`,mime,bytes});
  }
  return {name,email,phone,company,documents};
}
export async function submitApplication(request:Request,services:RecruitmentServices){
  if(!services.sameOrigin(request))return json({error:'Solicitud no permitida.'},403);
  try{
    if(!await services.allowSubmission(request))return json({error:'Has alcanzado el límite de solicitudes. Intenta más tarde.'},429);
    const application=await validateApplication(await limitedFormData(request));
    const id=crypto.randomUUID(),created=new Date().toISOString();
    await services.transaction(async database=>{
      await database.prepare('INSERT INTO driver_applications(id,name,email,phone,company,status,consented_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,application.name,application.email,application.phone,application.company,'new',created,created,created).run();
      for(const document of application.documents){
        await database.prepare('INSERT INTO driver_application_documents(id,application_id,kind,filename,mime_type,byte_size,content,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,document.kind,document.filename,document.mime,document.bytes.byteLength,Buffer.from(document.bytes),created).run();
      }
    });
    return json({ok:true,reference:id.toUpperCase()},201);
  }catch(error){return json({error:error instanceof ApplicationError?error.message:'No pudimos guardar la solicitud. Tus documentos no se han confirmado; intenta nuevamente.'},error instanceof ApplicationError?error.status:503);}
}
export async function listApplications(services:RecruitmentServices){
  try{
    if(!await services.isAdmin())return json({error:'Acceso restringido.'},403);
    const applications=await services.database.prepare('SELECT id,name,email,phone,company,status,created_at,updated_at FROM driver_applications ORDER BY created_at DESC LIMIT 100').all();
    // Binary content is deliberately excluded from list responses.
    const documents=await services.database.prepare('SELECT d.id,d.application_id,d.kind,d.filename,d.byte_size FROM driver_application_documents d INNER JOIN (SELECT id FROM driver_applications ORDER BY created_at DESC LIMIT 100) a ON a.id=d.application_id').all();
    return json({applications:applications.results,documents:documents.results});
  }catch{return json({error:'No se pudieron cargar las postulaciones.'},503);}
}
export async function changeApplicationStatus(request:Request,services:RecruitmentServices){
  if(!services.sameOrigin(request))return json({error:'Acceso restringido.'},403);
  try{
    if(!await services.isAdmin())return json({error:'Acceso restringido.'},403);
    const body=await services.readObject(request,1000);
    if(!body||typeof body.id!=='string'||!uuidPattern.test(body.id)||!APPLICATION_STATUSES.includes(body.status as ApplicationStatus))return json({error:'Estado o solicitud no válidos.'},400);
    const exists=await services.database.prepare('SELECT id FROM driver_applications WHERE id=?').bind(body.id).first();
    if(!exists)return json({error:'Solicitud no encontrada.'},404);
    await services.database.prepare('UPDATE driver_applications SET status=?,updated_at=? WHERE id=?').bind(body.status,new Date().toISOString(),body.id).run();
    return json({ok:true});
  }catch{return json({error:'No se pudo actualizar el estado.'},503);}
}
export async function downloadApplicationDocument(applicationId:string,documentId:string,services:RecruitmentServices){
  try{
    if(!await services.isAdmin())return json({error:'Acceso restringido.'},403);
    if(!uuidPattern.test(applicationId)||!uuidPattern.test(documentId))return json({error:'Documento no encontrado.'},404);
    const document=await services.database.prepare('SELECT filename,mime_type,content FROM driver_application_documents WHERE id=? AND application_id=?').bind(documentId,applicationId).first<{filename:string;mime_type:string;content:Uint8Array}>();
    if(!document)return json({error:'Documento no encontrado.'},404);
    const filename=/^[a-z_]+\.(pdf|png|jpg)$/.test(document.filename)?document.filename:'documento';
    return new Response(new Uint8Array(document.content),{headers:{...privateHeaders,'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="${filename}"`,'Content-Security-Policy':"default-src 'none'; sandbox",'X-Frame-Options':'DENY'}});
  }catch{return json({error:'No se pudo descargar el documento.'},503);}
}
