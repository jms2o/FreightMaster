import type {Metadata} from 'next';
import {ArrowLeft,ArrowDown,FileCheck2,ShieldCheck,Truck} from 'lucide-react';
import {CERTIFICATE_ADDRESS,CERTIFICATE_HOLDER,DRIVER_REQUIREMENTS} from '@/lib/recruitment';
import ApplicationForm from './application-form';

export const metadata:Metadata={title:'Trabaja con nosotros | Freight Master',description:'Consulta los requisitos y envía tu solicitud con documentos a Freight Master.'};

export default function RecruitmentPage(){
  return <>
    <header className="recruitment-header">
      <a className="brand" href="/" aria-label="Freight Master — inicio"><img src="/freight-master-transparent-e37568de.png" alt="Freight Master" width="1891" height="831"/></a>
      <a className="text-link" href="/"><ArrowLeft size={17}/> Volver al inicio</a>
    </header>
    <main className="recruitment-page">
      <section className="recruitment-intro" aria-labelledby="recruitment-title">
        <div><span className="eyebrow dark"><Truck size={16}/> FORMA PARTE DEL EQUIPO</span><h1 id="recruitment-title">Trabaja con<br/><em>Freight Master.</em></h1><p>Envía tus datos y documentación para que nuestro equipo revise tu solicitud como chofer.</p><a className="button wine" href="#documentos">Preparar mi solicitud <ArrowDown size={18}/></a></div>
        <div className="recruitment-summary"><FileCheck2 size={36} strokeWidth={1.2}/><h2>Tu documentación,<br/>en un solo lugar.</h2><p>Revisa los seis requisitos antes de comenzar. Cada documento tiene su propio espacio de carga.</p><span><ShieldCheck size={17}/> Acceso a documentos solo para administración</span></div>
      </section>
      <section className="recruitment-body" id="documentos" aria-label="Requisitos y solicitud de chofer">
        <aside className="recruitment-requirements">
          <span className="eyebrow dark">01 / REQUISITOS</span><h2>Antes de<br/>comenzar.</h2>
          <ol>{DRIVER_REQUIREMENTS.map(requirement=><li key={requirement.key}><b>{requirement.label}</b><p>{requirement.description}</p></li>)}</ol>
          <div className="certificate-holder"><span>INSURANCE</span><h3>Certificate holder</h3><b>{CERTIFICATE_HOLDER}</b><address>{CERTIFICATE_ADDRESS}</address><p>El certificado de Current Insurance debe incluir estos datos.</p></div>
        </aside>
        <ApplicationForm/>
      </section>
    </main>
    <footer className="recruitment-footer"><a href="/">Freight Master</a><a href="/control">Administración</a></footer>
  </>;
}
