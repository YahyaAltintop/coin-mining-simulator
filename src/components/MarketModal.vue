<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fmtNum, fmtUsd, t } from '../i18n'
import { GPU_MODELS } from '../data/gpus'
import { housingById } from '../data/housing'
import { buildingOrdinal, buyGpu, freeSlotsIn, game, toast } from '../stores/game'
import type { GpuModel, OwnedBuilding } from '../types'
import GpuCard3D from './GpuCard3D.vue'

const props = defineProps<{ targetBuilding?: string | null }>()
const emit = defineEmits<{ close: [] }>()

const s = computed(() => game.state!)

function nameOf(b: OwnedBuilding): string {
  const n = buildingOrdinal(b)
  return t(`housing.${b.tierId}` as never) + (n ? ` ${n}` : '')
}

const targetUid = ref<string>('')

function pickDefaultTarget() {
  const wanted = props.targetBuilding ? s.value.buildings.find(b => b.uid === props.targetBuilding) : undefined
  const fallback = s.value.buildings.find(b => freeSlotsIn(b) > 0) ?? s.value.buildings[0]
  targetUid.value = (wanted ?? fallback).uid
}
pickDefaultTarget()
watch(() => props.targetBuilding, pickDefaultTarget)

const target = computed(() => s.value.buildings.find(b => b.uid === targetUid.value))
const targetFree = computed(() => (target.value ? freeSlotsIn(target.value) : 0))

const sorted = computed(() => [...GPU_MODELS].sort((a, b) => s.value.gpuPrices[a.id] - s.value.gpuPrices[b.id]))

function ownedCount(id: string): number {
  return s.value.gpus.filter(g => g.modelId === id).length
}

function priceTrend(m: GpuModel): number {
  return ((s.value.gpuPrices[m.id] - m.basePrice) / m.basePrice) * 100
}

function buy(m: GpuModel) {
  if (buyGpu(m.id, targetUid.value)) {
    const b = target.value
    toast(`🛒 ${m.name} → ${b ? nameOf(b) : ''} ✓`)
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal market">
      <div class="modal-head">
        <h2>🛒 {{ t('gpuMarket') }}</h2>
        <div class="head-chips">
          <label class="target num">
            <span class="mute">{{ t('targetBuilding') }}:</span>
            <select v-model="targetUid">
              <option v-for="b in s.buildings" :key="b.uid" :value="b.uid">
                {{ housingById(b.tierId).icon }} {{ nameOf(b) }} — {{ freeSlotsIn(b) }}/{{ housingById(b.tierId).slots }}
              </option>
            </select>
          </label>
          <span class="chip num">💵 {{ fmtUsd(s.balance, 0) }}</span>
          <span class="chip num" :class="{ down: targetFree === 0 }">🎴 {{ targetFree }} {{ t('slots') }}</span>
          <button class="btn btn-icon" @click="emit('close')">✕</button>
        </div>
      </div>
      <div class="modal-body">
        <p v-if="targetFree === 0" class="warn-line">⚠️ {{ t('buildingFullNote') }}</p>
        <p class="mute note">{{ t('marketNote') }}</p>
        <div class="grid">
          <div v-for="m in sorted" :key="m.id" class="panel gpu-item">
            <div class="top">
              <span class="brand" :class="m.brand.toLowerCase()">{{ m.brand }}</span>
              <b>{{ m.name }}</b>
              <span v-if="ownedCount(m.id)" class="chip num owned-chip">{{ ownedCount(m.id) }} {{ t('owned') }}</span>
            </div>
            <GpuCard3D :model="m" :power="80" :condition="100" :running="false" size="sm" bare class="preview" />
            <div class="specs num">
              <span title="Hashrate">⚡ {{ m.hashrate }} MH/s</span>
              <span title="Power">🔌 {{ m.watts }} W</span>
              <span :title="t('estLife')">⏳ ~{{ fmtNum(m.lifespanDays / 365, 1) }} {{ t('years') }}</span>
            </div>
            <div class="buy-row">
              <div class="price-block">
                <span class="price num">{{ fmtUsd(s.gpuPrices[m.id], 0) }}</span>
                <span class="num trend" :class="priceTrend(m) >= 0 ? 'down-text' : 'up-text'">
                  {{ priceTrend(m) >= 0 ? '▲' : '▼' }}{{ fmtNum(Math.abs(priceTrend(m)), 1) }}%
                </span>
              </div>
              <button
                class="btn btn-primary btn-sm"
                :disabled="targetFree === 0 || s.balance < s.gpuPrices[m.id]"
                :title="s.balance < s.gpuPrices[m.id] ? t('notEnoughMoney') : ''"
                @click="buy(m)"
              >{{ t('buy') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market { width: min(880px, calc(100vw - 40px)); }
.head-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.target { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; }
.target select {
  background: var(--panel2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: 600 13px var(--font);
  padding: 6px 8px;
  outline: none;
  max-width: 220px;
}
.target select:focus { border-color: var(--accent); }

.note { font-size: 12.5px; margin-bottom: 12px; }
.warn-line {
  color: var(--warn);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 12px; }

.gpu-item { padding: 12px 13px; display: flex; flex-direction: column; gap: 9px; background: var(--panel2); }
.preview { align-self: center; pointer-events: none; margin: 2px 0; }
.top { display: flex; align-items: center; gap: 7px; font-size: 14.5px; flex-wrap: wrap; }
.brand {
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  padding: 2px 5px;
  border-radius: 4px;
  color: #0c101c;
}
.brand.nvidia { background: #76b900; }
.brand.amd { background: #ed1c24; color: #fff; }
.owned-chip { margin-left: auto; font-size: 10.5px; padding: 1px 8px; }

.specs { display: flex; gap: 10px; font-size: 12.5px; font-weight: 600; color: var(--text-dim); flex-wrap: wrap; }

.buy-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 2px; }
.price-block { display: flex; align-items: baseline; gap: 6px; }
.price { font-size: 17px; font-weight: 800; color: var(--gold); }
.trend { font-size: 11.5px; font-weight: 700; }
</style>
