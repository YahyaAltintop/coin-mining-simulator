import type { Difficulty } from '../types'

export interface DifficultyDef {
  id: Difficulty
  icon: string
  /** Multiplier on every facility's electricity price */
  elecMult: number
  /** Multiplier on daily GPU wear (higher = shorter life) */
  wearMult: number
}

export const DIFFICULTIES: DifficultyDef[] = [
  { id: 'easy', icon: '🌱', elecMult: 0.7, wearMult: 0.7 },
  { id: 'normal', icon: '⚖️', elecMult: 1, wearMult: 1 },
  { id: 'hard', icon: '🔥', elecMult: 1.4, wearMult: 1.5 },
]

export const difficultyById = (id: Difficulty): DifficultyDef =>
  DIFFICULTIES.find(d => d.id === id) ?? DIFFICULTIES[1]
