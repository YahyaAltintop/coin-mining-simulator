export interface GpuModel {
  id: string
  name: string
  brand: 'NVIDIA' | 'AMD'
  /** Average market price in USD (fluctuates daily in-game) */
  basePrice: number
  /** Hashrate in MH/s at 100% power */
  hashrate: number
  /** Power draw in watts at 100% power */
  watts: number
  /** Days of life when run at 100% power */
  lifespanDays: number
  /** Number of fans rendered on the 3D card */
  fans: 2 | 3
  tier: 1 | 2 | 3
}

export interface CoinDef {
  id: string
  name: string
  symbol: string
  /** Average price in USD (fluctuates daily in-game) */
  basePrice: number
  /** Daily volatility (stddev of log-return) */
  volatility: number
  /** Coin units mined per MH/s per day */
  rewardPerMh: number
  /** Accent color used in UI */
  color: string
}

export interface HousingTier {
  id: string
  price: number
  /** Max GPUs that fit */
  slots: number
  /** Electricity price $/kWh */
  kwhPrice: number
  icon: string
}

/** Position on the world terrain, in percent (0–100) of world width/height */
export interface Vec2 {
  x: number
  y: number
}

/** Stage camera: pan offset in screen px + zoom factor */
export interface Camera {
  x: number
  y: number
  zoom: number
}

export interface OwnedGpu {
  uid: string
  modelId: string
  /** 0..100 — at 0 the card is dead */
  condition: number
  /** Power level 10..100 (%) */
  power: number
  boughtDay: number
  boughtPrice: number
  /** Facility this card is installed in */
  buildingUid: string
}

export interface OwnedBuilding {
  uid: string
  /** Housing tier (shack/house/villa/warehouse) */
  tierId: string
  pos: Vec2
  boughtDay: number
  boughtPrice: number
}

export interface DayReport {
  grossUsd: number
  electricityUsd: number
  netUsd: number
  minedCoins: number
}

export interface GameState {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  /** Elapsed in-game days (0 = first day) */
  day: number
  balance: number
  coinId: string
  /** Game mode — scales electricity cost and GPU wear */
  difficulty: Difficulty
  /** Owned facilities on the terrain (at least one) */
  buildings: OwnedBuilding[]
  /** Last camera view (pan + zoom) */
  camera?: Camera
  gpus: OwnedGpu[]
  /** Current market price per GPU model */
  gpuPrices: Record<string, number>
  /** Current price per coin */
  coinPrices: Record<string, number>
  /** Rolling price history per coin (last 60 days) */
  coinHistory: Record<string, number[]>
  /** Lifetime mined units per coin */
  minedTotal: Record<string, number>
  totalEarnedUsd: number
  totalElectricityUsd: number
  lastReport: DayReport
  speed: 1 | 2 | 4
}

export interface SaveMeta {
  id: string
  name: string
  updatedAt: number
  day: number
  balance: number
  /** Number of owned facilities (older saves may miss this) */
  buildings?: number
  gpuCount: number
  coinId: string
  difficulty?: Difficulty
}

export type ThemeMode = 'system' | 'dark' | 'light'
export type Lang = 'tr' | 'en'
export type Difficulty = 'easy' | 'normal' | 'hard'
