// q — Rol Tanımları (Prototip 12 Rol)
// Belge Bölüm 7: Prototip Rol Seti
// Belge Bölüm 9: Gece Aksiyonları

// Grup ID'leri — UI renk eşlemesinde kullanılır
const GRUP = {
  OZGURLUKCU: 'ozgurlukcu',
  TARAFSIZ: 'tarafsiz',
  GELENEKCI: 'gelenekci',
  OUTSIDER: 'outsider',   // v1: Bastırmış (sahte Özgürlükçü oynar)
  KAOSCU: 'kaoscu'        // v1: 4 bireysel kazanma koşullu rol
};

// Tüm prototip rolleri — sırasıyla denge tablosuna göre seçileceğiz
const ROLLER = [
  // 🟢 ÖZGÜRLÜKÇÜLER (6 rol — havuzdan seçilecek)
  {
    id: 'gay',
    grup: GRUP.OZGURLUKCU,
    ad: 'Gay',
    karakter: 'Deniz',
    gorsel: '/karakterler/deniz.png',
    yas: 25,
    meslek: 'İK Uzmanı',
    motivasyon: 'Deniz beş yıl İK uzmanı olarak Çankaya\'da yüzlerce kişiyi işe aldı; her birine "hoş geldiniz, burada kendiniz olabilirsiniz" dedi — ama o cümleyi kimse içtenlikle ona söylemedi. Ankara\'nın "uygun çocuk" sessizliğinde kendi masasında kendi oryantasyonunu bekledi; bir bayram sofrasında teyzesi "utandırıyorsun bizi" deyince çatalı bıraktı. Köye, ömründe ilk kez karşılanan taraf olmak için geldi.',
    geceAksiyonu: 'Gece bir kişiyi ziyaret edersin. Özgürlükçüyse rolünü öğrenirsin, Tarafsızsa o gece aksiyonu iptal olur, Gelenekçiyse o Gelenekçinin gece aksiyonu tamamen iptal olur. Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'crossdresser',
    grup: GRUP.OZGURLUKCU,
    ad: 'Crossdresser',
    karakter: 'Umut',
    gorsel: '/karakterler/umut.png',
    yas: 34,
    meslek: 'Pilot',
    motivasyon: 'İstanbul\'da gizli yaşadığın bir parçanı bu köyde yaşamak istiyorsun.',
    geceAksiyonu: 'Gece kimin yerine geçeceğini seçersin — kör seçimdir. Kaan o gece seçtiğin kişiyi hedef alırsa sen ayrılırsın; seni hedef alırsa seçtiğin kişi ayrılır. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'drag_queen',
    grup: GRUP.OZGURLUKCU,
    ad: 'Drag Queen',
    karakter: 'Berke',
    gorsel: '/karakterler/berke.png',
    yas: 24,
    meslek: 'Senarist',
    motivasyon: 'Sahne arkasında değil ön safta var olmak istiyorsun.',
    geceAksiyonu: 'Gece bir kişiyi "sahneye çıkarırsın." Özgürlükçüyse ertesi gün oyu 2 sayılır. Tarafsızsa o oyuncuyu o gece kimlerin ziyaret ettiğini öğrenirsin. Gelenekçiyse ertesi gün oyu sayılmaz. Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'interseksuel',
    grup: GRUP.OZGURLUKCU,
    ad: 'İnterseksüel',
    karakter: 'Baran',
    gorsel: '/karakterler/baran.png',
    yas: 30,
    meslek: 'Biyolog',
    motivasyon: 'Senin gibi olanlara dair çok az şey biliniyor — burada görünür olabilirsin.',
    geceAksiyonu: 'Gece bir oyuncuyu izlersin — kimse fark etmez. O gecekinin kime aksiyon yaptığını öğrenirsin (hedefi görürsün, içeriği değil). Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'transseksuel',
    grup: GRUP.OZGURLUKCU,
    ad: 'Transseksüel',
    karakter: 'Devin',
    gorsel: '/karakterler/devin.png',
    yas: 28,
    meslek: 'Yazar',
    motivasyon: 'Devin Berlin\'de, Kreuzberg\'in iki dil arasında salınan sokaklarında doğdu; bir elinde hayatı, bir elinde yüz seksen yedi sayfalık prosedür dosyası, hep iki eşik arasında bir yazardı. Karakterlerine istediği adı, istediği bedeni verebildiği klavyenin başında o ağırlık yere inerdi. Bir yazarlık atölyesi için İstanbul\'a, oradan hiç tanımadığı dedesinin köyüne uğradı — ve üç hafta sonra geri dönmedi.',
    geceAksiyonu: 'Köyden ayrılan oyuncularla özel kanaldan iletişimde kalırsın. Onlar bilgi aktarabilir, sen de onlara. Bu kanal başka kimseye açık değildir.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'ladyboy',
    grup: GRUP.OZGURLUKCU,
    ad: 'Ladyboy',
    karakter: 'Lila',
    gorsel: '/karakterler/lila.png',
    yas: 21,
    meslek: 'Eczacı',
    motivasyon: 'Hayatın boyunca dikkat ettin, şimdi sen dikkat edenlerden olmak istiyorsun.',
    geceAksiyonu: 'Gece kim kimi ziyaret etti öğrenirsin — tüm gece hareketlerinin listesini alırsın. İçerik değil hareket görünür. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: 'boylar' // Femboy/Ladyboy → sadece biri
  },

  // 🟡 TARAFSIZLAR (3 rol)
  {
    id: 'hetero_erkek',
    grup: GRUP.TARAFSIZ,
    ad: 'Hetero Erkek',
    karakter: 'Mehmet',
    gorsel: '/karakterler/mehmet.png',
    yas: 35,
    meslek: 'Rock Müzisyeni',
    motivasyon: 'Mehmet on beş yıl Kadıköy\'ün bar sahnelerinde gitar çaldı; son turnede hangi şehirde, ne çaldığını hatırlamaz olmuştu — her kalabalık aynı yüz, her setlist bir öncekinin kopyasıydı. Albüm çıkmadı, prodüktör vazgeçti, kira ikiye katlandı. Bir cuma gecesi amfisini kapatıp köy ilanını gördü; müzik yapmaya değil, bir hafta susup dinlemeye geldi.',
    geceAksiyonu: 'Gece çay içmeye, sohbet etmeye gidersin. Özgürlükçüyse o oyuncuyu o gece kimlerin ziyaret ettiğini öğrenirsin. Tarafsızsa boş gece. Kaan\'a gidersen ertesi gece Kaan\'ın hedefini sen belirlersin. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Bireysel gizli koşulun var (prototipte: oyun sonuna kalmak).',
    tekil: 'heterolar'
  },
  {
    id: 'situationship',
    grup: GRUP.TARAFSIZ,
    ad: 'Situationship',
    karakter: 'Mert',
    gorsel: '/karakterler/mert.png',
    yas: 29,
    meslek: 'Fotoğrafçı',
    motivasyon: 'Tanımlamayı sevmiyorsun. Buradaki insanlar da pek tanımlanmak istemiyor gibi.',
    geceAksiyonu: 'Gece birine "yapışırsın" — ne aşk ne arkadaş. Özgürlükçü/Tarafsızsa ikinizin de gece aksiyonu iptal olur (karşılıklı koruma). Kaan\'a yapışırsan rolünü öğrenirsin ama Kaan\'ı engelleyemezsin. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Bireysel gizli koşulun var (prototipte: oyun sonuna kalmak).',
    tekil: null
  },
  {
    id: 'koca_kari',          // legacy id; v1.8.30'da ad 'Koca Karı' → 'Dul'
    grup: GRUP.TARAFSIZ,
    ad: 'Dul',                // v1.8.30 (Aşama 1.5 — hikaye uyumu)
    karakter: 'Fatma',
    gorsel: '/karakterler/fatma.png',
    yas: 48,
    meslek: 'Eski Ev Hanımı',
    motivasyon: 'Otuz yıl başkasının takvimini tuttun. Şimdi öğrenmek istediğin tek şey: bu köyde herkesin geçmişinde ne var?',
    geceAksiyonu: 'Gece bir oyuncudan geçmiş anısını sor. Hedefin karakterinden rastgele bir hatıra cümlesi sana gösterilir. Aynı hedefe tekrar gidemezsin.',
    kazanmaKosulu: '3 farklı oyuncudan geçmiş anısı toplamak.',
    tekil: null
  },

  // 🔴 GELENEKÇİLER (3 rol)
  {
    id: 'homofobik',
    grup: GRUP.GELENEKCI,
    ad: 'Homofobik',
    karakter: 'Kaan',
    gorsel: '/karakterler/kaan.png',
    yas: 45,
    meslek: 'Motosiklet Kurye',
    motivasyon: '"Bu insanlar köyümüzü bozdu." Burayı eskisi gibi yapmaya geldin.',
    geceAksiyonu: 'Ekonomik Abluka. Gece bir kişiyi ekonomik olarak izole edip köyden uzaklaştırırsın. Her gece 1 kişi. Savunma: Gay (engel), Drag Queen (koruma), Crossdresser (yerine geçme). Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: 'fobikler-homo',
    // v1.8.33: Kaan "grup içi favori" — gelenekci > 0 ise her oyunda en az 1 Kaan seçilir.
    // Ama master belge Bölüm 18'e göre gelenekci 0 olabilir (Kaan zorunluluğu kalktı).
    // Yani Kaan ZORUNLU değil, sadece grup VARSA FAVORİ.
    zorunlu: true
  },
  {
    id: 'muhafazakar',
    grup: GRUP.GELENEKCI,
    ad: 'Muhafazakâr',
    karakter: 'Necmi',
    gorsel: '/karakterler/necmi.png',
    yas: 52,
    meslek: 'Emekli Memur',
    motivasyon: 'Eski düzeni özlüyorsun. Konuşmaya, ikna etmeye geldin.',
    geceAksiyonu: 'Sosyal Manipülasyon. Gece birine yakınlık gösterirsin — ertesi gün oylamada o oyuncu senin oy verdiğin kişiye otomatik oy verir, fark etmez ve değiştiremez. Sen oy vermezsen o da kullanamaz. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'erkek_dusmani',
    grup: GRUP.GELENEKCI,
    ad: 'Erkek Düşmanı',
    karakter: 'Azra',
    gorsel: '/karakterler/azra.png',
    yas: 34,
    meslek: 'Ürün Yöneticisi',
    motivasyon: 'Azra yedi yıl boyunca toplantılarda fikrini söyledi; ama "harika fikir" övgüsü hep sesi daha gür, sandalyesi daha büyük bir erkeğe gitti — toplantı notlarına "Azra da evet dedi" diye geçti. Sesinin tavana çarpıp geri döndüğü, kimsenin kulağına değmediği yıllardı. Necmi\'nin forumunda "kendi düzenini kurmak isteyenler" cümlesini okuyunca izin yazıp dönmedi: burada düzeni kendi eliyle kuracak, ve bu kez sözünü kimse başkası adına tekrarlamayacak.',
    geceAksiyonu: 'Kimlik Tespiti. Oyun başında tüm oyuncuların doğuştan cinsiyetini öğrenirsin (rol kartından otomatik). Gece bir erkek oyuncuyu hedef alırsın — ertesi gün oyu sayılmaz. Gay engeli iptal eder. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },

  // ===========================================================================
  // V1 YENİ ROLLER (27 rol) — Faz 1 onaylanan tasarım
  // Kaynak: faz1-mekanik-kararlar.md + hikayeler-v1.md
  // Sıralama: Outsider → Özgürlükçü yeni → Tarafsız yeni → Gelenekçi yeni → Kaosçu
  // ===========================================================================

  // ⚪ OUTSIDER (1) — sahte Özgürlükçü kimliğiyle oynayan tek rol
  {
    id: 'bastirmis',
    grup: GRUP.OUTSIDER,
    ad: 'Bastırmış',
    karakter: 'Murat',
    gorsel: '/karakterler/murat.png',
    yas: 36,
    meslek: 'Avukat',
    motivasyon: 'Murat, otuz altı yıldır cübbenin altında başka bir adamı sakladı. İstanbul\'un trafiğinde, duruşma salonlarının kibirli ışığında hep "uygun" olanı söyledi. Köye geldiğinde valizinden önce kravatını çıkardı, sonra adını. Sabah çayını içerken pencereden bakıp ilk kez kendi nefesini duydu — ve bu sessizlik onu hem rahatlattı hem ürküttü.',
    geceAksiyonu: 'Oyun başında havuzdaki Özgürlükçülerden rastgele bir rol Murat\'a sahte kimlik olarak atanır; rol kartında o rolün arayüzüyle oynar. Gece bir oyuncu seçer, "görev başarılı" sahte cevabı alır ama gerçekte hiçbir şey olmaz (aksiyon boşa düşer). Murat Outsider olduğunu bilmez. Araştıran roller Murat\'ı incelediğinde sahte Özgürlükçü kimliği görünür. Ziyaret sayılır (Ladyboy listesinde gözükür).',
    kazanmaKosulu: 'Özgürlükçü zaferi gerçekleşmeli (tüm Gelenekçiler köyden ayrılır) ve oyun sonunda Murat hâlâ köyde olmalı.',
    tekil: null
  },

  // 🟢 ÖZGÜRLÜKÇÜLER — V1 YENİ (5 rol)
  {
    id: 'lezbiyen',
    grup: GRUP.OZGURLUKCU,
    ad: 'Lezbiyen',
    karakter: 'Ada',
    gorsel: '/karakterler/ada.png',
    yas: 27,
    meslek: 'Doktor',
    motivasyon: 'Acil servisin ışıkları hiç sönmüyordu. Ada altı yıl boyunca hayat kurtardı, ama kendi hayatının nereye gittiğini fark edemedi. Hastalar arasında bir başka hasta gibi yaşıyordu. Bir gece nöbette, ellerinin titrediğini gördü; ertesi sabah istifa dilekçesini yazdı.',
    geceAksiyonu: '"Muayene." Gece bir oyuncuyu muayene edersin ve hedefin grup rengini öğrenirsin (Özgürlükçü/Tarafsız/Gelenekçi). Bastırmış (Murat) muayene edilirse Özgürlükçü olarak görünür. Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'biseksuel',
    grup: GRUP.OZGURLUKCU,
    ad: 'Biseksüel',
    karakter: 'Elvin',
    gorsel: '/karakterler/elvin.png',
    yas: 32,
    meslek: 'Grafik Tasarımcı',
    motivasyon: 'Elvin\'in kim olduğu sorusu, hep başka birinin ağzından çıkardı. "Sen hangisindensin?" "Bir karar versen?" Her ilişki onu yeniden açıklamaya zorladı, her topluluk yarım kabul etti. Bir gün, bir kafede, gözlerini kapattı ve karar vermenin tek yolunun gitmek olduğunu anladı.',
    geceAksiyonu: '"İki dünyada görür." Gece iki oyuncu seçersin ve ikisinin de o gece bir aksiyon yapıp yapmadığı bilgisini alırsın (sadece aksiyon var/yok — hedef veya içerik değil). Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'panseksuel',
    grup: GRUP.OZGURLUKCU,
    ad: 'Panseksüel',
    karakter: 'Maya',
    gorsel: '/karakterler/maya.png',
    yas: 29,
    meslek: 'Mimar',
    motivasyon: 'Maya küçükken annesiyle camiye, babasıyla kiliseye, teyzesiyle bir cem evine gitmişti. Hiçbiri ona bir yuva olmadı. Mimari okudu, binalar tasarladı, ama içinde bir yer eksikti. Bir gün bir köy projesi yaparken kendi tasarladığı evi gördü, sonra orada yaşamak istedi.',
    geceAksiyonu: '"Köprü kurar." Gece iki oyuncu seçersin; sistem sana ikisi arasında o gece bir ziyaret oldu mu bilgisini verir (yön belirtilmez, sadece var/yok). Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'non_binary',
    grup: GRUP.OZGURLUKCU,
    ad: 'Non-binary',
    karakter: 'Aren',
    gorsel: '/karakterler/aren.png',
    yas: 26,
    meslek: 'İllüstratör',
    motivasyon: 'Aren çocuk kitabı çizerken sayfaların arasına kendi yüzünü kaybetti. Üç yıl boyunca başkalarının hayal ettiği prensesleri, prensleri çizdi; aynaya baktığında ikisi de değildi. İstanbul\'un kalabalığı çizgilerini sıkıştırdı. Köye bir bavul dolusu defter ve hâlâ bitirilmemiş bir otoportreyle geldi. Toprağın renginin sayfada nasıl durduğunu merak ediyor.',
    geceAksiyonu: '"Kimliği bulanıklaştırır." Gece bir oyuncu seçersin; o gece o oyuncuyu araştıran rollere (Gay, İnter, Lezbiyen vb.) hedefin rolü "?" olarak görünür. Öncelik 1.5 (Situationship ile aynı katman). Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'femboy',
    grup: GRUP.OZGURLUKCU,
    ad: 'Femboy',
    karakter: 'Umay',
    gorsel: '/karakterler/umay.png',
    yas: 23,
    meslek: 'Muhasebeci',
    motivasyon: 'Umay bir denetim firmasında üç yıl boyunca rakamların arkasına saklandı, hafta sonu da çalıştı. Hayatı tabloların arasında kayboldu; hiçbir defterde kendi adı geçmiyordu. Yüksek tempo bir gün bir denetim odasında çöktü. Köye bir hesap makinesi değil, hiç kullanmadığı boş bir günceyle geldi.',
    geceAksiyonu: '"Mizan." Muhasebeci Umay herkesin defterini tutar gibi sayar. Gece bir oyuncu seçersin; sistem sana hedefin oyun başından beri aktif aksiyon yaptığı kümülatif gece sayısını verir (pas geceler sayılmaz). Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: 'boylar' // Femboy/Ladyboy → sadece biri
  },

  // 🟡 TARAFSIZLAR — V1 YENİ (11 rol, hepsi bireysel kazanma)
  {
    id: 'hetero_kadin',
    grup: GRUP.TARAFSIZ,
    ad: 'Hetero Kadın',
    karakter: 'Bahar',
    gorsel: '/karakterler/bahar.png',
    yas: 28,
    meslek: 'Dijital Pazarlama',
    motivasyon: 'Bahar üç yıl boyunca bir teknoloji şirketinde dönüşüm oranlarını ondalık basamak hassasiyetinde takip etti. Hafta sonları rapor yazdı, gece yarıları kampanya canlıya alındı. Bir sabah aynaya baktığında kendi yüzünü bir grafik olarak gördüğünü fark etti. İstifa mektubunu yazıp birikimleriyle köye taşındı. Sabah uyandığında bildirim sesi olmamasına alışmak en zoruydu.',
    geceAksiyonu: '"Profil Çıkarır." Dijital pazarlamacı Bahar herkesi bir veri gibi okur. Gece bir oyuncuyu kahveye çağırırsın. Özgürlükçüyse hedefin doğuştan cinsiyetini, Tarafsızsa grup rengini öğrenirsin. Kaan\'a gidersen ertesi gece Kaan\'ın hedefini sen belirlersin. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Bireysel: oyun boyunca en az 2 erkek + 2 kadın hedef seçmiş olmalısın.',
    tekil: 'heterolar' // Hetero Erkek + Hetero Kadın → sadece biri
  },
  {
    id: 'aseksuel',
    grup: GRUP.TARAFSIZ,
    ad: 'Aseksüel',
    karakter: 'Irmak',
    gorsel: '/karakterler/irmak.png',
    yas: 33,
    meslek: 'Sosyal Medya Uzmanı',
    motivasyon: 'Irmak yedi yıl boyunca markaların sesi oldu; başkalarının tweetlerini yazdı, başkalarının fotoğraflarını seçti, başkalarının kavgalarını yumuşattı. Akşamları telefonu bıraktığında parmakları havada kayıyordu hâlâ. Bir gün ofisin camından dışarı baktı ve dışarıyı uzun süredir görmediğini fark etti. Sessiz bir hesap kapama gibi köye taşındı. Konuşmak istemediğinde kimsenin onu zorlamayacağı bir yer arıyordu.',
    geceAksiyonu: '"Sosyal medya stalk." Gece bir oyuncu seçersin; sistem sana hedefin önceki geceki aksiyon türünü verir (örn. "araştırma", "koruma", "engelleme", "pas" — kim/içerik değil sadece tür).',
    kazanmaKosulu: 'Bireysel: oyun boyunca 3 farklı oyuncunun aksiyon tipi raporunu çıkarmalısın.',
    tekil: null
  },
  {
    id: 'copcatan',
    grup: GRUP.TARAFSIZ,
    ad: 'Çöpçatan',
    karakter: 'Hatice',
    gorsel: '/karakterler/hatice.png',
    yas: 27,
    meslek: 'Yönetici Asistanı',
    motivasyon: 'Hatice beş yıl boyunca bir CEO\'nun takvimini yönetti; başka birinin uçaklarını ayarladı, başka birinin toplantılarını kurdu, başka birinin doğum gününü hatırladı. Kendi doğum gününde ofiste pasta keserken aslında patronun yıldönümü için sipariş ettiği pastayı paylaştığını fark etti. Köyde insanları kendi adına bir araya getirmek istiyordu. Birinin emrinde değil, birinin yanında olmak.',
    geceAksiyonu: '"Tanıştırma." Gece iki oyuncuyu seçersin; ikisi de sabah bildirim alır ("X seninle tanışmak istiyor"). Sistem bu çifti "eşleştirme" olarak kaydeder.',
    kazanmaKosulu: 'Bireysel: en az 2 farklı eşleştirme yap ve bu çiftler oyun sonuna kadar (her iki taraf da) köyde kalsın.',
    tekil: null
  },
  {
    id: 'fetisist',
    grup: GRUP.TARAFSIZ,
    ad: 'Fetişist',
    karakter: 'Kartal',
    gorsel: '/karakterler/kartal.png',
    yas: 32,
    meslek: 'Yazılım Mühendisi',
    motivasyon: 'Kartal sekiz yıl boyunca büyük bir bankanın arka sistemini ayakta tuttu. Geceleri uyanıp logları kontrol etti, kodun içinde başkalarının göremediği örüntüleri buldu. Şehirdeki hayatı tekdüze hâle gelince ayrıntıya olan ilgisi de bir tür açlığa dönüştü; her şeyin altında bir şablon arıyordu. Köye, dikkatini tekrar kendi seçtiği şeylere verebilmek için geldi. Şehrin gürültüsü altında kaybettiği inceliği arıyordu.',
    geceAksiyonu: '"Örüntü Taraması." Yazılımcı Kartal her sistemde gizli bir şablon arar. Oyun başında gizli bir etiket (meslek grubu, örn. "sağlık", "sanat", "teknoloji") alırsın. Gece bir oyuncu seçersin; sistem sana hedefin mesleğinin senin etiketine uyup uymadığını söyler.',
    kazanmaKosulu: 'Bireysel: oyun boyunca etiketine uyan 3 farklı oyuncuyu doğru tespit etmiş olmalısın.',
    tekil: null
  },
  {
    id: 'sugar_baby',
    grup: GRUP.TARAFSIZ,
    ad: 'Sugar Baby',
    karakter: 'Selin',
    gorsel: '/karakterler/selin.png',
    yas: 25,
    meslek: 'Yarı Zamanlı Öğrenci',
    motivasyon: 'Beş yıldır bitiremediği bir bölümün son sınıfında, hayatını ödediği herkesin gözüne bakmadan geçiren Selin, defterindeki tek sayfayı kapatmak için köye geldi. Beşiktaş\'taki o küçük dairede sabahları sınav notlarını masaya açar, akşamları o notları kapatırdı. Bir sömestr daha uzayınca bursunu, sonra ev sahibini kaybetti. Köy onu sınamadı, kayıt sormadı, tarih sormadı.',
    geceAksiyonu: '"Hediye ister." Gece bir oyuncudan "hediye" istersin; sistem sana hedefin grup rengini verir (Özgürlükçü/Tarafsız/Gelenekçi). Aynı oyuncuyu iki kez hedef alamazsın.',
    kazanmaKosulu: 'Bireysel: oyun boyunca 4 farklı oyuncudan hediye almış olmalısın.',
    tekil: 'sugar' // Sugar Baby ↔ Sugar Daddy → sadece biri
  },
  {
    id: 'sugar_daddy',
    grup: GRUP.TARAFSIZ,
    ad: 'Sugar Daddy',
    karakter: 'Eren',
    gorsel: '/karakterler/eren.png',
    yas: 42,
    meslek: 'İş İnsanı',
    motivasyon: 'Yirmi yılda kurduğu şirketin tabelası söküldüğü gün, kendi adını söyleyince hâlâ bir karşılık alabileceğini görmek isteyen Eren, köyün yolunu tuttu. Maslak\'taki ofis, üç katlı binanın iki katı, plaketler, diplomalar — hepsi geride kaldı. Şoförün adını ilk kez öğrendiği gün, dolaptaki yedi neredeyse aynı takımdan hangisinin hangi yıldan kaldığını hatırlayamadı.',
    geceAksiyonu: '"Yatırım." Gece bir oyuncuya yatırım yaparsın; ertesi gün hedefin oyu 2 sayılır. Drag Queen ile aynı hedefte çakışırsa oy max 2 kalır (kümülatif değil). Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Bireysel: en az bir oyuncuya 2 kez yatırım yap ve o oyuncu oyun sonuna kadar köyde kalsın.',
    tekil: 'sugar' // Sugar Baby ↔ Sugar Daddy → sadece biri
  },
  {
    id: 'capkin',
    grup: GRUP.TARAFSIZ,
    ad: 'Çapkın',
    karakter: 'Can',
    gorsel: '/karakterler/can.png',
    yas: 41,
    meslek: 'Spor Salonu Sahibi',
    motivasyon: 'Aynaya artık dünden daha fazla baktığı sabahları çoğalan Can, kırk sonrasında bedeninin yeni söylediği sözleri duymak için kalabalıktan uzaklaştı. Kadıköy\'deki iki katlı salonun aynaları onun rahatlığıyla, sesleri onun komutuyla doluydu. Doktor "bedeniniz size yeni bir dil konuşmaya başlıyor" dediğinde, aynayı uzun süredir gerçekten görmediğini anladı.',
    geceAksiyonu: '"Tavla." Spor salonu sahibi Can, kalabalığı hâlâ kendine çevirebildiğini görmek ister. Gece bir oyuncuyla flört edersin; sistem sana hedefin o gece kime aksiyon yaptığını verir (hedef ismi). Aynı oyuncuyu iki kez hedef alamazsın. Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Bireysel: 3 farklı gece, 3 farklı hedefle başarılı tavla atmış olmalısın.',
    tekil: null
  },
  {
    id: 'mazosist',
    grup: GRUP.TARAFSIZ,
    ad: 'Mazoşist',
    karakter: 'Beren',
    gorsel: '/karakterler/beren.png',
    yas: 32,
    meslek: 'Psikoterapist',
    motivasyon: 'Sekiz yıl başkalarının ağırlığını taşıdıktan sonra omuzlarının kendi yükünü unuttuğunu fark eden Beren, sessizliği duyabilmek için köye geldi. Adana\'da, Seyhan\'ın bir kliniğinde her seans doksanla başlar doksanla biterdi; aradaki dokuz dakika ona kendini "dinleyen" konumuna getirmeye yetmeliydi. Bir danışanın çocukluk anısı kendi uykusuna sızdığı sabah, süpervizörü "kendi odanı boş bırakmışsın" dedi — son seansta kapıyı kapatırken kilidin sesi ona dürüstlük gibi geldi.',
    geceAksiyonu: '"Süpervizyon." Terapist Beren başkasının taşıdığı yükü görür. Gece bir oyuncu seçersin; sistem sana o oyuncunun o gece yaptığı aksiyonun türünü verir (izleme / koruma / engelleme / ziyaret / pas — kim veya içerik değil, yalnız tür). Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Bireysel: Beren oyun sırasında köyden ayrılırsa otomatik kazanır (gizli tahmin yok).',
    tekil: null
  },
  {
    id: 'poliamorist',
    grup: GRUP.TARAFSIZ,
    ad: 'Poliamorist',
    karakter: 'Ekin',
    gorsel: '/karakterler/ekin.png',
    yas: 31,
    meslek: 'Çevirmen',
    motivasyon: 'Ekin yıllarca başkalarının cümlelerini taşıdı; bir noktada kendi diline yer kalmadı. Şehirde her ilişki bir başka dilbilgisiydi, her ses tonu bir başka şiveydi. Köye, sadece kendi kelimelerini hatırlamak için geldi. Bir akşam yatağa uzandığında, hangi dilde düşündüğünü hatırlayamadı; bu küçük boşluk onu altı ay boyunca uyutmadı.',
    geceAksiyonu: '"İki Dil." Çevirmen Ekin iki kişinin arasındaki anlamı okur. Gece iki oyuncu seçersin; sistem sana ikisinin de rollerinin ilk harfini verir (örn. "G — H" → Gay ve Homofobik). Aynı çifti iki kez seçemezsin.',
    kazanmaKosulu: 'Bireysel: oyun boyunca 3 farklı oyuncunun rolünü doğru tahmin etmelisin (ilk harf eşleştirmesinden çıkarımla).',
    tekil: null
  },
  {
    id: 'fuckbuddy',
    grup: GRUP.TARAFSIZ,
    ad: 'Fuckbuddy',
    karakter: 'Tuna',
    gorsel: '/karakterler/tuna.png',
    yas: 26,
    meslek: 'Bartender',
    motivasyon: 'Tuna binlerce yüze içki uzattı, hiçbirinin ismini hatırlamadı. Gece kulübünün ışıkları onu yedi yıl boyunca aynı saatte söndürdü. Köyde ilk kez kendi adının bir başkasının ağzında ağır kaldığını duydu. İsim sormayı bıraktı yıllar önce; çünkü bir yüz yarın yine geldiğinde, yanlış adla seslenmek hiç seslenmemekten daha incitici oluyordu.',
    geceAksiyonu: '"Son Sipariş." Gece bir oyuncuyu tanırsın; sistem sana o oyuncunun o gece kime gittiğini (hedefinin ismini) verir — bartender gözüyle kimin kiminle olduğunu görürsün. Aynı yüzün yarın da kalmasını istersin.',
    kazanmaKosulu: 'Bireysel: aynı oyuncuyu en az 3 farklı gece hedef al ve o oyuncu oyun sonuna kadar köyde kalsın.',
    tekil: 'buddy' // Fuckbuddy ↔ Lovebuddy → sadece biri
  },
  {
    id: 'lovebuddy',
    grup: GRUP.TARAFSIZ,
    ad: 'Lovebuddy',
    karakter: 'Nehir',
    gorsel: '/karakterler/nehir.png',
    yas: 28,
    meslek: 'UX Tasarımcı',
    motivasyon: 'Nehir beş yıl boyunca "kullanıcının ne hissedeceğini" düşündü; bir gün kendi ne hissettiğini sorduğunda cevap gelmedi. Her ekran bir akış, her akış bir tuzak. Köye, kendi tıklamasını duymak için geldi. Bir sevgilisi "sen benimle konuşmuyorsun, beni A/B test ediyorsun" dediğinde kalbi acıdı ama haklı olduğunu da biliyordu.',
    geceAksiyonu: '"Bağ kurar." Aynı oyuncuyu iki gece üst üste hedef alırsan üçüncü gece o oyuncuyla karşılıklı rol bilgisi paylaşımı gerçekleşir (siz birbirinin rolünü öğrenirsiniz). Tek geceyle bilgi gelmez.',
    kazanmaKosulu: 'Bireysel: en az 1 karşılıklı bağ kur + bağ kurduğun hedef oyun sonuna kadar köyde kalsın.',
    tekil: 'buddy' // Fuckbuddy ↔ Lovebuddy → sadece biri
  },

  // 🔴 GELENEKÇİLER — V1 YENİ (5 rol)
  {
    id: 'transfobik',
    grup: GRUP.GELENEKCI,
    ad: 'Transfobik',
    karakter: 'Sinan',
    gorsel: '/karakterler/sinan.png',
    yas: 39,
    meslek: 'Lise Öğretmeni',
    motivasyon: 'On beş yıllık öğretmen. Sınıfların değişen havasını bir türlü kabul edemedi; bir gece eski bir nizamın hâlâ mümkün olduğu yere kaçtı. Edebiyat dersinde okuduğu şiirlerin artık kimseye bir şey hatırlatmadığını hissediyordu. Müdürle yaptığı son toplantıda "uyum sağlamak zorundayız" dendiğinde, omzundan bir şey düştü. Forumda Necmi Bey\'in yazdıklarını okudu, köye geldi.',
    geceAksiyonu: '"Veli Toplantısı." Edebiyat öğretmeni Sinan eski nizamı sınıfa geri çağırmak ister. Gece bir Özgürlükçü oyuncu hedef alırsın. Hedef Trans/CD/DQ/Ladyboy/Femboy ise ertesi gün savunmasını yapamaz (savunma sırası gelince susar). Diğer rollerde etki yok.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'bifobik',
    grup: GRUP.GELENEKCI,
    ad: 'Bifobik',
    karakter: 'Yasemin',
    gorsel: '/karakterler/yasemin.png',
    yas: 33,
    meslek: 'Avukat',
    motivasyon: 'Aile hukukunda çalışan genç bir avukat. Dosyalardaki yalanlardan çok, kendi hayatındaki belirsizlikten yoruldu — köy ona "tek bir şeye güvenmek" sözü verdi. Uzun süredir birlikte olduğu kişinin "ben aslında her ikisini de…" diye başlayan cümlelerini her duyduğunda, içinde bir yer çatlıyordu. Net bir cevap istiyordu — evet ya da hayır.',
    geceAksiyonu: '"Sözleşme hilesi." Gece bir oyuncu hedef alırsın. Hedef Biseksüel/Panseksüel/Poliamorist/Situationship/Fuckbuddy/Lovebuddy ise ertesi gün oyu kendine geri döner (kendine oy = geçersiz). Diğer rollerde etki yok.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'dinci',
    grup: GRUP.GELENEKCI,
    ad: 'Dinci',
    karakter: 'Hüseyin',
    gorsel: '/karakterler/huseyin.png',
    yas: 47,
    meslek: 'İmam',
    motivasyon: 'Yıllarca büyük şehir camilerinde görev yaptı, son cemaatinin küçülmesini, gençlerin uzaklaşmasını hazmedemedi. Cuma hutbeleri sırasında arka safların boşaldığını, gençlerin telefonlarına baktığını gördü. Forumda Necmi Bey\'in yazdıklarını okudu, köy ilanını görünce "belki orada bir kandil daha yanar" diye düşündü.',
    geceAksiyonu: '"Ahlaki vaaz." Gece bir Özgürlükçü veya Tarafsız oyuncu hedef alırsın; hedef ertesi gece aksiyon yapamaz (pas). Gelenekçi/Kaosçu hedef seçilemez.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'nb_karsiti',
    grup: GRUP.GELENEKCI,
    ad: 'Non-binary Karşıtı',
    karakter: 'Pınar',
    gorsel: '/karakterler/pinar.png',
    yas: 38,
    meslek: 'Hemşire',
    motivasyon: 'On beş yıl acilde çalıştı, tükendi. Geleneksel anlayışla büyütülmüştü; değişen kavramlar, yeni tanımlar onu yordu. Annesi köyünden gelmiş, ona "kadın kadındır, erkek erkektir, gerisi karışıktır" diye öğretmişti. Hastane koridorlarında bunu unutmaya çalıştı ama her formdaki yeni kutucuk ona zorlandığını hissettirdi. Forumda "doğal sınırlar" diye bir başlık açtı, köye geldi.',
    geceAksiyonu: '"Etiketleme." Gece bir oyuncu hedef alırsın. Hedef Non-binary/İnterseksüel/Crossdresser ise rolü sabah tüm köye ifşa edilir. Diğer rollerde etki yok.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'cinsiyetci',
    grup: GRUP.GELENEKCI,
    ad: 'Cinsiyetçi',
    karakter: 'Oğuz',
    gorsel: '/karakterler/oguz.png',
    yas: 44,
    meslek: 'Esnaf',
    motivasyon: 'Babasından kalan tuhafiye dükkânını yirmi yıl yaşattı, AVM\'ler açıldıkça müşterisini kaybetti. Eski mahalle kalmadı. Dükkânda otururken eski defteri açıp veresiye yazdığı isimlere bakar, hiçbirini artık bilmediğini fark ederdi. Forumda esnaf sohbetlerine takıldı, Necmi Bey\'in köy yazılarını okudu, "ben de denerim" dedi.',
    geceAksiyonu: '"Eski Düzen." Yirmi yıl aynı çarşıda esnaflık yapan Oğuz, "herkesin yeri belli" anlayışını köye taşımak ister. Gece bir kadın oyuncu hedef alırsın; ertesi gün o oyuncunun bir Gelenekçi adayına verdiği oy 0 sayılır (yalnız Gelenekçi hedefli oyları iptal eder, diğer oylar normal sayılır).',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },

  // ⚫ KAOSÇULAR — V1 YENİ (4 rol, bireysel kazanma)
  {
    id: 'kaoscu_narsist',
    grup: GRUP.KAOSCU,
    ad: 'Narsist',
    karakter: 'Okan',
    gorsel: '/karakterler/okan.png',
    yas: 29,
    meslek: 'Influencer',
    motivasyon: 'İstanbul\'da yüz binlerce takipçi toplamış, her sabah aynanın değil ekranın yüzüne bakarak uyanan Okan; algoritmanın soğuduğunu hissedince soluğu köyde aldı. "Şehirden Kaçan Influencer" serisi için geldi, ama içten içe köyün de onu sevmesini, onu da bir trend yapmasını bekliyor. Sade kelimesini özellikle seçmişti, çünkü mütevazılık da bir tür gösterişti.',
    geceAksiyonu: '"Spotlight." Gece bir oyuncu hedef alırsın; hedef ertesi gün savunmada/oylamada kimlik açıklayamaz (rol kartını gösteremez). Okan ayrıca hedefin oyunu hangi yöne verdiğini öğrenir.',
    kazanmaKosulu: 'Bireysel: oyun boyunca kimlik açıklayan oyuncuların en az yarısını (min 2) sen spotlight\'a almış olmalısın. Koşul tamamlansa da oyun devam eder.',
    tekil: null
  },
  {
    id: 'sadist',
    grup: GRUP.KAOSCU,
    ad: 'Sadist',
    karakter: 'Bora',
    gorsel: '/karakterler/bora.png',
    yas: 37,
    meslek: 'Bakkal Sahibi',
    motivasyon: 'Köyün tek bakkalını işleten Bora, tezgahın arkasından mahallenin bütün küçük gerilimlerini izlemeyi sever. Kimseye kötülük etmez gibidir, ama birinin canı sıkıldığında ya da iki komşu kapışmaya başladığında yüzüne yerleşen o ince, hafif gülümsemeyi kimse görmez — çünkü o anda hep eğilip raftan bir şey alıyordur.',
    geceAksiyonu: '"Bozuk Sipariş." Bakkal Bora, tezgâhın arkasından küçük bir aksiliği zevkle izler. Gece bir oyuncu hedef alırsın; hedefin sabah panelinde sistem tarafından üretilmiş küçük bir aksilik notu görünür (3 jenerik mahalle olayı varyasyonundan rastgele — "küflü ekmek", "eksik para üstü", vb.). Ek olarak hedefin o gün ilk yazacağı sohbet mesajı 30 saniye gecikmeli iletilir.',
    kazanmaKosulu: 'Bireysel: en az 4 farklı oyuncuya "Bozuk Sipariş" uygulamış ve bu oyunculardan en az 2\'si aynı gün ilk oylamada oy almış olmalı. Koşul tamamlansa da oyun devam eder.',
    tekil: null
  },
  {
    id: 'sinir_tanimaz',
    grup: GRUP.KAOSCU,
    ad: 'Sınır Tanımaz',
    karakter: 'Erdem',
    gorsel: '/karakterler/erdem.png',
    yas: 42,
    meslek: 'Seyyar Satıcı',
    motivasyon: 'Erdem, yıllarca İstanbul\'un sokaklarını dolaşmış bir seyyar satıcı. Tezgâhı yorulmuş, ayakları yorulmuş ama dili hâlâ keskin. Köye bir kasa malla geldi; "burada da bir şeyler satılır" dedi, ama asıl meselesi satmak değil — kuralların kendisine işlemediği yerler aramak. "Yasak" kelimesi onun için bir uyarı değil, sadece bir hava durumu raporuydu.',
    geceAksiyonu: '"İzinsiz Giriş." Gece bir oyuncu hedef alırsın; sistem sana hedefin o gece yaptığı aksiyonun tam metnini gösterir (kimi hedef aldı + ne yaptı). Hedef bunu fark etmez.',
    kazanmaKosulu: 'Bireysel: en az 4 farklı oyuncunun gece aksiyon metnini öğrenmiş olmalısın. Koşul tamamlansa da oyun devam eder.',
    tekil: null
  },
  {
    id: 'zorba',
    grup: GRUP.KAOSCU,
    ad: 'Zorba',
    karakter: 'Hakan',
    gorsel: '/karakterler/hakan.png',
    yas: 38,
    meslek: 'İnşaat Müteahhidi',
    motivasyon: 'Hakan, büyük projelerin adamıydı; otuz katlı kuleler, AVM cepheleri, sahil rezidansları. Sonra bir imza, bir banka, bir mahkeme — ve elinde kalan tek şey küçük bir köy arsası oldu. Köye "buraya da bir şey kurarım" diye geldi; ama hırsı sönmedi, sadece sığacak yer bulamadı. Zorbalığı bağırmakla değil, bastırmakla işliyor.',
    geceAksiyonu: '"Baskı Mesajı." Gece iki oyuncu seçersin (A → B). A oyuncusu ertesi günkü ilk oylamada B oyuncusuna oy veremez (oy düğmesi grileşir). Yasak tek oylama için geçerlidir.',
    kazanmaKosulu: 'Bireysel: en az 2 farklı oylamada yasakladığın hedef (B), o oylamada en çok oyu almış olmalı. Koşul tamamlansa da oyun devam eder.',
    tekil: null
  }
];

// Karakter cinsiyetleri (Azra'nın aksiyonu + Oğuz "Cinsiyetçi" için)
// Belge: "Azra'nın aksiyonu için gereken cinsiyet bilgisi her karakterin rol kartından otomatik gelir"
// Not: 'diger' → non-binary / interseksüel (ne erkek ne kadın olarak modelleniyor)
const KARAKTER_CINSIYET = {
  // — Prototip 12 rol —
  'gay': 'erkek',
  'crossdresser': 'erkek',
  'drag_queen': 'erkek',
  'interseksuel': 'diger',
  'transseksuel': 'kadin', // Devin trans kadın olarak yazılmış
  'ladyboy': 'kadin',
  'hetero_erkek': 'erkek',
  'situationship': 'erkek',
  'koca_kari': 'kadin',
  'homofobik': 'erkek',
  'muhafazakar': 'erkek',
  'erkek_dusmani': 'kadin',

  // — V1 yeni roller —
  // Outsider
  'bastirmis': 'erkek',         // Murat
  // Özgürlükçü yeni
  'lezbiyen': 'kadin',          // Ada
  'biseksuel': 'erkek',         // Elvin — talimat "e veya nb", varsayılan erkek
  'panseksuel': 'kadin',        // Maya
  'non_binary': 'diger',        // Aren
  'femboy': 'erkek',            // Umay (doğuşta erkek)
  // Tarafsız yeni
  'hetero_kadin': 'kadin',      // Bahar
  'aseksuel': 'diger',          // Irmak — talimat "nb veya k", nb seçildi
  'copcatan': 'kadin',          // Hatice
  'fetisist': 'erkek',          // Kartal
  'sugar_baby': 'kadin',        // Selin
  'sugar_daddy': 'erkek',       // Eren
  'capkin': 'erkek',            // Can
  'mazosist': 'kadin',          // Beren
  'poliamorist': 'diger',       // Ekin
  'fuckbuddy': 'erkek',         // Tuna
  'lovebuddy': 'kadin',         // Nehir
  // Gelenekçi yeni
  'transfobik': 'erkek',        // Sinan
  'bifobik': 'kadin',           // Yasemin
  'dinci': 'erkek',             // Hüseyin
  'nb_karsiti': 'kadin',        // Pınar
  'cinsiyetci': 'erkek',        // Oğuz
  // Kaosçu
  'kaoscu_narsist': 'erkek',    // Okan
  'sadist': 'erkek',            // Bora
  'sinir_tanimaz': 'erkek',     // Erdem
  'zorba': 'erkek'              // Hakan
};

// Denge tablosu (Belge Bölüm 8) — 4-12 oyuncu
// 4-5 oyuncu "hızlı oyun" modudur: Kaan zorunlu olduğu için 1 gelenekçi gelir,
// 1. gece Kaan ayırırsa oyun kısa biter. Buğra v1.5'te onayladı.
const DENGE = {
  4:  { ozgurlukcu: 2, tarafsiz: 1, gelenekci: 1 },
  5:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 1 },
  6:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 2 },
  7:  { ozgurlukcu: 3, tarafsiz: 2, gelenekci: 2 },
  8:  { ozgurlukcu: 3, tarafsiz: 3, gelenekci: 2 },
  9:  { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 2 },
  10: { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 3 },
  11: { ozgurlukcu: 5, tarafsiz: 3, gelenekci: 3 },
  12: { ozgurlukcu: 6, tarafsiz: 3, gelenekci: 3 }
};

module.exports = {
  GRUP,
  ROLLER,
  KARAKTER_CINSIYET,
  DENGE
};
