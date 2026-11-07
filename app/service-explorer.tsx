'use client';
import {useLanguage} from "@/app/language";
import { useEffect, useRef, useState } from 'react';
import { MediaSkeleton } from './loading-skeletons';
import { Container, Package, MessagesSquare, ArrowUpRight, ArrowRight, Check } from 'lucide-react';
const services = [
    { name: 'Contenedores', icon: Container, subtitle: 'Tu contenedor. El siguiente destino.', description: 'Comparte los detalles del contenedor y las condiciones del traslado para iniciar tu solicitud.', details: ['Origen y destino', 'Tipo de contenedor', 'Fecha y requisitos'], label: 'Cotizar un contenedor' },
    { name: 'Mercancías', icon: Package, subtitle: 'Cada carga tiene su propio recorrido.', description: 'Cuéntanos qué necesitas mover para que el equipo conozca las características de tu operación.', details: ['Tipo de mercancía', 'Volumen o dimensiones', 'Puntos de recolección y entrega'], label: 'Cotizar mercancía' },
    { name: 'Atención a empresas', icon: MessagesSquare, subtitle: 'Hablemos de tu operación.', description: 'Resuelve tus primeras dudas sobre servicios y los datos que necesitas para pedir una cotización.', details: ['Orientación sobre servicios', 'Dudas frecuentes', 'Solicitud de cotización'], label: 'Iniciar conversación' }
];
export default function ServiceExplorer({ onConversation }: {
    onConversation: () => void;
}) {
    const { t } = useLanguage();
    const [active, setActive] = useState(0), [imagePending, setImagePending] = useState(true);
    const photo = useRef<HTMLImageElement>(null);
    const item = services[active];
    useEffect(() => { if (photo.current?.complete)
        setImagePending(false); }, []);
    return <section className="services section service-explorer" id="servicios" aria-labelledby="services-title"><div className="section-heading" data-reveal><div className="eyebrow dark">{t("01 / EXPLORA LOS SERVICIOS")}</div><h2 id="services-title">{t("Tu carga.")}<br /><em>{t("M\u00E1s posibilidades.")}</em></h2><p>{t("Elige qu\u00E9 necesitas mover.")}<br />{t("Demos forma al siguiente traslado.")}</p><div className="service-options" role="group" aria-label={t("Selecciona un servicio")}>{services.map((s, i) => { const Icon = s.icon; return <button key={s.name} type="button" aria-pressed={active === i} aria-controls="service-detail" onClick={() => setActive(i)}><span className="service-option-index">0{i + 1}</span><Icon size={22} strokeWidth={1.4}/><span>{t(s.name)}</span><ArrowUpRight size={19}/></button>; })}</div></div><div className="service-stage" data-reveal><img ref={photo} onLoad={() => setImagePending(false)} onError={() => setImagePending(false)} className="service-photo" src="/media/road-poster.jpg" alt={t("Tráiler Freight Master en una carretera al atardecer")} loading="lazy" width="1440" height="810"/>{imagePending && <MediaSkeleton kind="image"/>}<div className="service-photo-shade"/><div className="stage-caption"><span>{t("FREIGHT MASTER / EN MOVIMIENTO")}</span><span>{t("Escena ilustrativa")}</span></div><div className="service-detail" id="service-detail" aria-live="polite" aria-atomic="true"><div key={active} className="service-detail-content"><small>0{active + 1} / {t(item.name).toUpperCase()}</small><h3>{t(item.subtitle)}</h3><p>{t(item.description)}</p><ul>{item.details.map(d => <li key={d}><Check size={13}/>{t(d)}</li>)}</ul>{active === 2 ? <button className="button light" onClick={onConversation}>{t(item.label)}<ArrowRight size={17}/></button> : <a className="button light" href="#cotizar">{t(item.label)}<ArrowRight size={17}/></a>}</div></div><div className="stage-pagination" aria-hidden="true">{services.map((s, i) => <span key={s.name} className={active === i ? 'active' : ''}/>)}</div></div></section>;
}
