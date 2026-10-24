import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type BoundStatement = {
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{results:T[]}>;
  run(): Promise<{success:boolean}>;
};
export type AppDatabase = {prepare(sql:string):BoundStatement & {bind(...values:unknown[]):BoundStatement}};
type Pool = {execute(sql:string,values?:unknown[]):Promise<[unknown,unknown]>;query(sql:string):Promise<[unknown,unknown]>};
let pool:Pool|undefined;
let initialized:Promise<void>|undefined;
export function databaseConfigured(){return ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'].every(k=>Boolean(process.env[k]));}
function connection():Pool{
  if(pool)return pool;
  if(!databaseConfigured())throw new Error('Configura la base MySQL en las variables de Hostinger.');
  const require=createRequire(import.meta.url);
  const mysql=require('mysql2/promise') as {createPool(options:Record<string,unknown>):Pool};
  pool=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:true,connectionLimit:5,queueLimit:50,connectTimeout:10000,charset:'utf8mb4',supportBigNumbers:true,bigNumberStrings:false,multipleStatements:false});
  return pool;
}
async function initialize(){
  if(!initialized){initialized=(async()=>{
    const sql=await readFile(path.join(process.cwd(),'db/mysql.sql'),'utf8');
    for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await connection().query(statement);
  })().catch(error=>{initialized=undefined;throw error});}
  return initialized;
}
function statement(sql:string,values:unknown[]=[]):BoundStatement & {bind(...values:unknown[]):BoundStatement}{
  async function execute(){await initialize();return (await connection().execute(sql,values))[0];}
  return {bind(...bound){return statement(sql,bound)},async first<T>(){const rows=await execute() as T[];return rows[0]??null},async all<T>(){return {results:await execute() as T[]}},async run(){await execute();return {success:true}}};
}
const database:AppDatabase={prepare:sql=>statement(sql)};
export function getDatabase(){return database;}
