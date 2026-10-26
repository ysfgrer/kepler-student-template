import fs from 'node:fs';
console.log('Node:',process.version,Number(process.versions.node.split('.')[0])>=22?'OK':'Node 22+ gerekli');
for(const file of ['private/profile.json','private/school-data.json'])console.log(file,fs.existsSync(file)?'var':'npm run setup gerekli');
console.log('Ninova: Ajan kendi araçlarıyla oturumda salt okunur ders listesini gerçekten açmalı. Bu komut oturum doğrulamaz.');
console.log('Takvim: Hedef takvim listeleme yeteneği ve kullanıcı onayı gerekir.');
console.log('Otomasyon: Gerçek zamanlayıcı aracı, onaylı sıklık, kalıcı çalışma ortamı ve ilk başarılı çalışma gerekir.');
console.log('Dosyalar: Yetkili indirme aracı ve repo dışı özel hedef gerekir.');
