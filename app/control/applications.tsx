'use client';
import {useLanguage} from "@/app/language";
import { useEffect, useState } from 'react';
import { Download, RefreshCw, UserRound } from 'lucide-react';
import { APPLICATION_STATUSES, DRIVER_REQUIREMENTS, STATUS_LABELS } from '@/lib/recruitment';
import type { ApplicationStatus } from '@/lib/recruitment';
import { SkeletonList } from '../loading-skeletons';
type Application = {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: ApplicationStatus;
    created_at: string;
};
type DocumentRecord = {
    id: string;
    application_id: string;
    kind: string;
    filename: string;
    byte_size: number;
};
type ApplicationData = {
    applications: Application[];
    documents: DocumentRecord[];
};
export default function Applications() {
    const { t, dateLocale } = useLanguage();
    const [data, setData] = useState<ApplicationData>({ applications: [], documents: [] });
    const [loading, setLoading] = useState(true), [error, setError] = useState(''), [saving, setSaving] = useState('');
    async function load(signal?: AbortSignal) {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/control/applications', { cache: 'no-store', signal });
            const result = await response.json() as ApplicationData & {
                error?: string;
            };
            if (!response.ok)
                throw Error(result.error || 'No se pudieron cargar las solicitudes.');
            setData(result);
        }
        catch (cause) {
            if (signal?.aborted)
                return;
            setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las solicitudes.');
        }
        finally {
            if (!signal?.aborted)
                setLoading(false);
        }
    }
    useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, []);
    async function update(id: string, status: ApplicationStatus) {
        setSaving(id);
        setError('');
        try {
            const response = await fetch('/api/control/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
            const result = await response.json() as {
                error?: string;
            };
            if (!response.ok)
                throw Error(result.error || 'No se pudo actualizar la solicitud.');
            setData(current => ({ ...current, applications: current.applications.map(application => application.id === id ? { ...application, status } : application) }));
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la solicitud.');
        }
        finally {
            setSaving('');
        }
    }
    return <section className="control-applications" id="postulaciones" aria-labelledby="applications-title">
    <div className="applications-heading"><div><span className="eyebrow dark">{t("RECLUTAMIENTO")}</span><h2 id="applications-title">{t("Solicitudes de choferes ")}{!loading && !error && <small>({data.applications.length})</small>}</h2><p>{t("Consulta las 100 solicitudes m\u00E1s recientes y descarga sus documentos. El acceso operativo de un chofer se crea por separado.")}</p></div><button className="applications-refresh" type="button" disabled={loading} onClick={() => void load()}><RefreshCw size={16}/>{t(" Actualizar")}</button></div>
    {error && <p className="error" role="alert">{t(error)}</p>}
    {loading ? <SkeletonList label={t("Cargando solicitudes de choferes")} kind="application"/> : error && data.applications.length === 0 ? null : data.applications.length === 0 ? <p className="empty">{t("Todav\u00EDa no hay solicitudes. Se reciben desde ")}<a href="/trabaja-con-nosotros">{t("Trabaja con nosotros")}</a>.</p> : <div className="application-records">{data.applications.map(application => {
                const documents = data.documents.filter(document => document.application_id === application.id);
                return <details key={application.id} className="application-record"><summary><span className="applicant-icon"><UserRound size={20}/></span><span><b>{application.name}</b><small>{new Date(application.created_at).toLocaleDateString(dateLocale, { timeZone: 'UTC' })} · {documents.length}{t(" documentos")}</small></span><span className={`application-status status-${application.status}`}>{t(STATUS_LABELS[application.status] || 'En revisión')}</span></summary><div className="application-record-body">
        <dl><div><dt>{t("Correo")}</dt><dd><a href={`mailto:${application.email}`}>{application.email}</a></dd></div><div><dt>{t("Tel\u00E9fono")}</dt><dd><a href={`tel:${application.phone.replace(/[^+\d]/g, '')}`}>{application.phone}</a></dd></div>{application.company && <div><dt>{t("Empresa o raz\u00F3n social")}</dt><dd>{application.company}</dd></div>}<div><dt>{t("Folio")}</dt><dd>{application.id.toUpperCase()}</dd></div></dl>
        <label className="application-review-status" htmlFor={`status-${application.id}`}>{t("Estado de revisi\u00F3n")}<select id={`status-${application.id}`} value={application.status} disabled={Boolean(saving)} onChange={event => void update(application.id, event.currentTarget.value as ApplicationStatus)}>{APPLICATION_STATUSES.map(status => <option key={status} value={status}>{t(STATUS_LABELS[status])}</option>)}</select></label>
        {saving === application.id && <p role="status" className="application-help">{t("Guardando estado\u2026")}</p>}
        <h3>{t("Documentaci\u00F3n")}</h3><div className="application-downloads">{DRIVER_REQUIREMENTS.map(requirement => {
                        const document = documents.find(item => item.kind === requirement.key);
                        return document ? <a key={requirement.key} href={`/api/control/applications/${application.id}/documents/${document.id}`} download={document.filename}><span><b>{t(requirement.label)}</b><small>{(document.byte_size / 1024).toFixed(0)} KB</small></span><Download size={18}/></a> : <p key={requirement.key}>{t(requirement.label)}{t(": sin documento")}</p>;
                    })}</div>
      </div></details>;
            })}</div>}
  </section>;
}
