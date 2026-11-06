import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readObject} from '../lib/api-input.ts';
import {permittedOrigin} from '../lib/admin-security.ts';
import {DRIVER_REQUIREMENTS,MAX_APPLICATION_BYTES,MAX_DOCUMENT_BYTES,submitApplication,listApplications,changeApplicationStatus,downloadApplicationDocument} from '../lib/recruitment.ts';

const sqlite=new DatabaseSync(':memory:');
sqlite.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE driver_applications(id TEXT PRIMARY KEY,name TEXT,email TEXT,phone TEXT,company TEXT,status TEXT,consented_at TEXT,created_at TEXT,updated_at TEXT);
 CREATE TABLE driver_application_documents(id TEXT PRIMARY KEY,application_id TEXT REFERENCES driver_applications(id),kind TEXT,filename TEXT,mime_type TEXT,byte_size INTEGER,content BLOB,created_at TEXT,UNIQUE(application_id,kind));`);
let failDocument=false,admin=false,limited=false;
const database={prepare(sql){
 const call=(values=[])=>({
  async first(){return sqlite.prepare(sql).get(...values)||null;},
  async all(){return {results:sqlite.prepare(sql).all(...values)};},
  async run(){if(failDocument&&sql.startsWith('INSERT INTO driver_application_documents')&&values[2]==='insurance')throw Error('Simulated storage failure');sqlite.prepare(sql).run(...values);return {success:true};},
  bind(...bound){return call(bound);},
 });return call();
}};
const services={database,isAdmin:async()=>admin,sameOrigin:request=>permittedOrigin(request,'https://freight.test'),allowSubmission:async()=>!limited,readObject,
 async transaction(work){sqlite.exec('BEGIN');try{const result=await work(database);sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}}
};
const pdf=new TextEncoder().encode('%PDF-1.7\nSynthetic test document\n%%EOF');
function form(){const f=new FormData();for(const [key,value] of Object.entries({name:"Driver ' Test",email:'driver@example.test',phone:'+1 555 010 1234',company:'',consent:'yes'}))f.set(key,value);for(const r of DRIVER_REQUIREMENTS)f.set(r.key,new File([pdf],'../../document.pdf',{type:'application/pdf'}));return f;}
function request(data=form(),origin='https://freight.test'){return new Request('https://freight.test/api/applications',{method:'POST',headers:{origin},body:data});}
const counts=()=>[sqlite.prepare('SELECT COUNT(*) AS n FROM driver_applications').get().n,sqlite.prepare('SELECT COUNT(*) AS n FROM driver_application_documents').get().n];
let response=await submitApplication(request(),services);assert.equal(response.status,201);const {reference}=await response.json();assert.match(reference,/^[A-F0-9-]{36}$/);assert.deepEqual(counts(),[1,6]);
const saved=sqlite.prepare('SELECT * FROM driver_applications').get();assert.equal(saved.name,"Driver ' Test");
const documents=sqlite.prepare('SELECT * FROM driver_application_documents').all();assert(documents.every(d=>d.filename.endsWith('.pdf')&&!d.filename.includes('/')));assert.deepEqual(new Uint8Array(documents[0].content),pdf);
for(const mutate of [f=>f.delete('w9'),f=>f.delete('consent'),f=>f.set('email','invalid'),f=>f.append('cdl',new File([pdf],'extra.pdf',{type:'application/pdf'})),f=>f.set('registration',new File(['<script>bad</script>'],'fake.pdf',{type:'application/pdf'})),f=>f.set('w9',new File([pdf],'document.svg',{type:'image/svg+xml'})),f=>f.set('website','bot'),f=>f.append('name','second name')]){const f=form();mutate(f);assert.equal((await submitApplication(request(f),services)).status,400);assert.deepEqual(counts(),[1,6]);}
const oversized=form();oversized.set('w9',new File([new Uint8Array(MAX_DOCUMENT_BYTES+1)],'large.pdf',{type:'application/pdf'}));assert.equal((await submitApplication(request(oversized),services)).status,413);
assert.equal((await submitApplication(new Request('https://freight.test/api/applications',{method:'POST',headers:{origin:'https://freight.test','content-type':'multipart/form-data; boundary=x','content-length':String(MAX_APPLICATION_BYTES+1)},body:'x'}),services)).status,413);
assert.equal((await submitApplication(request(form(),'https://attacker.test'),services)).status,403);
limited=true;assert.equal((await submitApplication(request(),services)).status,429);limited=false;
failDocument=true;assert.equal((await submitApplication(request(),services)).status,503);assert.deepEqual(counts(),[1,6]);failDocument=false;
assert.equal((await listApplications(services)).status,403);assert.equal((await downloadApplicationDocument(saved.id,documents[0].id,services)).status,403);
admin=true;response=await listApplications(services);const list=await response.json();assert.equal(list.documents.length,6);assert(!JSON.stringify(list).includes('Synthetic test document'));assert(list.documents.every(d=>!('content' in d)));
response=await downloadApplicationDocument(saved.id,documents[0].id,services);assert.equal(response.status,200);assert.match(response.headers.get('content-disposition'),/^attachment/);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.deepEqual(new Uint8Array(await response.arrayBuffer()),pdf);
assert.equal((await downloadApplicationDocument(crypto.randomUUID(),documents[0].id,services)).status,404);assert.equal((await downloadApplicationDocument("' OR 1=1 --",documents[0].id,services)).status,404);
const patch=(status,id=saved.id,origin='https://freight.test')=>new Request('https://freight.test/api/control/applications',{method:'PATCH',headers:{origin,'content-type':'application/json'},body:JSON.stringify({id,status})});
assert.equal((await changeApplicationStatus(patch('reviewing'),services)).status,200);assert.equal(sqlite.prepare('SELECT status FROM driver_applications WHERE id=?').get(saved.id).status,'reviewing');assert.equal((await changeApplicationStatus(patch('approved'),services)).status,400);assert.equal((await changeApplicationStatus(patch('closed',crypto.randomUUID()),services)).status,404);assert.equal((await changeApplicationStatus(patch('closed',saved.id,'https://attacker.test'),services)).status,403);
admin=false;assert.equal((await changeApplicationStatus(patch('closed'),services)).status,403);
const mixed=form();mixed.set('cdl',new File([new Uint8Array([255,216,255,224,0,16,0])],'license.jpg',{type:'image/jpeg'}));mixed.set('registration',new File([new Uint8Array([137,80,78,71,13,10,26,10,0])],'registration.png',{type:'image/png'}));assert.equal((await submitApplication(request(mixed),services)).status,201);assert.deepEqual(counts(),[2,12]);
const wrongMime=form();wrongMime.set('w9',new File([pdf],'w9.pdf',{type:'image/jpeg'}));assert.equal((await submitApplication(request(wrongMime),services)).status,400);
const tooMuch=new Request('https://freight.test/api/applications',{method:'POST',headers:{origin:'https://freight.test','content-type':'multipart/form-data; boundary=x'},body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(MAX_APPLICATION_BYTES+1));controller.close();}}),duplex:'half'});assert.equal((await submitApplication(tooMuch,services)).status,413);assert.deepEqual(counts(),[2,12]);
sqlite.close();
console.log('PASS: six document submission, SQL-bound data, file signatures/types/sizes, duplicates and consent, origin/rate limits, transaction rollback, private lists/downloads, application-document ownership, manual status updates.');
