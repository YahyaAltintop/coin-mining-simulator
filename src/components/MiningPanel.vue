<script setup lang="ts">
import { computed } from 'vue'
import { fmtNum, fmtUsd, t } from '../i18n'
import { coinById, coinDecimals } from '../data/coins'
import { game, rigStats } from '../stores/game'
import PriceChart from './PriceChart.vue'

const emit = defineEmits<{ openCoins: [] }>()

const s = computed(() => game.state!)
const coin = computed(() => coinById(s.value.coinId))
const price = computed(() => s.value.coinPrices[s.value.coinId])
const history = computed(() => s.value.coinHistory[s.value.coinId])

const change = computed(() => {
  const h = history.value
  if (h.length < 2) return 0
  const prev = h[Math.max(0, h.length - 31)]
  return ((h[h.length - 1] - prev) / prev) * 100
})

function fmtCoin(v: number): string {
  return fmtNum(v, coinDecimals(price.value))
}
</script>

<template>
  <aside class="mining-panel">
    <!-- selected coin -->
    <section class="panel block">
      <div class="panel-title">{{ t('selectedCoin') }}</div>
      <div class="coin-head">
        <span class="coin-dot" :style="{ background: coin.color }">{{ coin.symbol.slice(0, 1) }}</span>
        <div class="coin-name">
          <b>{{ coin.name }}</b>
          <span class="mute">{{ coin.symbol }}</span>
        </div>
        <button class="btn btn-sm" @click="emit('openCoins')">⇄</button>
      </div>
      <div class="price-row">
        <span class="price num">{{ fmtUsd(price, coinDecimals(price) > 4 ? 4 : coinDecimals(price)) }}</span>
        <span class="chip num" :class="change >= 0 ? 'up' : 'down'">
          {{ change >= 0 ? '▲' : '▼' }} {{ fmtNum(Math.abs(change), 1) }}%
        </span>
      </div>
      <div class="mute tiny">{{ t('change30') }}</div>
      <PriceChart :data="history" :last-day="s.day + 1" />
    </section>

    <!-- live rig stats -->
    <section class="panel block">
      <div class="panel-title">📊 {{ t('dailyNet') }}</div>
      <dl class="stats">
        <div><dt>{{ t('totalHashrate') }}</dt><dd class="num">{{ fmtNum(rigStats.hashrate, 1) }} MH/s</dd></div>
        <div><dt>{{ t('powerDraw') }}</dt><dd class="num">{{ fmtNum(rigStats.watts, 0) }} W</dd></div>
        <div><dt>{{ t('dailyGross') }}</dt><dd class="num up-text">+{{ fmtUsd(rigStats.grossUsd) }}</dd></div>
        <div><dt>{{ t('dailyElectric') }}</dt><dd class="num down-text">−{{ fmtUsd(rigStats.elecUsd) }}</dd></div>
        <div class="net">
          <dt>{{ t('dailyNet') }}</dt>
          <dd class="num" :class="rigStats.netUsd >= 0 ? 'up-text' : 'down-text'">
            {{ rigStats.netUsd >= 0 ? '+' : '−' }}{{ fmtUsd(Math.abs(rigStats.netUsd)) }}{{ t('perDay') }}
          </dd>
        </div>
      </dl>
      <p v-if="rigStats.hashrate > 0 && rigStats.netUsd < 0" class="warn-note">⚠️ {{ t('profitWarning') }}</p>
    </section>

    <!-- lifetime totals -->
    <section class="panel block">
      <div class="panel-title">🧾 {{ t('totalEarned') }}</div>
      <dl class="stats">
        <div><dt>{{ t('minedToday') }}</dt><dd class="num">{{ fmtCoin(s.lastReport.minedCoins) }} {{ coin.symbol }}</dd></div>
        <div><dt>{{ t('totalMined') }}</dt><dd class="num">{{ fmtCoin(s.minedTotal[s.coinId]) }} {{ coin.symbol }}</dd></div>
        <div v-if="(s.wallet[s.coinId] ?? 0) > 0">
          <dt>👛 {{ t('inWallet') }}</dt>
          <dd class="num">{{ fmtCoin(s.wallet[s.coinId]) }} {{ coin.symbol }}</dd>
        </div>
        <div><dt>{{ t('totalEarned') }}</dt><dd class="num up-text">{{ fmtUsd(s.totalEarnedUsd) }}</dd></div>
        <div><dt>{{ t('totalElectric') }}</dt><dd class="num down-text">{{ fmtUsd(s.totalElectricityUsd) }}</dd></div>
      </dl>
    </section>
  </aside>
</template>

<style scoped>
.mining-panel {
  grid-area: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  background: var(--bg2);
}
.block { padding: 14px; }

.coin-head { display: flex; align-items: center; gap: 10px; }
.coin-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  flex-shrink: 0;
}
.coin-name { display: flex; flex-direction: column; line-height: 1.25; flex: 1; min-width: 0; }
.coin-name b { font-size: 15px; }
.coin-name .mute { font-size: 12px; font-weight: 600; }

.price-row { display: flex; align-items: baseline; gap: 8px; margin-top: 10px; }
.price { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
.tiny { font-size: 11.5px; margin: 2px 0 8px; }

.stats { display: flex; flex-direction: column; gap: 8px; }
.stats > div { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.stats dt { color: var(--text-dim); font-size: 13.5px; }
.stats dd { font-weight: 750; font-size: 14.5px; }
.stats .net { border-top: 1px solid var(--border-soft); padding-top: 8px; margin-top: 2px; }
.stats .net dt { font-weight: 700; color: var(--text); }
.stats .net dd { font-size: 17px; font-weight: 800; }

.warn-note {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--warn);
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--warn) 30%, transparent);
  border-radius: var(--radius-sm);
  padding: 7px 9px;
  line-height: 1.45;
}
</style>
