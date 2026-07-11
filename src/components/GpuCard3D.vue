<script setup lang="ts">
import { computed } from 'vue'
import type { GpuModel } from '../types'

const props = withDefaults(defineProps<{
  model: GpuModel
  power: number
  condition: number
  running: boolean
  size?: 'md' | 'sm'
  /** hide condition bar (e.g. market preview) */
  bare?: boolean
}>(), { size: 'md', bare: false })

const dead = computed(() => props.condition <= 0)
const spinning = computed(() => props.running && !dead.value)
/** Fan spin duration: 100% power → 0.5s, 10% → ~2.9s */
const fanDur = computed(() => (3.2 - 2.7 * (props.power / 100)).toFixed(2) + 's')

const fanCenters = computed(() => (props.model.fans === 3 ? [46, 118, 190] : [72, 164]))
const fanR = computed(() => (props.model.fans === 3 ? 30 : 33))

const brandColor = computed(() => (props.model.brand === 'NVIDIA' ? '#76b900' : '#ed1c24'))

const condColor = computed(() => {
  if (props.condition > 55) return 'var(--up)'
  if (props.condition > 25) return 'var(--warn)'
  return 'var(--down)'
})

/** 9 curved fan blades as SVG paths rotated around the hub */
const bladeAngles = Array.from({ length: 9 }, (_, i) => i * 40)
</script>

<template>
  <div class="gpu3d" :class="[size, { dead, spinning }]" :style="{ '--fan-dur': fanDur, '--cond-color': condColor }">
    <div class="card">
      <svg :viewBox="`0 0 236 104`" class="gpu-svg" aria-hidden="true">
        <defs>
          <linearGradient id="shroud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#343a46" />
            <stop offset="0.12" stop-color="#272c36" />
            <stop offset="0.6" stop-color="#191d25" />
            <stop offset="1" stop-color="#10131a" />
          </linearGradient>
          <linearGradient id="bracket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#8d97a8" />
            <stop offset="0.5" stop-color="#5c6673" />
            <stop offset="1" stop-color="#3f4854" />
          </linearGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#e0b64f" />
            <stop offset="1" stop-color="#8f6f1d" />
          </linearGradient>
          <linearGradient id="blade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6d7684" />
            <stop offset="1" stop-color="#343c47" />
          </linearGradient>
          <radialGradient id="recess" cx="0.38" cy="0.34" r="0.75">
            <stop offset="0" stop-color="#1f242e" />
            <stop offset="0.8" stop-color="#0a0d12" />
            <stop offset="1" stop-color="#05070a" />
          </radialGradient>
          <radialGradient id="hub" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stop-color="#5a6475" />
            <stop offset="0.55" stop-color="#333b48" />
            <stop offset="1" stop-color="#1c212b" />
          </radialGradient>
        </defs>

        <!-- PCB under the shroud -->
        <rect x="8" y="76" width="222" height="12" rx="2" fill="#123321" />
        <rect x="8" y="76" width="222" height="3" fill="#1c4a30" />
        <!-- SMD chips on PCB -->
        <rect x="26" y="80" width="7" height="5" rx="1" fill="#0a1f14" />
        <rect x="48" y="80" width="10" height="5" rx="1" fill="#0a1f14" />
        <rect x="196" y="80" width="8" height="5" rx="1" fill="#0a1f14" />
        <!-- gold PCIe fingers -->
        <rect x="34" y="88" width="150" height="8" rx="1.5" fill="url(#gold)" />
        <rect x="118" y="88" width="7" height="8" fill="#10131a" />
        <g fill="#8f6f1d" opacity="0.55">
          <rect v-for="i in 17" :key="i" :x="37 + (i - 1) * 8.6" y="89" width="1.4" height="6" />
        </g>

        <!-- IO bracket (left) -->
        <rect x="0" y="8" width="9" height="80" rx="2.5" fill="url(#bracket)" />
        <rect x="2.5" y="18" width="4" height="16" rx="2" fill="#232a33" />
        <rect x="2.5" y="40" width="4" height="16" rx="2" fill="#232a33" />
        <rect x="2.5" y="62" width="4" height="10" rx="2" fill="#232a33" />

        <!-- 8-pin power connector (top right) -->
        <rect x="180" y="1" width="34" height="9" rx="2" fill="#0b0d11" />
        <g fill="#1e232c">
          <rect v-for="i in 4" :key="i" :x="183 + (i - 1) * 8" y="3" width="5" height="5" rx="1" />
        </g>

        <!-- shroud -->
        <rect x="10" y="6" width="222" height="72" rx="9" fill="url(#shroud)" stroke="#3d4654" stroke-width="1" />
        <!-- top edge highlight -->
        <rect x="14" y="8" width="214" height="2.5" rx="1.25" fill="#ffffff" opacity="0.07" />
        <!-- angular accent cuts -->
        <path d="M10 26 L34 6 L10 6 Z" fill="#ffffff" opacity="0.045" />
        <path d="M232 58 L208 78 L232 78 Z" fill="#ffffff" opacity="0.045" />
        <!-- brand accent line along bottom of shroud -->
        <rect x="16" y="71" width="204" height="2.5" rx="1.25" :fill="brandColor" opacity="0.85" />

        <!-- screws -->
        <g fill="#5a6472" opacity="0.7">
          <circle cx="17" cy="13" r="1.8" />
          <circle cx="225" cy="13" r="1.8" />
          <circle cx="17" cy="70" r="1.8" />
          <circle cx="225" cy="70" r="1.8" />
        </g>

        <!-- fans -->
        <g v-for="(cx, fi) in fanCenters" :key="fi">
          <circle :cx="cx" cy="42" :r="fanR + 2.5" fill="#232935" />
          <circle :cx="cx" cy="42" :r="fanR" fill="url(#recess)" stroke="#3c4552" stroke-width="1.5" />
          <g class="blades" :style="{ animationDelay: `${fi * -0.13}s` }">
            <g :transform="`translate(${cx} 42)`">
              <path
                v-for="a in bladeAngles"
                :key="a"
                :d="`M 0 ${-fanR + 3.5} C 7 ${-fanR + 11} 8.5 -9 3 -3.2 L -2.5 -3.2 C -5 -12 -5.5 ${-fanR + 12} 0 ${-fanR + 3.5} Z`"
                fill="url(#blade)"
                stroke="#171b22"
                stroke-width="0.5"
                :transform="`rotate(${a})`"
              />
            </g>
          </g>
          <circle :cx="cx" cy="42" r="9.5" fill="url(#hub)" stroke="#454f5e" stroke-width="1" />
          <circle :cx="cx" cy="42" r="3" :fill="brandColor" opacity="0.9" />
          <circle v-if="spinning" :cx="cx" cy="42" :r="fanR + 1" class="fan-glow" fill="none" />
        </g>

        <!-- brand + model text -->
        <text x="121" y="99.5" text-anchor="middle" class="pcb-label">{{ model.brand }} · {{ model.name }}</text>
      </svg>

      <!-- animated RGB strip overlaid along the shroud top -->
      <div class="rgb" :class="{ on: spinning }"></div>

      <div v-if="dead" class="dead-badge">💀</div>
    </div>

    <div v-if="!bare" class="cond-track"><div class="cond-fill" :style="{ width: `${Math.max(condition, 0)}%` }"></div></div>
  </div>
</template>

<style scoped>
.gpu3d {
  --w: 188px;
  width: var(--w);
  perspective: 800px;
  user-select: none;
}
.gpu3d.sm { --w: 148px; }

.card {
  position: relative;
  transform: rotateX(9deg) rotateY(-8deg);
  transform-style: preserve-3d;
  transition: transform 0.25s;
}
.gpu3d:hover .card { transform: rotateX(5deg) rotateY(-3deg); }

.gpu-svg {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.45));
}
.spinning .gpu-svg {
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.45)) drop-shadow(0 0 18px var(--accent-soft));
}

.blades {
  transform-box: fill-box;
  transform-origin: center;
}
.spinning .blades { animation: fanSpin var(--fan-dur) linear infinite; }
@keyframes fanSpin { to { transform: rotate(360deg); } }

.fan-glow {
  stroke: var(--accent);
  stroke-width: 1.5;
  opacity: 0.5;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.6; } }

.pcb-label {
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  fill: #94a3b8;
  text-transform: uppercase;
}

.rgb {
  position: absolute;
  left: 7%;
  right: 4%;
  top: 4.5%;
  height: 2.5px;
  border-radius: 3px;
  background: transparent;
  pointer-events: none;
}
.rgb.on {
  background: linear-gradient(90deg, #22d3ee, #818cf8, #f472b6, #22d3ee);
  background-size: 220% 100%;
  animation: rgbFlow 3.2s linear infinite;
  box-shadow: 0 0 6px rgba(129, 140, 248, 0.65);
}
@keyframes rgbFlow { to { background-position: 220% 0; } }

.dead .gpu-svg { filter: grayscale(1) brightness(0.6) drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5)); }
.dead-badge {
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8));
}

.cond-track {
  height: 4.5px;
  border-radius: 4px;
  background: var(--border);
  margin: 8px 10px 0;
  overflow: hidden;
}
.cond-fill { height: 100%; border-radius: 4px; background: var(--cond-color); transition: width 0.3s; }
</style>
