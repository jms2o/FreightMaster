'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowRight,Play,Pause,SkipForward,MapPin} from 'lucide-react';
export default function RoadExperience(){
 const section=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null),progressBar=useRef<HTMLDivElement>(null),intro=useRef<HTMLDivElement>(null),ending=useRef<HTMLDivElement>(null);
 const[ready,setReady]=useState(false),[mode,setMode]=useState<'auto'|'scroll'|'paused'>('paused'),[limited,setLimited]=useState(false),[mobile,setMobile]=useState(false),[mediaError,setMediaError]=useState(false),[blocked,setBlocked]=useState(false);
 useEffect(()=>{const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;setMobile(window.matchMedia('(max-width: 760px)').matches);setLimited(reduce);setMode(reduce?'paused':'auto')},[]);
 useEffect(()=>{
  const el=section.current,v=video.current;if(!el||!v)return;
  let frame=0,seeking=false,active=true;
  const position=()=>Math.max(0,Math.min(1,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-window.innerHeight)));
  const update=()=>{const p=position();
   if(progressBar.current)progressBar.current.style.transform=`scaleX(${p})`;
   if(intro.current){intro.current.style.opacity=String(Math.max(0,1-p*4));intro.current.style.transform=`translateY(${-p*60}px)`;intro.current.style.pointerEvents=p>.24?'none':'auto'}
   if(ending.current){ending.current.style.opacity=String(Math.max(0,(p-.68)/.25));ending.current.style.transform=`translateY(${Math.max(0,1-(p-.68)/.25)*25}px)`;ending.current.style.pointerEvents=p>.75?'auto':'none'}
   const target=p*Math.max(0,(v.duration||3.2)-.04);
   if(mode==='scroll'&&!limited&&!seeking&&Math.abs(v.currentTime-target)>.025&&v.readyState>=2){seeking=true;v.currentTime=target}
  };
  const play=()=>{v.muted=true;v.play().then(()=>{if(active)setBlocked(false)}).catch(()=>{if(active){setBlocked(true);setMode('paused')}})};
  const seeked=()=>{seeking=false;update()};
  const loaded=()=>{setReady(true);if(mode==='auto')play();else v.pause();update()};
  const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!limited&&position()>.005&&mode!=='scroll'){v.pause();setMode('scroll')}else if(!limited&&position()===0&&mode==='scroll'){setMode('auto')}update()})};
  const resize=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
  v.addEventListener('seeked',seeked);v.addEventListener('loadeddata',loaded);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);
  if(v.readyState>=2)loaded();else update();
  return()=>{active=false;cancelAnimationFrame(frame);v.removeEventListener('seeked',seeked);v.removeEventListener('loadeddata',loaded);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize)}
 },[mode,limited,mobile]);
 async function toggle(){const v=video.current;if(!v)return;if(mode==='auto'){v.pause();setMode('paused')}else{v.muted=true;if(v.ended)v.currentTime=0;setLimited(false);setMode('auto');try{await v.play();setBlocked(false)}catch{setMode('paused');setBlocked(true)}}}
 return <section id="inicio" ref={section} className={`road-story ${limited?'reduced-road':''}`} aria-label="Recorrido de Freight Master"><div className="road-sticky"><div className="road-media"><video key={mobile?'mobile':'wide'} ref={video} muted playsInline autoPlay={mode==='auto'} loop={mode==='auto'} preload="auto" poster={mobile?'/media/road-poster-mobile.jpg':'/media/road-poster.jpg'} src={mobile?'/media/freight-road-mobile.mp4':'/media/freight-road-wide.mp4'} onError={()=>setMediaError(true)} aria-label="Video real de un tráiler con el logotipo de Freight Master"/><div className="road-shade"/></div><div className="road-topline"><span><MapPin size={12}/> LOGÍSTICA EN MOVIMIENTO</span><span>FREIGHT MASTER</span></div><div className="road-intro" ref={intro}><p className="road-kicker">CONTENEDORES Y MERCANCÍAS</p><h1>Freight<br/>Master<span>.</span></h1><p>El traslado de tu mercancía<br/>comienza con una conversación.</p><a href="#cotizar" className="button light">Solicitar cotización<ArrowRight size={18}/></a></div><div className="road-ending" ref={ending}><p className="road-kicker">EL SIGUIENTE DESTINO</p><h2>Tu operación.<br/>Una conversación.</h2><a href="#servicios" className="button light">Conoce los servicios<ArrowRight size={18}/></a></div><div className="road-bottom"><div className="road-scroll"><ArrowDown size={17}/><div><b>{limited?'EXPLORA FREIGHT MASTER':'DESLIZA PARA AVANZAR'}</b><small>{mediaError?'Video no disponible. Puedes continuar con los servicios.':blocked?'Toca Ver video para iniciar.':ready?'Tú marcas el ritmo del recorrido.':'Preparando el recorrido…'}</small></div></div><div className="road-buttons"><button onClick={toggle} aria-label={mode==='auto'?'Pausar video':'Reproducir video'}>{mode==='auto'?<Pause size={16}/>:<Play size={16}/>}<span>{mode==='auto'?'Pausar':'Ver video'}</span></button><a href="#servicios" aria-label="Saltar recorrido"><SkipForward size={16}/><span>Saltar</span></a></div></div><div className="road-progress"><div ref={progressBar}/></div><span className="road-credit">Escena ilustrativa · Video real</span></div></section>}
