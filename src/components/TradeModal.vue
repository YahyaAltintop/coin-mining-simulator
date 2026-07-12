<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtNum, fmtUsd, fmtWealth, t } from '../i18n'
import { COINS, coinDecimals } from '../data/coins'
import { buyCoin, game, sellCoin, setAutoSell, toast, TRADE_FEE, walletValue } from '../stores/game'
import type { CoinDef } from '../types'

const emit = defineEmits<{ close: [] }>()

const s = computed(() => game.state!)
const expanded = ref<string | null>(null)

function holdings(id: string): number {
  return s.value.wallet[id] ?? 0
}

function holdingsValue(id: string): number {
  return holdings(id) * s.value.coinPrices[id]
}

function change24(c: CoinDef): number {
  const h = s.value.coinHistory[c.id]
  if (h.length < 2) return 0
  const prev = h[h.length - 2]
  return ((h[h.length - 1] - prev) / prev) * 100
}

function fmtUnits(id: string, units: number): string {
  return fmtNum(units, coinDecimals(s.value.coinPrices[id]))
}

/** sorted: coins you hold first (by value), then the rest by price action */
const sorted = computed(() =>
  [...COINS].sort((a, b) => holdingsValue(b.id) - holdingsValue(a.id)),
)

function doBuy(c: CoinDef, frac: number) {
  const usd = s.value.balance * frac
  const units = buyCoin(c.id, usd)
  if (units > 0) toast(`💱 +${fmtUnits(c.id, units)} ${c.symbol}`)
}

function doSell(c: CoinDef, frac: number) {
  const units = holdings(c.id) * frac
  const usd = sellCoin(c.id, units)
  if (usd > 0) toast(`💱 ${c.symbol} → ${fmtUsd(usd)}`)
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal trade">
      <div class="modal-head">
        <h2>💱 {{ t('exchangeTitle') }}</h2>
        <div class="head-chips">
          <span class="chip num">💵 {{ t('cash') }}: {{ fmtWealth(s.balance) }}</span>
          <span class="chip num">👛 {{ t('walletLbl') }}: {{ fmtWealth(walletValue) }}</span>
          <button class="btn btn-icon" @click="emit('close')">✕</button>
        </div>
      </div>

      <!-- auto-sell toggle -->
      <div class="autosell">
        <button class="btn btn-sm" :class="{ 'btn-primary': s.autoSell }" @click="setAutoSell(!s.autoSell)">
          {{ s.autoSell ? '✅' : '⬜' }} {{ t('autoSellLbl') }}
        </button>
        <span class="hint mute">{{ t('hodlHint') }}</span>
      </div>

      <div class="modal-body">
        <ul class="coin-list">
          <li v-for="c in sorted" :key="c.id" class="coin-block" :class="{ open: expanded === c.id, held: holdings(c.id) > 0 }">
            <button class="coin-row" @click="expanded = expanded === c.id ? null : c.id">
              <span class="coin-dot" :style="{ background: c.color }">{{ c.symbol.slice(0, 1) }}</span>
              <span class="cname">
                <b>{{ c.name }}</b>
                <span class="mute sym">{{ c.symbol }}</span>
              </span>
              <span class="cprice num">
                <b>{{ fmtUsd(s.coinPrices[c.id], coinDecimals(s.coinPrices[c.id]) > 4 ? 4 : coinDecimals(s.coinPrices[c.id])) }}</b>
                <span :class="change24(c) >= 0 ? 'up-text' : 'down-text'">
                  {{ change24(c) >= 0 ? '▲' : '▼' }} {{ fmtNum(Math.abs(change24(c)), 1) }}%
                </span>
              </span>
              <span class="chold num">
                <template v-if="holdings(c.id) > 0">
                  <b>{{ fmtUnits(c.id, holdings(c.id)) }}</b>
                  <span class="mute">≈ {{ fmtWealth(holdingsValue(c.id)) }}</span>
                </template>
                <span v-else class="mute">—</span>
              </span>
              <span class="caret">{{ expanded === c.id ? '▾' : '▸' }}</span>
            </button>

            <div v-if="expanded === c.id" class="trade-panel">
              <div class="side">
                <span class="side-lbl up-text">{{ t('tradeBuy') }}</span>
                <div class="btns">
                  <button v-for="f in [0.1, 0.25, 0.5]" :key="f" class="btn btn-sm" :disabled="s.balance < 1" @click="doBuy(c, f)">
                    {{ f * 100 }}%
                  </button>
                  <button class="btn btn-sm btn-primary" :disabled="s.balance < 1" @click="doBuy(c, 1)">{{ t('maxLbl') }}</button>
                </div>
                <span class="mute tiny">{{ t('cash') }}: {{ fmtWealth(s.balance) }}</span>
              </div>
              <div class="side">
                <span class="side-lbl down-text">{{ t('sell') }}</span>
                <div class="btns">
                  <button v-for="f in [0.25, 0.5]" :key="f" class="btn btn-sm" :disabled="holdings(c.id) <= 0" @click="doSell(c, f)">
                    {{ f * 100 }}%
                  </button>
                  <button class="btn btn-sm btn-danger" :disabled="holdings(c.id) <= 0" @click="doSell(c, 1)">{{ t('allLbl') }}</button>
                </div>
                <span class="mute tiny">{{ t('inWallet') }}: {{ fmtUnits(c.id, holdings(c.id)) }} {{ c.symbol }}</span>
              </div>
            </div>
          </li>
        </ul>
        <p class="note mute">{{ t('tradeFeeNote') }} ({{ TRADE_FEE * 100 }}%)</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trade { width: min(680px, calc(100vw - 40px)); }
.head-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.autosell {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 20px 0;
  flex-wrap: wrap;
}
.autosell .hint { font-size: 11.5px; line-height: 1.4; flex: 1; min-width: 220px; }

.coin-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }

.coin-block {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  background: var(--panel2);
  overflow: hidden;
}
.coin-block.held { border-color: var(--accent-border); }
.coin-block.open { border-color: var(--accent); }

.coin-row {
  display: grid;
  grid-template-columns: 34px minmax(100px, 1fr) 120px minmax(110px, auto) 16px;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 12px;
  background: transparent;
  border: none;
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.coin-row:hover { background: var(--panel3); }

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
.cname b { font-size: 14px; }
.sym { font-size: 11.5px; font-weight: 600; }
.cprice { display: flex; flex-direction: column; line-height: 1.35; font-size: 13px; font-weight: 700; }
.cprice span { font-size: 11.5px; }
.chold { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.35; font-size: 12.5px; font-weight: 700; }
.chold .mute { font-size: 11px; font-weight: 600; }
.caret { color: var(--text-mute); font-size: 12px; }

.trade-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 14px;
  border-top: 1px solid var(--border-soft);
  background: var(--panel);
}
.side { display: flex; flex-direction: column; gap: 7px; }
.side-lbl { font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.btns { display: flex; gap: 6px; flex-wrap: wrap; }
.tiny { font-size: 11px; font-weight: 600; }

.note { font-size: 11px; margin-top: 12px; text-align: center; }

@media (max-width: 560px) {
  .coin-row { grid-template-columns: 34px 1fr auto 16px; }
  .cprice { display: none; }
  .trade-panel { grid-template-columns: 1fr; }
}
</style>
