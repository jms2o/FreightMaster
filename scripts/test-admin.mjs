import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomBytes} from 'node:crypto';
import {configuredCredentials,credentialVersion,verifyCredentials,permittedOrigin,sessionAdmin} from '../lib/admin-security.ts';
const saved={ADMIN_USERNAME:process.env.ADMIN_USERNAME,ADMIN_PASSWORD:process.env.ADMIN_PASSWORD,NODE_ENV:process.env.NODE_ENV,APP_URL:process.env.APP_URL};
try{
 delete process.env.ADMIN_PASSWORD;assert.equal(configuredCredentials(),null);assert.equal(verifyCredentials('admin','password'),false);
 process.env.ADMIN_USERNAME='admin';process.env.ADMIN_PASSWORD=randomBytes(24).toString('hex');
 const password=process.env.ADMIN_PASSWORD;
 assert.equal(verifyCredentials('admin',password),true);assert.equal(verifyCredentials('another-user',password),false);assert.equal(verifyCredentials('admin','wrong'),false);
 process.env.NODE_ENV='production';delete process.env.APP_URL;
 const own=new Request('http://internal:3000/api/admin/login',{method:'POST',headers:{origin:'https://demo.hostinger.test'}});
 assert.equal(permittedOrigin(own),false);process.env.APP_URL='https://demo.hostinger.test';assert.equal(permittedOrigin(own),true);
 assert.equal(permittedOrigin(new Request('http://internal:3000',{headers:{origin:'https://attacker.test'}})),false);
 assert.equal(permittedOrigin(new Request('http://internal:3000',{headers:{origin:'https://demo.hostinger.test.attacker.test'}})),false);
 assert.equal(permittedOrigin(new Request('http://internal:3000')),false);
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE admin_sessions(token_hash TEXT,credential_version TEXT,expires_at INTEGER)');
 const database={prepare(sql){return {bind(...values){return {async first(){return sqlite.prepare(sql).get(...values)||null}}}}}};
 const token=randomBytes(36).toString('hex');sqlite.prepare('INSERT INTO admin_sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),credentialVersion(),200);
 assert.equal(await sessionAdmin(database,token,100),true);assert.equal(await sessionAdmin(database,token,201),false);assert.equal(await sessionAdmin(database,undefined,100),false);assert.equal(await sessionAdmin(database,"' OR 1=1 --",100),false);
 process.env.ADMIN_PASSWORD=randomBytes(24).toString('hex');assert.equal(await sessionAdmin(database,token,100),false);
 console.log('PASS: unset credentials deny access, username/password, proxy origin, hostile/missing origin, opaque admin session, expiry, forged token, password rotation.');
}finally{for(const [k,v] of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
