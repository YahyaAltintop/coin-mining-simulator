<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtLife, fmtNum, fmtUsd, t } from '../i18n'
import { housingById } from '../data/housing'
import {
  beginEdit,
  buildingOrdinal,
  freeSlotsIn,
  game,
  gpuEconomics,
  gpusIn,
  sellAllDead,
  sellGpu,
  setGpuPower,
  toast,
  totals,
} from '../stores/game'
import type { OwnedBuilding, OwnedGpu } from '../types'
import ModalConfirm from './ModalConfirm.vue'

const emit = defineEmits<{ openMarket: [buildingUid?: string]; openHousing: [] }>()

const s = computed(() => game.state!)
const pendingSell = ref<OwnedGpu | null>(null)
const askSellDead = ref(false)

const deadInfo = computed(() => {
  const dead = s.value.gpus.filter(g => g.condition <= 0)
  return { count: dead.length, total: dead.reduce((acc, g) => acc + gpuEconomics(g).sellValue, 0) }
})

function openSellDead() {
  if (game.running) beginEdit()
  askSellDead.value = true
}

function confirmSellDead() {
  askSellDead.value = false
  const { count, total } = sellAllDead()
  if (count > 0) toast(`💀→💰 ${count} × ${fmtUsd(total)}`)
}

function nameOf(b: OwnedBuilding): string {
  const n = buildingOrdinal(b)
  return t(`housing.${b.tierId}` as never) + (n ? ` ${n}` : '')
}

function onSliderDown() {
  // Touching the rig stops the day counter until the player resumes.
  if (game.running) beginEdit()
}

function askSell(g: OwnedGpu) {
  if (game.running) beginEdit()
  pendingSell.value = g
}

function confirmSell() {
  const g = pendingSell.value
  pendingSell.value = null
  if (!g) return
  const eco = gpuEconomics(g)
  const value = sellGpu(g.uid)
  toast(`💰 ${eco.model.name} → ${fmtUsd(value)}`)
}
</script>

<template>
  <aside class="rig-panel">
    <section class="panel block head-block">
      <div class="panel-title">🖥️ {{ t('myRig') }}</div>
      <div class="head-row">
        <span class="chip num">🏘️ {{ totals.buildings }}</span>
        <span class="chip num">{{ totals.used }} / {{ totals.slots }} {{ t('slots') }}</span>
        <div class="spacer"></div>
        <button class="btn btn-primary btn-sm" @click="emit('openHousing')">🏘️ {{ t('addBuilding') }}</button>
      </div>
      <button v-if="deadInfo.count > 0" class="btn btn-danger btn-sm sell-dead" @click="openSellDead">
        💀 {{ t('sellDead') }} ({{ deadInfo.count }}) · {{ fmtUsd(deadInfo.total, 0) }}
      </button>
    </section>

    <div class="gpu-list">
      <template v-for="b in s.buildings" :key="b.uid">
        <!-- facility header -->
        <div class="bhead">
          <span class="bicon">{{ housingById(b.tierId).icon }}</span>
          <b>{{ nameOf(b) }}</b>
          <span class="chip num mini-chip">{{ gpusIn(b.uid).length }}/{{ housingById(b.tierId).slots }}</span>
          <span class="mute tiny num">⚡ {{ housingById(b.tierId).kwhPrice.toFixed(3) }} $/kWh</span>
          <div class="spacer"></div>
          <button
            v-if="freeSlotsIn(b) > 0"
            class="btn btn-sm"
            :title="t('addGpu')"
            @click="emit('openMarket', b.uid)"
          >🛒 ＋</button>
        </div>

        <section v-for="g in gpusIn(b.uid)" :key="g.uid" class="panel gpu-row" :class="{ dead: g.condition <= 0 }">
          <div class="row1">
            <b class="gname">{{ gpuEconomics(g).model.name }}</b>
            <span v-if="g.condition <= 0" class="chip down">💀 {{ t('dead') }}</span>
            <span v-else class="chip num" :class="gpuEconomics(g).netUsd >= 0 ? 'up' : 'down'">
              {{ gpuEconomics(g).netUsd >= 0 ? '+' : '−' }}{{ fmtUsd(Math.abs(gpuEconomics(g).netUsd)) }}{{ t('perDay') }}
            </span>
          </div>

          <!-- condition -->
          <div class="cond-row">
            <span class="lbl">{{ t('condition') }}</span>
            <div class="bar">
              <div
                class="fill"
                :style="{
                  width: `${Math.max(g.condition, 0)}%`,
                  background: g.condition > 55 ? 'var(--up)' : g.condition > 25 ? 'var(--warn)' : 'var(--down)',
                }"
              ></div>
            </div>
            <span class="num val">{{ fmtNum(g.condition, 0) }}%</span>
          </div>

          <!-- power slider -->
          <div class="cond-row">
            <span class="lbl">{{ t('powerLevel') }}</span>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              :value="g.power"
              :disabled="g.condition <= 0"
              :style="{ '--fill': `${((g.power - 10) / 90) * 100}%` }"
              @pointerdown="onSliderDown"
              @input="setGpuPower(g.uid, Number(($event.target as HTMLInputElement).value))"
            />
            <span class="num val">{{ g.power }}%</span>
          </div>

          <div class="row3">
            <span v-if="g.condition > 0" class="mute tiny num">
              ⏳ {{ t('estLife') }}: {{ fmtLife(gpuEconomics(g).remainingDays) }}
            </span>
            <span v-else class="mute tiny">{{ t('deadGpuNote') }}</span>
            <div class="spacer"></div>
            <button class="btn btn-sm btn-danger" @click="askSell(g)">
              {{ t('sellFor', { price: fmtUsd(gpuEconomics(g).sellValue, 0) }) }}
            </button>
          </div>
        </section>

        <button v-if="freeSlotsIn(b) > 0" class="add-tile" @click="emit('openMarket', b.uid)">
          ＋ {{ t('addGpu') }} · {{ nameOf(b) }}
        </button>
      </template>

      <div v-if="totals.used >= totals.slots" class="full-note">
        <span class="mute tiny">{{ t('noSlotLeft') }}</span>
        <button class="btn btn-primary btn-sm" @click="emit('openHousing')">🏘️ {{ t('addBuilding') }}</button>
      </div>
    </div>

    <ModalConfirm
      v-if="askSellDead"
      :title="`💀 ${t('sellDead')}`"
      :message="t('sellDeadConfirm', { count: deadInfo.count, total: fmtUsd(deadInfo.total) })"
      :confirm-text="t('sell')"
      @confirm="confirmSellDead"
      @cancel="askSellDead = false"
    />

    <ModalConfirm
      v-if="pendingSell"
      :title="`💰 ${t('sell')}: ${gpuEconomics(pendingSell).model.name}`"
      :message="t('sellConfirm', {
        name: gpuEconomics(pendingSell).model.name,
        price: fmtUsd(gpuEconomics(pendingSell).sellValue),
      })"
      :confirm-text="t('sell')"
      @confirm="confirmSell"
      @cancel="pendingSell = null"
    />
  </aside>
</template>

<style scoped>
.rig-panel {
  grid-area: right;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  overflow: hidden;
  border-left: 1px solid var(--border);
  background: var(--bg2);
}
.block { padding: 12px 14px; }
.head-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sell-dead { width: 100%; margin-top: 9px; }

.gpu-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-bottom: 4px; }

.bhead {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px 0;
  font-size: 14px;
}
.bicon { font-size: 18px; }
.mini-chip { font-size: 11px; padding: 1px 8px; }
.bhead .tiny { font-size: 11.5px; }

.gpu-row { padding: 11px 12px; display: flex; flex-direction: column; gap: 8px; }
.gpu-row.dead { opacity: 0.75; }
.row1 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.gname { font-size: 15px; font-weight: 750; }

.cond-row { display: flex; align-items: center; gap: 8px; }
.lbl { font-size: 12.5px; font-weight: 600; color: var(--text-dim); width: 72px; flex-shrink: 0; }
.bar { flex: 1; height: 6px; border-radius: 6px; background: var(--border); overflow: hidden; }
.fill { height: 100%; border-radius: 6px; transition: width 0.3s; }
.val { font-size: 12.5px; font-weight: 750; width: 40px; text-align: right; flex-shrink: 0; }
.cond-row input[type='range'] { flex: 1; }

.row3 { display: flex; align-items: center; gap: 8px; }
.tiny { font-size: 12px; }

.add-tile {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-mute);
  font: 600 13px var(--font);
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.add-tile:hover { border-color: var(--accent); color: var(--accent-strong); }

.full-note {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  text-align: center;
}
</style>
