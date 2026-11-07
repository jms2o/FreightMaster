'use client';
import {ArrowRight,ArrowUpRight,MapPin} from 'lucide-react';
import {useLanguage} from './language';

export default function StaticHero(){
 const {t}=useLanguage();
 return <section id="inicio" className="static-home-hero" aria-labelledby="home-title">
  <picture className="static-hero-image">
   <source media="(max-width: 760px)" srcSet="/media/home-hero-mobile.webp"/>
   <img src="/media/home-hero.webp" alt={t('Tráiler de Freight Master en carretera')} width={1440} height={810} fetchPriority="high" loading="eager" decoding="async"/>
  </picture>
  <div className="static-hero-shade" aria-hidden="true"/>
  <div className="static-hero-copy">
   <span className="static-hero-kicker"><MapPin size={15} aria-hidden="true"/>{t('LOGÍSTICA EN MOVIMIENTO')}</span>
   <p className="static-hero-category">{t('CONTENEDORES Y MERCANCÍAS')}</p>
   <h1 id="home-title">Freight<br/>Master<span>.</span></h1>
   <p className="static-hero-description">{t('El traslado de tu mercancía')}<br/>{t('comienza con una conversación.')}</p>
   <div className="static-hero-actions"><a href="#cotizar" className="button light">{t('Solicitar cotización')}<ArrowRight size={19} aria-hidden="true"/></a><a href="#servicios" className="static-hero-services">{t('Conoce los servicios')}<ArrowUpRight size={18} aria-hidden="true"/></a></div>
  </div>
  <span className="static-hero-credit">{t('Escena ilustrativa')}</span>
 </section>;
}
