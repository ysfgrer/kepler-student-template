import fs from 'node:fs';
import {validDate} from './dist/attendance-core.js';
export function validate(root='private'){
 const read=n=>JSON.parse(fs.readFileSync(root+'/'+n+'.json'));
 const d=read('school-data'),p=read('profile'),a=read('assignment-inventory'),f=read('class-files');
 const ensure=(v,m)=>{if(!v)throw Error(m)};
 ensure(d.schemaVersion===1&&d.timezone==='Europe/Istanbul','Şema/zaman dilimi desteklenmiyor');
 for(const key of ['courses','tasks','announcements','futureMilestones','history','scheduleNotes'])ensure(Array.isArray(d[key]),key);
 ensure(typeof p.displayName==='string'&&p.displayName.length<=80,'Ad');ensure(['lavender','ocean','forest'].includes(p.theme),'Tema');
 ensure(validDate(p.semester.start)&&validDate(p.semester.end)&&p.semester.start<=p.semester.end,'Dönem');
 ensure(Array.isArray(p.courses)&&Array.isArray(p.plannedSessions),'Program');
 const ids=new Set(d.courses.map(c=>c.id));ensure(ids.size===d.courses.length,'Yinelenen ders');
 for(const c of [...d.courses,...p.courses])ensure(/^[A-Z0-9_-]{1,30}$/.test(c.id),'Ders ID');
 for(const c of p.courses)ensure(c.userAbsenceLimit==null||Number.isFinite(c.userAbsenceLimit)&&c.userAbsenceLimit>=0,'Kişisel limit');
 for(const t of d.tasks){ensure(ids.has(t.courseId),'Görev dersi');ensure(validDate(t.date)||t.dueAt&&Number.isFinite(Date.parse(t.dueAt)),'Görev tarihi');ensure(t.dueAt==null||/[+-]\d{2}:\d{2}$|Z$/.test(t.dueAt),'Saat dilimi');}
 for(const s of p.plannedSessions)ensure(p.courses.some(c=>c.id===s.courseId)&&validDate(s.date)&&s.date>=p.semester.start&&s.date<=p.semester.end,'Oturum');
 for(const list of [d.tasks,d.announcements])ensure(new Set(list.map(x=>x.id)).size===list.length,'Yinelenen kayıt');
 const walk=v=>{if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(/url$/i.test(k)&&x!=null){const u=new URL(x);ensure(u.protocol==='https:'&&!u.username&&!u.password,'Güvensiz URL');}if(/verifiedAt|checkedAt/i.test(k)&&x!=null)ensure(Number.isFinite(Date.parse(x)),'Kontrol zamanı');if(typeof x==='object')walk(x);}};
 walk(d);walk(a);walk(f);ensure(d.lastVerifiedAt===null||Number.isFinite(Date.parse(d.lastVerifiedAt)),'Son kontrol');
 ensure(Array.isArray(a.records)&&f.courses&&typeof f.courses==='object','Envanter');return {d,p,a,f};
}
if(process.argv[1]===new URL(import.meta.url).pathname){validate(process.argv[2]||'private');console.log('Data validation passed');}
