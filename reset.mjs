import fs from 'node:fs';
if(!process.argv.includes('--confirm-local-reset'))throw Error('Bu komut özel veriyi yedekleyip boş kuruluma döner. --confirm-local-reset gerekli');
const {setup}=await import('./setup.mjs');
if(fs.existsSync('private')){fs.mkdirSync('.local',{recursive:true,mode:0o700});fs.renameSync('private','.local/backup-'+Date.now());}
fs.rmSync('build',{recursive:true,force:true});setup();
console.log('Eski veriler .local/ altında korunur. Yeni storageId eski tamamlanma işaretlerini kullanmaz.');
