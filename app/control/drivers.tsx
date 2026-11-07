'use client';
import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowRight,CircleCheck,CircleX} from 'lucide-react';
import {useLanguage} from '../language';
import {SkeletonList} from '../loading-skeletons';
type Driver={id:string;name:string;active:number};
export default function Drivers(){
 const {t}=useLanguage();
 const [data,setData]=useState<{drivers:Driver[]}>({drivers:[]});
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
 async function load(signal?:AbortSignal){
  setLoading(true);setLoadError('');
  try{const response=await fetch('/api/control?section=drivers',{cache:'no-store',signal});const result=await response.json();if(!response.ok)throw Error(result.error||'No se pudo cargar el panel.');setData(result);}
  catch(error){if(!signal?.aborted)setLoadError(error instanceof Error?error.message:'No se pudo cargar el panel.');}
  finally{if(!signal?.aborted)setLoading(false);}
 }
 useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[]);
    async function create(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = e.currentTarget; setBusy(true); try {
        const r = await fetch('/api/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        const d = await r.json() as {
            error?: string;
        };
        if (!r.ok)
            throw Error(d.error);
        setStatus('Chofer registrado. Entrega el ID y PIN al chofer por un canal privado.');
        form.reset();
        await load();
    }
    catch (e) {
        setStatus(e instanceof Error ? e.message : 'No se pudo registrar');
    }
    finally {
        setBusy(false);
    } }
    async function toggle(id: string) { setBusy(true); try {
        const r = await fetch('/api/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'toggle' }) });
        const d = await r.json() as {
            error?: string;
        };
        if (!r.ok)
            throw Error(d.error);
        setStatus('Estado de acceso actualizado.');
        await load();
    }
    catch (e) {
        setStatus(e instanceof Error ? e.message : 'No se pudo actualizar');
    }
    finally {
        setBusy(false);
    } }
 return <div className="control-module">{loadError&&<div role="alert"><p className="error">{t(loadError)}</p><button className="text-link" type="button" onClick={()=>void load()}>{t('Volver a intentar')}</button></div>}<div className="control-layout"><section className="control-card"><h2>{t("Registrar chofer")}</h2><form onSubmit={create}><label>{t("Nombre")}<input name="name" required minLength={2} maxLength={100} autoComplete="off" placeholder={t("Nombre del chofer")}/></label><label>{t("ID de chofer")}<input name="id" required pattern="[A-Za-z0-9-]{3,30}" maxLength={30} autoComplete="off" placeholder={t("Letras, números y guiones")}/></label><label>{t("PIN de acceso")}<input name="pin" type="password" inputMode="numeric" required pattern="[0-9]{6,12}" autoComplete="new-password" placeholder={t("6 a 12 dígitos")}/></label><button className="button wine" disabled={busy}>{t("Crear acceso ")}<ArrowRight size={16}/></button></form><p style={{ marginTop: 18 }}>{t("El PIN se almacena protegido y no se puede consultar. Conserva las credenciales para entregarlas al chofer.")}</p></section><section><h2>{t("Choferes registrados ")}{!loading && !loadError && <small>({data.drivers.length})</small>}</h2>{loading ? <SkeletonList label={t("Cargando choferes registrados")}/> : loadError ? null : data.drivers.length ? data.drivers.map(d => <div className="driver-row" key={d.id}><div><b>{d.name}</b><small>{t("ID: ")}{d.id}</small><small className={`status ${d.active ? '' : 'off'}`}>{d.active ? <><CircleCheck size={10}/>{t(" Acceso activo")}</> : <><CircleX size={10}/>{t(" Acceso desactivado")}</>}</small></div><button disabled={busy} onClick={() => toggle(d.id)}>{d.active ? t('Desactivar') : t('Activar')}</button></div>) : <p className="empty">{t("Todav\u00EDa no hay choferes. Crea el primer acceso con el formulario.")}</p>}<p className="form-status" role="status">{t(status)}</p></section></div></div>;
}
