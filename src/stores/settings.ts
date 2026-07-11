import { reactive, watchEffect } from 'vue'
import { lang } from '../i18n'
import type { Lang, ThemeMode } from '../types'

const CONSENT_KEY = 'cms_consent'
const SETTINGS_KEY = 'cms_settings'

interface Settings {
  theme: ThemeMode
  lang: Lang | null
  consent: boolean
}

function loadSettings(): Settings {
  const consent = localStorage.getItem(CONSENT_KEY) === '1'
  const base: Settings = { theme: 'system', lang: null, consent }
  if (!consent) return base
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s.theme === 'dark' || s.theme === 'light' || s.theme === 'system') base.theme = s.theme
      if (s.lang === 'tr' || s.lang === 'en') base.lang = s.lang
    }
  } catch { /* corrupted settings fall back to defaults */ }
  return base
}

export const settings = reactive<Settings>(loadSettings())

// A stored language preference overrides the browser-detected default.
if (settings.lang) lang.value = settings.lang

const media = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = reactive({ value: media.matches })
media.addEventListener('change', e => { systemDark.value = e.matches })

export function isDark(): boolean {
  if (settings.theme === 'system') return systemDark.value
  return settings.theme === 'dark'
}

// Apply theme class to <html> and persist settings (only after consent).
watchEffect(() => {
  document.documentElement.dataset.theme = isDark() ? 'dark' : 'light'
  if (settings.consent) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: settings.theme, lang: lang.value }))
  }
})

export function setLang(l: Lang) {
  lang.value = l
  settings.lang = l
}

export function grantConsent() {
  settings.consent = true
  localStorage.setItem(CONSENT_KEY, '1')
}
