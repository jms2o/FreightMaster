'use client';
import {useLanguage} from "@/app/language";
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, SkipForward, MapPin } from 'lucide-react';
import { MediaSkeleton } from './loading-skeletons';
export default function RoadExperience() {
    const { t } = useLanguage();
    const section = useRef<HTMLElement>(null), video = useRef<HTMLVideoElement>(null), progressBar = useRef<HTMLDivElement>(null), intro = useRef<HTMLDivElement>(null), ending = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false), [limited, setLimited] = useState(false), [mobile, setMobile] = useState(false), [mediaError, setMediaError] = useState(false);
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)'), small = window.matchMedia('(max-width: 760px)');
        const preferences = () => { setLimited(reduce.matches); setMobile(small.matches); };
        preferences();
        reduce.addEventListener('change', preferences);
        small.addEventListener('change', preferences);
        return () => { reduce.removeEventListener('change', preferences); small.removeEventListener('change', preferences); };
    }, []);
    useEffect(() => {
        const el = section.current, v = video.current;
        if (!el || !v)
            return;
        let frame = 0, seeking = false, lastTarget = -1;
        setReady(v.readyState >= 2);
        setMediaError(false);
        v.pause();
        const position = () => Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - window.innerHeight)));
        const update = () => {
            const p = limited ? 0 : position();
            if (progressBar.current)
                progressBar.current.style.transform = `scaleX(${p})`;
            if (intro.current) {
                intro.current.style.opacity = String(Math.max(0, 1 - p * 4));
                intro.current.style.transform = `translateY(${-p * 60}px)`;
                intro.current.style.pointerEvents = p > .24 ? 'none' : 'auto';
            }
            if (ending.current) {
                ending.current.style.opacity = String(Math.max(0, (p - .68) / .25));
                ending.current.style.transform = `translateY(${Math.max(0, 1 - (p - .68) / .25) * 25}px)`;
                ending.current.style.pointerEvents = p > .75 ? 'auto' : 'none';
            }
            if (!v.paused)
                v.pause();
            if (limited || seeking || v.readyState < 2 || !Number.isFinite(v.duration) || v.duration <= 0)
                return;
            const target = p * Math.max(0, v.duration - .04);
            if (Math.abs(target - lastTarget) > .025 && Math.abs(v.currentTime - target) > .025) {
                seeking = true;
                lastTarget = target;
                v.currentTime = target;
            }
        };
        const seeked = () => { seeking = false; update(); };
        const loaded = () => { setReady(true); v.pause(); update(); };
        const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
        v.addEventListener('seeked', seeked);
        v.addEventListener('loadeddata', loaded);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        window.addEventListener('pageshow', schedule);
        update();
        return () => { cancelAnimationFrame(frame); v.pause(); v.removeEventListener('seeked', seeked); v.removeEventListener('loadeddata', loaded); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('pageshow', schedule); };
    }, [limited, mobile]);
    return <section id="inicio" ref={section} className={`road-story ${limited ? 'reduced-road' : ''}`} aria-label={t("Recorrido de Freight Master")}><div className="road-sticky"><div className="road-media"><video key={mobile ? 'mobile' : 'wide'} ref={video} muted playsInline onPlay={event => event.currentTarget.pause()} preload="auto" poster={mobile ? '/media/road-poster-mobile.jpg' : '/media/road-poster.jpg'} src={mobile ? '/media/freight-road-mobile.mp4' : '/media/freight-road-wide.mp4'} onError={() => setMediaError(true)} aria-label={t("Video real de un tráiler con el logotipo de Freight Master")}/>{!ready && !mediaError && <MediaSkeleton />}<div className="road-shade"/></div><div className="road-topline"><span><MapPin size={12}/>{t(" LOG\u00CDSTICA EN MOVIMIENTO")}</span><span>FREIGHT MASTER</span></div><div className="road-intro" ref={intro}><p className="road-kicker">{t("CONTENEDORES Y MERCANC\u00CDAS")}</p><h1>Freight<br />Master<span>.</span></h1><p>{t("El traslado de tu mercanc\u00EDa")}<br />{t("comienza con una conversaci\u00F3n.")}</p><a href="#cotizar" className="button light">{t("Solicitar cotizaci\u00F3n")}<ArrowRight size={18}/></a></div><div className="road-ending" ref={ending}><p className="road-kicker">{t("EL SIGUIENTE DESTINO")}</p><h2>{t("Tu operaci\u00F3n.")}<br />{t("Una conversaci\u00F3n.")}</h2><a href="#servicios" className="button light">{t("Conoce los servicios")}<ArrowRight size={18}/></a></div><div className="road-bottom"><div className="road-scroll"><ArrowDown size={17}/><div><b>{limited ? t('EXPLORA FREIGHT MASTER') : t('DESLIZA PARA AVANZAR')}</b><small>{mediaError ? t('Video no disponible. Puedes continuar con los servicios.') : ready ? (limited ? t('Puedes continuar con los servicios.') : t('El video avanza únicamente al deslizar.')) : t('Preparando el recorrido…')}</small></div></div><div className="road-buttons"><a href="#servicios" aria-label={t("Saltar recorrido")}><SkipForward size={16}/><span>{t("Saltar")}</span></a></div></div><div className="road-progress"><div ref={progressBar}/></div><span className="road-credit">{t("Escena ilustrativa \u00B7 Video real")}</span></div></section>;
}
