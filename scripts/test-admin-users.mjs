import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import * as security from '../lib/admin-security.ts';
import * as accounts from '../lib/admin-users.ts';
import {readObject} from '../lib/api-input.ts';

const require=createRequire(import.meta.url),ts=require('typescript');
const saved={ADMIN_USERNAME:process.env.ADMIN_USERNAME,ADMIN_PASSWORD:process.env.ADMIN_PASSWORD,APP_URL:process.env.APP_URL};
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE admin_sessions(token_hash TEXT PRIMARY KEY,credential_version TEXT,expires_at INTEGER);
 CREATE TABLE admin_users(id TEXT PRIMARY KEY,name TEXT,username TEXT UNIQUE,password_hash TEXT,active INTEGER,created_at TEXT);
 CREATE TABLE admin_user_sessions(token_hash TEXT PRIMARY KEY,admin_user_id TEXT REFERENCES admin_users(id),credential_version TEXT,expires_at INTEGER);`);
let currentToken,limited=false,storageFailure=false,raceDuplicate=false;
const database={prepare(sql){
 const statement=(values=[])=>({
  bind(...bound){return statement(bound);},
  async first(){if(storageFailure)throw Error('Storage unavailable');return sqlite.prepare(sql).get(...values)||null;},
  async all(){if(storageFailure)throw Error('Storage unavailable');return {results:sqlite.prepare(sql).all(...values)};},
  async run(){
   if(storageFailure)throw Error('Storage unavailable');
   if(raceDuplicate&&sql.startsWith('INSERT INTO admin_users'))throw Object.assign(Error('Duplicate entry'),{code:'ER_DUP_ENTRY'});
   sqlite.prepare(sql).run(...values);return {success:true};
  },
 });return statement();
}};
const rateKeys=[];
const access={db:()=>database,sameOrigin:request=>security.permittedOrigin(request),admin:()=>security.sessionAdmin(database,currentToken),
 async rate(key){rateKeys.push(key);return !limited;},
 async digest(value){return createHash('sha256').update(value).digest('hex');},
 cookieFlags:()=> 'HttpOnly; SameSite=Strict; Secure; ',
 fail:(error,status=400)=>Response.json({error},{status}),
};
function route(file){
 const module={exports:{}};
 const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const imports={'@/lib/access':access,'@/lib/admin-security':security,'@/lib/admin-users':accounts,'@/lib/api-input':{readObject}};
 new Function('require','exports','module',code)(name=>imports[name]||require(name),module.exports,module);
 return module.exports;
}
const users=route('app/api/control/admin-users/route.ts'),login=route('app/api/admin/login/route.ts'),logout=route('app/api/admin/logout/route.ts');
const request=(url,body,origin='https://freight.test')=>new Request('https://freight.test'+url,{method:'POST',headers:{origin,'content-type':'application/json',...(currentToken?{cookie:'fm_admin='+currentToken}:{})},body:JSON.stringify(body)});
const body={name:'Operations Test',username:'operations.test',password:randomBytes(18).toString('hex')};body.confirmPassword=body.password;
const count=()=>sqlite.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n;
function tokenFrom(response){const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Max-Age=3600/);return cookie.match(/fm_admin=([a-f0-9]{72})/)[1];}
try{
 process.env.ADMIN_USERNAME='owner';process.env.ADMIN_PASSWORD=randomBytes(24).toString('hex');process.env.APP_URL='https://freight.test';
 assert.equal((await users.GET()).status,403);
 assert.equal((await users.POST(request('/api/control/admin-users',body))).status,403);assert.equal(count(),0);
 let response=await login.POST(request('/api/admin/login',{username:'owner',password:process.env.ADMIN_PASSWORD}));assert.equal(response.status,200);currentToken=tokenFrom(response);const ownerToken=currentToken;
 assert.equal(await security.sessionAdmin(database,currentToken),true);
 assert.equal((await users.POST(request('/api/control/admin-users',body,'https://attacker.test'))).status,403);
 for(const change of [{password:'short',confirmPassword:'short'},{confirmPassword:'does-not-match'},{name:'x'},{username:"' OR 1=1 --"},{username:' x '},{username:'x'.repeat(51)},{password:'x'.repeat(129),confirmPassword:'x'.repeat(129)},{name:'Bad\u0000Name'}])assert.equal((await users.POST(request('/api/control/admin-users',{...body,...change}))).status,400);
 assert.equal((await users.POST(request('/api/control/admin-users',{...body,username:'OWNER'}))).status,409);assert.equal(count(),0);
 response=await users.POST(request('/api/control/admin-users',{...body,username:' Operations.Test '}));assert.equal(response.status,201);const created=(await response.json()).user;
 assert.equal(created.username,'operations.test');assert(!('password_hash' in created));assert(!JSON.stringify(created).includes(body.password));
 const row=sqlite.prepare('SELECT * FROM admin_users').get();assert.notEqual(row.password_hash,body.password);assert.match(row.password_hash,/^scrypt\$/);
 assert.equal(await security.verifyAdminPassword(body.password,row.password_hash),true);assert.equal(await security.verifyAdminPassword('wrong',row.password_hash),false);assert.equal(await security.verifyAdminPassword(body.password,'bad hash'),false);
 const secondHash=await security.hashAdminPassword(body.password);assert.notEqual(secondHash,row.password_hash);
 assert.equal((await users.POST(request('/api/control/admin-users',body))).status,409);assert.equal(count(),1);
 raceDuplicate=true;assert.equal((await users.POST(request('/api/control/admin-users',{...body,username:'race.test'}))).status,409);raceDuplicate=false;
 limited=true;assert.equal((await users.POST(request('/api/control/admin-users',{...body,username:'limited.test'}))).status,429);limited=false;
 response=await users.GET();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');const listing=await response.json();assert.equal(listing.serverUsername,'owner');assert.equal(listing.users.length,1);assert(!JSON.stringify(listing).includes('password_hash'));assert(!JSON.stringify(listing).includes(row.password_hash));
 assert.equal((await login.POST(request('/api/admin/login',{username:body.username,password:'wrong'}))).status,401);
 assert.equal((await login.POST(request('/api/admin/login',{username:'unknown',password:body.password}))).status,401);
 response=await login.POST(request('/api/admin/login',{username:'OPERATIONS.TEST',password:body.password}));assert.equal(response.status,200);currentToken=tokenFrom(response);const userToken=currentToken;
 assert.equal(await security.sessionAdmin(database,currentToken),true);assert.equal((await users.GET()).status,200);
 // New accounts have the same panel capabilities, including creating another account.
 response=await users.POST(request('/api/control/admin-users',{...body,name:'Second Admin',username:'second.admin'}));assert.equal(response.status,201);assert.equal(count(),2);
 assert.equal(await security.sessionAdmin(database,'0'.repeat(72)),false);
 const digest=await access.digest(userToken);sqlite.prepare('UPDATE admin_user_sessions SET expires_at=0 WHERE token_hash=?').run(digest);assert.equal(await security.sessionAdmin(database,userToken),false);
 sqlite.prepare('UPDATE admin_user_sessions SET expires_at=? WHERE token_hash=?').run(Date.now()+60000,digest);
 sqlite.prepare('UPDATE admin_users SET active=0 WHERE id=?').run(created.id);assert.equal(await security.sessionAdmin(database,userToken),false);assert.equal((await login.POST(request('/api/admin/login',{username:body.username,password:body.password}))).status,401);
 sqlite.prepare('UPDATE admin_users SET active=1,password_hash=? WHERE id=?').run(secondHash,created.id);assert.equal(await security.sessionAdmin(database,userToken),false);assert.equal(await security.sessionAdmin(database,ownerToken),true);
 response=await login.POST(request('/api/admin/login',{username:body.username,password:body.password}));currentToken=tokenFrom(response);
 response=await logout.POST(request('/api/admin/logout',{}));assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/Max-Age=0/);assert.equal(await security.sessionAdmin(database,currentToken),false);
 assert(rateKeys.includes('admin:login:account:'+await access.digest('operations.test')));
 currentToken=ownerToken;storageFailure=true;assert.equal((await users.GET()).status,503);assert.equal((await users.POST(request('/api/control/admin-users',body))).status,503);storageFailure=false;
 process.env.ADMIN_PASSWORD=randomBytes(24).toString('hex');assert.equal(await security.sessionAdmin(database,ownerToken),false);
 delete process.env.ADMIN_PASSWORD;assert.equal((await login.POST(request('/api/admin/login',{username:'second.admin',password:body.password}))).status,200);
 console.log('PASS: actual admin API routes, owner compatibility, private registration/list, origin and session guards, input validation, duplicate/race/rate handling, salted password hashes, new-account login, independent sessions, expiry, revocation and logout.');
}finally{sqlite.close();for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
