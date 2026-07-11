<script setup lang="ts">
import { computed } from 'vue'
import { fmtNum, fmtUsd, t } from '../i18n'
import { COINS, coinDecimals } from '../data/coins'
import { game, selectCoin, toast } from '../stores/game'
import type { CoinDef } from '../types'
import Sparkline from './Sparkline.vue'

const emit = defineEmits<{ close: [] }>()

const s = computed(() => game.state!)

function change30(c: CoinDef): number {
  const h = s.value.coinHistory[c.id]
  if (h.length < 2) return 0
  const prev = h[Math.max(0, h.length - 31)]
  return ((h[h.length - 1] - prev) / prev) * 100
}

function pick(c: CoinDef) {
  selectCoin(c.id)
  toast(`⛏️ ${c.name}`)
  emit('close')
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal coins">
      <div class="modal-head">
        <h2>🪙 {{ t('selectCoin') }}</h2>
        <button class="btn btn-icon" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <ul class="coin-list">
          <li v-for="c in COINS" :key="c.id" class="coin-row" :class="{ active: c.id === s.coinId }">
            <span class="coin-dot" :style="{ background: c.color }">{{ c.symbol.slice(0, 1) }}</span>
            <div class="cname">
              <b>{{ c.name }}</b>
              <span class="mute">{{ c.symbol }}</span>
            </div>
            <Sparkline
              :data="s.coinHistory[c.id].slice(-30)"
              :trend="change30(c) >= 0 ? 'up' : 'down'"
            />
            <div class="cprice num">
              <b>{{ fmtUsd(s.coinPrices[c.id], coinDecimals(s.coinPrices[c.id]) > 4 ? 4 : coinDecimals(s.coinPrices[c.id])) }}</b>
              <span :class="change30(c) >= 0 ? 'up-text' : 'down-text'">
                {{ change30(c) >= 0 ? '▲' : '▼' }} {{ fmtNum(Math.abs(change30(c)), 1) }}%
              </span>
            </div>
            <button
              class="btn btn-sm"
              :class="c.id === s.coinId ? 'btn-primary' : ''"
              :disabled="c.id === s.coinId"
              @click="pick(c)"
            >{{ c.id === s.coinId ? '⛏️ ' + t('mining') : t('mineThis') }}</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coins { width: min(640px, calc(100vw - 40px)); }

.coin-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.coin-row {
  display: grid;
  grid-template-columns: 34px minmax(110px, 1fr) 96px 110px auto;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  background: var(--panel2);
}
.coin-row.active { border-color: var(--accent-border); background: var(--accent-soft); }

.coin-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}
.cname { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.cname b { font-size: 14.5px; }
.cname .mute { font-size: 12px; font-weight: 600; }
.cprice { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.35; font-size: 13.5px; font-weight: 700; }
.cprice span { font-size: 12px; font-weight: 700; }

@media (max-width: 560px) {
  .coin-row { grid-template-columns: 34px 1fr auto; }
  .coin-row :deep(.spark), .cprice { display: none; }
}
</style>
