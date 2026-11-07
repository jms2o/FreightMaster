import {ENGLISH} from './translations.ts';
export type Locale='es'|'en';
export function asLocale(value:unknown):Locale{return value==='en'?'en':'es';}
export function requestLocale(request:Request):Locale{
 const language=request.headers.get('x-fm-language');
 if(language)return asLocale(language);
 return asLocale(request.headers.get('cookie')?.match(/(?:^|;\s*)fm_language=(es|en)(?:;|$)/)?.[1]);
}
const templates=Object.entries(ENGLISH).filter(([key])=>/\{\d+\}/.test(key)).map(([key,value])=>({value,pattern:new RegExp('^'+key.split(/\{\d+\}/).map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('(.*?)')+'$')}));
export function translate(text:string,locale:Locale,values?:readonly (string|number)[]):string{
 const fill=(value:string)=>value.replace(/\{(\d+)\}/g,(match,index)=>String(values?.[Number(index)]??match));
 if(locale==='es')return fill(text);
 const key=text.replace(/\s+/g,' ').trim();
 if(Object.hasOwn(ENGLISH,key)){const translated=fill(ENGLISH[key]);return (text.startsWith(' ')?' ':'')+translated+(text.endsWith(' ')?' ':'');}
 for(const {pattern,value} of templates){const match=key.match(pattern);if(match)return value.replace(/\{(\d+)\}/g,(_,index)=>match[Number(index)+1]??'');}
 return fill(text);
}
