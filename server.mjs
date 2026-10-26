import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {FORMAT,parseImport} from './dist/attendance-core.js';
export function start(root='.',port=8765){
 const profile=JSON.parse(fs.readFileSync(root+'/private/profile.json'));
 const file=root+'/private/attendance.json';
 const read=()=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{records:[],revision:0,updatedAt:null};
 const server=http.createServer(async(req,res)=>{
 const origin='http://127.0.0.1:'+server.address().port;
 const send=(code,value,type='application/json')=>{res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"});res.end(type==='application/json'?JSON.stringify(value):value);};
 if(req.headers.host!==new URL(origin).host)return send(403,{error:'Yerel host gerekli'});
 if(req.headers.origin&&req.headers.origin!==origin)return send(403,{error:'Kaynak reddedildi'});
 if(req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'Çapraz site reddedildi'});
 try{
 const url=new URL(req.url,origin);
 if(url.pathname==='/api/attendance'){
 const old=read();
 if(req.method==='GET')return send(200,{...profile,...old,format:FORMAT,version:1,migrationId:null});
 if(req.method!=='PUT')return send(405,{error:'Yöntem desteklenmiyor'});
 if(req.headers.origin!==origin||!req.headers['content-type']?.startsWith('application/json'))return send(403,{error:'Kaynak ve JSON gerekli'});
 let body='';for await(const chunk of req){body+=chunk;if(body.length>250000)return send(413,{error:'Çok büyük'});}
 const v=JSON.parse(body);if(v.revision!==read().revision)return send(409,{error:'Başka oturum değiştirdi; yenile.'});
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const records=parseImport({format:FORMAT,version:1,records:v.records},profile.courses.map(c=>c.id),today);
 const result={records,revision:v.revision+1,updatedAt:new Date().toISOString(),migrationId:null};
 fs.writeFileSync(file+'.tmp',JSON.stringify(result),{mode:0o600});fs.renameSync(file+'.tmp',file);return send(200,result);
 }
 if(!['GET','HEAD'].includes(req.method))return send(405,{error:'Yöntem desteklenmiyor'});
 const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
 if(!/^[a-zA-Z0-9-]+\.(html|js|css|json)$/.test(name))return send(404,{error:'Bulunamadı'});
 const filename=path.join(root,'build',name);if(!fs.existsSync(filename))return send(404,{error:'Bulunamadı'});
 const type={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8'}[name.split('.').pop()];
 return send(200,req.method==='HEAD'?'':fs.readFileSync(filename),type);
 }catch{return send(400,{error:'Veri okunamadı veya geçersiz. Mevcut kayıt korunur.'});}
 });server.listen(port,'127.0.0.1',()=>console.log('Kepler: http://127.0.0.1:'+server.address().port));return server;
}
if(process.argv[1]===new URL(import.meta.url).pathname)start();
