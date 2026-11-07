import type {Metadata,Viewport} from 'next';
import {cookies} from 'next/headers';
import {asLocale,translate} from '@/lib/i18n';
import {LanguageProvider} from './language';
import './globals.css';
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',interactiveWidget:'resizes-content'};
export async function generateMetadata():Promise<Metadata>{const locale=asLocale((await cookies()).get('fm_language')?.value);return {title:'Freight Master',description:translate('Logística y traslado de mercancías en contenedores. Solicita una cotización.',locale),icons:{icon:'/favicon.svg'}};}
export default async function Layout({children}:{children:React.ReactNode}){const locale=asLocale((await cookies()).get('fm_language')?.value);return <html lang={locale}><body><LanguageProvider initialLocale={locale}>{children}</LanguageProvider></body></html>;}
