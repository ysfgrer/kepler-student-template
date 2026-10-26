const day=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(value);
export function uploadState(record){
 const own=record.ownUploaded,expected=record.expectedFiles;
 if(!Number.isInteger(own)||!Number.isInteger(expected)||expected<=0||own<0||own>expected)return {category:'unknown',ownComplete:false,label:'Yükleme sayısı bilinmiyor'};
 const ownComplete=own===expected;
 if(record.scope==='group'||record.scope==='unknown')return {category:'group_unknown',ownComplete,label:record.scope==='group'?'Grup sonucu bilinmiyor':'Teslim kapsamı bilinmiyor'};
 if(ownComplete)return {category:'full',ownComplete:true,label:'Kendi dosya sayısı tam'};
 return own>0?{category:'partial',ownComplete:false,label:'Kısmi yükleme'}:{category:'none',ownComplete:false,label:'Kendi yüklemesi görünmüyor'};
}
export function progressCounts(records){
 const totals={total:records.length,ownComplete:0,full:0,partial:0,none:0,group_unknown:0,unknown:0};
 for(const record of records){const state=uploadState(record);totals[state.category]++;if(state.ownComplete)totals.ownComplete++;}
 return totals;
}
export const isPastPersonal=(task,now=new Date())=>task.kind==='personal'&&!!task.date&&task.date<day(now);
export function upcomingMilestones(data,now=new Date(),horizonDays=14){const today=day(now),end=day(new Date(+now+horizonDays*864e5));return data.tasks.filter(t=>t.kind==='milestone'&&t.verification==='verified'&&t.verifiedAt&&(t.date||t.dueAt?.slice(0,10))>=today&&(t.date||t.dueAt?.slice(0,10))<=end);}
export function taskPriority(task,now=new Date(),staleAfterHours=24){
 const submission=task.submission;
 if(submission&&uploadState({...submission}).ownComplete)return {tone:'complete',rank:0,label:'Kendi dosya sayısı tam',reason:'Son gözlenen yükleme sayısı tamam. Kabul / not / zamanında teslim sonucu bilinmiyor.'};
 if(isPastPersonal(task,now))return {tone:'personal_history',rank:0,label:'Geçmiş kişisel hedef',reason:'Eski hazırlık kaydı korunur; Ninova yüklemesi bu kişisel hedefi otomatik tamamlamaz.'};
 if(task.kind==='personal')return {tone:'personal',rank:1,label:'Kişisel hedef',reason:'Ninova son tesliminden ayrı kişisel hazırlık.'};
 if(!task.verifiedAt||(now-new Date(task.verifiedAt))/36e5>staleAfterHours)return {tone:'unknown',rank:1,label:'Kaynağı yeniden kontrol et',reason:'Eski veya eksik kontrol, kesin gecikme / başarısızlık kanıtı değildir.'};
 const date=task.dueAt||task.date&&task.date+'T23:59:59+03:00';
 if(!date)return {tone:'unknown',rank:1,label:'Tarih bilinmiyor',reason:'Güncel kesin tarih aktarılmadı.'};
 if(new Date(date)<now)return {tone:'review',rank:2,label:'Geçmiş tarih · sonuç kontrolü',reason:submission?.scope==='group'?'Grup teslimi ayrıca doğrulanmalı. Kendi sıfır kaydın grup başarısızlığı değildir.':'Tarih geçti; yükleme sayısı tek başına geç / başarısız teslim sonucunu göstermez.'};
 const hours=(new Date(date)-now)/36e5,days=Math.round((new Date(day(new Date(date))+'T12:00:00Z')-new Date(day(now)+'T12:00:00Z'))/864e5);
 if(hours<=24)return {tone:'red',rank:5,label:'Önce bunu ele al',reason:task.dueAt?'Son teslim 24 saat içinde. Dosya ve kaynak kontrolü öncelikli.':'Hedef gününe 24 saatten az kaldı; kesin saat belirtilmedi.'};
 if(days<=3)return {tone:'orange',rank:4,label:'Yakın hazırlık',reason:'Tarih üç gün içinde. Çalışmayı hazırlık adımlarına böl.'};
 if(days<=7)return {tone:'yellow',rank:3,label:'Bu hafta hazırlan',reason:'Tarih yedi gün içinde. Hazırlık için zaman ayır.'};
 return {tone:'calm',rank:1,label:'Takvimde',reason:'Yakın tarihli kritik görevden sonra planlayabilirsin.'};
}
export function coursePriority(data,courseId,{now=new Date(),completed={}}={}){
 const tasks=data.tasks.filter(t=>t.courseId===courseId&&!completed[t.id]).map(task=>({task,...taskPriority(task,now,data.staleAfterHours)})).filter(t=>t.tone!=='complete'&&t.tone!=='personal_history').sort((a,b)=>b.rank-a.rank||(a.task.dueAt||a.task.date||'').localeCompare(b.task.dueAt||b.task.date||''));
 return tasks[0]||{tone:'calm',rank:0,label:'Yakın iş görünmüyor',reason:'Yalnızca aktarılmış kayıtlar değerlendirildi. Eksik veri, iş olmadığı anlamına gelmez.',task:null};
}
