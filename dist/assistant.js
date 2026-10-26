import {keplerIcon} from './character.js';
import {upcomingMilestones} from './progress-core.js';
import {uiQuery,uiQueryAll} from './router.js';
import {nextSteps} from './priority-core.js';
import {answerQuestion,upcomingTasks} from './assistant-core.js';
const $=s=>uiQuery(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,dateOnly=false)=>!v?'Henüz doğrulanmadı':new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'short',...(!dateOnly?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(v.length===10?v+'T12:00:00+03:00':v));
const link=(url,text)=>url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`:'';
export function initAssistant(data,getCompleted){
 const now=new Date(),hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',hourCycle:'h23'}).format(now));
 $('#greeting').innerHTML=`${hour<6?'İyi geceler':hour<12?'Günaydın':hour<18?'İyi günler':'İyi akşamlar'}, <span>${esc(window.keplerProfile?.displayName||'Öğrenci')}.</span>`;
 const next=upcomingTasks(data).find(t=>t.kind==='assignment'),urgent=upcomingTasks(data).filter(t=>t.kind==='assignment'&&new Date(t.dueAt)-now<=7*864e5).length;
 $('#focusTicket').innerHTML='<div class="focus-ticket-meta"><span>KENDİ ÇALIŞMA ALANIN</span></div>';
 $('#heroBrief').textContent='Önemli işlerin, ders dosyaların ve haftan. Her şey kendi sayfasında.';
 $('#heroAction').innerHTML='<a class="primary-action" href="#/courses">Ders klasörlerim <span>↗</span></a><a class="quiet-action" href="#/tasks">Ödevlerime bak →</a>';
 const stale=v=>!v||(Date.now()-new Date(v))/36e5>data.staleAfterHours;
 $('#heroEvidence').textContent=`Ninova kontrolü ${fmt(data.lastVerifiedAt)} · ${stale(data.lastVerifiedAt)?'Eski kontrol; yeniden doğrulama gerekli':'Kaynaklı veri kopyası'} · İstanbul`;
 $('#statusStrip').innerHTML=`<div><strong>${String(data.courses.length).padStart(2,'0')}</strong><span>Ninova dersi</span></div><div><strong>${String(urgent).padStart(2,'0')}</strong><span>7 günde teslim</span></div><div><strong>${upcomingMilestones(data,now,14).length}</strong><span>14 günde ders hedefi</span></div><div class="strip-status"><span class="private-dot"></span><span>${stale(data.lastVerifiedAt)?'Kontrol yenilenmeli':'Son kontrol kaydı hazır'}<small>Canlı bağlantı değil</small></span></div>`;
 function ask(question){
  const a=answerQuestion(data,question,{completed:getCompleted()});$('#assistantInput').value=question;
  $('#assistantAnswer').innerHTML=`<div class="answer-heading"><span class="answer-avatar" aria-hidden="true">${keplerIcon}</span><div><small>KEPLER / KAYIT ÖZETİ</small><h3>${esc(a.title)}</h3></div></div><p class="answer-intro">${esc(a.text)}</p><div class="answer-items">${a.items.map(i=>`<article class="answer-item"><div><span class="answer-kind">${i.verification==='personal'?'Kişisel hedef':i.verification==='unverified'?'Doğrulanmadı':stale(i.verifiedAt)?'Eski kontrol':'Kaynak kaydı'}${i.personalDone?' · Kendi planında hazır':''}</span>${i.date?`<span class="answer-date">${esc(fmt(i.date,i.dateOnly))}${i.dateOnly?' · saat belirsiz':''}</span>`:''}</div><h4>${esc(i.title)}</h4><p>${esc(i.text)}</p><div class="answer-links">${link(i.sourceUrl,'Kaynak')}${link(i.locationUrl,'Buluşma konumu')}${(i.links||[]).map(l=>link(l.url,l.title)).join('')}</div><small class="record-checked">${i.verifiedAt?'Kayıt kontrolü: '+esc(fmt(i.verifiedAt,i.verifiedAt.length===10)):'Ninova’da doğrulanmadı'}</small></article>`).join('')}</div>${a.section?`<a class="answer-section" href="${a.section}" data-open-panel="${a.section.slice(1)}">${esc(a.sectionLabel)} →</a>`:''}<div class="answer-footer">Son genel kontrol: ${esc(fmt(a.checkedAt))} İstanbul · Eksik kayıt, hiç iş olmadığı anlamına gelmez.</div>`;
 }
 $('#assistantForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#assistantInput').value.trim();if(q)ask(q)});
 uiQueryAll('[data-question]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
 uiQuery('[data-brief-focus]')?.addEventListener('click',()=>ask(next.courseId+' için ne hazırlamalıyım?'));
}
