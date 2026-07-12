export interface RichPerson {
  name: string
  source: string
  flag: string
  /** Approximate net worth in USD */
  worth: number
}

const B = 1_000_000_000

/**
 * The world's 50 richest people — approximate fortunes as of mid-2026
 * (Musk became the first trillionaire after the June 2026 SpaceX IPO).
 * Sorted richest-first. The player's live net worth is ranked against this
 * list — becoming #1 is the ultimate offline goal.
 */
export const RICH_LIST: RichPerson[] = [
  { name: 'Elon Musk', source: 'SpaceX · Tesla · xAI', flag: '🇺🇸', worth: 1100 * B },
  { name: 'Larry Page', source: 'Alphabet / Google', flag: '🇺🇸', worth: 323 * B },
  { name: 'Sergey Brin', source: 'Alphabet / Google', flag: '🇺🇸', worth: 300 * B },
  { name: 'Jeff Bezos', source: 'Amazon · Blue Origin', flag: '🇺🇸', worth: 290 * B },
  { name: 'Larry Ellison', source: 'Oracle', flag: '🇺🇸', worth: 233 * B },
  { name: 'Mark Zuckerberg', source: 'Meta', flag: '🇺🇸', worth: 217 * B },
  { name: 'Jensen Huang', source: 'NVIDIA', flag: '🇺🇸', worth: 191 * B },
  { name: 'Michael Dell', source: 'Dell Technologies', flag: '🇺🇸', worth: 179 * B },
  { name: 'Jim Walton', source: 'Walmart', flag: '🇺🇸', worth: 156 * B },
  { name: 'Rob Walton', source: 'Walmart', flag: '🇺🇸', worth: 150 * B },
  { name: 'Bernard Arnault', source: 'LVMH', flag: '🇫🇷', worth: 145 * B },
  { name: 'Amancio Ortega', source: 'Inditex / Zara', flag: '🇪🇸', worth: 140 * B },
  { name: 'Steve Ballmer', source: 'Microsoft', flag: '🇺🇸', worth: 135 * B },
  { name: 'Warren Buffett', source: 'Berkshire Hathaway', flag: '🇺🇸', worth: 130 * B },
  { name: 'Carlos Slim', source: 'América Móvil', flag: '🇲🇽', worth: 125 * B },
  { name: 'Changpeng Zhao', source: 'Binance', flag: '🇨🇦', worth: 110 * B },
  { name: 'Michael Bloomberg', source: 'Bloomberg LP', flag: '🇺🇸', worth: 109 * B },
  { name: 'Bill Gates', source: 'Microsoft', flag: '🇺🇸', worth: 108 * B },
  { name: 'Alice Walton', source: 'Walmart', flag: '🇺🇸', worth: 104 * B },
  { name: 'Françoise Bettencourt Meyers', source: "L'Oréal", flag: '🇫🇷', worth: 100 * B },
  { name: 'Mukesh Ambani', source: 'Reliance Industries', flag: '🇮🇳', worth: 99.7 * B },
  { name: 'Giancarlo Devasini', source: 'Tether', flag: '🇮🇹', worth: 89.3 * B },
  { name: 'Thomas Peterffy', source: 'Interactive Brokers', flag: '🇺🇸', worth: 82.9 * B },
  { name: 'Julia Koch', source: 'Koch Inc.', flag: '🇺🇸', worth: 81.2 * B },
  { name: 'Charles Koch', source: 'Koch Inc.', flag: '🇺🇸', worth: 73.8 * B },
  { name: 'Zhang Yiming', source: 'ByteDance', flag: '🇨🇳', worth: 69.3 * B },
  { name: 'Zhong Shanshan', source: 'Nongfu Spring', flag: '🇨🇳', worth: 68.1 * B },
  { name: 'Jeff Yass', source: 'Susquehanna', flag: '🇺🇸', worth: 67.4 * B },
  { name: 'Dieter Schwarz', source: 'Lidl · Kaufland', flag: '🇩🇪', worth: 67.2 * B },
  { name: 'Germán Larrea', source: 'Grupo México', flag: '🇲🇽', worth: 67.1 * B },
  { name: 'Gautam Adani', source: 'Adani Group', flag: '🇮🇳', worth: 63.8 * B },
  { name: 'Tadashi Yanai', source: 'Fast Retailing / Uniqlo', flag: '🇯🇵', worth: 61.8 * B },
  { name: 'Ma Huateng', source: 'Tencent', flag: '🇨🇳', worth: 53.8 * B },
  { name: 'Robin Zeng', source: 'CATL', flag: '🇨🇳', worth: 53.2 * B },
  { name: 'Iris Fontbona', source: 'Antofagasta', flag: '🇨🇱', worth: 52.6 * B },
  { name: 'Masayoshi Son', source: 'SoftBank', flag: '🇯🇵', worth: 51.5 * B },
  { name: 'Ken Griffin', source: 'Citadel', flag: '🇺🇸', worth: 49.8 * B },
  { name: 'Jacqueline Mars', source: 'Mars Inc.', flag: '🇺🇸', worth: 49.1 * B },
  { name: 'John Mars', source: 'Mars Inc.', flag: '🇺🇸', worth: 49.1 * B },
  { name: 'Lukas Walton', source: 'Walmart', flag: '🇺🇸', worth: 48.9 * B },
  { name: 'Giovanni Ferrero', source: 'Ferrero', flag: '🇮🇹', worth: 48.8 * B },
  { name: 'Li Ka-shing', source: 'CK Hutchison', flag: '🇭🇰', worth: 47 * B },
  { name: 'Mark Mateschitz', source: 'Red Bull', flag: '🇦🇹', worth: 45.8 * B },
  { name: 'Gianluigi Aponte', source: 'MSC', flag: '🇨🇭', worth: 44.5 * B },
  { name: 'Rafaela Aponte-Diamant', source: 'MSC', flag: '🇨🇭', worth: 44.5 * B },
  { name: 'Andrea Pignataro', source: 'ION Group', flag: '🇮🇹', worth: 42.6 * B },
  { name: 'Klaus-Michael Kühne', source: 'Kühne + Nagel', flag: '🇩🇪', worth: 41.9 * B },
  { name: 'Thomas Frist Jr.', source: 'HCA Healthcare', flag: '🇺🇸', worth: 41.1 * B },
  { name: 'Alain Wertheimer', source: 'Chanel', flag: '🇫🇷', worth: 39.4 * B },
  { name: 'Gérard Wertheimer', source: 'Chanel', flag: '🇫🇷', worth: 39.4 * B },
]

/** 1-based rank a given net worth would hold; 51 means below the list. */
export function rankOf(netWorth: number): number {
  const above = RICH_LIST.filter(p => p.worth >= netWorth).length
  return above + 1
}
