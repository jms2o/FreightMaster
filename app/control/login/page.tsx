'use client';
import {useLanguage,LanguageSwitcher} from "@/app/language";
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
export default function AdminLogin() {
    const { t } = useLanguage();
    const [busy, setBusy] = useState(false), [error, setError] = useState('');
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); try {
        const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
        const data = await response.json();
        if (!response.ok)
            throw Error(data.error || 'No se pudo ingresar.');
        window.location.assign('/control');
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo conectar.');
        setBusy(false);
    } }
    return <main className="admin-login"><LanguageSwitcher/><a href="/" className="back"><ArrowLeft size={14}/>{t(" Volver a Freight Master")}</a><div className="admin-login-card"><img src="/logo.png" alt="Freight Master"/><LockKeyhole size={25} strokeWidth={1.5}/><h1>{t("Administraci\u00F3n")}</h1><p>{t("Ingresa con tu usuario para gestionar la operaci\u00F3n y los accesos administrativos.")}</p><form onSubmit={submit}><label>{t("Usuario")}<input name="username" required autoComplete="username" maxLength={100}/></label><label>{t("Contrase\u00F1a")}<input name="password" type="password" required autoComplete="current-password" maxLength={128}/></label><button className="button wine" disabled={busy}>{busy ? t('Verificando…') : t('Ingresar')}<ArrowRight size={16}/></button><p className="error" role="alert">{t(error)}</p></form></div></main>;
}
