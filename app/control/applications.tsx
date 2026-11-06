'use client';
import {useEffect,useState} from 'react';
import {Download,RefreshCw,UserRound} from 'lucide-react';
import {APPLICATION_STATUSES,DRIVER_REQUIREMENTS,STATUS_LABELS} from '@/lib/recruitment';
import type {ApplicationStatus} from '@/lib/recruitment';

type Application={id:string;name:string;email:string;phone:string;company:string;status:ApplicationStatus;created_at:string};
type DocumentRecord={id:string;application_id:string;kind:string;filename:string;byte_size:number};
type ApplicationData={applications:Application[];documents:DocumentRecord[]};

export default function Applications(){
  const [data,setData]=useState<ApplicationData>({applications:[],documents:[]});
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[saving,setSaving]=useState('');
  async function load(signal?:AbortSignal){
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/control/applications',{cache:'no-store',signal});
      const result=await response.json() as ApplicationData&{error?:string};
      if(!response.ok)throw Error(result.error||'No se pudieron cargar las solicitudes.');
      setData(result);
    }catch(cause){if(signal?.aborted)return;setError(cause instanceof Error?cause.message:'No se pudieron cargar las solicitudes.');}
    finally{if(!signal?.aborted)setLoading(false);}
  }
  useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[]);
  async function update(id:string,status:ApplicationStatus){
    setSaving(id);setError('');
    try{
      const response=await fetch('/api/control/applications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw Error(result.error||'No se pudo actualizar la solicitud.');
      setData(current=>({...current,applications:current.applications.map(application=>application.id===id?{...application,status}:application)}));
    }catch(cause){setError(cause instanceof Error?cause.message:'No se pudo actualizar la solicitud.');}
    finally{setSaving('');}
  }
  return <section className="control-applications" id="postulaciones" aria-labelledby="applications-title">
    <div className="applications-heading"><div><span className="eyebrow dark">RECLUTAMIENTO</span><h2 id="applications-title">Solicitudes de choferes <small>({data.applications.length})</small></h2><p>Consulta las 100 solicitudes más recientes y descarga sus documentos. El acceso operativo de un chofer se crea por separado.</p></div><button className="applications-refresh" type="button" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> Actualizar</button></div>
    {error&&<p className="error" role="alert">{error}</p>}
    {loading?<p className="empty" role="status">Cargando solicitudes…</p>:data.applications.length===0?<p className="empty">Todavía no hay solicitudes. Se reciben desde <a href="/trabaja-con-nosotros">Trabaja con nosotros</a>.</p>:<div className="application-records">{data.applications.map(application=>{
      const documents=data.documents.filter(document=>document.application_id===application.id);
      return <details key={application.id} className="application-record"><summary><span className="applicant-icon"><UserRound size={20}/></span><span><b>{application.name}</b><small>{new Date(application.created_at).toLocaleDateString('es-MX',{timeZone:'UTC'})} · {documents.length} documentos</small></span><span className={`application-status status-${application.status}`}>{STATUS_LABELS[application.status]||'En revisión'}</span></summary><div className="application-record-body">
        <dl><div><dt>Correo</dt><dd><a href={`mailto:${application.email}`}>{application.email}</a></dd></div><div><dt>Teléfono</dt><dd><a href={`tel:${application.phone.replace(/[^+\d]/g,'')}`}>{application.phone}</a></dd></div>{application.company&&<div><dt>Empresa o razón social</dt><dd>{application.company}</dd></div>}<div><dt>Folio</dt><dd>{application.id.toUpperCase()}</dd></div></dl>
        <label className="application-review-status" htmlFor={`status-${application.id}`}>Estado de revisión<select id={`status-${application.id}`} value={application.status} disabled={Boolean(saving)} onChange={event=>void update(application.id,event.currentTarget.value as ApplicationStatus)}>{APPLICATION_STATUSES.map(status=><option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
        {saving===application.id&&<p role="status" className="application-help">Guardando estado…</p>}
        <h3>Documentación</h3><div className="application-downloads">{DRIVER_REQUIREMENTS.map(requirement=>{
          const document=documents.find(item=>item.kind===requirement.key);
          return document?<a key={requirement.key} href={`/api/control/applications/${application.id}/documents/${document.id}`} download={document.filename}><span><b>{requirement.label}</b><small>{(document.byte_size/1024).toFixed(0)} KB</small></span><Download size={18}/></a>:<p key={requirement.key}>{requirement.label}: sin documento</p>;
        })}</div>
      </div></details>;
    })}</div>}
  </section>;
}
