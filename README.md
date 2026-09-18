# Gündüz Rakısı (gunduzrakisi.blogspot.com Modern Sürümü)

> **moonworks.com.tr** tarafından yazar ve düşün insanı arkadaşımız **Mert Kip** için özel olarak tasarlanıp kodlanmış edebi blog hediyesi.

---

## 🏛️ Konsept ve Özellikler

### 1. Okuyucu Deneyimi (Büyük Meşe Kitaplık)
- **Meşe Kitaplık ve 5'li Raflar:** Tüm denemeler gerçek bir dev meşe kütüphanede yan yana duran kitaplar olarak modellenmiştir. Her rafta 5 kitap yer alır ve yeni yazılar eklendikçe otomatik yeni meşe raflar aşağıya doğru sıralanır.
- **Kırsal / Sıvalı Duvar Dokusu:** Sonsuz raf uzamasına uygun, dikişsiz, göz yormayan rustik sıva/duvar dokusu.
- **3D Kitap Etkileşimi:** Özel 3D CSS `Book` bileşeni ile kitaplar fareyle üzerine gelindiğinde raftan öne çıkar, tıklandığında yumuşak bir açılma animasyonu ile ekranı kaplayarak okuma moduna geçer.
- **"X Yudumda Okunur":** Kelime sayısına göre hesaplanan ikonik okuma süresi göstergesi (rakı kadehi ve damla ikonu eşliğinde).
- **Müzik Eşlikçisi:** Yazara özel parça ekleme (Birsen Tezer, Doğan Canku vb.) ve Spotify dinleme alanı.
- **Tipografi Öncelikli Okuma:** EB Garamond ve Plus Jakarta Sans ile kitap sayfası tadında rahat okuma alanı ve okuma ilerleme çubuğu.
- **Moonworks İmzası:** *"Arkadaşımız Mert Kip için moonworks.com.tr tarafından sevgiyle hazırlandı."*

---

### 2. Yazar Odası (`/yazar`)
- **Pastörel & Dingin Atmosfer:** Tüllerden süzülen sıcak ikindi güneşi huzmesi, huzme içinde süzülen mikro toz zerrecikleri ve nostaljik daktilo silüeti.
- **Akıllı Metin Temizleyici (WhatsApp & Word):** Word'den veya WhatsApp'tan kopyalanan yazılardaki tarih damgalarını (`[14:32, 17.09.2026] Mert: ...`), sistem mesajlarını ve Word stil artıklarını anında temizleyen otomatik arındırıcı.
- **Çekmece (Vintage Drawer Handle):** Ekranın sağ kenarındaki kulba tıklandığında açılan panel:
  - Canlı 3D Kitap Önizlemesi.
  - Cilt tipi (`stripe` / `simple`), renk paletleri (Bozkır Sarısı, Mülkiye Mavisi, Kadife Bordo vb.), özel renk seçici.
  - Kapak dokusu (`textured`), özel görsel URL'si ve organik kitap boyu slider'ı.
  - Kategori seçimi ve tek tıkla yeni kategori ekleme.
  - Müzik eşlikçisi tanımlama.
  - "Kitabı Rafa Yerleştir" butonu.
- **Sürükle-Bırak Raf Düzenleme (Shelf Organizer):**
  - **Raf Kilidi (Lock/Unlock):** Yazar kilidi açtığında kitapların sıralamasını sürükleyip bırakarak dilediği gibi değiştirebilir, kilidi kapattığında yeni düzen kaydedilir.

---

## 🚀 Başlangıç ve Çalıştırma

### Geliştirme Ortamı
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

### Vercel'e Dağıtım
Proje doğrudan Vercel'e deploy edilebilir. GitHub reponuzu Vercel'e bağlayıp `Deploy` butonuna basmanız yeterlidir.

### Firebase Firestore Bağlantısı (Opsiyonel)
Proje şu anda akıllı bir hibrit yapıya sahiptir. Firebase bilgileri girilmediğinde tarayıcı yerel belleğini (LocalStorage) ve başlangıç yazılarını kullanarak tam fonksiyonel çalışır.

Canlı Firestore'a bağlamak için `.env.example` dosyasını `.env.local` olarak kopyalayıp Firebase Console'dan alacağınız anahtarları girmeniz yeterlidir:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```
