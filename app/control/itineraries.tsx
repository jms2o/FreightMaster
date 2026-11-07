'use client';
import {useLanguage} from "@/app/language";
import { FormSkeleton, SkeletonList } from '../loading-skeletons';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CalendarDays, MapPin, Package, ShieldCheck, Pencil, Plus, CheckCircle2, Archive } from 'lucide-react';
type Driver = {
    id: string;
    name: string;
    active: number;
};
type Stop = {
    id: string;
    driver_id: string;
    driver_name: string;
    date: string;
    sequence: number;
    operation: string;
    location: string;
    planned_time: string;
    reference: string;
    instructions: string;
    requirements: string;
    active: number;
};
const names: Record<string, string> = { pickup: 'Pickup / recolección', delivery: 'Entrega / drop', drop_and_hook: 'Drop and hook' };
export default function Itineraries({view='itineraries'}:{view?:'itineraries'|'settings'}) {
    const { t } = useLanguage();
    const [drivers,setDrivers]=useState<Driver[]>([]);
    const [stops, setStops] = useState<Stop[]>([]);
    const [settings, setSettings] = useState({ address: '', security: '', address_en: '', security_en: '' });
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);
    const [edit, setEdit] = useState<Stop | null>(null);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
    async function load(signal?: AbortSignal) {
        setLoading(true);
        setLoadError('');
        try {
            const [r,driverResponse]=await Promise.all([fetch('/api/itinerary?section='+view,{cache:'no-store',signal}),view==='itineraries'?fetch('/api/control?section=drivers',{cache:'no-store',signal}):Promise.resolve(null)]);
            const d = await r.json() as {
                stops: Stop[];
                settings: {
                    address?: string;
                    security?: string;
                address_en?: string;
                security_en?: string;
                };
                error?: string;
            };
            if (!r.ok)
                throw Error(d.error || 'No se pudieron cargar los itinerarios.');
            if(driverResponse){const data=await driverResponse.json();if(!driverResponse.ok)throw Error(data.error||'No se pudo cargar el panel.');setDrivers(data.drivers);}
            setStops(d.stops);
            setSettings({ address: d.settings.address || '', security: d.settings.security || '', address_en: d.settings.address_en || '', security_en: d.settings.security_en || '' });
        }
        catch (e) {
            if (!signal?.aborted)
                setLoadError(e instanceof Error ? e.message : 'No se pudieron cargar los itinerarios.');
        }
        finally {
            if (!signal?.aborted)
                setLoading(false);
        }
    }
    useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [view]);
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = e.currentTarget; setBusy(true); setStatus(''); try {
        const values = Object.fromEntries(new FormData(form));
        const r = await fetch('/api/itinerary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, ...(edit && values.action !== 'settings' ? { action: 'update', id: edit.id } : {}) }) });
        const d = await r.json() as {
            error?: string;
        };
        if (!r.ok)
            throw Error(d.error);
        setStatus(values.action === 'settings' ? 'Respuestas públicas actualizadas.' : 'Itinerario actualizado. El chofer verá el cambio en su próxima consulta.');
        if (values.action !== 'settings') {
            form.reset();
            setEdit(null);
        }
        await load();
    }
    catch (e) {
        setStatus(e instanceof Error ? e.message : 'No se pudo guardar');
    }
    finally {
        setBusy(false);
    } }
    async function toggle(id: string) { setBusy(true); try {
        const r = await fetch('/api/itinerary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle', id }) });
        if (!r.ok)
            throw Error('No se pudo actualizar');
        await load();
        setStatus('Estado de la parada actualizado.');
    }
    catch (e) {
        setStatus(String(e));
    }
    finally {
        setBusy(false);
    } }
    return <>{view==='itineraries'&&<section className="itinerary-section"><div className="admin-section-title"><CalendarDays size={24}/><div><h2>{t("Itinerarios de choferes")}</h2><p>{t("Asigna las paradas en orden. Los horarios se expresan en la zona de Tijuana / Mexicali.")}</p></div></div><div className="itinerary-layout"><form key={edit?.id || 'new'} className="itinerary-form" onSubmit={submit}><h3>{edit ? t('Editar parada') : t('Añadir parada')}</h3><label>{t("Chofer")}<select name="driverId" required defaultValue={edit?.driver_id || ''}><option value="" disabled>{t("Selecciona un chofer")}</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name} · {d.id}{d.active ? '' : t(' · Inactivo')}</option>)}</select></label><div className="form-row"><label>{t("Fecha")}<input type="date" name="date" required defaultValue={edit?.date}/></label><label>{t("Orden de la parada")}<input name="sequence" type="number" min={1} max={99} required defaultValue={edit?.sequence || 1}/></label></div><label>{t("Maniobra")}<select name="operation" defaultValue={edit?.operation || 'pickup'}><option value="pickup">{t("Pickup / recolecci\u00F3n")}</option><option value="delivery">{t("Entrega / drop")}</option><option value="drop_and_hook">Drop and hook</option></select></label><div className="form-row"><label>{t("Hora local (opcional)")}<input type="time" name="plannedTime" defaultValue={edit?.planned_time}/></label><label>{t("Referencia de carga")}<input name="reference" maxLength={100} defaultValue={edit?.reference} placeholder={t("Solo si aplica")}/></label></div><label>{t("Ubicaci\u00F3n o direcci\u00F3n")}<input name="location" required minLength={3} maxLength={500} defaultValue={edit?.location} placeholder={t("Nombre del lugar y dirección confirmada")}/></label><label>{t("Instrucciones operativas")}<textarea name="instructions" rows={3} maxLength={1500} defaultValue={edit?.instructions} placeholder={t("Qué debe hacer al llegar y cuál es el siguiente paso")}/></label><label>{t("Documentos y requisitos")}<textarea name="requirements" rows={3} maxLength={1500} defaultValue={edit?.requirements} placeholder={t("Requisitos confirmados para esta maniobra")}/></label><button className="button wine" disabled={busy || !drivers.length}>{edit ? t('Guardar cambios') : t('Guardar parada')}<Plus size={16}/></button>{edit && <button className="back" type="button" onClick={() => setEdit(null)}>{t("Cancelar edici\u00F3n")}</button>}<p className="form-note" style={{ marginTop: 16 }}>{t("Registra \u00FAnicamente los datos operativos que el chofer necesita. No incluyas claves, informaci\u00F3n bancaria ni documentos personales.")}</p></form><div><label>{t("Filtrar itinerarios")}<select disabled={loading} value={filter} onChange={e => setFilter(e.target.value)}><option value="">{t("Todos los choferes")}</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>{loading ? <SkeletonList label={t("Cargando itinerarios")} kind="stop" rows={2}/> : loadError ? <p className="error" role="alert">{t(loadError)}</p> : <>{stops.filter(s => !filter || s.driver_id === filter).map(s => <article className={`stop-card ${s.active ? '' : 'archived'}`} key={s.id}><div className="stop-meta"><span>{s.date}{s.planned_time ? ' · ' + s.planned_time : ''}</span><span>{s.active ? t('Activa') : t('Desactivada')}</span></div><h3>{s.sequence}. {t(names[s.operation])}</h3><b className="stop-driver">{s.driver_name} · {s.driver_id}</b><p><MapPin size={15}/>{s.location}</p>{s.reference && <p><Package size={15}/>{s.reference}</p>}<p className="stop-instructions">{s.instructions || t('Sin instrucciones registradas.')}</p>{s.requirements && <p className="stop-requirements">{t("Requisitos: ")}{s.requirements}</p>}<div className="stop-actions"><button onClick={() => setEdit(s)}><Pencil size={13}/>{t("Editar")}</button><button disabled={busy} onClick={() => toggle(s.id)}>{s.active ? <Archive size={13}/> : <CheckCircle2 size={13}/>} {s.active ? t('Desactivar') : t('Restaurar')}</button></div></article>)}{!stops.length && <p className="empty">{t("A\u00FAn no hay paradas. Cuando las registres, el chofer podr\u00E1 preguntar \u00AB\u00BFQu\u00E9 hago hoy?\u00BB en su chat.")}</p>}</>}</div></div><p role="status" className="form-status">{t(status)}</p></section>}{view==='settings'&&<section className="itinerary-section"><div className="admin-section-title"><ShieldCheck size={24}/><div><h2>{t("Informaci\u00F3n del asistente p\u00FAblico")}</h2><p>{t("El bot responder\u00E1 con estos datos cuando pregunten por ubicaci\u00F3n o seguridad.")}</p></div></div><div className="company-form">{loading ? <FormSkeleton label={t("Cargando información del asistente")} multiline/> : loadError ? <p className="error" role="alert">{t(loadError)}</p> : <form onSubmit={submit}><input type="hidden" name="action" value="settings"/><label>{t("Ubicación oficial (español)")}<textarea key={'address' + settings.address} name="address" rows={3} maxLength={1500} defaultValue={settings.address} placeholder={t("Dirección y horarios que sí pueden compartirse públicamente")}/></label><label>{t("Seguridad y cobertura (español)")}<textarea key={'security' + settings.security} name="security" rows={4} maxLength={1500} defaultValue={settings.security} placeholder={t("Solo políticas, coberturas y condiciones confirmadas de la empresa")}/></label><label>{t("Ubicación oficial (inglés)")}<textarea key={'address_en'+settings.address_en} name="address_en" rows={3} maxLength={1500} defaultValue={settings.address_en} placeholder={t("Escribe la versión en inglés de la dirección y horarios públicos.")}/></label><label>{t("Seguridad y cobertura (inglés)")}<textarea key={'security_en'+settings.security_en} name="security_en" rows={4} maxLength={1500} defaultValue={settings.security_en} placeholder={t("Escribe la versión en inglés de las condiciones confirmadas.")}/></label><p className="form-note">{t("Estas versiones se muestran según el idioma elegido por el visitante.")}</p><button className="button wine" disabled={busy}>{t("Guardar respuestas")}<ArrowRight size={16}/></button></form>}</div><p role="status" className="form-status">{t(status)}</p></section>}</>;
}
