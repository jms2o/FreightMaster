import {admin} from '@/lib/access';
import {redirect} from 'next/navigation';
import Control from './panel';
export const dynamic='force-dynamic';
export default async function Page(){if(!await admin())redirect('/control/login');return <Control/>}
