<script setup lang="ts">
import { t } from '../i18n'

defineProps<{
  title: string
  message: string
  confirmText?: string
  danger?: boolean
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal confirm">
      <div class="modal-head"><h2>{{ title }}</h2></div>
      <div class="modal-body"><p>{{ message }}</p></div>
      <div class="modal-foot">
        <button class="btn" @click="emit('cancel')">{{ t('cancel') }}</button>
        <button class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" @click="emit('confirm')">
          {{ confirmText ?? t('confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm { width: min(440px, calc(100vw - 40px)); }
.confirm p { color: var(--text-dim); line-height: 1.55; }
</style>
