import assert from 'node:assert/strict';
import {FORMAT,parseImport,mergeRecords,totals} from './dist/attendance-core.js';
import {absenceOverview} from './dist/panel-core.js';
const r={courseId:'DEMO101',date:'2030-01-07',status:'half'};
assert.deepEqual(parseImport({format:FORMAT,version:1,records:[r]},['DEMO101'],'2030-01-08'),[r]);
for(const records of [[r,r],[{...r,date:'2030-02-30'}],[{...r,status:'fake'}],[{...r,courseId:'NO'}]])assert.throws(()=>parseImport({format:FORMAT,version:1,records},['DEMO101'],'2030-01-08'));
assert.throws(()=>parseImport({format:FORMAT,version:1,records:[r]},['DEMO101'],'2030-01-01'));
assert.equal(mergeRecords([r],[{...r,status:'absent'}])[0].status,'half');assert.equal(mergeRecords([r],[{...r,status:'absent'}],true)[0].status,'absent');
const s=absenceOverview([{id:'DEMO101',userAbsenceLimit:2}],[r],[{courseId:'DEMO101',date:'2030-01-01'}],'2030-01-08')[0];assert.equal(s.used,.5);assert.equal(s.remaining,1.5);assert.equal(s.absent,0);assert.equal(totals([]).absent,0);console.log('attendance passed');
