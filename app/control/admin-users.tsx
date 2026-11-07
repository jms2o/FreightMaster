'use client';
import {useLanguage} from "@/app/language";
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';
import { SkeletonList } from '../loading-skeletons';
type AdminUser = {
    id: string;
    name: string;
    username: string;
    active: number;
    created_at: string;
};
export default function AdminUsers() {
    const { t, dateLocale } = useLanguage();
    const [users, setUsers] = useState<AdminUser[]>([]), [serverUsername, setServerUsername] = useState('');
    const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
    const [busy, setBusy] = useState(false), [showPassword, setShowPassword] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
    async function load(signal?: AbortSignal) {
        setLoading(true);
        setLoadError('');
        try {
            const r = await fetch('/api/control/admin-users', { cache: 'no-store', signal });
            const data = await r.json() as {
                users: AdminUser[];
                serverUsername: string;
                error?: string;
            };
            if (!r.ok)
                throw Error(data.error || 'No se pudieron cargar los usuarios.');
            setUsers(data.users);
            setServerUsername(data.serverUsername);
        }
        catch (e) {
            if (!signal?.aborted)
                setLoadError(e instanceof Error ? e.message : 'No se pudieron cargar los usuarios.');
        }
        finally {
            if (!signal?.aborted)
                setLoading(false);
        }
    }
    useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, []);
    async function create(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        setError('');
        setMessage('');
        const fields = Object.fromEntries(new FormData(form));
        if (fields.password !== fields.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setBusy(true);
        try {
            const r = await fetch('/api/control/admin-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
            const data = await r.json() as {
                user?: AdminUser;
                error?: string;
            };
            if (!r.ok || !data.user)
                throw Error(data.error || 'No se pudo crear el usuario.');
            const user = data.user;
            setUsers(current => [user, ...current].slice(0, 100));
            form.reset();
            setShowPassword(false);
            setMessage(`Usuario ${user.username} creado. Ya puede ingresar desde /control/login. Entrega su contraseña por un canal privado.`);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo crear el usuario.');
        }
        finally {
            setBusy(false);
        }
    }
    return <section className="admin-users-section" aria-labelledby="admin-users-title" id="usuarios-administradores">
  <div className="admin-users-heading"><span className="admin-users-emblem"><ShieldCheck size={25} strokeWidth={1.5} aria-hidden="true"/></span><div><h2 id="admin-users-title">{t("Usuarios administradores")}</h2><p>{t("Crea un acceso personal para cada integrante del equipo.")}</p></div></div>
  <p className="admin-users-permissions">{t("Los nuevos usuarios tendr\u00E1n acceso completo al panel: choferes, itinerarios, postulaciones, cotizaciones y creaci\u00F3n de otros administradores.")}</p>
  <div className="admin-users-layout">
   <div className="control-card admin-user-form-card"><h3><UserPlus size={19} aria-hidden="true"/>{t(" Crear administrador")}</h3>
    <form onSubmit={create}><fieldset disabled={busy}>
     <label htmlFor="admin-user-name">{t("Nombre completo")}<input id="admin-user-name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder={t("Nombre de la persona")}/></label>
     <label htmlFor="admin-user-username">{t("Usuario")}<input id="admin-user-username" name="username" required minLength={3} maxLength={50} pattern="[A-Za-z0-9][A-Za-z0-9._\-]{2,49}" autoComplete="off" autoCapitalize="none" spellCheck={false} aria-describedby="admin-username-help" placeholder={t("Ej. operaciones.joel")}/></label>
     <p id="admin-username-help" className="admin-input-help">{t("De 3 a 50 letras, n\u00FAmeros, puntos o guiones. Se guardar\u00E1 en min\u00FAsculas.")}</p>
     <label htmlFor="admin-user-password">{t("Contrase\u00F1a")}<input id="admin-user-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={16} maxLength={128} autoComplete="new-password" aria-describedby="admin-password-help"/></label>
     <p id="admin-password-help" className="admin-input-help">{t("De 16 a 128 caracteres.")}</p>
     <label htmlFor="admin-user-confirm">{t("Confirmar contrase\u00F1a")}<input id="admin-user-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'} required minLength={16} maxLength={128} autoComplete="new-password"/></label>
     <button type="button" className="admin-password-toggle" aria-pressed={showPassword} aria-controls="admin-user-password admin-user-confirm" onClick={() => setShowPassword(current => !current)}>{showPassword ? <EyeOff size={16} aria-hidden="true"/> : <Eye size={16} aria-hidden="true"/>}{showPassword ? t('Ocultar contraseñas') : t('Mostrar contraseñas')}</button>
     <button type="submit" className="button wine" disabled={busy}>{busy ? t('Creando usuario…') : t('Crear administrador')}<ArrowRight size={16} aria-hidden="true"/></button>
    </fieldset></form>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <p className="form-status" role="status">{t(message)}</p>
    <p className="admin-user-privacy"><LockKeyhole size={14} aria-hidden="true"/>{t(" La contrase\u00F1a se guarda protegida y no se puede consultar despu\u00E9s.")}</p>
   </div>
   <div className="admin-user-directory"><h3>{t("Accesos al panel")}</h3>
    {loading ? <SkeletonList label={t("Cargando usuarios administradores")} rows={3}/> : loadError ? <div role="alert"><p className="error">{t(loadError)}</p><button type="button" className="text-link" onClick={() => void load()}>{t("Volver a intentar ")}<ArrowRight size={14} aria-hidden="true"/></button></div> : <>
     {serverUsername && <article className="admin-user-record"><ShieldCheck size={22} strokeWidth={1.5} aria-hidden="true"/><div><h4>{t("Administrador principal")}</h4><p>{t("Usuario: ")}{serverUsername}</p><small>{t("Configurado en el servidor")}</small></div><span className="admin-user-badge">{t("Principal")}</span></article>}
     {users.map(user => <article className="admin-user-record" key={user.id}><UserPlus size={21} strokeWidth={1.5} aria-hidden="true"/><div><h4>{user.name}</h4><p>{t("Usuario: ")}{user.username}</p><small>{t("Creado el ")}{new Date(user.created_at).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })}</small></div><span className={`admin-user-badge ${user.active ? '' : 'admin-user-inactive'}`}>{user.active ? t('Activo') : t('Inactivo')}</span></article>)}
     {!users.length && <p className="empty">{t("Todav\u00EDa no hay administradores adicionales. Crea el primero con el formulario.")}</p>}
     <p className="admin-user-directory-note">{t("Se muestran hasta 100 cuentas adicionales. El ingreso es desde ")}<a href="/control/login">/control/login <ArrowRight size={12} aria-hidden="true"/></a>.</p>
    </>}
   </div>
  </div>
 </section>;
}
