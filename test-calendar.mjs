import assert from 'node:assert/strict';
import {calendarLayout,sessionClock,clockMinutes} from './dist/calendar-core.js';
import {weekSessions,weekMonday,addDays} from './dist/weekly-core.js';
const courses=[{id:'DEMO101',name:'Sentetik',schedule:[[1,'09:00–10:00','Örnek oda']]}],planned=[{courseId:'DEMO101',date:'2030-01-07',time:'09:00'}];
const before=JSON.stringify(planned),sessions=weekSessions(planned,'2030-01-07',courses,courses,[]);assert.equal(calendarLayout(sessions).blocks[0].start,540);assert.equal(calendarLayout(sessions).blocks[0].end,600);
const event={courseId:'DEMO101',verification:'verified',eventAt:'2030-01-07T11:00:00+03:00',title:'Sentetik istisna',meetingPoint:'Örnek yer',sourceUrl:'https://example.invalid/event'};
assert.equal(weekSessions(planned,'2030-01-07',courses,courses,[event])[0].time,'11:00');assert.equal(JSON.stringify(planned),before);
assert.equal(calendarLayout([{date:'2030-01-07',time:null}]).unknown.length,1);assert.equal(sessionClock('09:00').end,null);assert.equal(clockMinutes('24:01'),null);
const overlap=calendarLayout([{date:'2030-01-07',time:'09:00–11:00'},{date:'2030-01-07',time:'10:00–12:00'}]);assert(overlap.blocks.every(s=>s.lanes===2));assert.equal(weekMonday('2030-01-01'),'2029-12-31');assert.equal(addDays('2029-12-31',7),'2030-01-07');console.log('calendar passed');
