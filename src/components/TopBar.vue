<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatGameDate, fmtUsd, lang, t } from '../i18n'
import { difficultyById } from '../data/difficulty'
import { exitToMenu, game, playerRank, restartGame, rigStats, setRunning, setSpeed } from '../stores/game'
import { setLang, settings } from '../stores/settings'
import ModalConfirm from './ModalConfirm.vue'

const askRestart = ref(false)

const s = computed(() => game.state!)

function cycleTheme() {
  settings.theme = settings.theme === 'system' ? 'dark' : settings.theme === 'dark' ? 'light' : 'system'
}
const themeIcon = computed(() => (settings.theme === 'system' ? '🖥️' : settings.theme === 'dark' ? '🌙' : '☀️'))
const themeLabel = computed(() =>
  settings.theme === 'system' ? t('themeSystem') : settings.theme === 'dark' ? t('themeDark') : t('themeLight'),
)

function doRestart() {
  askRestart.value = false
  restartGame()
}
</script>

<template>
  <header class="topbar">
    <!-- day / month / year counter (top-left) -->
    <div class="date-block">
      <div class="date num">📅 {{ formatGameDate(s.day) }}</div>
      <div class="day-count mute num">{{ t('day') }} {{ s.day + 1 }}</div>
    </div>

    <div class="balance-block">
      <span class="label mute">{{ t('balance') }}</span>
      <span class="balance num" :class="s.balance < 0 ? 'down-text' : ''">{{ fmtUsd(s.balance) }}</span>
      <span class="chip num" :class="rigStats.netUsd >= 0 ? 'up' : 'down'">
        {{ rigStats.netUsd >= 0 ? '▲' : '▼' }} {{ fmtUsd(Math.abs(rigStats.netUsd)) }}{{ t('perDay') }}
      </span>
    </div>

    <div class="status" :class="game.running ? 'on' : 'off'">
      <span class="dot"></span>{{ game.running ? t('running') : t('paused') }}
    </div>

    <span class="chip" :title="t(`diffDesc.${s.difficulty}` as never)">
      {{ difficultyById(s.difficulty).icon }} {{ t(`diff.${s.difficulty}` as never) }}
    </span>

    <span v-if="playerRank <= 50" class="chip rank-chip num" :title="t('yourRank')">
      {{ playerRank === 1 ? '👑' : '🏆' }} #{{ playerRank }}
    </span>

    <div class="spacer"></div>

    <div class="controls">
      <button
        class="btn btn-icon"
        :class="{ 'btn-primary': game.running }"
        :title="game.running ? t('pause') : t('resume')"
        :disabled="game.bankrupt"
        @click="setRunning(!game.running)"
      >{{ game.running ? '⏸' : '▶' }}</button>
      <div class="speed-group" :title="t('speed')">
        <button
          v-for="sp in [1, 2, 4] as const"
          :key="sp"
          class="btn btn-sm speed"
          :class="{ 'btn-primary': s.speed === sp }"
          @click="setSpeed(sp)"
        >{{ sp }}×</button>
      </div>
      <span class="sep"></span>
      <button class="btn btn-icon" :title="t('restart')" @click="askRestart = true">🔄</button>
      <button class="btn btn-icon" :title="`${t('theme')}: ${themeLabel}`" @click="cycleTheme()">{{ themeIcon }}</button>
      <button class="btn btn-sm" :title="t('language')" @click="setLang(lang === 'tr' ? 'en' : 'tr')">{{ lang.toUpperCase() }}</button>
      <button class="btn btn-sm" @click="exitToMenu()">⏏ {{ t('mainMenu') }}</button>
    </div>

    <ModalConfirm
      v-if="askRestart"
      :title="`🔄 ${t('restart')}`"
      :message="t('restartConfirm')"
      :confirm-text="t('restart')"
      danger
      @confirm="doRestart"
      @cancel="askRestart = false"
    />
  </header>
</template>

<style scoped>
.topbar {
  grid-area: top;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.date-block { display: flex; flex-direction: column; line-height: 1.3; min-width: 185px; }
.date { font-size: 15.5px; font-weight: 800; }
.day-count { font-size: 12.5px; font-weight: 600; }

.balance-block { display: flex; align-items: center; gap: 10px; }
.label { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.balance { font-size: 22px; font-weight: 800; color: var(--gold); letter-spacing: -0.01em; }

.status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; }
.status .dot { width: 8px; height: 8px; border-radius: 50%; }
.status.on { color: var(--up-text); }
.status.on .dot { background: var(--up-text); box-shadow: 0 0 8px var(--up-text); animation: blink 1.4s ease-in-out infinite; }
.status.off { color: var(--warn); }
.status.off .dot { background: var(--warn); }
@keyframes blink { 50% { opacity: 0.35; } }

.rank-chip { color: var(--gold); border-color: color-mix(in srgb, var(--gold) 40%, transparent); background: color-mix(in srgb, var(--gold) 10%, transparent); }

.controls { display: flex; align-items: center; gap: 7px; }
.speed-group { display: flex; gap: 3px; }
.speed { min-width: 34px; }
.sep { width: 1px; height: 22px; background: var(--border); margin: 0 3px; }
</style>
