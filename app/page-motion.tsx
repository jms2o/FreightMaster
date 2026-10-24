'use client';
import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';

export default function PageMotion({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=root.current;if(!el)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer:IntersectionObserver|undefined,frame=0;
  const targets=Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
  const track=el.querySelector<HTMLElement>('.ticker-track');
  const update=()=>{if(track){const y=track.parentElement!.getBoundingClientRect().top;track.style.transform=`translate3d(${-Math.max(0,window.innerHeight-y)*.08}px,0,0)`}};
  const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
  const configure=()=>{
   observer?.disconnect();window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);cancelAnimationFrame(frame);
   targets.forEach(t=>t.classList.remove('reveal-ready','is-visible'));
   if(preference.matches){if(track)track.style.transform='none';return}
   if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer?.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -28px 0px'});targets.forEach(t=>{t.classList.add('reveal-ready');observer!.observe(t)})}
   window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);update();
  };
  configure();preference.addEventListener('change',configure);
  return()=>{observer?.disconnect();cancelAnimationFrame(frame);preference.removeEventListener('change',configure);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);targets.forEach(t=>t.classList.remove('reveal-ready','is-visible'))};
 },[]);
 return <div ref={root} className="site-experience">{children}</div>
}
