# Kepler Student Template

Kepler'in özelleştirilebilir Türkçe okul paneli: ders klasörleri, ödevler, duyurular, haftalık program, kişisel yoklama, tamamlandı işaretleri ve kayıtlı veriye dayalı yerel soru konsolu. Hiçbir gerçek öğrencinin verisi veya eğitim içeriği içermez. Kaynak repo private olsa bile kişisel veriler Git'e girmez.

## Codex'e verilecek kısa başlangıç

> AGENTS.md ve README'yi oku. Kepler'i benim için boş kur; adımı, temamı ve güncel dönemimi sor. Kendi izinlerimle Ninova oturumumu salt okunur kullanarak derslerimi ve güncel kayıtları keşfet. Takvim, indirme ve gerçek otomasyon kabiliyetlerini doğrula; gereken izinleri al, desteklenmeyeni açıkça bildir. Özel verilerimi Git'e koyma.

## Yerel kurulum (Node 22+)

```sh
npm run doctor
npm run setup
npm run build
npm start
```

`http://127.0.0.1:8765` adresini aç. Sunucuyu Ctrl+C ile durdur. npm paketi indirmek gerekmez; çalışma zamanı yalnız Node standart kütüphanesidir. Önce denemek istersen yeni, boş klonda `npm run setup -- --demo` kullan. Demo tarihlerinin tümü sentetiktir; doğrulanmış veya güncel dönem sayılmaz.

`private/profile.json`: displayName, theme (`lavender`, `ocean`, `forest`), semester başlangıç/bitiş, courses içindeki userAbsenceLimit ve plannedSessions. Limit null ise bilinmiyor; yarım katılım 0,5 oturumdur. Tarihli programı sadece doğrulanmış dönem/istisnalarla doldur; bu şablon kendiliğinden takvim üretmez. Saat dilimi şu anda Europe/Istanbul ile sınırlıdır.

`private/school-data.json`: dersler, program, ödevler, duyurular ve kapsam/zamanlar. `examples/demo/` alanları gösterir. `private/assignment-inventory.json` bağımsız liste sayımı, `private/class-files.json` bağımsız dosya envanteridir. İlgili kapsamı kontrol etmeden zamanını ilerletme. Ad/tema/veri değiştirdikten sonra build'i yeniden çalıştır; program veya limit değiştiyse sunucuyu yeniden başlat.

Yoklama `private/attendance.json` içinde yerel diskte saklanır. Aynı bilgisayarda yeniden başlatınca korunur; cihazlar arası bulut eşitleme yoktur. Tamamlandı işaretleri kurulum kimliğiyle yalnız tarayıcı localStorage alanındadır; tarayıcı verisi silinirse kaybolur. Kişisel tamamlanma Ninova yüklemesini değiştirmez. İçe aktarma önce önizleme/çakışma seçimi sunar, son işlem geri alınabilir. Yoklama sayfasından JSON yedeği alınabilir; yedeği repo dışında özel tut.

## Sıfırlama

Sunucuyu durdur. `node reset.mjs --confirm-local-reset` özel dosyaları `.local/backup-<zaman>` altında koruyup boş profil ve yeni tamamlanma kimliği oluşturur. Ardından build ve start. Eski tamamlanma anahtarları tarayıcıda kalır, yeni profil onları kullanmaz. Yedeğin gerçekten gereksiz olduğuna karar vermeden elle silme. Setup mevcut private dizinini asla ezmez.

## Ninova / takvim / otomasyon

AGENTS.md uygulanabilir ajan akışıdır; otomatik çalışan entegrasyon değildir. Kullanıcı kendi hesabıyla giriş yapar ve kendi izinlerini verir. Ajan önce oturumda salt okunur ders keşfini doğrular. Ödev yüklemesi, teslim ve sınıftan ayrılma yasaktır. Bireysel yükleme sayısı ve grubun teslim durumu ayrı tutulur. Başarısız kontrol eski son-başarılı zamanını korur.

Düzenli kontrol ancak gerçek zamanlayıcı aracı + onaylı saat/sıklık + özel verilere erişebilen çalışma ortamı varsa kurulabilir; ilk çalışma ve sonraki zaman doğrulanır. Bildirim tekrarları ve tamamlanmış işler bastırılır. Takvim için hedef ve yazma onayı gerekir; mevcut kayıt sorgusu ve özel event-ID eşlemesi yeniden eklemeyi engeller. Sınıf dosyaları kullanıcının repo dışı özel dizinine indirilir; push edilmez. Şifre/cookie/token bu projede saklanmaz.

## Gizlilik ve testler

```sh
npm test
npm run privacy
node privacy-scan.mjs --staged
node privacy-scan.mjs --commit
```

`private/`, `.local/`, `build/`, belgeler, görseller, loglar, ortam dosyaları ve bağımlılıklar ignore edilir. `build/` özel JSON içerir: GitHub Pages'e veya statik hosta yükleme. Tarama içerik kalıpları, dosya allowlist'i, staged blob'ları ve commit ağacını denetler; insan incelemesinin yerini tutmaz. Her kişisel kurulumun örnek dosyalarını değiştirmeden private altında tutulması gerekir. Push öncesi `git diff --cached` incele.

Yerel testler: boş/sentetik kurulum, üzerine yazmayı reddetme, ad/tema, reset kimliği, veri doğrulama, tüm JS sözdizimi, build, assistant, attendance, calendar, panel, course/progress, tracking, API kalıcılığı/temizleme/çakışma, origin engeli. UI testi isteğe bağlı Playwright ve Chrome gerektirir (`PLAYWRIGHT_MODULE` ve `CHROME_PATH` ile yerel kurulumu seç, `node test-ui.mjs`). Browser testleri ağ erişimini yalnız loopback'e sınırlar.

Denenmeyen harici yetenekler: gerçek arkadaş Ninova hesabı, takvim yazma, zamanlanmış çalışma, gerçek dosya indirme, bulut ve cihazlar arası eşitleme. PDF gömme paketi dağıtılmaz; kaynak bağlantısı kullanılır. Soru konsolu LLM değildir, yalnız mevcut kayıtlardan kurallı özet üretir. Sunucu kimlik doğrulamalı internet servisi değildir; yalnız loopback'e bağlanır, paylaşma/tünelleme. Sites/D1 kimliği veya hazır deploy bağlantısı yoktur. Hosting istenirse ayrı güvenlik/hesap kurulumu ve açık onay gerekir.

Yerel doğrulama kaydı: Node 24 ile boş ve demo senaryoları geçti. İzole Chrome testinde 8 sayfa × 3 genişlik (1440/390/320), taşma ve JavaScript hatası denetimi, tamamlanmanın yenileme sonrası korunması ve yoklama yarım kaydının yenileme sonrası okunması geçti. Bu sonuçlar gerçek Ninova veya bulut entegrasyonu testi değildir.
