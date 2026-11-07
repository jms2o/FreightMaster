import assert from 'node:assert/strict';
import path from 'node:path';
import {existsSync,readFileSync} from 'node:fs';
import Module,{createRequire} from 'node:module';
import {asLocale,requestLocale,translate} from '../lib/i18n.ts';
import {reply} from '../lib/replies.ts';
import {driverReply} from '../lib/driver-reply.ts';
const root=path.resolve('.'),require=createRequire(path.join(root,'package.json'));
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const modules=new Map();
let currentPathname='/control';
function source(file){
 const resolved=['','.tsx','.ts','.js','/index.tsx','/index.ts'].map(suffix=>file+suffix).find(candidate=>existsSync(candidate)&&/\.(tsx|ts|js)$/.test(candidate));
 if(!resolved)throw Error('Missing test module: '+file);
 if(modules.has(resolved))return modules.get(resolved).exports;
 const module=new Module(resolved);module.paths=Module._nodeModulePaths(path.dirname(resolved));modules.set(resolved,module);
 module.require=name=>name==='next/navigation'?{usePathname:()=>currentPathname}:name==='next/link'?({prefetch,children,...props})=>React.createElement('a',props,children):name.startsWith('@/')?source(path.join(root,name.slice(2))):name.startsWith('.')?source(path.resolve(path.dirname(resolved),name)):require(name);
 module._compile(ts.transpileModule(readFileSync(resolved,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,resolved);
 return module.exports;
}
assert.equal(asLocale('en'),'en');assert.equal(asLocale('EN'),'es');assert.equal(asLocale('unknown'),'es');
assert.equal(requestLocale(new Request('https://freight.test',{headers:{cookie:'other=x; fm_language=en'}})),'en');
assert.equal(requestLocale(new Request('https://freight.test',{headers:{cookie:'fm_language=english'}})),'es');
assert.equal(requestLocale(new Request('https://freight.test',{headers:{'x-fm-language':'es',cookie:'fm_language=en'}})),'es');
assert.equal(translate('Solicitar cotización','en'),'Request a quote');assert.equal(translate('Solicitar cotización','es'),'Solicitar cotización');
assert.equal(translate('Ver requisitos y postularme ','en'),'View requirements and apply ');
assert.equal(translate('Unknown original content','en'),'Unknown original content');assert.equal(translate('constructor','en'),'constructor');
assert.equal(translate('Quitar W9','en'),'Remove W9');
assert.equal(translate('W9: el máximo por archivo es 3 MB.','en'),'W9: the maximum file size is 3 MB.');
assert.match(translate('Solicitud registrada. Tu referencia es REF123. El equipo puede consultarla en su panel.','en'),/REF123/);
assert.equal(translate('Hola {0}','es',['Joel']),'Hola Joel');
assert.match(reply('Request a quote',false,'en'),/request a quote/i);assert.match(reply('Driver access',false,'en'),/driver/i);
const stop={id:'a',driver_id:'A',date:'2026-11-06',sequence:1,operation:'pickup',location:'Almacén del Norte',planned_time:'09:00',reference:'REF123',instructions:'Presentar referencia en caseta.',requirements:'BOL firmado',active:1};
const driver=driverReply('What am I doing today?','José','2026-11-06',[stop],'en');
assert.match(driver,/recorded itinerary/);assert.match(driver,/José/);assert.match(driver,/Almacén del Norte/);assert.match(driver,/Presentar referencia en caseta\./);
assert.match(driverReply('What documents do I need?','José','2026-11-06',[stop],'en'),/Recorded requirements/);
assert.match(driverReply('What do I have tomorrow?','José','2026-11-07',[],'en'),/no recorded stops/);
assert.match(driverReply('Emergency','José','2026-11-06',[],'en'),/emergency services/);
const {LanguageProvider,LanguageSwitcher}=source(path.join(root,'app/language.tsx'));
function render(file,locale,props={}){const Component=source(path.join(root,file)).default;return renderToStaticMarkup(React.createElement(LanguageProvider,{initialLocale:locale},React.createElement(Component,props)));}
for(const locale of ['es','en']){
 const home=render('app/page.tsx',locale),recruitment=render('app/trabaja-con-nosotros/recruitment-content.tsx',locale),panel=render('app/control/panel.tsx',locale,{children:React.createElement('p',null,'Workspace content')}),login=render('app/control/login/page.tsx',locale);
 assert.ok(home.includes(locale==='en'?'Request a quote':'Solicitar cotización'));
 assert.ok(home.includes(locale==='en'?'View requirements and apply':'Ver requisitos y postularme'));
 assert.ok(home.includes('/media/driver-recruitment.webp'));assert.ok(home.includes('/media/freight-road-wide.mp4'));assert.ok(!/autoplay/i.test(home));
 assert.equal((recruitment.match(/type="file"/g)||[]).length,6);
 assert.ok(recruitment.includes('FREIGHTMASTER USA'));assert.ok(recruitment.includes('950 Houston Northcutt Blvd, Mount Pleasant, SC 29464'));
 assert.ok(recruitment.includes(locale==='en'?'Upload your documents':'Sube tus documentos'));
 const users=render('app/control/admin-users.tsx',locale);assert.ok(users.includes(locale==='en'?'Create administrator':'Crear administrador'));
 assert.ok(users.includes('name="confirmPassword"'));const itineraries=render('app/control/itineraries.tsx',locale);assert.ok(itineraries.includes(locale==='en'?'Driver itineraries':'Itinerarios de choferes'));assert.ok(!itineraries.includes('name="address_en"'));const settings=render('app/control/itineraries.tsx',locale,{view:'settings'});assert.ok(settings.includes(locale==='en'?'Public assistant information':'Información del asistente público'));assert.ok(!settings.includes('name="driverId"'));const drivers=render('app/control/drivers.tsx',locale);assert.ok(drivers.includes('name="pin"'));assert.ok(!drivers.includes('name="confirmPassword"'));const overview=render('app/control/overview.tsx',locale);assert.ok(overview.includes('/control/choferes'));assert.ok(!overview.includes('name="pin"'));
 assert.ok(login.includes(locale==='en'?'Sign in':'Ingresar'));
 for(const html of [home,recruitment,panel,login]){assert.ok(html.includes('aria-label="Idioma / Language"'));assert.ok(html.includes(`<option value="${locale}" lang="${locale}" selected=""`));}
 const composer=render('app/chat-composer.tsx',locale,{send(){},busy:false});assert.ok(composer.includes(locale==='en'?'Type your message':'Escribe tu mensaje'));
}
for(const route of ['/control','/control/choferes','/control/itinerarios','/control/postulaciones','/control/cotizaciones','/control/usuarios','/control/configuracion']){
 currentPathname=route;
 const shell=render('app/control/panel.tsx','en',{children:React.createElement('div',null,'Only this module')});
 assert.ok(shell.includes(`href="${route}" aria-current="page"`));
 assert.ok(shell.includes('aria-label="Close menu"'));assert.ok(shell.includes('aria-label="Sign out"'));
 assert.ok(shell.includes('Only this module'));assert.ok(!shell.includes('name="pin"'));
 const file=route==='/control'?'app/control/(panel)/page.tsx':`app/control/(panel)/${route.split('/').at(-1)}/page.tsx`;
 const html=render(file,'en');assert.ok(html.length>0);
}
currentPathname='/control';
// Public mobile navigation opens/closes the native dialog and retains every destination.
let menuOpened=0,menuClosed=0,toggleFocused=0,driverOpened=0,refIndex=0;
const dialogDouble={showModal(){menuOpened++;},close(){menuClosed++;}};
const toggleDouble={focus(){toggleFocused++;}};
const headerModule={exports:{}};
const headerCode=ts.transpileModule(readFileSync(path.join(root,'app/site-header.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const headerReact={...React,useRef:()=>({current:refIndex++===0?dialogDouble:toggleDouble}),useState:()=>[false,()=>{}],useEffect(){}};
new Function('require','exports','module',headerCode)(name=>name==='react'?headerReact:name==='./language'?{useLanguage:()=>({t:text=>translate(text,'en')}),LanguageSwitcher}:require(name),headerModule.exports,headerModule);
const headerTree=headerModule.exports.default({onDriverAccess(){driverOpened++;}});
const publicHeader=headerTree.props.children[0],publicDialog=headerTree.props.children[1];
const mobileToggle=publicHeader.props.children.find(child=>child?.props?.className==='site-menu-toggle');
assert.equal(mobileToggle.props['aria-controls'],publicDialog.props.id);assert.equal(publicDialog.props['aria-labelledby'],'site-menu-title');
mobileToggle.props.onClick();assert.equal(menuOpened,1);
const mobileNav=publicDialog.props.children.find(child=>child?.type==='nav');
for(const href of ['#servicios','#experiencia','/trabaja-con-nosotros'])assert.ok(mobileNav.props.children.some(child=>child?.props?.href===href));
mobileNav.props.children.find(child=>child?.type==='button').props.onClick();assert.equal(driverOpened,1);assert.equal(menuClosed,1);
publicDialog.props.onClose();assert.equal(toggleFocused,1);
// Both language choices are available in server-rendered output.
const selector=renderToStaticMarkup(React.createElement(LanguageProvider,{initialLocale:'en'},React.createElement(LanguageSwitcher)));
assert.ok(selector.includes('Español'));assert.ok(selector.includes('English'));

// Exercise the real selector/preference callbacks with isolated React and DOM doubles.
let currentContext,storedLanguage='es';
const mockReact={...React,useState:initial=>[initial,next=>{storedLanguage=next;}],useCallback:callback=>callback,useEffect(){},useMemo:callback=>callback(),useContext:()=>currentContext};
const languageModule={exports:{}};
const languageCode=ts.transpileModule(readFileSync(path.join(root,'app/language.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
new Function('require','exports','module',languageCode)(name=>name==='react'?mockReact:name==='@/lib/i18n'?{asLocale,translate}:require(name),languageModule.exports,languageModule);
const previousDocument=globalThis.document,previousLocation=globalThis.location;
try{
 globalThis.document={cookie:''};globalThis.location={protocol:'https:'};
 const provider=languageModule.exports.LanguageProvider({initialLocale:'es',children:null});currentContext=provider.props.value;
 const chooser=languageModule.exports.LanguageSwitcher().props.children.find(child=>child?.type==='select');
 chooser.props.onChange({target:{value:'en'}});assert.equal(storedLanguage,'en');assert.match(document.cookie,/fm_language=en; Path=\/; Max-Age=31536000; SameSite=Lax; Secure/);
 chooser.props.onChange({target:{value:'es'}});assert.equal(storedLanguage,'es');assert.match(document.cookie,/fm_language=es/);
}finally{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;}
// The public chat selects the configured response in the visitor's language.
const settings={address:'Dirección original',address_en:'English address',security:'Política original',security_en:'English security terms'};
const apiModule={exports:{}};
const apiCode=ts.transpileModule(readFileSync(path.join(root,'app/api/chat/route.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const access={sameOrigin:()=>true,fail:(error,status=400)=>Response.json({error},{status}),db:()=>({prepare:()=>({bind:key=>({first:async()=>settings[key]?{value:settings[key]}:null})})})};
new Function('require','exports','module',apiCode)(name=>name==='@/lib/access'?access:name==='@/lib/i18n'?{asLocale,requestLocale,translate}:name==='@/lib/replies'?{reply}:name==='@/lib/api-input'?source(path.join(root,'lib/api-input.ts')):require(name),apiModule.exports,apiModule);
async function chat(message,locale){return (await (await apiModule.exports.POST(new Request('https://freight.test/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,locale})}))).json()).message;}
assert.equal(await chat('Location','en'),'English address');assert.equal(await chat('Ubicación','es'),'Dirección original');assert.equal(await chat('Security','en'),'English security terms');
delete settings.security_en;assert.match(await chat('Security','en'),/original text/);assert.match(await chat('Security','en'),/Política original/);
console.log('PASS: bilingual pages and replies, six uploads, untranslated operational data, locale fallback, preference callback/cookie, localized company settings, selector state and scroll-only video.');
