'use client';
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,Plus,ClipboardCheck} from 'lucide-react';
import {useLanguage} from '../language';
import {ADMIN_PAGES} from './navigation';
export default function Overview(){
 const {t}=useLanguage();
 return <div className="admin-overview">
  <section className="admin-welcome" aria-labelledby="admin-welcome-title"><div><span>{t('UN ESPACIO PARA CADA TAREA')}</span><h2 id="admin-welcome-title">{t('Todo en su lugar.')}</h2><p>{t('Accede a cada módulo desde el menú. Las herramientas y los formularios están organizados por función.')}</p><div className="admin-welcome-actions"><Link href="/control/choferes" className="button light" prefetch={false}><Plus size={17} aria-hidden="true"/>{t('Registrar chofer')}</Link><Link href="/control/postulaciones" prefetch={false}>{t('Ver postulaciones')}<ArrowUpRight size={17} aria-hidden="true"/></Link></div></div><ClipboardCheck size={130} strokeWidth={.8} className="admin-welcome-art" aria-hidden="true"/></section>
  <div className="admin-modules-heading"><h2>{t('¿Qué necesitas gestionar?')}</h2><span>{t('ACCESOS DIRECTOS')}</span></div>
  <div className="admin-module-grid">{ADMIN_PAGES.slice(1).map(({href,label,description,Icon},index)=><Link href={href} className="admin-module-card" key={href} prefetch={false}><div><span className="admin-module-icon"><Icon size={24} strokeWidth={1.4} aria-hidden="true"/></span><span className="admin-module-number">0{index+1}</span></div><h3>{t(label)}</h3><p>{t(description)}</p><span className="admin-module-open">{t('Abrir sección')}<ArrowRight size={17} aria-hidden="true"/></span></Link>)}</div>
 </div>;
}
