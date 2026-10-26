import {totals,keyOf} from './attendance-core.js';
import {weekDays} from './weekly-core.js';
export const weekdayDates=monday=>weekDays(monday).slice(0,5);
export function absenceOverview(courses,records,planned,today){
 return courses.map(c=>{const list=records.filter(r=>r.courseId===c.id),count=totals(list),keys=new Set(list.map(keyOf));const missing=(planned||[]).filter(s=>s.courseId===c.id&&s.date<today&&!keys.has(keyOf(s))).length;const used=count.absent+count.half*.5,limit=Number.isFinite(c.userAbsenceLimit)?c.userAbsenceLimit:null;return {courseId:c.id,name:c.name,recordCount:list.length,...count,unknown:count.unknown+missing,missing,used,limit,remaining:limit===null?null:limit-used};});
}
const day=v=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(v);
export function taskReminder(task,now=new Date()){
 const today=day(now),date=task.dueAt?day(new Date(task.dueAt)):task.date;
 if(task.dueAt&&new Date(task.dueAt)<now||!task.dueAt&&date<today)return {tone:'past',label:'Tarih geçti',detail:'Teslim sonucu bilinmiyor; kaynağı kontrol et.'};
 if(date===today)return {tone:'urgent',label:'Bugün',detail:task.dueAt?'Son tarih bugün. Dosyalarını ve yükleme durumunu kontrol et.':'Bugünkü hedef · kesin saat belirtilmedi.'};
 const days=Math.round((new Date(date+'T12:00:00Z')-new Date(today+'T12:00:00Z'))/864e5);
 return {tone:days<=3?'soon':'later',label:days===1?'Yarın':days+' gün kaldı',detail:task.dueAt?'Ninova son tarihi · İstanbul saati':'Kişisel hedef / dönüm noktası · kesin saat bilinmiyor'};
}
