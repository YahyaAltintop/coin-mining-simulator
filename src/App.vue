<script setup lang="ts">
import ConsentModal from './components/ConsentModal.vue'
import GameView from './components/GameView.vue'
import MainMenu from './components/MainMenu.vue'
import { game } from './stores/game'
import { settings } from './stores/settings'
</script>

<template>
  <ConsentModal v-if="!settings.consent" />
  <template v-else>
    <GameView v-if="game.screen === 'game' && game.state" />
    <MainMenu v-else />
  </template>
</template>
