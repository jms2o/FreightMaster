import {submitApplication} from '@/lib/recruitment';
import {recruitmentServices} from '@/lib/recruitment-services';
export const runtime='nodejs';
export async function POST(request:Request){return submitApplication(request,recruitmentServices);}
