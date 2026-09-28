/**
 * localStorage wrappers that never throw. Storage can be unavailable (site
 * data blocked, some private modes) or full — the game must keep running.
 */

export function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Returns false when the write failed (quota exceeded or storage blocked). */
export function storageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function storageRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch { /* nothing to remove when storage is unavailable */ }
}
