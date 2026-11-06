import {Skeleton} from '@/components/ui/skeleton';

export function SkeletonList({label,kind='driver',rows=3}:{label:string;kind?:'driver'|'quote'|'application'|'stop';rows?:number}){
  return <div className={`skeleton-list skeleton-list-${kind}`} role="status" aria-label={label}>
    <span className="skeleton-caption">{label}</span>
    <div aria-hidden="true">{Array.from({length:rows},(_,index)=><div className={`skeleton-record skeleton-record-${kind}`} key={index}>
      {(kind==='driver'||kind==='application')&&<Skeleton className="fm-skeleton skeleton-avatar"/>}
      <div className="skeleton-copy"><Skeleton className="fm-skeleton skeleton-line skeleton-w-60"/><Skeleton className="fm-skeleton skeleton-line skeleton-line-small skeleton-w-85"/>{(kind==='quote'||kind==='stop')&&<><Skeleton className="fm-skeleton skeleton-line skeleton-w-70"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-45"/></>}</div>
      <Skeleton className="fm-skeleton skeleton-badge"/>
    </div>)}</div>
  </div>;
}

export function FormSkeleton({label='Cargando formulario',fields=2,multiline=false}:{label?:string;fields?:number;multiline?:boolean}){
  return <div className={`skeleton-form ${multiline?'skeleton-form-multiline':''}`} role="status" aria-label={label}><span className="skeleton-caption">{label}</span><div aria-hidden="true">{Array.from({length:fields},(_,index)=><div className="skeleton-field" key={index}><Skeleton className="fm-skeleton skeleton-line skeleton-w-45"/><Skeleton className="fm-skeleton skeleton-input"/></div>)}<Skeleton className="fm-skeleton skeleton-action"/></div></div>;
}

export function MediaSkeleton({kind='video'}:{kind?:'video'|'image'}){
  const label=kind==='video'?'Preparando el recorrido':'Cargando imagen del servicio';
  return <div className={`media-skeleton media-skeleton-${kind}`} role="status" aria-label={label}><span className="skeleton-caption">{label}</span><div className="media-skeleton-shape" aria-hidden="true"><Skeleton className="fm-skeleton skeleton-media-panel"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-60"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-85"/></div></div>;
}

export function ChatReplySkeleton(){
  return <div className="message bot skeleton-chat" role="status" aria-label="Consultando respuesta"><span className="skeleton-caption">Consultando respuesta…</span><div aria-hidden="true"><Skeleton className="fm-skeleton skeleton-line skeleton-w-85"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-60"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-70"/></div></div>;
}

export function SitePageSkeleton(){
  return <main className="skeleton-page" aria-busy="true"><div role="status" aria-label="Cargando página"><span className="skeleton-caption">Cargando página de Freight Master…</span><div aria-hidden="true"><div className="skeleton-page-header"><Skeleton className="fm-skeleton skeleton-logo"/><Skeleton className="fm-skeleton skeleton-nav"/><Skeleton className="fm-skeleton skeleton-action"/></div><div className="skeleton-page-hero"><div><Skeleton className="fm-skeleton skeleton-line skeleton-w-45"/><Skeleton className="fm-skeleton skeleton-title"/><Skeleton className="fm-skeleton skeleton-title skeleton-w-70"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-85"/><Skeleton className="fm-skeleton skeleton-action"/></div><Skeleton className="fm-skeleton skeleton-page-image"/></div></div></div></main>;
}

export function ControlPageSkeleton(){
  return <main className="control skeleton-control-page" aria-busy="true"><div role="status" aria-label="Cargando administración"><span className="skeleton-caption">Cargando panel administrativo…</span><div aria-hidden="true"><div className="skeleton-page-header"><Skeleton className="fm-skeleton skeleton-logo"/><Skeleton className="fm-skeleton skeleton-action"/></div><Skeleton className="fm-skeleton skeleton-title skeleton-w-60"/><Skeleton className="fm-skeleton skeleton-line skeleton-w-85"/></div></div><div className="control-layout"><FormSkeleton fields={3} label="Cargando formulario de choferes"/><SkeletonList label="Cargando choferes"/></div><SkeletonList kind="application" label="Cargando solicitudes de choferes" rows={2}/></main>;
}
