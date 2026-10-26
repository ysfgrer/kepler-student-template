// Date-only arithmetic is independent of the browser's timezone and DST.
export function addDays(date,n){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function weekMonday(date){const day=new Date(date+'T12:00:00Z').getUTCDay();return addDays(date,-((day+6)%7));}
export function weekDays(start){return Array.from({length:7},(_,i)=>addDays(start,i));}
export function weekSessions(planned,start,notebookCourses,schoolCourses=[],announcements=[]){
 const dates=new Set(weekDays(start)),names=new Map(notebookCourses.map(c=>[c.id,c.name])),school=new Map(schoolCourses.map(c=>[c.id,c]));
 return planned.filter(s=>dates.has(s.date)&&names.has(s.courseId)).map(s=>{
  const c=school.get(s.courseId),weekday=((new Date(s.date+'T12:00:00Z').getUTCDay()+6)%7)+1;
  const schedule=c?.schedule?.find(x=>x[0]===weekday&&x[1].split('–')[0]===s.time);
  let time=schedule?.[1]||s.time||null,place=schedule?.[2]||null,note=null;
  // Exact dated exceptions from the already verified announcement snapshot.
  const event=announcements.find(a=>a.verification==='verified'&&a.courseId===s.courseId&&a.eventAt?.slice(0,10)===s.date);
  if(event){time=event.eventAt.slice(11,16);place=event.meetingPoint||place;note=event.title+' · Duyuru saati geçerli.';}
  return {courseId:s.courseId,date:s.date,time,place,note,sourceUrl:event?.sourceUrl||null,title:c?.nameTr&&!c.nameTr.includes('aktarılmadı')?c.nameTr:names.get(s.courseId),basis:c?'Kayıtlı ders programı':'Kişisel program · doğrulanmadı'};
 }).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99').localeCompare(b.time||'99')||a.courseId.localeCompare(b.courseId));
}