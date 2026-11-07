'use client';
import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,ChevronRight,LockKeyhole,LogOut,Menu,X} from 'lucide-react';
import {LanguageSwitcher,useLanguage} from '../language';
import {ADMIN_PAGES} from './navigation';

function Navigation({pathname,onNavigate}:{pathname:string;onNavigate?:()=>void}){
 const {t}=useLanguage();
 return <><Link href="/control" className="admin-brand" onClick={onNavigate} prefetch={false} aria-label={t('Inicio del panel')}><img src="/freight-master-transparent-e37568de.png" alt="Freight Master" width={184} height={81}/></Link>
  <span className="admin-nav-label">{t('TU ESPACIO DE TRABAJO')}</span>
  <nav className="admin-navigation" aria-label={t('Menú administrativo')}>{ADMIN_PAGES.map(({href,label,Icon})=><Link key={href} href={href} prefetch={false} onClick={onNavigate} aria-current={pathname===href?'page':undefined}><Icon size={19} strokeWidth={1.6} aria-hidden="true"/><span>{t(label)}</span>{pathname===href&&<ChevronRight className="admin-current-arrow" size={15} aria-hidden="true"/>}</Link>)}</nav>
  <div className="admin-sidebar-footer"><span><LockKeyhole size={14} aria-hidden="true"/>{t('Panel privado')}</span><a href="/">{t('Visitar sitio web')}<ArrowUpRight size={15} aria-hidden="true"/></a></div>
 </>;
}
export default function ControlShell({children}:{children:ReactNode}){
 const {t}=useLanguage();
 const pathname=usePathname()?.replace(/\/$/,'')||'/control';
 const page=ADMIN_PAGES.find(item=>item.href===pathname)||ADMIN_PAGES[0];
 const drawer=useRef<HTMLDialogElement>(null),menuButton=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false),[signingOut,setSigningOut]=useState(false),[error,setError]=useState('');
 function closeMenu(){drawer.current?.close();setOpen(false);}
 useEffect(()=>{drawer.current?.close();setOpen(false);},[pathname]);
 useEffect(()=>{const width=window.matchMedia('(min-width: 1001px)');const close=()=>{if(width.matches){drawer.current?.close();setOpen(false);}};width.addEventListener('change',close);return()=>width.removeEventListener('change',close);},[]);
 async function logout(){
  setSigningOut(true);setError('');
  try{const response=await fetch('/api/admin/logout',{method:'POST'});if(!response.ok)throw Error('No se pudo cerrar la sesión. Intenta nuevamente.');window.location.assign('/control/login');}
  catch(cause){setError(cause instanceof Error?cause.message:'No se pudo cerrar la sesión. Intenta nuevamente.');setSigningOut(false);}
 }
 return <div className="admin-shell">
  <a href="#admin-content" className="admin-skip-link">{t('Saltar al contenido')}</a>
  <aside className="admin-sidebar"><Navigation pathname={pathname}/></aside>
  <dialog id="admin-mobile-navigation" ref={drawer} className="admin-mobile-menu" aria-label={t('Menú administrativo')} onClose={()=>{setOpen(false);menuButton.current?.focus();}} onClick={event=>{if(event.target===event.currentTarget){const bounds=event.currentTarget.getBoundingClientRect();if(event.clientX>bounds.right||event.clientY>bounds.bottom)closeMenu();}}}>
   <button className="admin-menu-close" type="button" onClick={closeMenu} aria-label={t('Cerrar menú')}><X size={22} aria-hidden="true"/></button><Navigation pathname={pathname} onNavigate={closeMenu}/>
  </dialog>
  <div className="admin-main-column">
   <header className="admin-toolbar">
    <button ref={menuButton} className="admin-menu-toggle" type="button" aria-controls="admin-mobile-navigation" aria-expanded={open} onClick={()=>{drawer.current?.showModal();setOpen(true);}} aria-label={t('Abrir menú')}><Menu size={23} aria-hidden="true"/></button>
    <div className="admin-breadcrumb"><Link href="/control" prefetch={false}>{t('Administración')}</Link><ChevronRight size={14} aria-hidden="true"/><span>{t(page.label)}</span></div>
    <div className="admin-toolbar-actions"><LanguageSwitcher/><button type="button" className="admin-logout" aria-label={t(signingOut?'Cerrando sesión…':'Cerrar sesión')} onClick={()=>void logout()} disabled={signingOut}><LogOut size={17} aria-hidden="true"/><span>{t(signingOut?'Cerrando sesión…':'Cerrar sesión')}</span></button></div>
   </header>
   <main className="control admin-content" id="admin-content" tabIndex={-1}>
    <div className="admin-page-heading"><span className="eyebrow dark">FREIGHT MASTER / {t('ADMINISTRACIÓN')}</span><h1>{t(page.title)}</h1><p>{t(page.description)}</p></div>
    {error&&<p className="error admin-shell-error" role="alert">{t(error)}</p>}
    <div className="admin-page-body" key={pathname}>{children}</div>
   </main>
  </div>
 </div>;
}
