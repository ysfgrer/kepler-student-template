import fs from 'node:fs';
import {validate} from './validate.mjs';
export function build(root='.'){
 const {d,p,a,f}=validate(root+'/private');fs.rmSync(root+'/build',{recursive:true,force:true});fs.mkdirSync(root+'/build',{recursive:true,mode:0o700});
 for(const n of fs.readdirSync(new URL('./dist/',import.meta.url)))if(/\.(js|css|html)$/.test(n))fs.copyFileSync(new URL('./dist/'+n,import.meta.url),root+'/build/'+n);
 for(const [n,v] of Object.entries({'school-data':{...d,owner:p.displayName},'profile':{displayName:p.displayName,theme:p.theme,storageId:p.storageId},'class-files':f,'assignment-inventory':a}))fs.writeFileSync(root+'/build/'+n+'.json',JSON.stringify(v));
 console.log('Local build ready. build/ özel veri içerir; yayımlama.');
}
if(process.argv[1]===new URL(import.meta.url).pathname)build();
