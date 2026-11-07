'use client';
import {useLanguage} from "@/app/language";
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import RoadExperience from './road-experience';
import ChatComposer from './chat-composer';
import ServiceExplorer from './service-explorer';
import PageMotion from './page-motion';
import SiteHeader from './site-header';
import RecruitmentCallout from './recruitment-callout';
import { ChatReplySkeleton } from './loading-skeletons';
import { ArrowUpRight, ArrowRight, ArrowLeft, Truck, Package, X, MapPin, ClipboardList } from 'lucide-react';
const Arrow = () => <ArrowUpRight size={17} aria-hidden="true"/>;
export default function Home() {
    const { t, locale } = useLanguage();
    const [chat, setChat] = useState(false);
    const [mode, setMode] = useState<'choose' | 'visitor' | 'login' | 'driver'>('choose');
    const [driver, setDriver] = useState('');
    const [messages, setMessages] = useState<{
        from: string;
        text: string;
    }[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [quote, setQuote] = useState('');
    const chatEnd = useRef<HTMLDivElement>(null);
    const chatPanel=useRef<HTMLElement>(null);
    useEffect(()=>{
        if(!chat)return;
        const viewport=window.visualViewport,panel=chatPanel.current;if(!viewport||!panel)return;
        const resize=()=>{panel.style.setProperty('--chat-available-height',`${viewport.height}px`);panel.style.setProperty('--chat-keyboard-offset',`${Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop)}px`);};
        resize();viewport.addEventListener('resize',resize);viewport.addEventListener('scroll',resize);
        return()=>{viewport.removeEventListener('resize',resize);viewport.removeEventListener('scroll',resize);panel.style.removeProperty('--chat-available-height');panel.style.removeProperty('--chat-keyboard-offset');};
    },[chat]);
    useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [messages, busy]);
    function openChat(m: 'choose' | 'login' | 'visitor' = 'choose') { setChat(true); setMode(m); setError(''); setMessages(m === 'visitor' ? [{ from: 'bot', text: 'Bienvenido a Freight Master. Puedo orientarte sobre cotizaciones y el acceso de choferes. ¿En qué te ayudo?' }] : []); }
    async function login(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); const f = new FormData(e.currentTarget); try {
        const r = await fetch('/api/driver', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(f)) });
        const d = await r.json() as {
            error?: string;
            name: string;
        };
        if (!r.ok)
            throw Error(d.error);
        setDriver(d.name);
        setMode('driver');
        setMessages([{ from: 'bot', text: `Hola, ${d.name}. Tu acceso de chofer está verificado. Puedo consultar el itinerario y los requisitos que el equipo te asignó. Pregúntame «¿Qué hago hoy?» o «¿Qué documentos necesito?».` }]);
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo verificar el acceso.');
    }
    finally {
        setBusy(false);
    } }
    async function send(text: string) { if (!text.trim() || busy)
        return; setMessages(m => [...m, { from: 'user', text }]); setBusy(true); try {
        const r = await fetch(mode === 'driver' ? '/api/driver/chat' : '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, locale }) });
        const d = await r.json() as {
            error?: string;
            message: string;
        };
        if (!r.ok)
            throw Error(d.error);
        setMessages(m => [...m, { from: 'bot', text: d.message }]);
    }
    catch (e) {
        setMessages(m => [...m, { from: 'bot', text: e instanceof Error ? e.message : 'No se pudo conectar. Intenta otra vez.' }]);
    }
    finally {
        setBusy(false);
    } }
    async function submitQuote(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = e.currentTarget; setQuote('Guardando tu solicitud…'); const fields = Object.fromEntries(new FormData(form)); try {
        const r = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
        const d = await r.json() as {
            error?: string;
            reference: string;
        };
        if (!r.ok)
            throw Error(d.error);
        setQuote(`Solicitud registrada. Tu referencia es ${d.reference}. El equipo puede consultarla en su panel.`);
        form.reset();
    }
    catch (e) {
        setQuote(e instanceof Error ? e.message : 'No se pudo guardar. Intenta otra vez.');
    } }
    return <PageMotion><SiteHeader onDriverAccess={()=>openChat('login')}/>
    <main><RoadExperience />
    <div className="ticker" aria-hidden="true"><div className="ticker-track">{[0, 1, 2].map(n => <div className="ticker-group" key={n}><span>{t("CONTENEDORES")}</span><ArrowUpRight size={22}/><span>{t("MERCANC\u00CDAS")}</span><ArrowUpRight size={22}/><span>{t("LOG\u00CDSTICA EN MOVIMIENTO")}</span><ArrowUpRight size={22}/></div>)}</div></div>
    <ServiceExplorer onConversation={() => openChat('visitor')}/>
    <section className="operation-flow section" aria-labelledby="flow-title"><div className="flow-heading" data-reveal><span className="eyebrow dark">{t("DE LA IDEA AL TRASLADO")}</span><h2 id="flow-title">{t("El movimiento")}<br />{t("empieza ")}<em>{t("contigo.")}</em></h2><a href="#cotizar" className="text-link">{t("Cu\u00E9ntanos tu proyecto ")}<ArrowUpRight size={18}/></a></div><div className="flow-steps"><article data-reveal><span className="flow-number">01</span><MapPin size={25} strokeWidth={1.3}/><h3>{t("Traza el destino")}</h3><p>{t("Indica el origen y el destino de tu traslado.")}</p></article><article data-reveal><span className="flow-number">02</span><Package size={25} strokeWidth={1.3}/><h3>{t("Describe tu carga")}</h3><p>{t("Comparte el tipo de mercanc\u00EDa, contenedor y requisitos.")}</p></article><article data-reveal><span className="flow-number">03</span><ClipboardList size={25} strokeWidth={1.3}/><h3>{t("Inicia la solicitud")}</h3><p>{t("Env\u00EDa los detalles para que el equipo prepare tu cotizaci\u00F3n.")}</p></article></div></section>
    <section className="journey section" id="experiencia"><div data-reveal><div className="eyebrow">{t("02 / CONECTAMOS TU OPERACI\u00D3N")}</div><h2>{t("Una conversaci\u00F3n.")}<br /><em>{t("Dos caminos.")}</em></h2><p>{t("Un acceso pensado para cada persona")}<br />{t("que forma parte del movimiento.")}</p><div className="route-art" aria-hidden="true"><span>{t("ORIGEN")}</span><div className="route-line"><i /><i /><i /></div><span>{t("DESTINO")}</span></div></div><div className="access-list" data-reveal><button onClick={() => openChat('visitor')}><span className="access-icon"><Package size={22}/></span><div><small>{t("PARA TU EMPRESA")}</small><h3>{t("Clientes y visitantes")}</h3><p>{t("Consulta servicios, ubicaci\u00F3n y prepara tu solicitud de cotizaci\u00F3n.")}</p></div><span><ArrowRight size={18}/></span></button><button onClick={() => openChat('login')}><span className="access-icon"><Truck size={22}/></span><div><small>{t("PARA QUIEN MUEVE LA CARGA")}</small><h3>{t("Acceso de choferes")}</h3><p>{t("Consulta tus paradas e instrucciones con tu ID y PIN.")}</p></div><span><ArrowRight size={18}/></span></button></div></section>
    <RecruitmentCallout />
    <section className="quote section" id="cotizar"><div className="quote-copy" data-reveal><div className="eyebrow dark">{t("03 / COMENCEMOS")}</div><h2>{t("\u00BFQu\u00E9 vamos")}<br />{t("a ")}<em>{t("mover?")}</em></h2><p>{t("Comparte los detalles de tu carga")}<br />{t("para solicitar una cotizaci\u00F3n.")}</p><div className="quote-mark" aria-hidden="true"><ArrowUpRight size={100} strokeWidth={1}/></div></div><form onSubmit={submitQuote} data-reveal><div className="form-row"><label>{t("Empresa")}<input required name="company" maxLength={100} placeholder={t("Nombre de tu empresa")} autoComplete="organization"/></label><label>{t("Correo o tel\u00E9fono")}<input required name="contact" maxLength={150} placeholder={t("¿Cómo te contactamos?")}/></label></div><div className="form-row"><label>{t("Origen")}<input required name="origin" maxLength={150} placeholder={t("Ciudad de origen")}/></label><label>{t("Destino")}<input required name="destination" maxLength={150} placeholder={t("Ciudad de destino")}/></label></div><label>{t("Cu\u00E9ntanos sobre tu carga")}<textarea required name="cargo" maxLength={500} rows={3} placeholder={t("Tipo de mercancía, contenedor y detalles del traslado")}/></label><p className="form-note">{t("El equipo de Freight Master utilizar\u00E1 estos datos para atender tu solicitud.")}</p><button className="button wine" type="submit">{t("Solicitar cotizaci\u00F3n ")}<Arrow /></button><p className="form-status" role="status">{t(quote)}</p></form></section></main>
    <footer><a className="footer-wordmark" href="#inicio">Freight Master<span><ArrowUpRight size={19}/></span></a><div><p>{t("LOG\u00CDSTICA \u00B7 CONTENEDORES \u00B7 MERCANC\u00CDAS")}</p><a href="/trabaja-con-nosotros">{t("Trabaja con nosotros")}</a><a href="/control">{t("Administraci\u00F3n")}</a><a href="https://www.pexels.com/video/white-truck-driving-at-sunset-on-highway-33870727/" target="_blank" rel="noreferrer">{t("Video: Jonathan David \u00B7 Pexels")}</a><button onClick={() => openChat('visitor')}>{t("Hablar con el asistente ")}<ArrowUpRight size={14}/></button></div></footer>
    {!chat && <button className="chat-launcher" onClick={() => openChat()} aria-label={t("Abrir asistente Freight Master. Preguntas de clientes y choferes")} aria-haspopup="dialog"><span className="chat-symbol"><img src="/fm-assistant.svg" alt="" width="52" height="52"/></span><span className="chat-launcher-copy"><b>{t("Pregunta aqu\u00ED")}</b><small>{t("Clientes y choferes")}</small></span><span className="chat-launcher-arrow" aria-hidden="true"><ArrowUpRight size={19}/></span></button>}
    {chat && <aside ref={chatPanel} className="chat" role="dialog" aria-label={t("Asistente Freight Master")}><div className="chat-header"><div className="chat-avatar"><img src="/fm-assistant.svg" alt="" width="45" height="45"/></div><div><b>Freight Master</b><small>{t("Asistente de orientaci\u00F3n")}</small></div><button aria-label={t("Cerrar chat")} onClick={() => setChat(false)}><X size={20}/></button></div><div className="chat-content">{mode === 'choose' ? <><small className="eyebrow dark">{t("BIENVENIDO")}</small><h3>{t("\u00BFEres chofer")}<br />{t("o visitante?")}</h3><p>{t("Este mismo asistente te ayuda seg\u00FAn lo que necesitas.")}</p><button className="chat-choice" onClick={() => openChat('login')}>{t("Soy chofer ")}<span><ArrowRight size={18}/></span><small>{t("Ingresar con ID y PIN")}</small></button><button className="chat-choice" onClick={() => openChat('visitor')}>{t("Soy cliente u otra persona ")}<span><ArrowRight size={18}/></span><small>{t("Conversar sin ID de chofer")}</small></button></> : mode === 'login' ? <><button className="back" onClick={() => openChat()}><ArrowLeft size={13}/>{t(" Volver")}</button><h3>{t("Acceso de choferes")}</h3><p>{t("Usa las credenciales que te proporcion\u00F3 Freight Master.")}</p><form onSubmit={login}><label>{t("ID de chofer")}<input name="id" required maxLength={30} placeholder={t("Tu ID")} autoComplete="username"/></label><label>PIN<input name="pin" required type="password" inputMode="numeric" pattern="[0-9]{6,12}" autoComplete="current-password" placeholder={t("De 6 a 12 dígitos")}/></label><button className="button wine" disabled={busy}>{busy ? t('Verificando…') : t('Verificar acceso')}</button><p className="error" role="alert">{t(error)}</p></form><p className="small">{t("\u00BFNo tienes acceso? Solicita tu ID al equipo de Freight Master.")}</p></> : <><div className="chat-role"><span>{mode === 'driver' ? t(`Chofer verificado · ${driver}`) : t('Cliente o visitante')}</span><button onClick={async () => { if (mode === 'driver')
        await fetch('/api/driver', { method: 'DELETE' }); openChat(); }}>{t("Salir")}</button></div><div className="messages" aria-live="polite">{messages.map((m, i) => <div key={i} className={`message ${m.from}`}>{m.from==='bot'?t(m.text):m.text}</div>)}{busy && <ChatReplySkeleton />}<div ref={chatEnd}/></div><div className="quick-replies">{(mode === 'driver' ? ['¿Qué hago hoy?', '¿Qué tengo mañana?', '¿Qué documentos necesito?'] : ['Solicitar cotización', 'Ubicación', 'Seguridad']).map(text => <button key={text} onClick={() => { if (text === 'Soy chofer')
        openChat('login');
    else if (text === 'Solicitar cotización') {
        setChat(false);
        document.getElementById('cotizar')?.scrollIntoView({ behavior: 'smooth' });
    }
    else
        send(t(text)); }}>{t(text)}</button>)}</div></>}</div>{(mode === 'driver' || mode === 'visitor') && <ChatComposer send={send} busy={busy}/>}<div className="chat-disclaimer">{t("Orientaci\u00F3n guiada \u00B7 Sin navegaci\u00F3n en vivo")}</div></aside>}</PageMotion>;
}
