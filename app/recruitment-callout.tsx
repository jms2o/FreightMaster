'use client';
import {useLanguage} from "@/app/language";
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ClipboardCheck, FileUp, Send, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
const applicationSteps = [
    { number: '01', Icon: ClipboardCheck, title: 'Revisa los requisitos', description: 'Conoce los 6 documentos que necesitas.' },
    { number: '02', Icon: FileUp, title: 'Prepara tus documentos', description: 'Súbelos en PDF, JPG o PNG.' },
    { number: '03', Icon: Send, title: 'Envía tu solicitud', description: 'Comparte tus datos para su revisión.' },
];
export default function RecruitmentCallout() {
    const { t } = useLanguage();
    const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading');
    const imageRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        // A cached image can finish before React attaches its load listener.
        const image = imageRef.current;
        if (image?.complete)
            setImageState(image.naturalWidth > 0 ? 'ready' : 'error');
    }, []);
    return <section className="recruitment-callout section" aria-labelledby="join-team-title">
    <svg className="recruitment-route" viewBox="0 0 600 600" fill="none" aria-hidden="true"><path d="M600 30H340c-105 0-150 65-150 150v80c0 85-45 150-150 150H0"/><path d="M600 75H360c-85 0-125 50-125 125v80c0 100-55 175-165 175H0"/></svg>
    <div className="recruitment-feature">
      <div className="recruitment-copy" data-reveal>
        <span className="recruitment-kicker"><Truck size={17} aria-hidden="true"/>{t(" PARA CHOFERES ")}<span aria-hidden="true"/></span>
        <h2 id="join-team-title">{t("Trabaja con")}<br /><em>{t("nosotros.")}</em></h2>
        <p>{t("El siguiente paso en tu camino empieza aqu\u00ED. Conoce los requisitos y env\u00EDa tu solicitud a Freight Master.")}</p>
        <a href="/trabaja-con-nosotros" className="button light recruitment-cta">{t("Ver requisitos y postularme ")}<span><ArrowUpRight size={20} aria-hidden="true"/></span></a>
        <span className="recruitment-note">{t("Tus datos y documentos, en una sola solicitud.")}</span>
      </div>
      <figure className={`recruitment-visual recruitment-visual-${imageState}`} data-reveal>
        {imageState === 'loading' && <div className="recruitment-image-loading" role="status" aria-label={t("Cargando imagen de Freight Master")}><Skeleton className="fm-skeleton"/></div>}
        {imageState !== 'error' && <img ref={imageRef} src="/media/driver-recruitment.webp" alt={t("Imagen ilustrativa de un chofer en la cabina de un tráiler")} width={1440} height={960} loading="lazy" decoding="async" onLoad={() => setImageState('ready')} onError={() => setImageState('error')}/>}
        {imageState === 'error' && <div className="recruitment-image-fallback"><Truck size={56} strokeWidth={1} aria-hidden="true"/><span>FREIGHT MASTER</span></div>}
        <span className="recruitment-photo-label"><Truck size={16} aria-hidden="true"/>{t(" IMAGEN ILUSTRATIVA")}</span>
        <figcaption><a href="/trabaja-con-nosotros" className="recruitment-card-link"><span className="recruitment-caption-line" aria-hidden="true"/><span className="recruitment-caption-copy"><span>{t("UN NUEVO CAMINO")}</span><strong>{t("Comienza con tu solicitud.")}</strong></span><ArrowUpRight size={27} aria-hidden="true"/></a></figcaption>
      </figure>
    </div>
    <div className="recruitment-process" data-reveal>
      <div className="recruitment-process-intro"><span>{t("AS\u00CD DE SENCILLO")}</span><p>{t("Tu siguiente paso,")}<br />{t("bien encaminado.")}</p></div>
      <ol aria-label={t("Pasos para postularte")}>{applicationSteps.map(({ number, Icon, title, description }) => <li key={number}>
        <span className="recruitment-step-icon"><Icon size={20} strokeWidth={1.5} aria-hidden="true"/><span>{number}</span></span>
        <div><h3>{t(title)}</h3><p>{t(description)}</p></div>
      </li>)}</ol>
    </div>
  </section>;
}
