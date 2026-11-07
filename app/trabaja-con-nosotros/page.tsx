import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import {asLocale,translate} from '@/lib/i18n';
import RecruitmentContent from './recruitment-content';
export async function generateMetadata():Promise<Metadata>{const locale=asLocale((await cookies()).get('fm_language')?.value);return {title:translate('Trabaja con nosotros | Freight Master',locale),description:translate('Consulta los requisitos y envía tu solicitud con documentos a Freight Master.',locale)};}
export default function RecruitmentPage(){return <RecruitmentContent/>;}
