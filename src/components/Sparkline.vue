<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]
  width?: number
  height?: number
  /** 'up' | 'down' — polarity of the window, colors the line */
  trend?: 'up' | 'down'
}>(), { width: 96, height: 28 })

const points = computed(() => {
  const d = props.data
  if (d.length < 2) return ''
  const min = Math.min(...d)
  const max = Math.max(...d)
  const span = max - min || 1
  const pad = 2
  const w = props.width - pad * 2
  const h = props.height - pad * 2
  return d
    .map((v, i) => {
      const x = pad + (i / (d.length - 1)) * w
      const y = pad + h - ((v - min) / span) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="spark" aria-hidden="true">
    <polyline
      :points="points"
      fill="none"
      :stroke="trend === 'down' ? 'var(--down)' : 'var(--up)'"
      stroke-width="1.75"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.spark { display: block; flex-shrink: 0; }
</style>
