'use client';
import {useRef,useState} from 'react';
import type {ChangeEvent,FormEvent} from 'react';
import {ArrowUpRight,Check,CheckCircle2,FileUp,LoaderCircle,X} from 'lucide-react';
import {DRIVER_REQUIREMENTS,MAX_DOCUMENT_BYTES} from '@/lib/recruitment';

export default function ApplicationForm(){
  const [selected,setSelected]=useState<Record<string,string>>({});
  const [error,setError]=useState('');const [reference,setReference]=useState('');const [busy,setBusy]=useState(false);
  const errorRef=useRef<HTMLParagraphElement>(null);
  const inputs=useRef<Record<string,HTMLInputElement|null>>({});
  const count=Object.values(selected).filter(Boolean).length;
  function selectDocument(event:ChangeEvent<HTMLInputElement>,key:string){
    const file=event.currentTarget.files?.[0];setError('');
    if(file&&(file.size>MAX_DOCUMENT_BYTES||! /\.(pdf|jpe?g|png)$/i.test(file.name))){
      setError('Usa archivos PDF, JPG o PNG de hasta 3 MB cada uno.');event.currentTarget.value='';setSelected(current=>({...current,[key]:''}));return;
    }
    setSelected(current=>({...current,[key]:file?.name||''}));
  }
  function removeDocument(key:string){if(inputs.current[key])inputs.current[key]!.value='';setSelected(current=>({...current,[key]:''}));}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    const form=event.currentTarget,data=new FormData(form);setError('');setBusy(true);
    try{
      const response=await fetch('/api/applications',{method:'POST',body:data});
      let result:{error?:string;reference?:string};
      try{result=await response.json();}catch{throw Error('No se pudo enviar la solicitud. Intenta nuevamente con archivos más pequeños.');}
      if(!response.ok||!result.reference)throw Error(result.error||'No pudimos guardar tu solicitud. Intenta nuevamente.');
      setReference(result.reference);form.reset();setSelected({});
    }catch(cause){setError(cause instanceof Error?cause.message:'No se pudo enviar la solicitud.');requestAnimationFrame(()=>errorRef.current?.focus());}
    finally{setBusy(false);}
  }
  if(reference)return <section className="application-received" role="status" aria-live="polite"><CheckCircle2 size={44} strokeWidth={1.3}/><span className="eyebrow dark">SOLICITUD REGISTRADA</span><h2>Recibimos tus<br/>documentos.</h2><p>Tu solicitud está pendiente de revisión por el equipo de Freight Master.</p><p>Conserva tu folio:</p><strong className="application-reference">{reference}</strong><a className="button wine" href="/">Volver al inicio <ArrowUpRight size={18}/></a></section>;
  return <form className="application-form" onSubmit={submit} aria-busy={busy}>
    <fieldset disabled={busy}>
      <legend>02 / TU SOLICITUD</legend><h2>Cuéntanos de ti.</h2><p className="application-help">Los campos marcados con * son obligatorios.</p>
      <label htmlFor="application-name">Nombre completo *<input id="application-name" name="name" autoComplete="name" required minLength={2} maxLength={100}/></label>
      <div className="application-contact"><label htmlFor="application-email">Correo electrónico *<input id="application-email" name="email" type="email" autoComplete="email" required maxLength={254}/></label><label htmlFor="application-phone">Teléfono *<input id="application-phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40}/></label></div>
      <label htmlFor="application-company">Empresa o razón social <span className="field-optional">(opcional)</span><input id="application-company" name="company" autoComplete="organization" maxLength={150}/></label>
      <div className="application-honeypot" aria-hidden="true"><label htmlFor="application-website">Dejar vacío<input id="application-website" name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <div className="application-documents-heading"><h3>Sube tus documentos</h3><span aria-live="polite">{count} de 6</span></div><p id="document-help" className="application-help">Un archivo por requisito. PDF, JPG o PNG, máximo 3 MB por archivo. Los seis documentos son obligatorios.</p>
      <div className="application-documents">{DRIVER_REQUIREMENTS.map((requirement,index)=><div className={`application-document ${selected[requirement.key]?'has-file':''}`} key={requirement.key}>
        <label htmlFor={`document-${requirement.key}`}><span className="document-number">{selected[requirement.key]?<Check size={17}/>:String(index+1).padStart(2,'0')}</span><span><b>{requirement.label} *</b><small>{selected[requirement.key]||'Seleccionar archivo'}</small></span><FileUp size={22} strokeWidth={1.4}/></label>
        <input ref={element=>{inputs.current[requirement.key]=element;}} id={`document-${requirement.key}`} name={requirement.key} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required aria-describedby="document-help" onChange={event=>selectDocument(event,requirement.key)}/>
        {selected[requirement.key]&&<button className="remove-document" type="button" aria-label={`Quitar ${requirement.label}`} onClick={()=>removeDocument(requirement.key)}><X size={16}/></button>}
      </div>)}</div>
      <label className="application-consent"><input type="checkbox" name="consent" value="yes" required/><span>Autorizo a Freight Master a utilizar mis datos y documentos para revisar y dar seguimiento a esta solicitud. *</span></label>
      <p className="application-help">Los documentos se consultan desde administración. El envío no confirma una contratación.</p>
      <p ref={errorRef} tabIndex={-1} className="application-error" role="alert">{error}</p>
      <button className="button wine application-submit" type="submit" disabled={busy}>{busy?'Enviando solicitud…':'Enviar mi solicitud'}{busy?<LoaderCircle className="application-spinner" size={18}/>:<ArrowUpRight size={18}/>}</button>
      {busy&&<p className="application-help" role="status">Estamos cargando tus documentos. Mantén esta página abierta hasta recibir tu folio.</p>}
    </fieldset>
  </form>;
}
