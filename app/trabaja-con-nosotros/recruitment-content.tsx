'use client';
import {useLanguage,LanguageSwitcher} from "@/app/language";
import { ArrowLeft, ArrowDown, FileCheck2, ShieldCheck, Truck } from 'lucide-react';
import { CERTIFICATE_ADDRESS, CERTIFICATE_HOLDER, DRIVER_REQUIREMENTS } from '@/lib/recruitment';
import ApplicationForm from './application-form';
export default function RecruitmentPage() {
    const { t } = useLanguage();
    return <>
    <header className="recruitment-header">
      <a className="brand" href="/" aria-label={t("Freight Master — inicio")}><img src="/freight-master-transparent-e37568de.png" alt="Freight Master" width="1891" height="831"/></a>
      <a className="text-link" href="/"><ArrowLeft size={17}/>{t(" Volver al inicio")}</a>
    <LanguageSwitcher/></header>
    <main className="recruitment-page">
      <section className="recruitment-intro" aria-labelledby="recruitment-title">
        <div><span className="eyebrow dark"><Truck size={16}/>{t(" FORMA PARTE DEL EQUIPO")}</span><h1 id="recruitment-title">{t("Trabaja con")}<br /><em>{t("Freight Master.")}</em></h1><p>{t("Env\u00EDa tus datos y documentaci\u00F3n para que nuestro equipo revise tu solicitud como chofer.")}</p><a className="button wine" href="#documentos">{t("Preparar mi solicitud ")}<ArrowDown size={18}/></a></div>
        <div className="recruitment-summary"><FileCheck2 size={36} strokeWidth={1.2}/><h2>{t("Tu documentaci\u00F3n,")}<br />{t("en un solo lugar.")}</h2><p>{t("Revisa los seis requisitos antes de comenzar. Cada documento tiene su propio espacio de carga.")}</p><span><ShieldCheck size={17}/>{t(" Acceso a documentos solo para administraci\u00F3n")}</span></div>
      </section>
      <section className="recruitment-body" id="documentos" aria-label={t("Requisitos y solicitud de chofer")}>
        <aside className="recruitment-requirements">
          <span className="eyebrow dark">{t("01 / REQUISITOS")}</span><h2>{t("Antes de")}<br />{t("comenzar.")}</h2>
          <ol>{DRIVER_REQUIREMENTS.map(requirement => <li key={requirement.key}><b>{t(requirement.label)}</b><p>{t(requirement.description)}</p></li>)}</ol>
          <div className="certificate-holder"><span>INSURANCE</span><h3>Certificate holder</h3><b>{CERTIFICATE_HOLDER}</b><address>{CERTIFICATE_ADDRESS}</address><p>{t("El certificado de Current Insurance debe incluir estos datos.")}</p></div>
        </aside>
        <ApplicationForm />
      </section>
    </main>
    <footer className="recruitment-footer"><a href="/">Freight Master</a><a href="/control">{t("Administraci\u00F3n")}</a></footer>
  </>;
}
