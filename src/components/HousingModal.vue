<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtUsd, t } from '../i18n'
import { HOUSING_TIERS } from '../data/housing'
import { buyBuilding, game, toast } from '../stores/game'
import type { HousingTier } from '../types'
import ModalConfirm from './ModalConfirm.vue'

const emit = defineEmits<{ close: [] }>()

const s = computed(() => game.state!)
const pending = ref<HousingTier | null>(null)

function ownedCount(tierId: string): number {
  return s.value.buildings.filter(b => b.tierId === tierId).length
}

function confirmBuy() {
  const tier = pending.value
  pending.value = null
  if (tier && buyBuilding(tier.id)) {
    toast(`${tier.icon} ${t(`housing.${tier.id}` as never)} ✓`)
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal housing">
      <div class="modal-head">
        <h2>🏘️ {{ t('housingTitle') }}</h2>
        <div class="head-chips">
          <span class="chip num">💵 {{ fmtUsd(s.balance, 0) }}</span>
          <button class="btn btn-icon" @click="emit('close')">✕</button>
        </div>
      </div>
      <div class="modal-body">
        <p class="mute note">{{ t('housingNote') }}</p>
        <div class="tiers">
          <div v-for="h in HOUSING_TIERS" :key="h.id" class="panel tier">
            <span v-if="ownedCount(h.id)" class="chip owned-chip num">{{ ownedCount(h.id) }} {{ t('owned') }}</span>
            <div class="icon">{{ h.icon }}</div>
            <b class="tname">{{ t(`housing.${h.id}` as never) }}</b>
            <div class="specs">
              <span class="num">🎴 {{ h.slots }} {{ t('slots') }}</span>
              <span class="num">⚡ {{ h.kwhPrice.toFixed(3) }} $/kWh</span>
            </div>
            <div class="price num">{{ fmtUsd(h.price, 0) }}</div>
            <button
              class="btn btn-primary btn-sm"
              :disabled="s.balance < h.price"
              :title="s.balance < h.price ? t('notEnoughMoney') : ''"
              @click="pending = h"
            >{{ t('buy') }}</button>
          </div>
        </div>
      </div>
    </div>

    <ModalConfirm
      v-if="pending"
      :title="`${pending.icon} ${t('addBuilding')}`"
      :message="t('buildConfirm', { name: t(`housing.${pending.id}` as never), price: fmtUsd(pending.price, 0) })"
      :confirm-text="t('buy')"
      @confirm="confirmBuy"
      @cancel="pending = null"
    />
  </div>
</template>

<style scoped>
.housing { width: min(780px, calc(100vw - 40px)); }
.head-chips { display: flex; align-items: center; gap: 8px; }
.note { font-size: 12.5px; margin-bottom: 14px; }

.tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.tier {
  position: relative;
  padding: 18px 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  background: var(--panel2);
}
.owned-chip {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10.5px;
  padding: 1px 8px;
  color: var(--accent-strong);
  border-color: var(--accent-border);
  background: var(--accent-soft);
}

.icon { font-size: 40px; }
.tname { font-size: 15px; }
.specs { display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; font-weight: 600; color: var(--text-dim); }
.price { font-size: 17px; font-weight: 800; color: var(--gold); }
</style>
