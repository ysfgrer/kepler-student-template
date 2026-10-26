export const FORMAT='kepler-attendance';
export const STATUSES=['attended','half','absent','unknown'];
export const keyOf=r=>`${r.courseId}|${r.date}`;
export function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;}
export function totals(records){return records.reduce((a,r)=>{if(STATUSES.includes(r.status))a[r.status]++;return a},{attended:0,half:0,absent:0,unknown:0});}
export function parseImport(value,courseIds,today){
 if(!value||value.format!==FORMAT||value.version!==1||!Array.isArray(value.records))throw Error('Dosya biçimi tanınmadı. Örnek JSON şemasını kullan.');
 if(value.records.length>5000)throw Error('Tek aktarımda en fazla 5000 kayıt kullanılabilir.');
 const seen=new Set();
 return value.records.map((r,i)=>{
  if(!r||!courseIds.includes(r.courseId))throw Error(`${i+1}. kayıtta ders kodu tanınmadı.`);
  if(!validDate(r.date)||r.date>today)throw Error(`${i+1}. kayıtta tarih geçersiz veya gelecekte.`);
  if(!STATUSES.includes(r.status))throw Error(`${i+1}. kayıtta durum tanınmadı.`);
  const key=keyOf(r);if(seen.has(key))throw Error(`${i+1}. kayıtta aynı ders ve tarih yineleniyor.`);seen.add(key);
  return {courseId:r.courseId,date:r.date,status:r.status};
 });
}
export function mergeRecords(existing,incoming,replace=false){const map=new Map(existing.map(r=>[keyOf(r),{...r}]));for(const r of incoming)if(replace||!map.has(keyOf(r)))map.set(keyOf(r),{...r});return [...map.values()];}
