import fs from 'node:fs';import assert from 'node:assert/strict';
import {answerQuestion,localDate} from './dist/assistant-core.js';
const d=JSON.parse(fs.readFileSync('examples/demo/school-data.json')),now=new Date('2030-01-07T12:00:00Z'),before=JSON.stringify(d);
assert.equal(localDate(new Date('2030-01-07T22:00:00Z')),'2030-01-08');
const a=answerQuestion(d,'Teslim durumum ne?',{now});assert.match(a.items[0].text,/grup durumu bilinmiyor/);assert.equal(a.items[0].dateOnly,true);assert.equal(a.items[0].verifiedAt,null);
assert.match(answerQuestion(d,'Not ortalamam kaç?',{now}).title,/doğrulayamıyorum/);
answerQuestion(d,'Bugün ne yapayım?',{now,completed:{'demo-task-1':true}});assert.equal(JSON.stringify(d),before);
const empty=JSON.parse(fs.readFileSync('examples/empty/school-data.json'));assert.equal(answerQuestion(empty,'Duyurular',{now}).items.length,0);console.log('assistant passed');
