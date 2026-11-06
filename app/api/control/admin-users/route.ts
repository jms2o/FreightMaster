import {admin,db,rate,sameOrigin} from '@/lib/access';
import {readObject} from '@/lib/api-input';
import {configuredCredentials,hashAdminPassword} from '@/lib/admin-security';
import {createAdminUser,listAdminUsers} from '@/lib/admin-users';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const services={database:db(),isAdmin:admin,sameOrigin,readObject,hashPassword:hashAdminPassword,reservedUsername:()=>configuredCredentials()?.username||'',allowCreation:()=>rate('admin:users:create',20)};
export async function GET(){return listAdminUsers(services);}
export async function POST(request:Request){return createAdminUser(request,services);}
