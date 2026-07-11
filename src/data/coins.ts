import type { CoinDef } from '../types'

/**
 * Mineable coins. rewardPerMh is tuned so gross income lands around
 * $0.045–0.065 per MH/s per day at base price — riskier (more volatile)
 * coins pay slightly better on average.
 */
export const COINS: CoinDef[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', basePrice: 65000, volatility: 0.022, rewardPerMh: 0.00000069, color: '#f7931a' },
  { id: 'xmr', name: 'Monero', symbol: 'XMR', basePrice: 165, volatility: 0.03, rewardPerMh: 0.00029, color: '#ff6600' },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', basePrice: 95, volatility: 0.035, rewardPerMh: 0.00053, color: '#88aaff' },
  { id: 'etc', name: 'Ethereum Classic', symbol: 'ETC', basePrice: 26, volatility: 0.04, rewardPerMh: 0.002, color: '#3ab83a' },
  { id: 'zec', name: 'Zcash', symbol: 'ZEC', basePrice: 42, volatility: 0.04, rewardPerMh: 0.00124, color: '#f4b728' },
  { id: 'dash', name: 'Dash', symbol: 'DASH', basePrice: 27, volatility: 0.042, rewardPerMh: 0.00189, color: '#008ce7' },
  { id: 'vtc', name: 'Vertcoin', symbol: 'VTC', basePrice: 0.05, volatility: 0.05, rewardPerMh: 1.1, color: '#048657' },
  { id: 'erg', name: 'Ergo', symbol: 'ERG', basePrice: 1.35, volatility: 0.055, rewardPerMh: 0.043, color: '#ff5e18' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', basePrice: 0.13, volatility: 0.06, rewardPerMh: 0.446, color: '#c2a633' },
  { id: 'flux', name: 'Flux', symbol: 'FLUX', basePrice: 0.55, volatility: 0.06, rewardPerMh: 0.107, color: '#2b61d1' },
  { id: 'rvn', name: 'Ravencoin', symbol: 'RVN', basePrice: 0.022, volatility: 0.065, rewardPerMh: 2.73, color: '#e43e3e' },
  { id: 'cfx', name: 'Conflux', symbol: 'CFX', basePrice: 0.16, volatility: 0.065, rewardPerMh: 0.375, color: '#38a1db' },
  { id: 'kas', name: 'Kaspa', symbol: 'KAS', basePrice: 0.11, volatility: 0.075, rewardPerMh: 0.59, color: '#70c7ba' },
  { id: 'alph', name: 'Alephium', symbol: 'ALPH', basePrice: 1.35, volatility: 0.07, rewardPerMh: 0.046, color: '#6a5ae0' },
]

export const coinById = (id: string): CoinDef => {
  const c = COINS.find(x => x.id === id)
  if (!c) throw new Error(`Unknown coin: ${id}`)
  return c
}

/** How many decimals to show for a coin amount, based on unit price. */
export function coinDecimals(price: number): number {
  if (price >= 1000) return 6
  if (price >= 10) return 4
  if (price >= 0.5) return 3
  return 2
}
