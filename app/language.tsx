'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import type {ReactNode} from 'react';
import {Globe2} from 'lucide-react';
import {asLocale,translate} from '@/lib/i18n';
import type {Locale} from '@/lib/i18n';
type LanguageContextValue={locale:Locale;dateLocale:string;t:(text:string,values?:readonly (string|number)[])=>string;setLocale:(locale:Locale)=>void};
const LanguageContext=createContext<LanguageContextValue|null>(null);
export function LanguageProvider({initialLocale,children}:{initialLocale:Locale;children:ReactNode}){
 const [locale,setLanguage]=useState(initialLocale);
 const setLocale=useCallback((value:Locale)=>{const next=asLocale(value);document.cookie=`fm_language=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;setLanguage(next);},[]);
 useEffect(()=>{
  document.documentElement.lang=locale;
  const title=location.pathname==='/trabaja-con-nosotros'?'Trabaja con nosotros | Freight Master':location.pathname.startsWith('/control')?'Administración | Freight Master':'Freight Master';
  document.title=translate(title,locale);
  document.querySelector('meta[name="description"]')?.setAttribute('content',translate(location.pathname==='/trabaja-con-nosotros'?'Consulta los requisitos y envía tu solicitud con documentos a Freight Master.':'Logística y traslado de mercancías en contenedores. Solicita una cotización.',locale));
 },[locale]);
 const value=useMemo(()=>({locale,dateLocale:locale==='en'?'en-US':'es-MX',t:(text:string,values?:readonly (string|number)[])=>translate(text,locale,values),setLocale}),[locale,setLocale]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw Error('LanguageProvider is required');return value;}
export function LanguageSwitcher(){
 const {locale,setLocale}=useLanguage();
 return <label className="language-switcher"><Globe2 size={16} aria-hidden="true"/><select value={locale} onChange={event=>setLocale(asLocale(event.target.value))} aria-label="Idioma / Language"><option value="es" lang="es">Español</option><option value="en" lang="en">English</option></select></label>;
}
