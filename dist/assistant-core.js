import {nextSteps} from './priority-core.js';
export const localDate=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
const norm=s=>s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
const date=t=>t.dueAt||t.date+'T12:00:00+03:00';
export const upcomingTasks=(d,now=new Date())=>d.tasks.filter(t=>t.dueAt?new Date(t.dueAt)>=now:t.date>=localDate(now)).sort((a,b)=>new Date(date(a))-new Date(date(b)));
export function answerQuestion(d,question,{now=new Date(),completed={}}={}){
 const q=norm(question),code=d.courses.find(c=>q.replace(/\s/g,'').includes(norm(c.id).replace(/\s/g,'')))?.id||null;
 const tasks=upcomingTasks(d,now).filter(t=>!code||t.courseId===code);
 const item=t=>({title:(t.courseId||t.courseLabel||'Dersi belirsiz')+' · '+t.title,text:nextSteps[t.id]||t.summary,date:t.dueAt||t.date,dateOnly:!t.dueAt,sourceUrl:t.sourceUrl,verifiedAt:t.verifiedAt,verification:t.verification,personalDone:!!completed[t.id]});
 const result=(title,text,items=[],extra={})=>({title,text,items,checkedAt:d.lastVerifiedAt,...extra});
 if(/yukle|gonder|teslim durum|teslim ett|teslimim/.test(q))return result('Teslimin ile hazırlığın ayrı şeyler.','Sayılar son kontrolde kendi hesabında görülen dosyalardır; güncel teslim sonucunu kaynağından doğrula.',tasks.filter(t=>t.kind==='assignment'&&t.submission).map(t=>({...item(t),text:`Kendi hesabında ${t.submission.ownUploaded}/${t.submission.expectedFiles} dosya. ${t.submission.scope==='group'?'Grup adına tek kişi yükler. Kendi 0 kaydın grubun teslim etmediğini göstermez; grup durumu bilinmiyor.':'Son kontrol sonrası yüklemeler burada görünmeyebilir.'}`})));
 if(/duyuru|haber|yeni|gezi/.test(q))return result('Duyuruların kısa özeti.','Yeni duyuru düzenli programdan önceliklidir. Bu liste kontrol anında aktarılan kayıtları içerir.',d.announcements.filter(a=>a.status!=='past_event'&&(!code||a.courseId===code)).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')).slice(0,4).map(a=>({title:a.courseId+' · '+a.title,text:a.body,sourceUrl:a.sourceUrl,locationUrl:a.locationUrl,verifiedAt:a.verifiedAt,verification:a.verification,date:a.eventAt})));
 if(/dosya|kaynak|dwg|pdf/.test(q)&&!/hazir|yap/.test(q))return result('Ders dosyaları ve kaynakları.','Aktarılan bağlantılar aşağıda. Eksik dosya listesi, dosya olmadığı anlamına gelmez.',d.courses.filter(c=>!code||c.id===code).map(c=>({title:c.id+' · '+(c.nameTr||c.name),text:c.files.length?c.files.map(f=>f.title).join(' · '):'Dosya listesi aktarılmadı.',sourceUrl:c.sourceUrl,verifiedAt:c.verifiedAt,links:c.files})));
 if(/yarin/.test(q)){
  const tomorrow=new Date(localDate(now)+'T12:00:00Z');tomorrow.setUTCDate(tomorrow.getUTCDate()+1);const day=tomorrow.toISOString().slice(0,10),weekday=((tomorrow.getUTCDay()+6)%7)+1;
  const events=d.announcements.filter(a=>a.eventAt?.slice(0,10)===day);
  const classes=d.courses.filter(c=>(!code||c.id===code)&&c.schedule?.some(s=>s[0]===weekday)).map(c=>{const e=events.find(a=>a.courseId===c.id),s=c.schedule.find(s=>s[0]===weekday);return {title:c.id+' · '+(c.nameTr||c.name),text:e?e.body:`Düzenli program: ${s[1]} · ${s[2]}. Güncel duyuruyu ayrıca kontrol et.`,sourceUrl:e?.sourceUrl||c.sourceUrl,locationUrl:e?.locationUrl,verifiedAt:e?.verifiedAt||c.scheduleCheckedAt};});
  return result('Yarın için görünüm.','Program 2 Ekim kaydından; tarihli duyurular önceliklidir. Yoklama ve teslim sonucu çıkarımı yapılmaz.',[...tasks.filter(t=>date(t).slice(0,10)===day).map(item),...classes]);
 }
 if(/yoklama|devamsiz/.test(q))return result('Yoklaman kendi kaydın.','Haftalık derslerde katılımını tam / yarım / katılmadım olarak düzeltebilirsin. Boş gün devamsızlık sayılmaz. Kişisel limitlerin resmi üniversite kuralı olarak doğrulanmadı.',[],{section:'#week',sectionLabel:'Haftalık dersleri aç'});
 if(/hafta|yaklas|takvim/.test(q)){
  const end=new Date(now.getTime()+7*864e5),events=d.announcements.filter(a=>a.eventAt&&new Date(a.eventAt)>=now&&new Date(a.eventAt)<=end&&(!code||a.courseId===code)).map(a=>({title:a.courseId+' · '+a.title,text:a.body,date:a.eventAt,sourceUrl:a.sourceUrl,locationUrl:a.locationUrl,verifiedAt:a.verifiedAt,verification:'verified'}));
  return result('Önümüzdeki 7 gün.','Resmi teslimler, kişisel hedefler ve etkinlikler ayrı etiketlerle. Saati bilinmeyen hedefler için saat uydurulmaz.',[...tasks.filter(t=>new Date(date(t))<=end).map(item),...events].sort((a,b)=>String(a.date).localeCompare(String(b.date))));
 }
 if(/bugun|ne yap|hazir|odak|basla|oncelik/.test(q)||code)return result(code?code+' için çalışma özeti.':'Önce en yakın işi netleştirelim.','Önerim: en yakın tarihli işten başla. Bu sıra kayıtlı tarihlere göre; adımlar birer hazırlık önerisidir.',tasks.filter(t=>!completed[t.id]).slice(0,code?4:3).map(item));
 return result('Bunu kayıtlarından doğrulayamıyorum.','Ders koduyla hazırlık, teslim, dosya, duyuru veya yarınki programı sorabilirsin. Not ve sınav sonucu için veri, serbest sohbet için bağlı bir model bulunmuyor.',[],{section:'#courses',sectionLabel:'Ders kaynaklarını aç'});
}
