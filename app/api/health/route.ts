import {db} from '@/lib/access';
import {databaseConfigured} from '@/lib/database';
import {configuredCredentials} from '@/lib/admin-security';
export const dynamic='force-dynamic';
export async function GET(){
 const configuration={database:databaseConfigured(),admin:Boolean(configuredCredentials()),origin:Boolean(process.env.APP_URL)};
 let connected=false;try{if(configuration.database){await db().prepare('SELECT 1 AS ok').first();connected=true;}}catch{}
 const ok=connected&&configuration.admin&&configuration.origin;
 return Response.json({ok,configuration,databaseConnected:connected},{status:ok?200:503,headers:{'Cache-Control':'no-store'}});
}
