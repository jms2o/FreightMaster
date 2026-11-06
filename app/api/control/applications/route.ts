import {listApplications,changeApplicationStatus} from '@/lib/recruitment';
import {recruitmentServices} from '@/lib/recruitment-services';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){return listApplications(recruitmentServices);}
export async function PATCH(request:Request){return changeApplicationStatus(request,recruitmentServices);}
