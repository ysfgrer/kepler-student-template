import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {setup} from './setup.mjs';import {build} from './build.mjs';import {start} from './server.mjs';import {validate} from './validate.mjs';
for(const n of ['test-attendance.mjs','test-calendar.mjs','test-assistant.mjs','test-panel.mjs','test-courses.mjs','test-tracking.mjs'])execFileSync(process.execPath,[n],{stdio:'inherit'});
for(const n of fs.readdirSync('dist').filter(n=>n.endsWith('.js')))execFileSync(process.execPath,['--check','dist/'+n]);
for(const mode of ['empty','demo']){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'kepler-test-'));let server;
 try{setup(root,mode);assert.throws(()=>setup(root,mode));const p=JSON.parse(fs.readFileSync(root+'/private/profile.json'));p.displayName='Test <öğrenci>';p.theme='forest';p.courses=[{id:'DEMO101',name:'Sentetik',userAbsenceLimit:2}];fs.writeFileSync(root+'/private/profile.json',JSON.stringify(p));validate(root+'/private');build(root);
 assert.equal(JSON.parse(fs.readFileSync(root+'/build/profile.json')).theme,'forest');assert.equal(JSON.parse(fs.readFileSync(root+'/build/school-data.json')).owner,p.displayName);
 server=start(root,0);await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/private/profile.json')).status,404);assert.equal((await fetch(base+'/profile.json',{headers:{Origin:'https://example.invalid'}})).status,403);
 const put=(v,origin=base)=>fetch(base+'/api/attendance',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(v)});
 const initial=await fetch(base+'/api/attendance').then(r=>r.json());assert.equal(initial.records.length,0);
 const v={revision:0,records:[{courseId:'DEMO101',date:'2020-01-01',status:'half'}]};assert.equal((await put(v,'https://example.invalid')).status,403);assert.equal((await put(v)).status,200);assert.equal((await put(v)).status,409);
 assert.equal((await fetch(base+'/api/attendance').then(r=>r.json())).records[0].status,'half');assert.equal((await put({revision:1,records:[]})).status,200);
 fs.renameSync(root+'/private',root+'/backup');setup(root);assert.notEqual(JSON.parse(fs.readFileSync(root+'/private/profile.json')).storageId,p.storageId);assert.equal(JSON.parse(fs.readFileSync(root+'/private/school-data.json')).courses.length,0);
 }finally{if(server)await new Promise(r=>server.close(r));fs.rmSync(root,{recursive:true,force:true});}
}
console.log('PASS: empty/demo onboarding, customization, safe setup/reset, validation, build, JS, local API persistence, origin protection, conflicts and clear');
