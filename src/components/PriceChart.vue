<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtUsd, localeTag, t } from '../i18n'
import { coinDecimals } from '../data/coins'

const props = defineProps<{
  data: number[]
  /** in-game day number of the last data point */
  lastDay: number
}>()

const W = 272
const H = 96
const PAD = { l: 4, r: 4, t: 6, b: 4 }

const hoverIdx = ref<number | null>(null)

const scale = computed(() => {
  const d = props.data
  const min = Math.min(...d)
  const max = Math.max(...d)
  const span = max - min || min * 0.02 || 1
  const x = (i: number) => PAD.l + (i / Math.max(d.length - 1, 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - min) / span)
  return { min, max, x, y }
})

const linePoints = computed(() =>
  props.data.map((v, i) => `${scale.value.x(i).toFixed(1)},${scale.value.y(v).toFixed(1)}`).join(' '),
)

const areaPoints = computed(
  () => `${PAD.l},${H - PAD.b} ${linePoints.value} ${scale.value.x(props.data.length - 1).toFixed(1)},${H - PAD.b}`,
)

function fmtPrice(v: number): string {
  return fmtUsd(v, coinDecimals(v) > 4 ? 4 : coinDecimals(v))
}

function onMove(e: MouseEvent) {
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const frac = (e.clientX - rect.left) / rect.width
  const i = Math.round(frac * (props.data.length - 1))
  hoverIdx.value = Math.min(Math.max(i, 0), props.data.length - 1)
}

const hover = computed(() => {
  if (hoverIdx.value == null || props.data.length < 2) return null
  const i = hoverIdx.value
  const day = props.lastDay - (props.data.length - 1 - i)
  return { i, x: scale.value.x(i), y: scale.value.y(props.data[i]), v: props.data[i], day }
})
</script>

<template>
  <div class="chart-wrap">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="chart"
      role="img"
      @mousemove="onMove"
      @mouseleave="hoverIdx = null"
    >
      <!-- recessive horizontal grid -->
      <line v-for="f in [0.25, 0.5, 0.75]" :key="f" :x1="PAD.l" :x2="W - PAD.r"
        :y1="PAD.t + (H - PAD.t - PAD.b) * f" :y2="PAD.t + (H - PAD.t - PAD.b) * f" class="grid" />
      <polygon :points="areaPoints" class="area" />
      <polyline :points="linePoints" class="line" fill="none" />
      <template v-if="hover">
        <line :x1="hover.x" :x2="hover.x" :y1="PAD.t" :y2="H - PAD.b" class="crosshair" />
        <circle :cx="hover.x" :cy="hover.y" r="3.5" class="dot" />
      </template>
    </svg>
    <div v-if="hover" class="tooltip num" :style="{ left: `${(hover.x / W) * 100}%` }">
      <span class="mute">{{ t('day') }} {{ hover.day.toLocaleString(localeTag) }}</span>
      <b>{{ fmtPrice(hover.v) }}</b>
    </div>
    <div class="range num">
      <span>{{ fmtPrice(scale.max) }}</span>
      <span>{{ fmtPrice(scale.min) }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap { position: relative; }
.chart { display: block; width: 100%; height: auto; cursor: crosshair; }
.grid { stroke: var(--border-soft); stroke-width: 1; }
.line { stroke: var(--chart-line); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
.area { fill: var(--chart-line); opacity: 0.12; }
.crosshair { stroke: var(--text-mute); stroke-width: 1; stroke-dasharray: 3 3; }
.dot { fill: var(--chart-line); stroke: var(--panel); stroke-width: 2; }
.tooltip {
  position: absolute;
  top: -6px;
  transform: translateX(-50%);
  background: var(--panel3);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  display: flex;
  gap: 6px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
}
.range {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 9.5px;
  color: var(--text-mute);
  pointer-events: none;
  padding: 1px 2px;
}
</style>
