'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Menu,X} from 'lucide-react';
import {LanguageSwitcher,useLanguage} from './language';

export default function SiteHeader({onDriverAccess}:{onDriverAccess:()=>void}){
 const {t}=useLanguage();
 const menu=useRef<HTMLDialogElement>(null),toggle=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false);
 function close(){menu.current?.close();setOpen(false);}
 function driverAccess(){close();onDriverAccess();}
 useEffect(()=>{
  const desktop=window.matchMedia('(min-width: 1101px)');
  const resize=()=>{if(desktop.matches){menu.current?.close();setOpen(false);}};
  desktop.addEventListener('change',resize);return()=>desktop.removeEventListener('change',resize);
 },[]);
 return <>
  <header className="header site-header">
   <a className="brand" href="#inicio" aria-label={t('Freight Master — inicio')}><img src="/freight-master-transparent-e37568de.png" alt="Freight Master" width={1536} height={675}/></a>
   <nav className="site-desktop-nav" aria-label={t('Navegación principal')}>
    <a href="#servicios">{t('Servicios')}</a><a href="#experiencia">{t('Cómo funciona')}</a><a href="/trabaja-con-nosotros">{t('Trabaja con nosotros')}</a>
    <button type="button" onClick={onDriverAccess} aria-haspopup="dialog">{t('Acceso choferes')}<ArrowUpRight size={17} aria-hidden="true"/></button><LanguageSwitcher/>
   </nav>
   <a className="header-cta" href="#cotizar" aria-label={t('Solicitar cotización')}><span className="header-cta-full">{t('Solicitar cotización')}</span><span className="header-cta-short">{t('Cotizar')}</span><ArrowUpRight size={17} aria-hidden="true"/></a>
   <button ref={toggle} className="site-menu-toggle" type="button" aria-label={t('Abrir menú')} aria-controls="site-mobile-navigation" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{menu.current?.showModal();setOpen(true);}}><Menu size={23} aria-hidden="true"/></button>
  </header>
  <dialog ref={menu} id="site-mobile-navigation" className="site-mobile-menu" aria-labelledby="site-menu-title" onClose={()=>{setOpen(false);toggle.current?.focus();}} onClick={event=>{if(event.target===event.currentTarget){const bounds=event.currentTarget.getBoundingClientRect();if(event.clientY>bounds.bottom||event.clientX<bounds.left||event.clientX>bounds.right)close();}}}>
   <div className="site-menu-heading"><h2 id="site-menu-title">{t('Menú')}</h2><button type="button" onClick={close} aria-label={t('Cerrar menú')}><X size={23} aria-hidden="true"/></button></div>
   <nav aria-label={t('Navegación principal')}><a href="#servicios" onClick={close}>{t('Servicios')}<ArrowUpRight size={18} aria-hidden="true"/></a><a href="#experiencia" onClick={close}>{t('Cómo funciona')}<ArrowUpRight size={18} aria-hidden="true"/></a><a href="/trabaja-con-nosotros" onClick={close}>{t('Trabaja con nosotros')}<ArrowUpRight size={18} aria-hidden="true"/></a><button type="button" onClick={driverAccess} aria-haspopup="dialog">{t('Acceso choferes')}<ArrowUpRight size={18} aria-hidden="true"/></button></nav>
   <div className="site-menu-bottom"><LanguageSwitcher/><a href="#cotizar" className="button wine" onClick={close}>{t('Solicitar cotización')}<ArrowUpRight size={18} aria-hidden="true"/></a></div>
  </dialog>
 </>;
}
