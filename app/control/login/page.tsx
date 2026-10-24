'use client';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowLeft,ArrowRight,LockKeyhole} from 'lucide-react';
export default function AdminLogin(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');try{const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});const data=await response.json();if(!response.ok)throw Error(data.error||'No se pudo ingresar.');window.location.assign('/control');}catch(e){setError(e instanceof Error?e.message:'No se pudo conectar.');setBusy(false);}}
 return <main className="admin-login"><a href="/" className="back"><ArrowLeft size={14}/> Volver a Freight Master</a><div className="admin-login-card"><img src="/logo.png" alt="Freight Master"/><LockKeyhole size={25} strokeWidth={1.5}/><h1>Administración</h1><p>Ingresa para gestionar choferes, itinerarios y cotizaciones.</p><form onSubmit={submit}><label>Usuario<input name="username" required autoComplete="username" maxLength={100}/></label><label>Contraseña<input name="password" type="password" required autoComplete="current-password" maxLength={128}/></label><button className="button wine" disabled={busy}>{busy?'Verificando…':'Ingresar'}<ArrowRight size={16}/></button><p className="error" role="alert">{error}</p></form></div></main>
}
