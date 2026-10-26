import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const mode=process.argv.includes('--commit')?'commit':process.argv.includes('--staged')?'staged':'working';
const files=mode==='commit'?git('ls-tree','-r','--name-only','HEAD').split('\n'):mode==='staged'?git('diff','--cached','--name-only','--diff-filter=ACMR').split('\n'):git('ls-files','--cached','--others','--exclude-standard').split('\n');
const bad=[];
for(const file of files.filter(Boolean)){
 if(!/^(?:dist\/[\w-]+\.(?:js|css|html)|examples\/(?:empty|demo)\/[\w-]+\.json|[\w-]+\.mjs|README\.md|AGENTS\.md|package\.json|\.gitignore)$/.test(file)){bad.push(file+': unexpected file');continue;}
 const s=mode==='commit'?git('show','HEAD:'+file):mode==='staged'?git('show',':'+file):fs.readFileSync(file,'utf8');
 const rules=[/appg(?:prj|dep|ver)_\w+/i,/https:\/\/[^\s'"<>]*\.chatgpt\.site/i,/\/(?:Users|home)\/[^\s'"<>]+/,/https:\/\/ninova\.itu\.edu\.tr\/Sinif\/[\d.]+/i,/\b(?:PEM\d+E?|ATA\d+)\b/i,/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_\w+|sk-[A-Za-z0-9]{20,})\b/,new RegExp('-----BEGIN .*PRIVATE '+'KEY-----'),/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,new RegExp(['Em'+'re','Gü'+'rer','Gu'+'rer'].join('|'),'i')];
 if(rules.some(r=>r.test(s)))bad.push(file+': sensitive pattern '+rules.map((r,i)=>r.test(s)?i:null).filter(x=>x!==null));
 if(s.includes('\u0000'))bad.push(file+': binary');
}
if(bad.length){console.error(bad.join('\n'));process.exit(1);}console.log('Privacy '+mode+' PASS: '+files.filter(Boolean).length+' allowed text files');
