import { computed, reactive } from 'vue'
import { COINS, coinById } from '../data/coins'
import { difficultyById } from '../data/difficulty'
import { GPU_MODELS, effectiveHashrate, effectiveWatts, gpuById, sellPrice, wearPerDay } from '../data/gpus'
import { housingById } from '../data/housing'
import type { Camera, Difficulty, GameState, GpuModel, OwnedBuilding, OwnedGpu, SaveMeta, Vec2 } from '../types'

const SAVES_KEY = 'cms_saves'
const SAVE_PREFIX = 'cms_save_'
const HISTORY_LEN = 60
const BASE_MS_PER_DAY = 1500
export const STARTING_BALANCE = 1000

interface Toast { id: number; msg: string }

export const game = reactive({
  screen: 'menu' as 'menu' | 'game',
  state: null as GameState | null,
  running: false,
  /** true while a management panel forced the pause */
  editPaused: false,
  /** whether the clock was running before the edit pause */
  wasRunningBeforeEdit: false,
  bankrupt: false,
  toasts: [] as Toast[],
})

let timer: number | null = null
let accumulator = 0
let lastTick = 0
let toastSeq = 0

// ---------- utils ----------

function gauss(): number {
  // Box-Muller
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function toast(msg: string) {
  const id = ++toastSeq
  game.toasts.push({ id, msg })
  setTimeout(() => {
    const i = game.toasts.findIndex(t => t.id === id)
    if (i >= 0) game.toasts.splice(i, 1)
  }, 2600)
}

// ---------- save / load ----------

export function listSaves(): SaveMeta[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY)
    const list: SaveMeta[] = raw ? JSON.parse(raw) : []
    return list.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

function writeSaveIndex(list: SaveMeta[]) {
  localStorage.setItem(SAVES_KEY, JSON.stringify(list))
}

export function saveGame() {
  const s = game.state
  if (!s) return
  s.updatedAt = Date.now()
  localStorage.setItem(SAVE_PREFIX + s.id, JSON.stringify(s))
  const meta: SaveMeta = {
    id: s.id,
    name: s.name,
    updatedAt: s.updatedAt,
    day: s.day,
    balance: s.balance,
    buildings: s.buildings.length,
    gpuCount: s.gpus.length,
    coinId: s.coinId,
    difficulty: s.difficulty,
  }
  const list = listSaves().filter(m => m.id !== s.id)
  list.unshift(meta)
  writeSaveIndex(list)
}

export function deleteSave(id: string) {
  localStorage.removeItem(SAVE_PREFIX + id)
  writeSaveIndex(listSaves().filter(m => m.id !== id))
}

/** Upgrade saves from the single-facility era to the buildings list. */
function migrate(raw: Record<string, unknown>): GameState {
  const s = raw as unknown as GameState & { housingId?: string; buildingPos?: Vec2 }
  if (!Array.isArray(s.buildings) || s.buildings.length === 0) {
    const b: OwnedBuilding = {
      uid: uid(),
      tierId: s.housingId && HOUSING_IDS.has(s.housingId) ? s.housingId : 'shack',
      pos: s.buildingPos ?? { x: 50, y: 50 },
      boughtDay: 0,
      boughtPrice: 0,
    }
    s.buildings = [b]
  }
  delete s.housingId
  delete s.buildingPos
  if (s.difficulty !== 'easy' && s.difficulty !== 'normal' && s.difficulty !== 'hard') s.difficulty = 'normal'
  const firstUid = s.buildings[0].uid
  const known = new Set(s.buildings.map(b => b.uid))
  for (const g of s.gpus) {
    if (!g.buildingUid || !known.has(g.buildingUid)) g.buildingUid = firstUid
  }
  return s
}
const HOUSING_IDS = new Set(['shack', 'house', 'villa', 'warehouse'])

export function loadGame(id: string): boolean {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + id)
    if (!raw) return false
    const s = migrate(JSON.parse(raw))
    // Backfill prices for models/coins added after the save was created.
    for (const m of GPU_MODELS) if (s.gpuPrices[m.id] == null) s.gpuPrices[m.id] = m.basePrice
    for (const c of COINS) {
      if (s.coinPrices[c.id] == null) s.coinPrices[c.id] = c.basePrice
      if (!s.coinHistory[c.id]) s.coinHistory[c.id] = [c.basePrice]
      if (s.minedTotal[c.id] == null) s.minedTotal[c.id] = 0
    }
    game.state = s
    game.screen = 'game'
    game.running = false
    game.editPaused = false
    game.bankrupt = s.balance < 0 && s.gpus.length === 0
    startClock()
    return true
  } catch {
    return false
  }
}

function freshState(name: string, difficulty: Difficulty): GameState {
  const gpuPrices: Record<string, number> = {}
  const coinPrices: Record<string, number> = {}
  const coinHistory: Record<string, number[]> = {}
  const minedTotal: Record<string, number> = {}
  for (const m of GPU_MODELS) gpuPrices[m.id] = m.basePrice
  for (const c of COINS) {
    coinPrices[c.id] = c.basePrice
    coinHistory[c.id] = [c.basePrice]
    minedTotal[c.id] = 0
  }
  return {
    id: uid(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    day: 0,
    balance: STARTING_BALANCE,
    coinId: 'btc',
    difficulty,
    // the first shack is on the house — welcome to the business
    buildings: [{ uid: uid(), tierId: 'shack', pos: { x: 50, y: 50 }, boughtDay: 0, boughtPrice: 0 }],
    gpus: [],
    gpuPrices,
    coinPrices,
    coinHistory,
    minedTotal,
    totalEarnedUsd: 0,
    totalElectricityUsd: 0,
    lastReport: { grossUsd: 0, electricityUsd: 0, netUsd: 0, minedCoins: 0 },
    speed: 1,
  }
}

export function newGame(name: string, difficulty: Difficulty = 'normal') {
  game.state = freshState(name.trim() || 'Miner', difficulty)
  game.screen = 'game'
  game.running = false
  game.editPaused = false
  game.bankrupt = false
  saveGame()
  startClock()
}

export function restartGame() {
  const s = game.state
  if (!s) return
  const fresh = freshState(s.name, s.difficulty)
  fresh.id = s.id
  fresh.createdAt = s.createdAt
  game.state = fresh
  game.running = false
  game.editPaused = false
  game.bankrupt = false
  saveGame()
}

export function exitToMenu() {
  if (game.state) saveGame()
  stopClock()
  game.state = null
  game.screen = 'menu'
  game.running = false
  game.editPaused = false
  game.bankrupt = false
}

// ---------- clock ----------

function startClock() {
  stopClock()
  lastTick = performance.now()
  accumulator = 0
  timer = window.setInterval(() => {
    const now = performance.now()
    const dt = now - lastTick
    lastTick = now
    if (!game.running || !game.state) return
    accumulator += dt
    const msPerDay = BASE_MS_PER_DAY / game.state.speed
    // Catch up at most a few days per tick to avoid spiral after tab throttling.
    let steps = 0
    while (accumulator >= msPerDay && steps < 4) {
      accumulator -= msPerDay
      advanceDay()
      steps++
    }
    if (accumulator > msPerDay) accumulator = 0
  }, 100)
}

function stopClock() {
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }
}

export function setRunning(run: boolean) {
  if (!game.state || game.bankrupt) return
  game.running = run
  if (!run) saveGame()
}

export function setSpeed(speed: 1 | 2 | 4) {
  if (game.state) game.state.speed = speed
}

/** Called when a management panel opens — the day counter must stop. */
export function beginEdit() {
  if (game.editPaused) return
  game.wasRunningBeforeEdit = game.running
  game.editPaused = true
  game.running = false
}

/** Called when the panel closes — resume if the game was running before. */
export function endEdit() {
  if (!game.editPaused) return
  game.editPaused = false
  if (game.wasRunningBeforeEdit && !game.bankrupt) game.running = true
  game.wasRunningBeforeEdit = false
  saveGame()
}

// ---------- simulation ----------

function walkPrices(s: GameState) {
  for (const c of COINS) {
    let p = s.coinPrices[c.id]
    p *= Math.exp(c.volatility * gauss())
    p += (c.basePrice - p) * 0.002
    p = Math.min(Math.max(p, c.basePrice * 0.15), c.basePrice * 10)
    s.coinPrices[c.id] = p
    const h = s.coinHistory[c.id]
    h.push(p)
    if (h.length > HISTORY_LEN) h.splice(0, h.length - HISTORY_LEN)
  }
  for (const m of GPU_MODELS) {
    let p = s.gpuPrices[m.id]
    p += (m.basePrice - p) * 0.03 + p * 0.012 * gauss()
    p = Math.min(Math.max(p, m.basePrice * 0.55), m.basePrice * 1.8)
    s.gpuPrices[m.id] = p
  }
}

function kwhPriceOf(s: GameState, buildingUid: string): number {
  const b = s.buildings.find(x => x.uid === buildingUid) ?? s.buildings[0]
  return housingById(b.tierId).kwhPrice * difficultyById(s.difficulty).elecMult
}

/** Daily wear including the difficulty multiplier. */
function wearOf(s: GameState, model: GpuModel, power: number): number {
  return wearPerDay(model, power) * difficultyById(s.difficulty).wearMult
}

function advanceDay() {
  const s = game.state
  if (!s) return
  s.day++
  walkPrices(s)

  const coin = coinById(s.coinId)
  let mined = 0
  let elec = 0
  for (const g of s.gpus) {
    if (g.condition <= 0) continue
    const model = gpuById(g.modelId)
    mined += coin.rewardPerMh * effectiveHashrate(model, g.power)
    elec += ((effectiveWatts(model, g.power) * 24) / 1000) * kwhPriceOf(s, g.buildingUid)
    g.condition = Math.max(0, g.condition - wearOf(s, model, g.power))
    if (g.condition === 0) toast(`${model.name} 💀`)
  }

  const gross = mined * s.coinPrices[s.coinId]
  s.balance += gross - elec
  s.minedTotal[s.coinId] += mined
  s.totalEarnedUsd += gross
  s.totalElectricityUsd += elec
  s.lastReport = { grossUsd: gross, electricityUsd: elec, netUsd: gross - elec, minedCoins: mined }

  if (s.balance < 0 && s.gpus.length === 0) {
    game.bankrupt = true
    game.running = false
  }
  saveGame()
}

// ---------- facilities ----------

/** Preferred spots for new facilities, spiraling out from the center. */
const BUILD_SPOTS: Vec2[] = [
  { x: 50, y: 50 }, { x: 62, y: 48 }, { x: 38, y: 52 }, { x: 50, y: 30 },
  { x: 50, y: 70 }, { x: 64, y: 68 }, { x: 36, y: 32 }, { x: 66, y: 30 },
  { x: 34, y: 70 }, { x: 76, y: 50 }, { x: 24, y: 48 }, { x: 78, y: 70 },
  { x: 22, y: 28 }, { x: 60, y: 86 }, { x: 40, y: 14 }, { x: 84, y: 30 },
  { x: 16, y: 68 }, { x: 86, y: 86 }, { x: 14, y: 14 },
]

function newBuildingPos(s: GameState): Vec2 {
  for (const p of BUILD_SPOTS) {
    const taken = s.buildings.some(b => Math.abs(b.pos.x - p.x) < 9 && Math.abs(b.pos.y - p.y) < 11)
    if (!taken) return { ...p }
  }
  return { x: 12 + Math.random() * 76, y: 12 + Math.random() * 76 }
}

export function buyBuilding(tierId: string): boolean {
  const s = game.state
  if (!s) return false
  const tier = housingById(tierId)
  if (s.balance < tier.price) return false
  s.balance -= tier.price
  s.buildings.push({ uid: uid(), tierId, pos: newBuildingPos(s), boughtDay: s.day, boughtPrice: tier.price })
  saveGame()
  return true
}

export function setBuildingPos(buildingUid: string, pos: Vec2) {
  const b = game.state?.buildings.find(x => x.uid === buildingUid)
  if (b) b.pos = pos
}

/** Persist terrain layout / camera after a drag or zoom gesture ends. */
export function commitLayout() {
  saveGame()
}

/** Remember the stage view; persisted on the next commitLayout/saveGame. */
export function setCamera(cam: Camera) {
  if (game.state) game.state.camera = cam
}

export function gpusIn(buildingUid: string): OwnedGpu[] {
  return game.state?.gpus.filter(g => g.buildingUid === buildingUid) ?? []
}

export function freeSlotsIn(b: OwnedBuilding): number {
  return housingById(b.tierId).slots - gpusIn(b.uid).length
}

/** 1-based ordinal among same-tier buildings, or null when it's the only one. */
export function buildingOrdinal(b: OwnedBuilding): number | null {
  const same = game.state?.buildings.filter(x => x.tierId === b.tierId) ?? []
  return same.length > 1 ? same.findIndex(x => x.uid === b.uid) + 1 : null
}

export const totals = computed(() => {
  const s = game.state
  if (!s) return { buildings: 0, slots: 0, used: 0 }
  const slots = s.buildings.reduce((acc, b) => acc + housingById(b.tierId).slots, 0)
  return { buildings: s.buildings.length, slots, used: s.gpus.length }
})

// ---------- player actions ----------

export function buyGpu(modelId: string, buildingUid?: string): boolean {
  const s = game.state
  if (!s) return false
  const target = buildingUid
    ? s.buildings.find(b => b.uid === buildingUid)
    : s.buildings.find(b => freeSlotsIn(b) > 0)
  if (!target || freeSlotsIn(target) <= 0) return false
  const price = s.gpuPrices[modelId]
  if (s.balance < price) return false
  s.balance -= price
  const g: OwnedGpu = {
    uid: uid(),
    modelId,
    condition: 100,
    power: 80,
    boughtDay: s.day,
    boughtPrice: price,
    buildingUid: target.uid,
  }
  s.gpus.push(g)
  saveGame()
  return true
}

export function sellGpu(gpuUid: string): number {
  const s = game.state
  if (!s) return 0
  const i = s.gpus.findIndex(g => g.uid === gpuUid)
  if (i < 0) return 0
  const g = s.gpus[i]
  const value = sellPrice(s.gpuPrices[g.modelId], g.condition)
  s.balance += value
  s.gpus.splice(i, 1)
  if (game.bankrupt && s.balance >= 0) game.bankrupt = false
  saveGame()
  return value
}

/** Sell every dead card at scrap price in one go. */
export function sellAllDead(): { count: number; total: number } {
  const s = game.state
  if (!s) return { count: 0, total: 0 }
  const dead = s.gpus.filter(g => g.condition <= 0)
  if (dead.length === 0) return { count: 0, total: 0 }
  let total = 0
  for (const g of dead) total += sellPrice(s.gpuPrices[g.modelId], g.condition)
  s.gpus = s.gpus.filter(g => g.condition > 0)
  s.balance += total
  if (game.bankrupt && s.balance >= 0) game.bankrupt = false
  saveGame()
  return { count: dead.length, total }
}

export function setGpuPower(gpuUid: string, power: number) {
  const s = game.state
  if (!s) return
  const g = s.gpus.find(x => x.uid === gpuUid)
  if (g) g.power = Math.min(100, Math.max(10, Math.round(power)))
}

export function selectCoin(coinId: string) {
  const s = game.state
  if (s) {
    s.coinId = coinId
    saveGame()
  }
}

// ---------- derived economics (live projections at current prices) ----------

export const rigStats = computed(() => {
  const s = game.state
  if (!s) return { hashrate: 0, watts: 0, grossUsd: 0, elecUsd: 0, netUsd: 0, coinsPerDay: 0 }
  const coin = coinById(s.coinId)
  let hashrate = 0
  let watts = 0
  let elecUsd = 0
  for (const g of s.gpus) {
    if (g.condition <= 0) continue
    const model = gpuById(g.modelId)
    const w = effectiveWatts(model, g.power)
    hashrate += effectiveHashrate(model, g.power)
    watts += w
    elecUsd += ((w * 24) / 1000) * kwhPriceOf(s, g.buildingUid)
  }
  const coinsPerDay = coin.rewardPerMh * hashrate
  const grossUsd = coinsPerDay * s.coinPrices[s.coinId]
  return { hashrate, watts, grossUsd, elecUsd, netUsd: grossUsd - elecUsd, coinsPerDay }
})

/** Per-GPU daily economics at current prices — used by rig panel & popovers. */
export function gpuEconomics(g: OwnedGpu) {
  const s = game.state!
  const model = gpuById(g.modelId)
  const coin = coinById(s.coinId)
  const alive = g.condition > 0
  const grossUsd = alive ? coin.rewardPerMh * effectiveHashrate(model, g.power) * s.coinPrices[s.coinId] : 0
  const elecUsd = alive ? ((effectiveWatts(model, g.power) * 24) / 1000) * kwhPriceOf(s, g.buildingUid) : 0
  const wear = wearOf(s, model, g.power)
  return {
    model,
    grossUsd,
    elecUsd,
    netUsd: grossUsd - elecUsd,
    wear,
    remainingDays: alive ? Math.ceil(g.condition / wear) : 0,
    sellValue: sellPrice(s.gpuPrices[g.modelId], g.condition),
  }
}

// Persist on tab close / hide.
window.addEventListener('beforeunload', () => {
  if (game.state) saveGame()
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state) saveGame()
})
