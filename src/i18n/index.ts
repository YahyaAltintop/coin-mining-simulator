import { computed, ref } from 'vue'
import type { Lang } from '../types'

const dict = {
  tr: {
    appTitle: 'Coin Mining Simulator',
    tagline: 'Kendi madencilik imparatorluğunu kur',
    // Consent
    consentTitle: 'Veri Saklama İzni',
    consentBody:
      'Bu oyun ilerlemeni (kayıtlı oyunlar, bakiye, sistem kurulumun) ve tercihlerini (tema, dil) yalnızca bu tarayıcıdaki localStorage üzerinde saklar. Hiçbir veri sunucuya gönderilmez. Oyunu oynayabilmek için bu zorunlu izni vermen gerekiyor.',
    consentAccept: 'Kabul Et ve Başla',
    consentNote: 'İzin vermeden oyun kaydedilemez ve oynanamaz.',
    // Menu
    newGame: 'Yeni Oyun',
    continueGame: 'Devam Et',
    savedGames: 'Kayıtlı Oyunlar',
    noSaves: 'Henüz kayıtlı oyun yok. Yeni bir oyun başlat!',
    gameName: 'Oyun adı',
    gameNamePh: 'Örn: Madenci Yahya',
    start: 'Başlat',
    difficulty: 'Zorluk',
    'diff.easy': 'Kolay',
    'diff.normal': 'Orta',
    'diff.hard': 'Zor',
    'diffDesc.easy': 'Elektrik %30 ucuz · kartlar %30 yavaş aşınır',
    'diffDesc.normal': 'Standart fatura ve aşınma',
    'diffDesc.hard': 'Elektrik %40 pahalı · kartlar %50 hızlı aşınır',
    cancel: 'İptal',
    delete: 'Sil',
    load: 'Yükle',
    day: 'Gün',
    startingCredit: 'Başlangıç kredisi',
    menuHint: '1.000 $ kredi ile başla, kasanı topla, coin kaz, imparatorluğunu büyüt.',
    deleteSaveConfirm: 'Bu kayıt kalıcı olarak silinecek. Emin misin?',
    // Topbar / time
    balance: 'Bakiye',
    paused: 'DURAKLATILDI',
    running: 'ÇALIŞIYOR',
    resume: 'Devam Et',
    pause: 'Duraklat',
    speed: 'Hız',
    restart: 'Yeniden Başlat',
    restartConfirm: 'Oyun 1. güne sıfırlanacak: 1.000 $ bakiye, boş kasa, kulübe. Emin misin?',
    mainMenu: 'Ana Menü',
    theme: 'Tema',
    themeSystem: 'Sistem',
    themeDark: 'Karanlık',
    themeLight: 'Aydınlık',
    language: 'Dil',
    // Stats
    dailyGross: 'Günlük Kazanç',
    dailyElectric: 'Elektrik Gideri',
    dailyNet: 'Net Kâr',
    totalHashrate: 'Toplam Hız',
    powerDraw: 'Güç Tüketimi',
    totalEarned: 'Toplam Kazanç',
    totalElectric: 'Toplam Elektrik',
    minedToday: 'Bugün kazılan',
    totalMined: 'Toplam kazılan',
    perDay: '/gün',
    // Coins
    coins: 'Coinler',
    selectedCoin: 'Kazılan Coin',
    selectCoin: 'Coin Seç',
    price: 'Fiyat',
    change30: '30 günlük değişim',
    mineThis: 'Bunu Kaz',
    mining: 'Kazılıyor',
    // Rig
    rig: 'Kasa',
    myRig: 'Sistemim',
    slots: 'Slot',
    emptySlot: 'Boş Slot',
    addGpu: 'Ekran Kartı Ekle',
    condition: 'Ömür',
    powerLevel: 'Güç Limiti',
    sell: 'Sat',
    sellFor: 'Sat: {price}',
    dead: 'BOZULDU',
    deadGpuNote: 'Kart bozuldu — artık kazmıyor. Hurda fiyatına satabilirsin.',
    sellConfirm: '{name} kartını {price} karşılığında satmak istiyor musun?',
    sellDead: 'Bozukları Sat',
    sellDeadConfirm: '{count} bozuk kart hurda fiyatına toplam {total} karşılığında satılacak. Onaylıyor musun?',
    wearRate: 'Aşınma',
    estLife: 'Tahmini kalan ömür',
    days: 'gün',
    years: 'yıl',
    // Market
    market: 'Market',
    gpuMarket: 'Ekran Kartı Marketi',
    buy: 'Satın Al',
    noSlotLeft: 'Boş slot yok — yeni bir tesis satın al!',
    notEnoughMoney: 'Bakiye yetersiz',
    owned: 'sahip',
    marketNote: 'Fiyatlar piyasaya göre her gün değişir.',
    targetBuilding: 'Hedef tesis',
    full: 'Dolu',
    buildingFullNote: 'Bu tesis dolu — başka bir tesis seç veya yeni tesis satın al.',
    // Housing
    housing: 'Tesisler',
    housingTitle: 'Tesis Marketi',
    addBuilding: 'Tesis Ekle',
    buildConfirm: '{price} karşılığında yeni bir {name} satın almak istiyor musun?',
    electricity: 'Elektrik',
    housingNote: 'Aynı tesisten istediğin kadar satın alabilirsin. Büyük tesisler daha çok kart alır ve elektriği daha ucuza kullanır.',
    'housing.shack': 'Kulübe',
    'housing.house': 'Ev',
    'housing.villa': 'Villa',
    'housing.warehouse': 'Depo',
    // Pause reasons
    pausedEditing: 'Sistemde değişiklik yapılıyor — sayaç durdu',
    autoSaved: 'Otomatik kaydedildi',
    // misc
    close: 'Kapat',
    confirm: 'Onayla',
    yes: 'Evet',
    no: 'Hayır',
    gross: 'Brüt',
    net: 'Net',
    profitWarning: 'Bu güç seviyesinde elektrik faturası kazançtan yüksek!',
    bankruptTitle: 'İflas Ettin!',
    bankruptBody: 'Bakiyen eksiye düştü ve satacak kartın kalmadı. Yeniden başlamayı deneyebilirsin.',
    startHint: 'Marketten ekran kartı al ve kazmaya başla!',
  },
  en: {
    appTitle: 'Coin Mining Simulator',
    tagline: 'Build your own mining empire',
    consentTitle: 'Storage Permission',
    consentBody:
      'This game stores your progress (saved games, balance, rig setup) and preferences (theme, language) only in this browser via localStorage. Nothing is sent to any server. You must grant this required permission to play.',
    consentAccept: 'Accept & Start',
    consentNote: 'Without permission the game cannot be saved or played.',
    newGame: 'New Game',
    continueGame: 'Continue',
    savedGames: 'Saved Games',
    noSaves: 'No saved games yet. Start a new one!',
    gameName: 'Game name',
    gameNamePh: 'e.g. Miner Yahya',
    start: 'Start',
    difficulty: 'Difficulty',
    'diff.easy': 'Easy',
    'diff.normal': 'Normal',
    'diff.hard': 'Hard',
    'diffDesc.easy': 'Electricity 30% cheaper · cards wear 30% slower',
    'diffDesc.normal': 'Standard bills and wear',
    'diffDesc.hard': 'Electricity 40% pricier · cards wear 50% faster',
    cancel: 'Cancel',
    delete: 'Delete',
    load: 'Load',
    day: 'Day',
    startingCredit: 'Starting credit',
    menuHint: 'Start with $1,000 credit, build your rig, mine coins, grow your empire.',
    deleteSaveConfirm: 'This save will be permanently deleted. Are you sure?',
    balance: 'Balance',
    paused: 'PAUSED',
    running: 'RUNNING',
    resume: 'Resume',
    pause: 'Pause',
    speed: 'Speed',
    restart: 'Restart',
    restartConfirm: 'The game will reset to day 1: $1,000 balance, empty rig, shack. Are you sure?',
    mainMenu: 'Main Menu',
    theme: 'Theme',
    themeSystem: 'System',
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    dailyGross: 'Daily Income',
    dailyElectric: 'Electricity Cost',
    dailyNet: 'Net Profit',
    totalHashrate: 'Total Hashrate',
    powerDraw: 'Power Draw',
    totalEarned: 'Total Earned',
    totalElectric: 'Total Electricity',
    minedToday: 'Mined today',
    totalMined: 'Total mined',
    perDay: '/day',
    coins: 'Coins',
    selectedCoin: 'Mining Coin',
    selectCoin: 'Select Coin',
    price: 'Price',
    change30: '30-day change',
    mineThis: 'Mine This',
    mining: 'Mining',
    rig: 'Rig',
    myRig: 'My Rig',
    slots: 'Slots',
    emptySlot: 'Empty Slot',
    addGpu: 'Add GPU',
    condition: 'Condition',
    powerLevel: 'Power Limit',
    sell: 'Sell',
    sellFor: 'Sell: {price}',
    dead: 'DEAD',
    deadGpuNote: 'This card died — it no longer mines. You can sell it for scrap.',
    sellConfirm: 'Sell {name} for {price}?',
    sellDead: 'Sell Dead Cards',
    sellDeadConfirm: '{count} dead cards will be sold for a total of {total} in scrap. Confirm?',
    wearRate: 'Wear',
    estLife: 'Est. remaining life',
    days: 'days',
    years: 'years',
    market: 'Market',
    gpuMarket: 'GPU Market',
    buy: 'Buy',
    noSlotLeft: 'No free slots — buy a new facility!',
    notEnoughMoney: 'Insufficient balance',
    owned: 'owned',
    marketNote: 'Prices fluctuate with the market every day.',
    targetBuilding: 'Target facility',
    full: 'Full',
    buildingFullNote: 'This facility is full — pick another one or buy a new facility.',
    housing: 'Facilities',
    housingTitle: 'Facility Market',
    addBuilding: 'Add Facility',
    buildConfirm: 'Buy a new {name} for {price}?',
    electricity: 'Electricity',
    housingNote: 'You can own any number of each facility. Bigger ones fit more cards and buy cheaper electricity.',
    'housing.shack': 'Shack',
    'housing.house': 'House',
    'housing.villa': 'Villa',
    'housing.warehouse': 'Warehouse',
    pausedEditing: 'Editing your rig — the clock is stopped',
    autoSaved: 'Auto-saved',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    gross: 'Gross',
    net: 'Net',
    profitWarning: 'At this power level the electricity bill exceeds income!',
    bankruptTitle: 'Bankrupt!',
    bankruptBody: 'Your balance went negative and you have no cards left to sell. Try restarting.',
    startHint: 'Buy a GPU from the market and start mining!',
  },
} as const

export type TKey = keyof typeof dict.tr

function detectLang(): Lang {
  const nav = navigator.language?.toLowerCase() ?? 'en'
  return nav.startsWith('tr') ? 'tr' : 'en'
}

export const lang = ref<Lang>(detectLang())

export function t(key: TKey, params?: Record<string, string | number>): string {
  let s: string = dict[lang.value][key] ?? dict.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v))
  }
  return s
}

export const localeTag = computed(() => (lang.value === 'tr' ? 'tr-TR' : 'en-US'))

/** In-game calendar starts on Jan 1, 2026. */
const GAME_EPOCH = Date.UTC(2026, 0, 1)

export function gameDate(day: number): Date {
  return new Date(GAME_EPOCH + day * 86_400_000)
}

export function formatGameDate(day: number): string {
  return gameDate(day).toLocaleDateString(localeTag.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function fmtUsd(v: number, digits = 2): string {
  return v.toLocaleString(localeTag.value, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function fmtNum(v: number, digits = 2): string {
  return v.toLocaleString(localeTag.value, { maximumFractionDigits: digits })
}

/** "~1.420 gün (3,9 yıl)" — remaining-life display with a year hint. */
export function fmtLife(days: number): string {
  const base = `~${Math.round(days).toLocaleString(localeTag.value)} ${t('days')}`
  return days >= 365 ? `${base} (${fmtNum(days / 365, 1)} ${t('years')})` : base
}
