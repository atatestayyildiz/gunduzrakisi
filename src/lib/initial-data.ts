import { BookArticle, CategoryItem } from "./types";

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "all", name: "Tüm Kitaplar" },
  { id: "ankara", name: "Ankara & Bozkır" },
  { id: "edebiyat-ve-toplum", name: "Edebiyat & Toplum" },
  { id: "denemeler", name: "İnce Şeyler & Deneme" },
  { id: "gundelik-hayat", name: "Gündelik Hayat & İroni" },
];

export const INITIAL_ARTICLES: BookArticle[] = [
  {
    id: "eylulun-ankara-hali",
    slug: "eylulun-ankara-hali",
    title: '"Eylül"ün Ankara Hali',
    category: "ankara",
    date: "17 Eylül 2026",
    readTimeMinutes: 5,
    sips: 3,
    coverColor: "#9D2127", // Rich wine red like reference
    textColor: "var(--ds-gray-1000)",
    variant: "stripe",
    textured: true,
    heightRatio: 1.0,
    order: 0,
    musicTitle: "Balıkesir",
    musicArtist: "Birsen Tezer",
    musicUrl: "https://open.spotify.com/track/12345",
    excerpt: "Ankara–bozkır–Eylül güzellemesi sevmeyenler hemen çarpıya basıp kapatabilir. Bu yazı bir Ankara sonbaharı güzellemesidir...",
    content: `Ankara–bozkır–Eylül güzellemesi sevmeyenler hemen çarpıya basıp kapatabilir. Bu yazı bir Ankara sonbaharı güzellemesidir.

Öyle “Ankara zaten çok güzel bir şehir” diye başlayan, Kızılay'ın ortasında durup şehrin güzelliklerinden bahsedenlerden değilim. Ankara'nın pek de güzel olmadığına dair elinizde yeterince delil olabilir. Altyapısı deseniz, on dakika süren kuvvetli bir yağmurda evleri su basabilir, kaldırımlarda yürümek mümkün olmayabilir; hava durumu biraz ciddileşmeye görsün, Ankara'nın bütün eksikleri bir anda önümüze serilebilir…

İstanbul gibi denizi yoktur (ayy klişeeeee, ama tüm klişeler gibi doğru), Boğaz'ı yoktur, Galata'sı yoktur, Kız Kulesi'ni kıyıdan seyredemezsiniz. Doğal güzelliklerimiz de öyle aman aman değildir. Ama bugün bunları konuşmayalım. Bugün biraz çirkinlikleri görmeyelim. Bugün Ankara'nın Eylülüne bakalım.

Ankara bozkırdır. Bunu bilerek sevmek gerekir Ankara’yı. Çünkü bozkır, ilk bakışta insana güzellikten çok yoksunluğu hatırlatır. Deniz yoktur ya; ufka baktığınızda mavinin içine doğru kayıp gidemezsiniz. Dağlar hemen önünüzde yükselmez, ağaçlar şehrin üstüne gölge gibi kapanmaz. Büyük manzaralarla kendini kolayca sevdiren şehirlerden değildir Ankara. Biraz mahcup, biraz suskun durur karşınızda. Sarı otların, kurumuş toprağın, uzak tepelerin ve insanın başını kaldırdığında neredeyse sonsuza kadar uzanan o geniş ve pembe gökyüzünün içinde, kendisini anlatmak için acele etmeden bekler.

Belki de bozkırın güzelliği tam burada başlar. Yokluğun içinden kendine bir güzellik çıkarır. Güneş altında sararan otlarda, akşamüstü toprağın üzerine çöken o solgun ışıkta, uzakta birbirine değmeden duran tepelerde, rüzgârın kurumuş otların arasında çıkardığı seste... Başka şehirlerde güzellik insanın karşısına çıkar; Ankara'da ise biraz saklanır. Onu görmek için bakmak yetmez, alışmak ve sevmek gerekir.

Sonra bir gün, hiçbir şey değişmemişken, aynı bozkıra bir başka gözle bakarsınız. Sarının içinde kahverengiyi, kahverenginin içinde yeşili, hepsinin üzerinde o uçsuz bucaksız Ankara göğünü görürsünüz. Ve anlarsınız ki bozkır yoksunluk değildir; kendine ait bir güzelliği olan, sessiz bir coğrafyadır.

Eylül gelince Ankara'nın bu sessizliği daha da belirginleşir. Yazın sertliği kırılır, bozkırın rengi ağır ağır değişir. Sarı biraz koyulaşır, yeşil son bir kez kendini gösterir, akşamın laciverti erkenden çöker şehrin üzerine. Ankara'nın o kendine mahsus, biraz hüzünlü, biraz mesafeli güzelliği tam da o zaman çıkar ortaya. Belki kartpostallık manzaraları yoktur ama uzaklara bakınca insanın içine işleyen bir boşluğu vardır.

Ankara'nın manzarası biraz da insanın kendi içidir. İnsan bu şehri gördüğü için değil, içinde yaşadığı için sever. Bir yerden sonra caddelerin, parkların, sokakların kendisi değil, onların içinde biriken hayat önem kazanmaya başlar. Tunalı'dan kaç kere geçtiğinizi, Kuğulu'da kaç kere oturduğunuzu, Seğmenler'de kaç akşam sohbet ettiğinizi hatırlamazsınız; ama bir gün, yıllar sonra, aynı yerden geçerken bir insanın yüzü gelir aklınıza. O zaman anlarsınız: Ankara dediğimiz şey biraz da hatırladıklarımızdan ibarettir.

Hava bugün on beş derece. Hafif bir yağmur yağıyor. Ankara Ankara kokuyor.

Bunun nasıl bir koku olduğunu anlatmak zor. Islak toprak diyebilirsiniz, bozkır diyebilirsiniz, yağmurdan sonra serinleyen asfalt diyebilirsiniz ama yetmez. Biraz eski bir kitap gibi, biraz Birsen Tezer’in sesi gibi, biraz akşamüstü gibi; biraz da yıllardır burada yaşayan insanların üzerine sinmiş bir şey gibi, “kıdemli bir atkı” gibi mesela…

Saat yediden sonra hava birden değişiyor. Gündüzün sıcaklığı çekiliyor, gökyüzünün rengi ağırlaşıyor, insanlar ceketlerini almaya başlıyor. Yazın o gevşekliği gidiyor. Cinnah’ta ağır ağır yürürken bunu hissediyorsun. Çok değil geçen hafta terleten hava gitmiş, yerine insanın omzuna hafifçe dokunan tanıdık bir serinlik gelmiş.

Sonbaharda yanındaki insanla konuşmanın, susmanın, yürüyüşün bile başka bir anlamı oluyor sanki. Belki bu yüzden Eylül biraz arkadaşlık, biraz yarenlik... Birlikte yürümek. Yağmur başlayınca saçma sapan bir yere sığınıp yağmurun geçmesini beklemek. Bir kafede oturup dışarıdaki insanları seyretmek. Bir kitabı bahane edip yıllar sonra Dost Kitabevi'ne girmek. Bir kahvecide saatlerce oturup insanları seyretmek. Saatin kaç olduğunu unutmak. Sonra hava iyice serinleyince “Hadi kalkalım” deyip kalkamamak.

En çok eylülde hatırlar insan, Ankara’da.

İnsan bir şehri bazen güzel olduğu için değil, orada kendisinden bir şeyler kaldığı için sever. İlk arkadaşlıklar oradadır, ilk aşklar, ilk ayrılıklar, ilk yalnızlıklar, ilk kitaplar, ilk tiyatrolar, ilk sloganlar, ilk yumruklar, ilk büyük hayal kırıklıkları... Bir şehrin kaldırımlarında kendi geçmişiniz dolaşıyorsa, artık o kaldırımların güzel olup olmadığının pek bir önemi kalmaz. İşte Ankara'nın en büyük güzelliği de budur: insan burada kendi geçmişine rastlar.

Bir sokak başında, bir parkta, bir kitapçıda… Bazen de hiç beklemediği bir Eylül akşamında.

O yüzden bu eylül Ankara'yı biraz affedelim. Yağmur yağınca su basan sokaklarını, yürünmeyen kaldırımlarını, bitmeyen inşaatlarını, her sabah başka bir yerinden kazılmış yollarını bugünlük unutalım. Kuğulu'da yaprakların üzerine basalım, Seğmenler'de biraz oturalım. Tunalı'dan yürüyelim, Vadi’nin renklerini izleyelim.

Yeni çıkan bir romanı alalım, vizyona giren filmleri konuşalım, eski arkadaşları arayalım. Sevgilinin elini biraz daha sıkı tutalım. Saat yediden sonra hava serinleyince ceketimizi giyelim. Bozkırın rengine bakalım, göğe bakalım!

Bir yerlerden Cemal Süreya geçer belki, bir yerlerden Attila İlhan göz kırpar. Bir şarkı çalar, bir arkadaşın sesi gelir, eski bir yüz düşer aklına. Sonra fark edersin, Eylül çoktan Ankara'ya yerleşmiştir.

Hava serindir. Bozkır suskundur. Ankara Ankara kokuyordur.`
  },
  {
    id: "ince-seylerin-yalnizligi",
    slug: "ince-seylerin-yalnizligi",
    title: "İnce Şeylerin Yalnızlığı",
    category: "denemeler",
    date: "11 Eylül 2026",
    readTimeMinutes: 6,
    sips: 4,
    coverColor: "#1e3a5f", // Mülkiye blue
    textColor: "#ffffff",
    variant: "simple",
    textured: true,
    heightRatio: 1.0,
    order: 1,
    musicTitle: "Ayrılık Masalı",
    musicArtist: "Doğan Canku",
    excerpt: "“Ah, kimselerin vakti yok durup ince şeyleri anlamaya.” Gülten Akın’ın yıllar önce yazdığı bu dize zihnimde dolaşıyor...",
    content: `“Ah, kimselerin vakti yok durup ince şeyleri anlamaya.”

Gülten Akın’ın yıllar önce yazdığı bu dize, son zamanlarda zihnimde gereğinden fazla dolaşıyor. Çünkü galiba artık yalnızca ince şeyleri anlamaya değil, birbirimizi anlamaya da vaktimiz yok. Daha kötüsü, bazen buna ihtiyacımız olduğunu bile düşünmüyoruz.

Kabalık sıradan bir davranış biçimi olmaktan çıkıp neredeyse gündelik hayatın dili haline geliyor. Birbirinin önüne geçmekte sakınca görmeyenler, trafikte karşısındakini bir rakip gibi görenler, ortak bir alanda yalnızca kendi rahatını düşünenler, bir başkasının rahatsız olup olmadığını düşünmeye bile gerek duymayanlar, çoğaltmak mümkün…

Bunların her biri tek başına önemsiz bir hadise gibi görünebilir; fakat milyonlarca küçük davranış aynı yönde birikmeye başladığında, ortaya yalnızca kaba insanların oluşturduğu bir kalabalık değil, insanın birbirine karşı duyarlılığını kaybettiği bir toplumsal iklim çıkıyor; en vahimi de bu olmalı.

İncelik dediğin şey "büyük laflardan" oluşmuyor. Bir kapıyı arkandan gelen insan için açık tutmakta, sırada bekleyen kişinin hakkını gözetmekte, yaşlı bir insanın yavaşlığından rahatsız olmamakta, otobüste yanındaki insanın alanına taşmamaya çalışmakta, bir arkadaşının anlattığı şeyi gerçekten dinlemekte, karşındaki insanın da senin kadar yorulabileceğini, üzülebileceğini, telaşlanabileceğini hesaba katmakta saklı. Bütün bunların ortak bir tarafı var tabii: İnsan, kendi varlığının yanına bir başkasının varlığını koyuyor ve “Ben ne istiyorum?” sorusundan önce “Karşımdaki ne hisseder?” diye düşünmeye başlıyor. Belki de inceliğin en basit tanımı budur sevgili okur; kendi hayatının merkezinden birkaç santim olsun çekilip başka bir insanın varlığına yer açabilmek.

Bugün tam da bunu giderek daha az yapıyoruz. Herkesin hakkını kendisinin öncelediği, herkesin kendi konforunu savunduğu, kendi zamanını başkasının zamanından daha değerli gördüğü, kendi öfkesini haklı, karşısındakinin öfkesini gereksiz bulduğu bir hayatın içinde yaşıyoruz. Bunun yalnızca "insanların bozulmasıyla” açıklanamayacağını düşünüyorum. İçinde yaşadığımız düzenin de bunda payı var. Çünkü kapitalizm yalnızca emeğimizi ve zamanımızı satın alan bir ekonomik sistem değil; gündelik hayatın içine de kendi rekabet mantığını taşıyan bir düzen değil mi? Daha hızlı ol, daha çok kazan, daha öne geç, daha görünür ol, daha fazla tüket ve kendini kurtar… Böyle bir dünyanın insanlara sürekli olarak “önce sen” demesinde şaşılacak bir şey yok. Başkasını düşünme eylemi, bazen bu düzenin içinde neredeyse bir lüks haline geliyor. Oysa insanı insan yapan şeylerden biri de “başkasını düşünme” yeteneği değil mi?

Burada "yalnızlıktan" söz ederken de alışılmış yalnızlık hikayelerinden biraz farklı bir şeyden bahsediyorum. Kalabalıklar içinde yalnız kalmak, telefonlarımızdan başımızı kaldıramamak, arkadaşlarımızın azalması ya da bir pazar akşamı evde tek başına oturmak değil kastettiğim. Daha tuhaf, daha derin bir yalnızlık bu. Etrafında insanlar olduğu halde, onların davranış biçimiyle kendi davranış biçimin arasında giderek büyüyen bir mesafe hissetmek…

Kabalığın normal, duyarsızlığın makul, bencilliğin doğal kabul edildiği bir ortamda hâlâ başkasını düşünmeye çalışıyorsan, bir süre sonra kendini ister istemez yalnız hissediyorsun. Çünkü sen bir şeyin yanlış olduğunu görüyorsun ama etrafındaki insanların önemli bir kısmı bunun yanlış olduğunu bile düşünmüyor. Sen bir sözün kırıcı olabileceğini hesaplıyorsun, karşındaki o sözü neden söylememesi gerektiğini anlamıyor. Sen birinin hakkına girmemeye çalışıyorsun, başkası senin hakkını yemeyi gayet doğal buluyor. Bir süre sonra insan yalnızlığının sebebini kendi içinde aramaya başlıyor: “Acaba ben mi fazla hassasım?” diye soruyor. Belki de değilsin. Belki yalnızca etrafındaki dünyanın kabalaşmasına karşı bir itirazın vardır. Olamaz mı!

Ve galiba insanı en çok yoran da bu. Çünkü ince olmak, giderek savunmasız olmak gibi hissettiriyor. Kaba olanın işi daha kolay; istediğini söylüyor, istediğini yapıyor, başkasının ne düşüneceğini hesaba katmıyor ve yoluna devam ediyor. İnce insan ise sürekli düşünüyor. “Bunu söylersem karşındaki üzülür mü?”, “Şimdi bunu yaparsam başkasının hakkına girmiş olur muyum?”, “Ben rahat ederken bir başkasını rahatsız ediyor muyum?” diye kendi kendine soruyor. Bu soruların çoğaldığı yerde insan yoruluyor. Çünkü sürekli kendini frenlemek, başkalarını hesaba katmak ve aynı özeni karşılığında görememek gerçekten yorucu şey sevgili okur. Bir süre sonra insan “ Ulan ben de biraz onlar gibi olsam hayat daha kolay olmaz mı?” diye düşünüyor. İşte tam o noktada ince insanların birbirine ihtiyacı başlıyor.

Çünkü belki de çözüm daha kaba bir dünyaya ayak uydurmak değil, birbirimizi bulmak. Sayımız gerçekten azalıyor. Birbirimizin inceliğini fark etmek, onu aptallık ya da saflık olarak görmemek, tam tersine kıymetli bir şey olduğunu hatırlamak. Bazen bir insana “Bu hareketin çok inceydi.” demek bile önemli değil mi? Çünkü incelik görünmez oldukça kayboluyor. İnsan, yaptığı güzel şeyin dünyada hiçbir karşılığı olmadığını düşündüğünde bir süre sonra vazgeçiyor. Oysa bir başkasının nezaketi, başka bir insanın nezaketini mümkün kılıyor. Hem dayanışma da biraz böyle başlamıyor mu? Önce birbirimizin varlığını fark ederek, sonra birbirimizin yükünü biraz olsun hafifleterek...

Belki bu yüzden incelik yalnızca kişisel bir erdem değildir; aynı zamanda küçük bir dayanışma biçimidir; olamaz mı? Başkasını düşünmek, onun hayatının da en az kendi hayatımız kadar gerçek olduğunu kabul etmektir. Sistemin bize sürekli rekabet etmeyi, öne geçmeyi ve kendi çıkarımızı maksimize etmeyi öğrettiği bir dünyada, başkasının iyiliğini kendi çıkarımızın önüne koyabilmek başlı başına bir direnme biçimine dönüşebilir. Büyük sloganlara gerek yok. Birinin hakkını gözetmek, birinin yükünü taşımaya yardım etmek, birinin sözünü kesmeden dinlemek, bir insanın kötü gününde yanında durmak… Başta sosyalizm olmak üzere, dünyayı değiştirme iddiasında olan bütün büyük fikirlerin nihayetinde ulaşması gereken yer biraz da burası değil midir? İnsanların birbirine yeniden "insan gibi" davranabildiği bir hayat.

Ben galiba en çok bundan dolayı yalnız hissediyorum.

İnsanların arasında değil, insanların birbirine davranma biçimi karşısında yalnız hissediyorum. Çünkü kaba olmak kolaylaşıyor, bencil olmak normalleşiyor, vurdumduymazlık güç göstergesi gibi algılanıyor ve incelik giderek istisna haline geliyor. Ben yine de ince kalmak istiyorum. Bunun aptallık olduğunu düşünmüyorum, dünyaya yenilmek olduğunu da düşünmüyorum. İnsanın bütün bu kabalığa rağmen, başka bir insanın varlığını önemsemekte ısrar etmesi, elimizde kalan en değerli şeylerden biri değil mi?

Çok uzattım, yine başa, Gülten Akın’ın o dizesine dönüyorum: “Ah, kimselerin vakti yok durup ince şeyleri anlamaya.”

Belki gerçekten vakit yok. Belki herkes çok yorgun, herkes çok telaşlı, herkes kendi hayatının derdinde. Dünya tek kutuplu belki, reel bir alternatif yok deniyor. Kazandığımız paralar günü kurtarmaya kılı kılına yetiyor, her geçen gün fakirleşiyoruz; kitap almak, konsere gitmek, gülmek lüks geliyor. Ama yine de bu kabalık çemberine bir dur dememiz gerekmiyor mu?

Tüm bu hale rağmen, birilerinin birbirinin yüzüne bakması, gülümsemesi; birbirini duyması, bir başkasının hayatına kendi hayatı kadar değer vermesi gerekmiyor mu?

İncelik kaybolduğunda yalnızlık derinleşiyor sevgili okur.

Mülkiye'de okurken, bir hocamla birbirimize sıkça söylediğimiz bir cümle ile bitsin bu yazı:

"Tutunamayanlar birbirine tutunsun."

Bulalım birbirimizi.`
  },
  {
    id: "aycicekleri-koyunlar-kaybedenler",
    slug: "aycicekleri-koyunlar-ve-kaybedenler-kulubu",
    title: "Ayçiçekleri, Koyunlar ve Kaybedenler Kulübü",
    category: "edebiyat-ve-toplum",
    date: "28 Ağustos 2026",
    readTimeMinutes: 4,
    sips: 3,
    coverColor: "#FED954", // Yellow like reference
    textColor: "var(--ds-gray-1000)",
    variant: "stripe",
    textured: true,
    heightRatio: 1.0,
    order: 2,
    musicTitle: "Kaybedenler",
    musicArtist: "Kaan Çaydamlı & Mete Avunduk",
    excerpt: "Güneşe boynunu büken ayçiçeklerinin tarladaki sessizliği ile gecenin bir yarısı radyodan süzülen yalnız sesler arasında tuhaf bir akrabalık var...",
    content: `Güneşe boynunu büken ayçiçeklerinin tarladaki o ağırbaşlı sessizliği ile gecenin bir yarısı radyodan süzülen yalnız sesler arasında tuhaf bir akrabalık var.

Bir dönemin Kadıköy sokaklarında, gecenin kör vaktinde sigara dumanına karışan o "Kaybedenler Kulübü" monologlarını hatırlarsınız. Hiçbir yere yetişmeye çalışmayan, kazanmanın kibriyle kirlenmemiş, kendi halinde yenilmiş insanların sığınağıydı o mikrofon.

Bugün etrafımıza baktığımızda herkes bir şeylerin galibi olmaya çalışıyor. Başarı hikayeleri, bitmeyen self-marketing, LinkedIn aydınlanmaları... Oysa bozkırın ortasında başını öne eğmiş bir ayçiçeği kadar sahici kaç insan kaldı aramızda?

Yenilmek, bazen insanın kendine dürüst kalabilmesinin tek yoludur. Kaybetmeyi göze alamayan bir ruh, incelik inşa edemez. Bir kadeh rakıyı masaya koyup 'iyi ki kaybettik be abi' diyebilmek, hayatın bütün sahteliğine çekilmiş en zarif resttir.`
  },
  {
    id: "organik-koy-kahvaltisi",
    slug: "organik-koy-kahvalti-mi-yeni-parti-ilkeleri-mi",
    title: "Organik Köy Kahvaltısı mı, Yeni Parti İlkeleri mi?",
    category: "gundelik-hayat",
    date: "22 Temmuz 2026",
    readTimeMinutes: 4,
    sips: 2,
    coverColor: "#2d6a4f", // Olive forest green
    textColor: "#ffffff",
    variant: "simple",
    textured: true,
    heightRatio: 1.0,
    order: 3,
    excerpt: "Pazar sabahları şehrin orta sınıfını esir alan 'serpme köy kahvaltısı' çılgınlığı ile siyasetin yeni 'kapsayıcı' parti programları arasındaki akıllara zarar paralellik...",
    content: `Pazar sabahları şehrin orta sınıfını esir alan o meşhur "serpme organik köy kahvaltısı" çılgınlığı ile siyasetimizin yeni ve "tüm kesimleri kucaklayan" parti programları arasında akıllara zarar bir paralellik var sevgili okur.

Masaya öyle tabaklar geliyor ki, ne yediğinizi anlamıyorsunuz. Bir yanda nutellalı pişi, öte yanda keçi boynuzu reçeli; köşede Erzincan tulumu, yanında kivi dilimleri... Hiçbirinin birbiriyle tutarlı bir ilişkisi yok, ama menüye baksanız "doğal ve halk tipi".

Yeni kurulan partilerimizin ilkeler bildirgeleri de tastamam böyle bir serpme kahvaltı sofrası gibi. Biraz liberalizm serpiştirilmiş, araya iki dilim sosyal adalet sıkıştırılmış, kenara milli duygular garnitür yapılmış. Herkesi memnun etmeye çalışırken ortaya çıkan o garip tatsızlık...

Oysa sade bir çay, iki dilim beyaz peynir ve bir parça taze ekmek kafi değil miydi? Düşüncede de sofrada da samimiyeti kaybettiğimiz an, her şeyi bir gösteriş sarmalına feda ediyoruz.`
  },
  {
    id: "kardan-adamdan-kardan-bireye",
    slug: "kardan-adamdan-kardan-bireye",
    title: "Kardan Adamdan Kardan Bireye: Toplumculuğu Unutmanın Hali",
    category: "edebiyat-ve-toplum",
    date: "17 Temmuz 2026",
    readTimeMinutes: 5,
    sips: 3,
    coverColor: "#7DC1C1", // Teal like reference
    textColor: "var(--ds-gray-1000)",
    variant: "stripe",
    textured: true,
    heightRatio: 1.0,
    order: 4,
    excerpt: "Eskiden mahalle çocukları hep beraber toplanıp ortaklaşa bir kardan adam yapardı. Şimdi herkes kendi balkonunda kendi minyatür heykeline filtre seçiyor...",
    content: `Eskiden kar yağdığında mahallede kimse evinde tek başına oturamazdı. Çocuklar eldivenleri sırılsıklam olana kadar sokakta yuvarlanır, avuçlarındaki karları birleştirip o koca kardan adamı imece usulü dikerlerdi. Burnuna komşudan alınan havuç, boynuna dedenin eski kaşkolu takılırdı. Kardan adam, mahallenin ortak eseriydi.

Şimdi ise kardan bireyler çağındayız. Herkes kendi küçük kalesinde, kendi yalnızlığının heykelini yontuyor. Toplumsal olan her şey, kolektif her neşe, yerini bireysel bir tüketim ritüeline bıraktı. 

Kardan adam erirdi belki, ama geride bıraktığı dostluklar ve o çocukluk kahkahaları erimezdi. Şimdi ise heykellerimiz erimiyor ama içimizdeki ortak yaşama sevinci çoktan eriyip gitti. Birbirimize tutunmayı unuttuğumuz o gün, kardan adamlarımız da bizi terk etti.`
  },
  {
    id: "dunya-kupasindan-dunya-duzenine",
    slug: "dunya-kupasindan-dunya-duzenine",
    title: "Dünya Kupası'ndan Dünya Düzenine",
    category: "gundelik-hayat",
    date: "05 Temmuz 2026",
    readTimeMinutes: 4,
    sips: 3,
    coverColor: "#831843", // Velvet burgundy
    textColor: "#ffffff",
    variant: "simple",
    textured: true,
    heightRatio: 1.0,
    order: 5,
    excerpt: "Futbolun o eski çamurlu sahalarından, petro-dolarların yönettiği devasa klimalı stadyumlara uzanan o hazin yolculuk...",
    content: `Futbolun o eski çamurlu sahalarından, pazar akşamları radyodan dinlenen maç spikeri heyecanından, petro-dolarların ve algoritmaların yönettiği devasa klimalı stadyumlara uzanan yolculuk, aslında küresel dünyanın son 40 yıllık özeti gibidir.

Bir zamanlar yoksulların tutkusu, zenginlerin ise seyirci kaldığı o oyun, şimdi tam tersine döndü. Bilet fiyatları asgari ücreti aşan, taraftarın müşteriye, futbolcunun birer finansal varlığa dönüştüğü bir arena...

Yine de bazen bir sokak arasında, iki taşın arasına yuvarlanan patlak bir top gördüğümüzde içimiz cız eder. Çünkü biliriz ki, oyunun ruhu hala o çocukların çıplak ayaklarında yaşıyor; plazaların VIP localarında değil.`
  },
  {
    id: "devrim-ama-vegan",
    slug: "devrim-ama-vegan-isyan-ama-glutensiz",
    title: "Devrim... Ama vegan / İsyan... Ama glutensiz",
    category: "gundelik-hayat",
    date: "01 Temmuz 2026",
    readTimeMinutes: 4,
    sips: 2,
    coverColor: "#b45309", // Warm Amber
    textColor: "var(--ds-gray-1000)",
    variant: "stripe",
    textured: true,
    heightRatio: 1.0,
    order: 6,
    excerpt: "Radikal fikirlerin tüketim kültürünün vitrin süsüne dönüştüğü, protestonun bile estetik bir konsept olarak pazarlandığı günlerimiz üzerine...",
    content: `Radikal fikirlerin ve asırlık itirazların, tüketim kültürünün vitrin süsüne dönüştüğü günlerde yaşıyoruz sevgili okur. İsyan etmek bile artık belirli bir bütçe ve yaşam tarzı sertifikasyonu gerektiriyor sanki.

Eğer isyan edecekseniz, bunu sürdürülebilir keten gömleklerle, organik yulaf sütlü latte eşliğinde ve mutlaka fotomodellik pozları vererek yapmalısınız! Çelişki tam da burada başlıyor: Düzeni dönüştürme iddiasındaki her talep, düzenin pazarlama departmanı tarafından anında paketlenip yeni bir lifestyle ürünü olarak bize geri satılıyor.

Devrim dediğin şey bir etiketten ibaret olamaz. O, insanın yanındaki insana samimiyetle elini uzatmasında, çıkar hesabı yapmadan paylaşabilmesinde ve hayatın sahteliğine karşı sahici bir direnç gösterebilmesinde saklıdır.`
  }
];
