<script setup lang="ts">
import { computed } from 'vue'
import { fmtWealth, t } from '../i18n'
import { RICH_LIST } from '../data/richlist'
import { game, netWorth, playerRank } from '../stores/game'

const emit = defineEmits<{ close: [] }>()

const rank = computed(() => playerRank.value)
const ranked = computed(() => rank.value <= 50)

/** The person directly above the player (null when the player is #1). */
const nextTarget = computed(() => {
  if (rank.value === 1) return null
  return RICH_LIST[rank.value - 2] ?? RICH_LIST[RICH_LIST.length - 1]
})

/** Progress toward overtaking the next target (0..1). */
const nextProgress = computed(() => {
  const target = nextTarget.value
  if (!target) return 1
  return Math.min(netWorth.value / target.worth, 1)
})

/** rows above the player, then the player, then the rest */
const rowsAbove = computed(() => RICH_LIST.slice(0, Math.min(rank.value - 1, 50)))
const rowsBelow = computed(() => RICH_LIST.slice(Math.min(rank.value - 1, 50)))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal richlist">
      <div class="modal-head">
        <h2>🏆 {{ t('richListTitle') }}</h2>
        <button class="btn btn-icon" @click="emit('close')">✕</button>
      </div>

      <!-- player summary -->
      <div class="me-card" :class="{ crown: rank === 1 }">
        <div class="me-rank num">{{ rank === 1 ? '👑' : ranked ? `#${rank}` : '50+' }}</div>
        <div class="me-info">
          <b>{{ game.state?.name }} <span class="chip you-chip">{{ t('youTag') }}</span></b>
          <span class="dim">{{ t('netWorth') }}: <b class="num gold">{{ fmtWealth(netWorth) }}</b></span>
        </div>
        <div v-if="nextTarget" class="me-next">
          <span class="dim tiny">{{ t('nextTarget') }}: <b>{{ nextTarget.name }}</b></span>
          <div class="progress"><div class="fill" :style="{ width: `${Math.max(nextProgress * 100, 0.5)}%` }"></div></div>
          <span class="tiny num mute">{{ fmtWealth(nextTarget.worth - netWorth) }} {{ t('remaining') }}</span>
        </div>
        <div v-else class="me-next crown-note">{{ t('becameRichest') }}</div>
      </div>
      <p v-if="!ranked" class="not-ranked mute">{{ t('notRanked') }}</p>

      <div class="modal-body">
        <ol class="list">
          <li v-for="(p, i) in rowsAbove" :key="p.name" class="row">
            <span class="rk num">{{ i + 1 }}</span>
            <span class="flag">{{ p.flag }}</span>
            <span class="who"><b>{{ p.name }}</b><span class="src mute">{{ p.source }}</span></span>
            <span class="worth num">{{ fmtWealth(p.worth) }}</span>
          </li>

          <!-- the player, inline at their rank -->
          <li v-if="ranked" class="row me-row">
            <span class="rk num">{{ rank }}</span>
            <span class="flag">⛏️</span>
            <span class="who"><b>{{ game.state?.name }}</b><span class="src mute">Coin Mining</span></span>
            <span class="worth num">{{ fmtWealth(netWorth) }}</span>
          </li>

          <li v-for="(p, i) in rowsBelow" :key="p.name" class="row">
            <span class="rk num">{{ (ranked ? rank + 1 : 1) + i + (ranked ? 0 : rowsAbove.length) }}</span>
            <span class="flag">{{ p.flag }}</span>
            <span class="who"><b>{{ p.name }}</b><span class="src mute">{{ p.source }}</span></span>
            <span class="worth num">{{ fmtWealth(p.worth) }}</span>
          </li>

          <!-- unranked player pinned at the bottom -->
          <li v-if="!ranked" class="row me-row">
            <span class="rk num">—</span>
            <span class="flag">⛏️</span>
            <span class="who"><b>{{ game.state?.name }}</b><span class="src mute">Coin Mining</span></span>
            <span class="worth num">{{ fmtWealth(netWorth) }}</span>
          </li>
        </ol>
        <p class="note mute">{{ t('richListNote') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.richlist { width: min(620px, calc(100vw - 40px)); }

.me-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px 16px;
  margin: 14px 20px 0;
  padding: 12px 16px;
  border: 1px solid var(--accent-border);
  border-radius: var(--radius);
  background: var(--accent-soft);
}
.me-card.crown { border-color: var(--gold); box-shadow: 0 0 24px color-mix(in srgb, var(--gold) 25%, transparent); }
.me-rank { font-size: 24px; font-weight: 800; color: var(--accent-strong); min-width: 52px; }
.me-info { display: flex; flex-direction: column; gap: 2px; font-size: 14.5px; }
.you-chip { font-size: 9.5px; padding: 0 7px; color: var(--accent-strong); border-color: var(--accent-border); }
.gold { color: var(--gold); }
.me-next { display: flex; flex-direction: column; gap: 4px; min-width: 190px; }
.crown-note { font-weight: 750; color: var(--gold); font-size: 13.5px; max-width: 200px; }
.progress { height: 6px; border-radius: 6px; background: var(--border); overflow: hidden; }
.progress .fill { height: 100%; border-radius: 6px; background: var(--gold); transition: width 0.4s; }
.tiny { font-size: 11.5px; font-weight: 600; }

.not-ranked { margin: 8px 22px 0; font-size: 12.5px; }

.list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
.row {
  display: grid;
  grid-template-columns: 34px 26px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel2);
  border: 1px solid transparent;
}
.row:nth-child(-n + 3) .rk { color: var(--gold); }
.me-row {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 12px var(--accent-soft);
}
.rk { font-weight: 800; font-size: 13.5px; color: var(--text-mute); text-align: right; }
.flag { font-size: 16px; text-align: center; }
.who { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.who b { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.src { font-size: 11px; font-weight: 600; }
.worth { font-weight: 750; font-size: 13.5px; }

.note { font-size: 11px; margin-top: 12px; text-align: center; }
</style>
