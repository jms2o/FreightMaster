import {downloadApplicationDocument} from '@/lib/recruitment';
import {recruitmentServices} from '@/lib/recruitment-services';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{applicationId:string;documentId:string}>}){
  const {applicationId,documentId}=await params;
  return downloadApplicationDocument(applicationId,documentId,recruitmentServices);
}
