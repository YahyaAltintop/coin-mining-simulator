<script setup lang="ts">
import { computed } from 'vue'
import { localeTag, t } from '../i18n'
import { game } from '../stores/game'

const emit = defineEmits<{ openMarket: []; openHousing: []; openCoins: [] }>()

const savedAt = computed(() =>
  game.state ? new Date(game.state.updatedAt).toLocaleTimeString(localeTag.value) : '',
)
</script>

<template>
  <footer class="bottombar">
    <button class="btn" @click="emit('openMarket')">🛒 {{ t('market') }}</button>
    <button class="btn" @click="emit('openHousing')">🏠 {{ t('housing') }}</button>
    <button class="btn" @click="emit('openCoins')">🪙 {{ t('coins') }}</button>
    <div class="spacer"></div>
    <span class="save-note mute num">💾 {{ t('autoSaved') }} · {{ savedAt }}</span>
  </footer>
</template>

<style scoped>
.bottombar {
  grid-area: bottom;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  background: var(--panel);
  border-top: 1px solid var(--border);
}
.save-note { font-size: 12.5px; font-weight: 600; }
</style>
