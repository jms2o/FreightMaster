import {initializeOwner} from '@/lib/access';
import {requireChatGPTUser} from '@/app/chatgpt-auth';
import Control from './panel';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/control');if(!await initializeOwner())return <main className="control"><h1>Acceso restringido</h1><p>Esta sección es exclusiva de la cuenta administradora.</p><a href="/">Volver al inicio</a></main>;return <Control/>}
