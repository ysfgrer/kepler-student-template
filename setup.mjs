import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
export function setup(root='.',mode='empty'){
 if(!['empty','demo'].includes(mode))throw Error('Mode: empty veya demo');
 if(fs.existsSync(root+'/private'))throw Error('private zaten var. Korundu; reset kılavuzunu oku.');
 fs.mkdirSync(root+'/private',{recursive:true,mode:0o700});
 for(const n of ['profile','school-data','class-files','assignment-inventory'])fs.copyFileSync(new URL('./examples/'+mode+'/'+n+'.json',import.meta.url),root+'/private/'+n+'.json');
 const file=root+'/private/profile.json',p=JSON.parse(fs.readFileSync(file));p.storageId=randomUUID();fs.writeFileSync(file,JSON.stringify(p,null,2),{mode:0o600});
 console.log('Özel başlangıç hazır: '+mode);
}
if(process.argv[1]===new URL(import.meta.url).pathname)setup('.',process.argv.includes('--demo')?'demo':'empty');
