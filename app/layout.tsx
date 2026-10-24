import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Freight Master',description:'Logística y traslado de mercancías en contenedores. Solicita una cotización.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
