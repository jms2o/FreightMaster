'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,RefreshCw} from 'lucide-react';
import {useLanguage} from '../language';
import {SkeletonList} from '../loading-skeletons';
type Quote={id:string;company:string;contact:string;origin:string;destination:string;cargo:string;created_at:string};
export default function Quotes(){
 const {t,dateLocale}=useLanguage();
 const [data,setData]=useState<{quotes:Quote[]}>({quotes:[]});
 const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
 async function load(signal?:AbortSignal){
  setLoading(true);setLoadError('');
  try{const response=await fetch('/api/control?section=quotes',{cache:'no-store',signal});const result=await response.json();if(!response.ok)throw Error(result.error||'No se pudo cargar el panel.');setData(result);}
  catch(error){if(!signal?.aborted)setLoadError(error instanceof Error?error.message:'No se pudo cargar el panel.');}
  finally{if(!signal?.aborted)setLoading(false);}
 }
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[]);
 return <div className="control-module"><div className="control-module-tools"><p>{t('Consulta las 100 solicitudes de cotización más recientes.')}</p><button className="applications-refresh" type="button" disabled={loading} onClick={()=>void load()}><RefreshCw size={16} aria-hidden="true"/>{t('Actualizar')}</button></div>{loadError&&<p className="error" role="alert">{t(loadError)}</p>}<section className="control-quotes"><h2>{t("Solicitudes de cotizaci\u00F3n")}</h2>{loading ? <SkeletonList label={t("Cargando solicitudes de cotización")} kind="quote"/> : loadError ? null : data.quotes.length ? data.quotes.map(q => <article className="quote-record" key={q.id}><div><b>{q.company}</b><p>{q.origin} <ArrowRight size={14}/> {q.destination}</p><small>{t("Referencia: ")}{q.id.slice(0, 8).toUpperCase()} · {new Date(q.created_at).toLocaleDateString(dateLocale)}</small></div><div><p>{q.contact}</p><p>{q.cargo}</p></div></article>) : <p className="empty">{t("Las solicitudes enviadas desde la web aparecer\u00E1n aqu\u00ED.")}</p>}</section></div>;
}
