import {LayoutDashboard,Truck,Route,ClipboardList,FileText,Users,MessagesSquare} from 'lucide-react';
export const ADMIN_PAGES=[
 {href:'/control',label:'Resumen',title:'Tu operación, por secciones.',description:'Elige el espacio que necesitas y continúa con tu operación.',Icon:LayoutDashboard},
 {href:'/control/choferes',label:'Choferes',title:'Choferes',description:'Registra choferes y administra su acceso al chat operativo.',Icon:Truck},
 {href:'/control/itinerarios',label:'Itinerarios',title:'Planifica las próximas paradas.',description:'Asigna y organiza las tareas de cada chofer.',Icon:Route},
 {href:'/control/postulaciones',label:'Postulaciones',title:'Postulaciones de choferes',description:'Revisa solicitudes, consulta documentos y actualiza su seguimiento.',Icon:ClipboardList},
 {href:'/control/cotizaciones',label:'Cotizaciones',title:'Solicitudes de cotización',description:'Consulta los detalles enviados por tus clientes desde la página.',Icon:FileText},
 {href:'/control/usuarios',label:'Usuarios',title:'Accesos administrativos',description:'Crea cuentas personales para quienes administran la operación.',Icon:Users},
 {href:'/control/configuracion',label:'Asistente público',title:'La información que compartes.',description:'Configura las respuestas de ubicación y seguridad en ambos idiomas.',Icon:MessagesSquare},
] as const;
