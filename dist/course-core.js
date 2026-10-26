// Read-only course projections. Never derive attendance from school records.
export const courseTabs=['overview','files','announcements','assignments','syllabus'];
export const normalize=value=>String(value??'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
export function safeResourceUrl(value,origin='https://kepler.invalid'){
 try{const url=new URL(value,origin);if(url.username||url.password)return null;if(url.origin===origin&&url.pathname.startsWith('/')&&value?.startsWith('/'))return url.href;return url.protocol==='https:'&&['ninova.itu.edu.tr','drive.google.com'].includes(url.hostname)?url.href:null;}catch{return null;}
}
export function pdfCandidate(file,origin){if(file?.preview?.sourceUrl===file.url&&/^\/documents\/[A-Z0-9]+-syllabus\.pdf$/.test(file.preview.path)&&/^[a-f0-9]{64}$/.test(file.preview.sha256))return new URL(file.preview.path,origin).href;const url=safeResourceUrl(file?.url,origin);return url&&/\.pdf$/i.test(new URL(url).pathname)?url:null;}
export const isSyllabus=file=>/izlence|syllabus|course outline|ders plani|ders izlencesi/.test(normalize(file.title));
export function courseResources(data,course){
 const list=new Map();
 function add(file,context,verifiedAt){if(!file?.url)return;const existing=list.get(file.url);if(existing){if(!existing.contexts.includes(context))existing.contexts.push(context);return;}const inventory=data.classFiles?.courses?.[course.id],classEntry=inventory?.entries.find(e=>e.source_url===file.url),courseEntry=inventory?.courseEntries?.find(e=>e.source_url===file.url),entry=classEntry||courseEntry,section=courseEntry?'Ders Dosyaları':'Sınıf Dosyaları',preview=inventory?.preview?.sourceUrl===file.url?inventory.preview:null;list.set(file.url,{kind:entry?.kind||'source',folder:entry?.folder||null,preview,title:file.title||'Başlığı aktarılmamış kaynak',url:file.url,contexts:[entry?section+' · '+entry.folder:context],section:entry?section:'Ek kaynak',otherInstructor:inventory?.otherInstructorSyllabi?.includes(file.url)||false,verifiedAt:courseEntry?inventory.courseFilesCheckedAt:classEntry?data.classFiles.checkedAt:verifiedAt,syllabus:!!preview||isSyllabus(file)&&!inventory?.otherInstructorSyllabi?.includes(file.url)});}
 for(const file of course.files||[])add(file,'Ek kaynak bağlantısı',course.verifiedAt);
 for(const task of data.tasks||[])if(task.courseId===course.id)for(const file of task.resources||[])add(file,task.title,task.verifiedAt);
 for(const announcement of data.announcements||[])if(announcement.courseId===course.id&&announcement.resourceUrl)add({title:announcement.title,url:announcement.resourceUrl},'Duyuru kaynağı',announcement.verifiedAt);
 return [...list.values()];
}
export function attendanceSignal(item,state='loading'){
 if(state!=='ready')return {tone:'unknown',icon:'?',label:state==='loading'?'Yoklama okunuyor':'Yoklamaya erişilemiyor',text:'Kişisel kayıt okunmadan risk hesaplanmaz.'};
 if(!item||!item.recordCount)return {tone:'unknown',icon:'?',label:'Kayıt yetersiz',text:'Bu ders için kişisel yoklama kaydı yok. Boş günler devamsızlık sayılmaz.'};
 if(item.remaining===null)return {tone:'unknown',icon:'?',label:'Limit bilinmiyor',text:'Kayıtların var; kişisel devamsızlık limiti aktarılmamış.'};
 const n=v=>v.toLocaleString('tr-TR');
 const base=`Kayıtlı kullanılan ${n(item.used)} / kişisel limit ${n(item.limit)} oturum. ${item.unknown} belirsiz gün devamsız sayılmadı. Resmî yoklama sonucu değildir.`;
 if(item.remaining<0)return {tone:'critical',icon:'!',label:'Kişisel limit aşıldı',text:`Kişisel limitin ${n(-item.remaining)} oturum üzerinde. ${base}`};
 if(item.remaining<=1)return {tone:'critical',icon:'!',label:item.remaining===0?'Kişisel hak kalmadı':`Kişisel kalan ${n(item.remaining)} oturum`,text:base};
 return {tone:item.unknown?'unknown':'calm',icon:item.unknown?'?':'✓',label:`Kişisel kalan ${n(item.remaining)} oturum`,text:base+(item.unknown?' Belirsiz kayıtlar tamamlanınca sonuç değişebilir.':'')};
}
export function parseCourseRoute(hash,courses){
 const match=/^#(?:ders\/|\/courses\/)([^/]+)(?:\/([^/]+))?$/.exec(hash);if(!match)return null;
 let id;try{id=decodeURIComponent(match[1]);}catch{return {missing:true};}
 const course=courses.find(c=>c.id===id);if(!course)return {missing:true};
 return {course,tab:courseTabs.includes(match[2])?match[2]:'overview'};
}
export function courseMatches(data,course,query,filter,signal){
 const files=courseResources(data,course);const haystack=normalize([course.id,course.name,course.nameTr,...files.map(f=>f.title)].join(' '));
 return haystack.includes(normalize(query).trim())&&(filter==='all'||filter==='files'&&files.length>0||filter==='syllabus'&&files.some(f=>f.syllabus)||filter==='critical'&&signal.tone==='critical');
}
