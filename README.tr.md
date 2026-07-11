# ⛏️ Coin Mining Simulator

> 🇬🇧 English documentation: **[README.md](README.md)**

Tamamen tarayıcıda çalışan, gerçek zamanlı bir kripto madenciliği tycoon oyunu. 1.000 $ ve bir kulübeyle başla, ekran kartı kasaları kur, dalgalı coin fiyatlarını kovala ve depo ölçeğinde bir madencilik imparatorluğuna büyü — hepsi [k8sgames.com](https://k8sgames.com/) tarzı açık, yakınlaştırılabilir bir arazi üzerinde.

**Vue 3 + TypeScript + Vite** ile yazıldı. Sunucu yok, hesap yok, takip yok — oyunun tüm verisi tarayıcının `localStorage`'ında durur.

**🎮 Canlı oyna: [coinminer.web.app](https://coinminer.web.app)**

<!-- TODO: buraya ekran görüntüsü / GIF ekle, örn. docs/screenshot.png -->

## ✨ Özellikler

- 🗺️ **Açık arazi** — kaydırılabilir, yakınlaştırılabilir büyük dünya (tekerlekle imlece doğru zoom, sürükleyerek pan, tümünü sığdır butonu). Tesisleri istediğin yere sürükle; kamera görünümü kayda yazılır.
- 🏘️ **Çoklu tesis** — aynı anda istediğin kadar kulübe, ev, villa ve depo. Her tesisin kendi slot sayısı ve elektrik tarifesi var; her ekran kartı bir tesise takılıdır.
- 🎴 **15 gerçek ekran kartı** (RTX 3060 → RTX 5090, RX 6600 XT → RX 7900 XTX) — dönen fanlı, RGB şeritli, marka aksanlı detaylı SVG çizimler. Piyasa fiyatları her gün dalgalanır.
- 🪙 **14 kazılabilir coin** (BTC, XMR, KAS, DOGE…) — coin başına volatilite, 60 günlük fiyat geçmişi, sparkline'lar ve etkileşimli fiyat grafiği. İstediğin an coin değiştir.
- ⚡ **Güç limiti stratejisi** — her kartı %10–100 arasında çalıştır. Tam güç en hızlı kazar ama kartı eritir; ~%20 altında elektrik faturası kazancı yer.
- 🔥 **Aşınma ve ikinci el** — kartlar gerçekçi şekilde yaşlanır (RTX 3090 gibi sıcak kartlar önce ölür). Az kullanılmış kart piyasaya yakın fiyata, ölü kart hurdaya gider. Tek tıkla *"bozukları sat"*.
- 🎮 **Zorluk modları** — Kolay / Orta / Zor; elektrik maliyetini (×0,7 / ×1 / ×1,4) ve aşınmayı (×0,7 / ×1 / ×1,5) ölçekler.
- ⏱️ **Gerçek zamanlı simülasyon** — 1 oyun günü ≈ 1,5 sn; 1×/2×/4× hız. Herhangi bir yönetim paneli (veya güç slider'ı) gün sayacını durdurur; kaldığın yerden devam edersin.
- 🫧 **Yaşayan sahne** — oyun çalışırken kartlar minik halde binasının yanına dizilir, fanlar döner; binaya hover yapınca baloncuk içinde büyürler. Duraklatınca yayılır, seçilebilir olur ve arazi üzerinde hızlı düzenleme balonu açılır (slider + sat).
- 💾 **Çoklu kayıt** — her oyun günü ve sekme kapanışında `localStorage`'a otomatik kayıt. İlk açılışta zorunlu saklama izni ekranı; hiçbir veri tarayıcıdan çıkmaz.
- 🌗 **Karanlık & aydınlık tema** (varsayılan: sistem) · 🌍 **Türkçe & İngilizce** (varsayılan: tarayıcı dili).

## 🚀 Başlangıç

```bash
git clone <repo-adresin>
cd coin-mining-simulator
npm install
npm run dev      # geliştirme sunucusu (varsayılan port 3969)
npm run build    # tip kontrolü (vue-tsc) + dist/ altına prodüksiyon paketi
npm run preview  # prodüksiyon paketini yerelde sun
```

Gereksinim: Node 20+ (Node 25 ile geliştirildi). Çalışma zamanı bağımlılığı yalnızca Vue 3 ve pakete gömülü Inter fontu — durum yönetimi saf Vue reactivity, i18n el yazması, grafikler ham SVG.

## 🎮 Nasıl oynanır

1. (Yalnızca yerel) saklama iznini ver, isim ve zorluk seçip yeni oyun başlat.
2. **1.000 $** ve bedava bir kulübeyle (2 slot) başlarsın. **Market**'ten (🛒) kart al — RTX 4060 gibi verimli ucuz kartlar iyi başlangıçtır.
3. **▶** ile başlat: her gün `bakiye += kazılan coin × fiyat − elektrik`.
4. Kart başına **güç limitini** ayarla: yüksek = daha çok kâr + hızlı aşınma; çok düşük = fatura kazanır.
5. Coin piyasasını izle — risk iştahına göre en çok kazandırana geç (oynak coinler ortalamada daha iyi öder).
6. Büyü: yeni tesisler al (🏘️), kartlarla doldur, yaşlanan kartları hurdaya düşmeden sat.
7. Bakiye eksiye düşüp kart da kalmadıysa iflas — yeniden başlat, farklı strateji dene.

## ⚙️ Simülasyonun içi

Tüm denge sabitleri [`src/data/`](src/data/) altında — denge yaması tek satırlık iştir.

| Mekanik | Formül |
|---|---|
| Hash hızı | `taban × (güç)^1.5` — düşük güçte verim çöker |
| Güç tüketimi | `taban watt × (0.45 + 0.55 × güç)` — rölanti tüketimi hep var |
| Günlük aşınma | `(100 / ömürGünü) × (0.2 + 0.8 × güç²) × zorluk` |
| Satış fiyatı | `piyasa fiyatı × (0.12 + 0.78 × kondisyon)` |
| Coin fiyatları | geometrik rastgele yürüyüş `p × exp(σ·N(0,1))` + hafif ortalamaya dönüş |
| Kart piyasası | MSRP etrafında ortalamaya dönen yürüyüş (+%80 / −%45 sınırlı) |

Tesisler:

| Tesis | Fiyat | Slot | Elektrik |
|---|---|---|---|
| 🛖 Kulübe | 900 $ *(ilki bedava)* | 2 | 0,160 $/kWh |
| 🏠 Ev | 2.800 $ | 5 | 0,140 $/kWh |
| 🏡 Villa | 14.000 $ | 12 | 0,120 $/kWh |
| 🏭 Depo | 60.000 $ | 28 | 0,085 $/kWh |

Kart ömürleri oyun dengesi için kısaltılmıştır (%100 güçte 7/24 ~1–1,5 yıl, kısılmış kartta ~2+ yıl) — gerçek madencilik ömür verilerinden esinlenilmiştir.

## 🧱 Mimari

```
src/
├── data/            # denge tabloları: kartlar, coinler, tesisler, zorluklar
├── i18n/            # el yazması TR/EN sözlük + tarih/sayı/para yardımcıları
├── stores/
│   ├── game.ts      # reaktif oyun durumu, gün motoru, ekonomi, kayıtlar
│   └── settings.ts  # tema / dil / saklama izni
├── components/
│   ├── StagePanel.vue    # pan+zoom dünya, sürüklenebilir binalar, kart dockları
│   ├── GpuCard3D.vue     # animasyonlu fanlı SVG ekran kartı
│   ├── MiningPanel.vue   # coin, fiyat grafiği, canlı istatistikler
│   ├── RigPanel.vue      # tesis bazlı kart yönetimi
│   ├── MarketModal.vue / HousingModal.vue / CoinModal.vue
│   └── ...menü, üst çubuk, izin ve onay diyalogları
└── types.ts         # ortak arayüzler
```

Katkı vermeden önce bilinmesi iyi olan kararlar:

- **Durum kütüphanesi yok** — tek bir `reactive()` store modülü (`stores/game.ts`) ve dışa açılan aksiyon fonksiyonları. Saat, akümülatörlü 100 ms'lik `setInterval` — arka plan sekme kısıtlaması gün kaybettirmez.
- **Kayıtlar sürümsüz ama migrasyonlu** — `game.ts` içindeki `migrate()`, eski kayıt şekillerini (tek bina dönemi, zorluk alanı eksikliği…) yüklerken günceller. `GameState`'i değiştirirsen `migrate()`'i genişlet.
- **Düzenleme-duraklatma sözleşmesi** — kasayı değiştiren her şey `beginEdit()` / `endEdit()` üzerinden geçer; oyuncu değişiklik yaparken gün sayacı asla akmaz.
- **Sahne izole bir stacking context'tir** — içinde açılan modallar mevcut `z-index` istisnasına muhtaçtır; pan hareketi `.modal-backdrop` üzerindeki basışları bilerek yok sayar (`StagePanel.vue`).

## 🤝 Katkı

Issue ve PR'lara açığız! Bkz. [CONTRIBUTING.md](CONTRIBUTING.md). Kısa kurallar: push'lamadan önce `npm run build` çalıştır (tip kontrolü yapar), arayüz metnine dokunurken `tr`/`en` sözlüklerini senkron tut, denge değişikliklerini bileşenlere gömme — `src/data/`'ya yaz.

Yol haritasındaki fikirler: ses efektleri, başarımlar, rastgele olaylar (elektrik kesintisi, piyasa çöküşü), kartları tesisler arası taşıma, ölünce otomatik satış ayarı, soğutma geliştirmeleri.

## 📄 Lisans

[MIT](LICENSE) © 2026 Yahya
