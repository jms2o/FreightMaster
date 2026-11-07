import {admin} from '@/lib/access';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {asLocale,translate} from '@/lib/i18n';
import ControlShell from '../panel';
export const dynamic='force-dynamic';
export async function generateMetadata(){const locale=asLocale((await cookies()).get('fm_language')?.value);return {title:translate('Administración | Freight Master',locale)};}
export default async function PanelLayout({children}:{children:React.ReactNode}){if(!await admin())redirect('/control/login');return <ControlShell>{children}</ControlShell>;}
