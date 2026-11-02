// ========================================================
// 📌 1. BÖLÜM: TEMEL VERİLER VE HAFIZA YÖNETİMİ
// ========================================================
// [NOT]: Bu bölüm uygulamanın "State" (durum) ve sabit verilerini tutar.
// Tüm fonksiyonlar bu değişkenler üzerinden okuma ve yazma yapar.

// Haftanın iş günlerini sayısal ID'ler ile eşleyen sözlük yapısı.
// 1 = Pazartesi ... 5 = Cuma formatı benimsenmiştir.
const gunAdlari = {
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma"
};

// Uygulama genelinde o an ekranda hangi günün seçili olduğunu takip eden değişken.
// Varsayılan olarak 1 (Pazartesi) atanır; sayfa yüklendiğinde güncel güne göre güncellenir.
let aktifGun = 1;

// Haftalık ders programını gün bazında tutan nesne.
// Her gün numarası (1-5), ders adlarını temsil eden bir string dizisi (string[]) barındırır.
let dersProgrami = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: []
};

// Günlere bağlı görev ve ödev nesnelerini tutan merkezi dizi.
// Örnek eleman yapısı: { id: 1711234567, gun: 1, baslik: "Ödev 1", tamamlandi: false }
let gorevler = [];


// ========================================================
// 📌 2. BÖLÜM: SAYFA AÇILDIĞINDA ÇALIŞACAK KISIM (INIT)
// ========================================================
// [NOT]: DOM yüklendiğinde tetiklenir; sistem saatini okur, LocalStorage verilerini
// belleğe çeker ve arayüzü güncel verilerle ilk defa render eder.
window.onload = function() {
  // 1. Bilgisayar saatine göre bugünü tespit et
  // JS getDay() indeksi: 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi döner.
  let bugun = new Date().getDay();

  // Hafta sonu kontrolü (Pazar: 0, Cumartesi: 6):
  // Hafta sonuysa varsayılan olarak Pazartesi (1) seçilir ve kullanıcı bilgilendirilir.
  if (bugun === 0 || bugun === 6) {
    aktifGun = 1;
    document.getElementById("bugun-yazi").innerText = "Bugün Hafta Sonu! (Pazartesi gösteriliyor)";
  } else {
    // Hafta içi ise aktif günü sistem gününe eşitler.
    aktifGun = bugun;
    document.getElementById("bugun-yazi").innerText = "Bugün: " + gunAdlari[aktifGun];
  }

  // 2. Tarayıcı hafızasından (LocalStorage) kayıtlı ders programını çek
  let kayitliDersler = localStorage.getItem("ogrenciDersProgrami");
  if (kayitliDersler) {
    // JSON metnini tekrar JavaScript nesnesine dönüştürür.
    dersProgrami = JSON.parse(kayitliDersler);
  }

  // 3. Tarayıcı hafızasından kayıtlı görevleri çek
  let kayitliGorevler = localStorage.getItem("ogrenciGorevleri");
  if (kayitliGorevler) {
    gorevler = JSON.parse(kayitliGorevler);
  }

  // 4. Belirlenen aktif güne göre arayüzü çizdir
  gunSec(aktifGun);
};


// ========================================================
// 📌 3. BÖLÜM: GÜN SEÇME MANTIĞI
// ========================================================
// [NOT]: Kullanıcı gün butonlarına tıkladığında veya sayfa ilk açıldığında
// aktif günü günceller ve ilgili günün içeriğini ekrana basar.
function gunSec(gunNo) {
  aktifGun = gunNo;

  // Gün butonlarının aktiflik durumunu güncelle (CSS sınıfı yönetimi)
  let butonlar = document.querySelectorAll(".gun-btn");
  butonlar.forEach((btn, index) => {
    // index 0 Pazartesi'ye (1), index 4 Cuma'ya (5) denk gelir
    if (index + 1 === gunNo) {
      btn.classList.add("aktif");
    } else {
      btn.classList.remove("aktif");
    }
  });

  // Seçili gün başlığını güncelle
  document.getElementById("secili-gun-baslik").innerText = "📚 " + gunAdlari[gunNo] + " Dersleri";

  // Değişen güne göre ders ve görev listelerini DOM'a yeniden çiz
  dersleriCizdir();
  gorevleriCizdir();
}


// ========================================================
// 📌 4. BÖLÜM: DERS EKLEME, SİLME VE ÇİZDİRME
// ========================================================
// [NOT]: Ders programı CRUD (Create, Read, Delete) işlemlerini yönetir.

function dersEkle() {
  let dersInput = document.getElementById("ders-input");
  let dersAdi = dersInput.value.trim(); // Baş ve sondaki boşlukları temizler

  // Boş metin kontrolü
  if (dersAdi === "") {
    alert("Lütfen ders adı yaz!");
    return;
  }

  // Seçili günün dizisine yeni dersi ekle
  dersProgrami[aktifGun].push(dersAdi);

  // Veriyi kalıcı hale getir ve DOM'u yenile
  dersleriKaydet();
  dersleriCizdir();

  // Input alanını temizleyip yeniden odaklanma sağla (UX iyileştirmesi)
  dersInput.value = "";
  dersInput.focus();
}

function dersSil(index) {
  // splice(başlangıçİndeksi, silinecekAdet) ile seçilen dersi diziden çıkarır
  dersProgrami[aktifGun].splice(index, 1);
  dersleriKaydet();
  dersleriCizdir();
}

function dersleriCizdir() {
  let listeHTML = document.getElementById("ders-listesi");
  listeHTML.innerHTML = ""; // Listeyi sıfırla

  let gununDersleri = dersProgrami[aktifGun];

  // Liste boş ise kullanıcıya bilgi mesajı göster
  if (!gununDersleri || gununDersleri.length === 0) {
    listeHTML.innerHTML = "<p class='bos-yazi'>Bu güne henüz ders eklenmedi ✍️</p>";
    return;
  }

  // Dersleri döngü ile HTML öğelerine dönüştür
  gununDersleri.forEach((ders, index) => {
    listeHTML.innerHTML += `
      <li class="ders-oge">
        <span>${index + 1}. Ders: <strong>${ders}</strong></span>
        <button class="sil-btn" onclick="dersSil(${index})">🗑️</button>
      </li>
    `;
  });
}

function dersleriKaydet() {
  // JavaScript nesnesini JSON string formatına çevirerek LocalStorage'a kaydeder
  localStorage.setItem("ogrenciDersProgrami", JSON.stringify(dersProgrami));
}


// ========================================================
// 📌 5. BÖLÜM: GÖREV EKLEME, DURUM DEĞİŞTİRME VE SİLME
// ========================================================
// [NOT]: Görev yönetimi; derslerin aksine ID tabanlı çalışır.
// Bu sayede filtreleme veya sıralama değişse bile doğru eleman manipüle edilir.

function gorevEkle() {
  let gorevInput = document.getElementById("gorev-input");
  let metin = gorevInput.value.trim();

  // Boş girdi kontrolü
  if (metin === "") {
    alert("Lütfen bir görev veya ödev yaz!");
    return;
  }

  // Benzersiz görev nesnesi oluşturma
  let yeniGorev = {
    id: Date.now(),      // Milisaniye cinsinden benzersiz ID (Unique Identifier)
    gun: aktifGun,       // Görevin ait olduğu gün numarası
    baslik: metin,       // Görev metni
    tamamlandi: false    // Tamamlanma bayrağı (Checkbox durumu)
  };

  gorevler.push(yeniGorev);
  gorevleriKaydet();
  gorevleriCizdir();

  gorevInput.value = "";
  gorevInput.focus();
}

function gorevDurumDegistir(id) {
  // İlgili ID'ye sahip görevi bul ve tamamlanma durumunu tersine çevir (toggle)
  for (let i = 0; i < gorevler.length; i++) {
    if (gorevler[i].id === id) {
      gorevler[i].tamamlandi = !gorevler[i].tamamlandi;
      break; // Bulunduktan sonra döngüyü sonlandır
    }
  }
  gorevleriKaydet();
  gorevleriCizdir();
}

function gorevSil(id) {
  // filter() metodu ile seçilen ID hariç tüm elemanları yeni dizi olarak saklar
  gorevler = gorevler.filter(g => g.id !== id);
  gorevleriKaydet();
  gorevleriCizdir();
}

function gorevleriCizdir() {
  let listeHTML = document.getElementById("gorev-listesi");
  listeHTML.innerHTML = "";

  // Yalnızca aktif güne ait görevleri filtrele
  let gununGorevleri = gorevler.filter(g => g.gun === aktifGun);

  if (gununGorevleri.length === 0) {
    listeHTML.innerHTML = "<p class='bos-yazi'>Bu güne ait görev yok 🎉</p>";
    return;
  }

  // Filtrelenen görevleri render et
  gununGorevleri.forEach(g => {
    let yaziSinifi = g.tamamlandi ? "tamamlandi" : "";
    let checkDurumu = g.tamamlandi ? "checked" : "";

    listeHTML.innerHTML += `
      <li>
        <div class="gorev-sol">
          <input type="checkbox" ${checkDurumu} onchange="gorevDurumDegistir(${g.id})">
          <span class="${yaziSinifi}">${g.baslik}</span>
        </div>
        <button class="sil-btn" onclick="gorevSil(${g.id})">🗑️</button>
      </li>
    `;
  });
}

function gorevleriKaydet() {
  localStorage.setItem("ogrenciGorevleri", JSON.stringify(gorevler));
}