// Read-only tracking rules. No rewards, writes, local completion or academic-grade inference.
const day=v=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(v);
export function personalRisk(item,state='ready'){
 const unknown={tone:'unknown',icon:'?',label:state==='loading'?'Kayıt okunuyor':'Bilgi eksik',fraction:null,remaining:null};
 if(item&&['attended','half','absent'].every(k=>Number.isFinite(item[k]))&&item.attended+item.half+item.absent===0)return unknown;
 if(state!=='ready'||!item||!item.recordCount||!Number.isFinite(item.used)||item.used<0||!Number.isFinite(item.limit)||item.limit<0)return unknown;
 const remaining=item.limit-item.used,n=v=>v.toLocaleString('tr-TR'),fraction=item.limit===0?(item.used>0?1:0):Math.min(1,item.used/item.limit);
 if(remaining<0)return {tone:'critical',icon:'!',label:`Kişisel aşım ${n(-remaining)}`,fraction,remaining};
 if(item.used>0&&remaining<=1)return {tone:'critical',icon:'!',label:remaining===0?'Kişisel sınırda':`Kalan ${n(remaining)} oturum`,fraction,remaining};
 return {tone:item.used>0&&item.limit>0&&item.used/item.limit>=.5?'watch':'calm',icon:item.used?'◷':'✓',label:`Kalan ${n(remaining)} oturum`,fraction,remaining};
}
export function tierForScore(score){if(!Number.isFinite(score)||score<0||score>100)return null;return score===100?'AA':score>=90?'BA':score>=80?'BB':score>=70?'CB':score>=60?'CC':'DC';}
export function evaluateTracking({courseId,assignments=[],assignmentCoverage=false,records=[],sessions=[],sessionsCoverage=false,sourceAt=null,personalOnly=false,now=new Date(),staleAfterHours=24}){
 const today=day(now),reasons=new Set(),fresh=at=>!!at&&Number.isFinite(+new Date(at))&&new Date(at)<=now&&(now-new Date(at))/36e5<=staleAfterHours;
 if(!assignmentCoverage)reasons.add('assignment_coverage');if(!sessionsCoverage)reasons.add('session_coverage');if(!fresh(sourceAt))reasons.add('source_stale');if(personalOnly)reasons.add('personal_source');
 let sum=0,count=0;const assignmentIds=new Set();
 for(const a of assignments){
  if(!/^ninova-\d+$/.test(a.id||'')){reasons.add('assignment_identity');continue;}
  if(assignmentIds.has(a.id)){reasons.add('assignment_identity');continue;}assignmentIds.add(a.id);
  const date=a.dueAt||a.date;if(!date||!Number.isFinite(+new Date(date))){reasons.add('assignment_date');continue;}
  const mature=a.dueAt?new Date(a.dueAt).getTime()+36e5<now.getTime():a.date<today;if(!mature)continue;
  if(!fresh(a.verifiedAt)||a.dueAt&&new Date(a.verifiedAt)<new Date(a.dueAt)){reasons.add('assignment_stale');continue;}
  if(a.scope==='group'&&a.groupStatus==='verified_complete'&&a.participantVerified){sum++;count++;continue;}
  if(a.scope!=='individual'){reasons.add('group_unknown');continue;}
  if(!Number.isInteger(a.ownUploaded)||!Number.isInteger(a.expectedFiles)||a.expectedFiles<=0||a.ownUploaded<0||a.ownUploaded>a.expectedFiles){reasons.add('upload_unknown');continue;}
  sum+=a.ownUploaded===a.expectedFiles?1:a.ownUploaded>0?.5:0;count++;
 }
 if(sessions.some(s=>s.courseId===courseId&&s.date<today&&typeof s.held!=='boolean'))reasons.add('session_status');
 const eligible=sessions.filter(s=>s.courseId===courseId&&s.held===true&&s.date<=today&&(s.endAt?new Date(s.endAt)<=now:s.date<today)),seen=new Set();let attended=0,known=0;
 for(const session of eligible){const key=session.courseId+'|'+session.date;if(seen.has(key))continue;seen.add(key);const r=records.find(r=>r.courseId===courseId&&r.date===session.date);if(!r||!['attended','half','absent'].includes(r.status)){reasons.add('attendance_unknown');continue;}known++;attended+=r.status==='attended'?1:r.status==='half'?.5:0;}
 const H=count?100*sum/count:null,A=known?100*attended/known:null;
 if(reasons.size)return {status:'pending',tier:null,score:null,reasons:[...reasons],H,A,eligibleSessions:seen.size};
 if(known<2)return {status:'starting',tier:null,score:null,reasons:['starting'],H,A,eligibleSessions:seen.size};
 const score=H===null?A:.6*H+.4*A;return {status:'ready',tier:tierForScore(score),score,H,A,reasons:[],eligibleSessions:seen.size};
}
export function trackingCourses(schoolCourses=[],notebookCourses=[]){const map=new Map(schoolCourses.map(c=>[c.id,{...c,personalOnly:false}]));for(const c of notebookCourses)map.set(c.id,{...c,...map.get(c.id),personalOnly:!schoolCourses.some(x=>x.id===c.id)});return [...map.values()];}
