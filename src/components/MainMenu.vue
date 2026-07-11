<script setup lang="ts">
import { ref } from 'vue'
import { formatGameDate, fmtUsd, lang, localeTag, t } from '../i18n'
import { coinById } from '../data/coins'
import { DIFFICULTIES, difficultyById } from '../data/difficulty'
import { deleteSave, listSaves, loadGame, newGame, STARTING_BALANCE } from '../stores/game'
import { setLang, settings } from '../stores/settings'
import type { Difficulty, SaveMeta } from '../types'
import ModalConfirm from './ModalConfirm.vue'

const name = ref('')
const difficulty = ref<Difficulty>('normal')
const saves = ref<SaveMeta[]>(listSaves())
const pendingDelete = ref<SaveMeta | null>(null)

function start() {
  newGame(name.value, difficulty.value)
}

function confirmDelete() {
  if (pendingDelete.value) {
    deleteSave(pendingDelete.value.id)
    saves.value = listSaves()
  }
  pendingDelete.value = null
}

function cycleTheme() {
  settings.theme = settings.theme === 'system' ? 'dark' : settings.theme === 'dark' ? 'light' : 'system'
}
const themeIcon = () => (settings.theme === 'system' ? '🖥️' : settings.theme === 'dark' ? '🌙' : '☀️')
</script>

<template>
  <div class="menu">
    <div class="corner">
      <button class="btn btn-icon" :title="t('theme')" @click="cycleTheme()">{{ themeIcon() }}</button>
      <button class="btn btn-sm" @click="setLang(lang === 'tr' ? 'en' : 'tr')">{{ lang.toUpperCase() }}</button>
    </div>

    <header>
      <div class="logo">⛏️</div>
      <h1>{{ t('appTitle') }}</h1>
      <p class="tagline">{{ t('tagline') }}</p>
    </header>

    <div class="cards">
      <section class="panel card">
        <h2>🎮 {{ t('newGame') }}</h2>
        <label class="dim" for="gname">{{ t('gameName') }}</label>
        <input id="gname" v-model="name" type="text" :placeholder="t('gameNamePh')" maxlength="24" @keyup.enter="start" />

        <label class="dim">{{ t('difficulty') }}</label>
        <div class="diff-row">
          <button
            v-for="d in DIFFICULTIES"
            :key="d.id"
            class="btn diff-btn"
            :class="{ 'btn-primary': difficulty === d.id }"
            @click="difficulty = d.id"
          >{{ d.icon }} {{ t(`diff.${d.id}` as never) }}</button>
        </div>
        <p class="diff-desc mute">{{ t(`diffDesc.${difficulty}` as never) }}</p>

        <div class="credit chip">💵 {{ t('startingCredit') }}: <b class="num">{{ fmtUsd(STARTING_BALANCE, 0) }}</b></div>
        <button class="btn btn-primary start-btn" @click="start">▶ {{ t('start') }}</button>
      </section>

      <section class="panel card">
        <h2>💾 {{ t('savedGames') }}</h2>
        <p v-if="saves.length === 0" class="empty mute">{{ t('noSaves') }}</p>
        <ul v-else class="save-list">
          <li v-for="s in saves" :key="s.id" class="save">
            <div class="save-info">
              <b>{{ s.name }}</b>
              <span class="dim small">
                {{ difficultyById(s.difficulty ?? 'normal').icon }} {{ t(`diff.${s.difficulty ?? 'normal'}` as never) }}
                · 🏘️ {{ s.buildings ?? 1 }} · 🎴 {{ s.gpuCount }} GPU · {{ coinById(s.coinId).symbol }}
              </span>
              <span class="mute small num">
                📅 {{ formatGameDate(s.day) }} ({{ t('day') }} {{ s.day + 1 }}) —
                {{ new Date(s.updatedAt).toLocaleString(localeTag) }}
              </span>
            </div>
            <div class="save-balance num" :class="s.balance >= 0 ? 'up-text' : 'down-text'">{{ fmtUsd(s.balance, 0) }}</div>
            <div class="save-actions">
              <button class="btn btn-primary btn-sm" @click="loadGame(s.id)">{{ t('load') }}</button>
              <button class="btn btn-danger btn-sm" @click="pendingDelete = s">{{ t('delete') }}</button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <footer class="mute">{{ t('menuHint') }}</footer>

    <ModalConfirm
      v-if="pendingDelete"
      :title="`🗑️ ${t('delete')}: ${pendingDelete.name}`"
      :message="t('deleteSaveConfirm')"
      :confirm-text="t('delete')"
      danger
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

<style scoped>
.menu {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 48px 20px 28px;
  background:
    radial-gradient(800px 400px at 50% -10%, var(--stage-glow), transparent 70%),
    var(--bg);
}
.corner { position: fixed; top: 16px; right: 18px; display: flex; gap: 8px; z-index: 10; }

header { text-align: center; }
.logo { font-size: 52px; filter: drop-shadow(0 4px 14px var(--accent-soft)); }
h1 {
  font-size: 30px;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, var(--accent-strong), var(--text));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.tagline { color: var(--text-dim); margin-top: 6px; }

.cards {
  display: grid;
  grid-template-columns: 320px minmax(360px, 520px);
  gap: 18px;
  align-items: start;
  width: min(900px, 100%);
}
@media (max-width: 780px) { .cards { grid-template-columns: 1fr; } }

.card { padding: 22px; display: flex; flex-direction: column; gap: 12px; }
.card h2 { font-size: 16px; }
.card label { font-size: 12px; }
.credit { align-self: flex-start; }
.diff-row { display: flex; gap: 7px; }
.diff-btn { flex: 1; padding: 9px 6px; }
.diff-desc { font-size: 11.5px; line-height: 1.4; margin-top: -4px; }
.start-btn { padding: 11px; font-size: 15px; margin-top: 4px; }

.empty { padding: 18px 4px; text-align: center; }
.save-list { list-style: none; display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; }
.save {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 12px;
  align-items: center;
  background: var(--panel2);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
.save-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.small { font-size: 11.5px; }
.save-balance { font-weight: 700; font-size: 15px; justify-self: end; }
.save-actions { grid-column: 2; display: flex; gap: 6px; justify-self: end; }

footer { font-size: 12.5px; text-align: center; }
</style>
