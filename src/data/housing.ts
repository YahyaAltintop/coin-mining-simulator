import type { HousingTier } from '../types'

/**
 * Facility tiers. You can own any number of each; bigger facilities hold
 * more GPUs and buy electricity cheaper (industrial rates). The first
 * shack is granted for free when a game starts.
 */
export const HOUSING_TIERS: HousingTier[] = [
  { id: 'shack', price: 900, slots: 2, kwhPrice: 0.16, icon: '🛖' },
  { id: 'house', price: 2800, slots: 5, kwhPrice: 0.14, icon: '🏠' },
  { id: 'villa', price: 14000, slots: 12, kwhPrice: 0.12, icon: '🏡' },
  { id: 'warehouse', price: 60000, slots: 28, kwhPrice: 0.085, icon: '🏭' },
]

export const housingById = (id: string): HousingTier => {
  const h = HOUSING_TIERS.find(x => x.id === id)
  if (!h) throw new Error(`Unknown housing tier: ${id}`)
  return h
}
