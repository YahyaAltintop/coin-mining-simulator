import type { GpuModel } from '../types'

/**
 * GPU catalog with average market prices (USD).
 * Prices random-walk daily around basePrice during the simulation.
 *
 * lifespanDays = days of 24/7 mining at 100% power until the card dies.
 * Game-balanced: full throttle kills a card in ~1-1.5 years, a tuned-down
 * card lasts ~2 years (hot VRAM like the RTX 3090's dies earliest) — shorter
 * than real life so wear stays a meaningful mechanic while you play.
 */
export const GPU_MODELS: GpuModel[] = [
  { id: 'rx6600xt', name: 'RX 6600 XT', brand: 'AMD', basePrice: 210, hashrate: 32, watts: 130, lifespanDays: 420, fans: 2, tier: 1 },
  { id: 'rtx3060', name: 'RTX 3060', brand: 'NVIDIA', basePrice: 240, hashrate: 45, watts: 170, lifespanDays: 450, fans: 2, tier: 1 },
  { id: 'rtx4060', name: 'RTX 4060', brand: 'NVIDIA', basePrice: 290, hashrate: 52, watts: 115, lifespanDays: 520, fans: 2, tier: 1 },
  { id: 'rtx3060ti', name: 'RTX 3060 Ti', brand: 'NVIDIA', basePrice: 300, hashrate: 58, watts: 200, lifespanDays: 450, fans: 2, tier: 1 },
  { id: 'rx6700xt', name: 'RX 6700 XT', brand: 'AMD', basePrice: 320, hashrate: 47, watts: 186, lifespanDays: 440, fans: 2, tier: 1 },
  { id: 'rtx3070', name: 'RTX 3070', brand: 'NVIDIA', basePrice: 350, hashrate: 62, watts: 220, lifespanDays: 470, fans: 2, tier: 2 },
  { id: 'rx6800', name: 'RX 6800', brand: 'AMD', basePrice: 420, hashrate: 64, watts: 250, lifespanDays: 460, fans: 3, tier: 2 },
  { id: 'rtx3080', name: 'RTX 3080', brand: 'NVIDIA', basePrice: 520, hashrate: 98, watts: 320, lifespanDays: 440, fans: 3, tier: 2 },
  { id: 'rtx4070', name: 'RTX 4070', brand: 'NVIDIA', basePrice: 540, hashrate: 78, watts: 200, lifespanDays: 540, fans: 3, tier: 2 },
  { id: 'rtx3090', name: 'RTX 3090', brand: 'NVIDIA', basePrice: 800, hashrate: 121, watts: 350, lifespanDays: 400, fans: 3, tier: 3 },
  { id: 'rx7900xtx', name: 'RX 7900 XTX', brand: 'AMD', basePrice: 920, hashrate: 105, watts: 355, lifespanDays: 500, fans: 3, tier: 3 },
  { id: 'rtx4080', name: 'RTX 4080', brand: 'NVIDIA', basePrice: 950, hashrate: 112, watts: 320, lifespanDays: 560, fans: 3, tier: 3 },
  { id: 'rtx5080', name: 'RTX 5080', brand: 'NVIDIA', basePrice: 1100, hashrate: 135, watts: 360, lifespanDays: 590, fans: 3, tier: 3 },
  { id: 'rtx4090', name: 'RTX 4090', brand: 'NVIDIA', basePrice: 1650, hashrate: 155, watts: 450, lifespanDays: 540, fans: 3, tier: 3 },
  { id: 'rtx5090', name: 'RTX 5090', brand: 'NVIDIA', basePrice: 2100, hashrate: 190, watts: 575, lifespanDays: 560, fans: 3, tier: 3 },
]

export const gpuById = (id: string): GpuModel => {
  const m = GPU_MODELS.find(g => g.id === id)
  if (!m) throw new Error(`Unknown GPU model: ${id}`)
  return m
}

/** Power draw has a fixed idle baseline, so low power levels waste energy. */
export function effectiveWatts(model: GpuModel, power: number): number {
  const p = power / 100
  return model.watts * (0.45 + 0.55 * p)
}

/**
 * Hashrate scales super-linearly (p^1.5): mining efficiency collapses at low
 * power, so ~10% power cannot cover the electricity bill.
 */
export function effectiveHashrate(model: GpuModel, power: number): number {
  return model.hashrate * Math.pow(power / 100, 1.5)
}

/**
 * Condition lost per day at a given power level. Quadratic in power: full
 * throttle kills a card in ~2.5-3.5 years, a tuned-down card lasts 4-6+
 * years — matching real 24/7 mining wear (heat ages silicon; fans die first).
 */
export function wearPerDay(model: GpuModel, power: number): number {
  const p = power / 100
  const wearFactor = 0.2 + 0.8 * p * p
  return (100 / model.lifespanDays) * wearFactor
}

/** Resale value: barely-used cards keep ~90% of market price, dead cards are scrap. */
export function sellPrice(marketPrice: number, condition: number): number {
  return marketPrice * (0.12 + 0.78 * (condition / 100))
}
