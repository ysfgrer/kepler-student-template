// Clock geometry only. Unknown ends stay null; card size is a visual minimum, never a duration claim.
export const HOUR_HEIGHT=112;
export function clockMinutes(value){const m=/^(\d{2}):(\d{2})$/.exec(value||'');if(!m)return null;const h=Number(m[1]),n=Number(m[2]);return h<24&&n<60?h*60+n:null;}
export function sessionClock(value){const parts=(value||'').split(/[–—-]/).map(s=>s.trim()),start=clockMinutes(parts[0]),parsedEnd=parts.length===2?clockMinutes(parts[1]):null;return {start,end:start!==null&&parsedEnd!==null&&parsedEnd>start?parsedEnd:null};}
export const clockLabel=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
export function calendarLayout(sessions){
 const parsed=sessions.map(s=>({...s,...sessionClock(s.time)})),timed=parsed.filter(s=>s.start!==null),unknown=parsed.filter(s=>s.start===null);
 const startMinute=Math.min(8*60,...timed.map(s=>Math.floor(s.start/60)*60));
 const endMinute=Math.max(18*60,...timed.map(s=>Math.ceil((s.end??Math.min(24*60,s.start+180))/60)*60));
 const days=new Map();
 for(const s of timed){const list=days.get(s.date)||[];list.push(s);days.set(s.date,list);}
 const blocks=[];
 for(const list of days.values()){
  list.sort((a,b)=>a.start-b.start||a.courseId.localeCompare(b.courseId));const lanes=[];
  for(const s of list){s.top=(s.start-startMinute)*HOUR_HEIGHT/60;s.height=s.end===null?260:(s.end-s.start)*HOUR_HEIGHT/60-5;const visualEnd=s.start+(s.end===null?260*60/HOUR_HEIGHT:s.end-s.start);let lane=lanes.findIndex(n=>n<=s.start);if(lane<0)lane=lanes.length;lanes[lane]=visualEnd;s.lane=lane;}
  for(const s of list)blocks.push({...s,lanes:lanes.length});
 }
 return {startMinute,endMinute,height:(endMinute-startMinute)*HOUR_HEIGHT/60,ticks:Array.from({length:(endMinute-startMinute)/60+1},(_,i)=>startMinute+i*60),blocks,unknown};
}
