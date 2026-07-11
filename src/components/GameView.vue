<script setup lang="ts">
import { ref, watch } from 'vue'
import { t } from '../i18n'
import { beginEdit, endEdit, exitToMenu, game, restartGame } from '../stores/game'
import BottomBar from './BottomBar.vue'
import CoinModal from './CoinModal.vue'
import HousingModal from './HousingModal.vue'
import MarketModal from './MarketModal.vue'
import MiningPanel from './MiningPanel.vue'
import RigPanel from './RigPanel.vue'
import StagePanel from './StagePanel.vue'
import TopBar from './TopBar.vue'

type ModalName = 'market' | 'housing' | 'coins' | null
const openModal = ref<ModalName>(null)
/** Facility the market should install new GPUs into */
const marketTarget = ref<string | null>(null)

function openMarket(buildingUid?: string) {
  marketTarget.value = buildingUid ?? null
  openModal.value = 'market'
}

// Any management modal stops the day counter; closing it resumes if it was running.
watch(openModal, (now, prev) => {
  if (now && !prev) beginEdit()
  else if (!now && prev) endEdit()
})
</script>

<template>
  <div class="game-layout">
    <TopBar />
    <MiningPanel @open-coins="openModal = 'coins'" />
    <StagePanel @open-market="openMarket" @open-housing="openModal = 'housing'" />
    <RigPanel @open-market="openMarket" @open-housing="openModal = 'housing'" />
    <BottomBar
      @open-market="openMarket()"
      @open-housing="openModal = 'housing'"
      @open-coins="openModal = 'coins'"
    />

    <MarketModal v-if="openModal === 'market'" :target-building="marketTarget" @close="openModal = null" />
    <HousingModal v-if="openModal === 'housing'" @close="openModal = null" />
    <CoinModal v-if="openModal === 'coins'" @close="openModal = null" />

    <!-- bankruptcy -->
    <div v-if="game.bankrupt" class="modal-backdrop">
      <div class="modal bankrupt">
        <div class="icon">📉</div>
        <h2>{{ t('bankruptTitle') }}</h2>
        <p class="dim">{{ t('bankruptBody') }}</p>
        <div class="actions">
          <button class="btn" @click="exitToMenu()">⏏ {{ t('mainMenu') }}</button>
          <button class="btn btn-primary" @click="restartGame()">🔄 {{ t('restart') }}</button>
        </div>
      </div>
    </div>

    <!-- toasts -->
    <div class="toasts">
      <div v-for="toast in game.toasts" :key="toast.id" class="toast">{{ toast.msg }}</div>
    </div>
  </div>
</template>

<style scoped>
.game-layout {
  height: 100%;
  display: grid;
  grid-template-areas:
    'top top top'
    'left stage right'
    'bottom bottom bottom';
  grid-template-rows: 58px 1fr 52px;
  grid-template-columns: 300px 1fr 318px;
}

@media (max-width: 1100px) {
  .game-layout { grid-template-columns: 260px 1fr 280px; }
}

.bankrupt {
  width: min(420px, calc(100vw - 40px));
  padding: 30px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.bankrupt .icon { font-size: 46px; }
.bankrupt p { line-height: 1.55; }
.bankrupt .actions { display: flex; gap: 10px; margin-top: 6px; }
</style>
