import {createHash} from 'node:crypto';
import {admin,db,rate,sameOrigin} from './access';
import {databaseTransaction} from './database';
import type {RecruitmentServices} from './recruitment';
import {readObject} from './api-input';

export const recruitmentServices:RecruitmentServices={
  database:db(),transaction:databaseTransaction,isAdmin:admin,sameOrigin,readObject,
  async allowSubmission(request){
    const address=request.headers.get('x-real-ip')||request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'shared';
    const key=createHash('sha256').update(address).digest('hex');
    return await rate('applications:ip:'+key,3)&&await rate('applications:global',10);
  },
};
