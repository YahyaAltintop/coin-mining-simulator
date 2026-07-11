<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { fmtLife, fmtNum, fmtUsd, t } from '../i18n'
import { gpuById } from '../data/gpus'
import { housingById } from '../data/housing'
import {
  buildingOrdinal,
  commitLayout,
  endEdit,
  freeSlotsIn,
  game,
  gpuEconomics,
  gpusIn,
  sellGpu,
  setBuildingPos,
  setCamera,
  setGpuPower,
  toast,
  totals,
} from '../stores/game'
import type { OwnedBuilding, OwnedGpu } from '../types'
import GpuCard3D from './GpuCard3D.vue'
import ModalConfirm from './ModalConfirm.vue'

const emit = defineEmits<{ openMarket: [buildingUid?: string]; openHousing: [] }>()

/** World size in px at zoom 1 — a wide open terrain. */
const WORLD_W = 4200
const WORLD_H = 2800
const ZOOM_MIN = 0.25
const ZOOM_MAX = 2.5

const s = computed(() => game.state!)

const stageEl = ref<HTMLElement | null>(null)
const camera = reactive({ x: 0, y: 0, zoom: 1 })

const hoverUid = ref<string | null>(null)
const selectedUid = ref<string | null>(null)
const pendingSell = ref<OwnedGpu | null>(null)

const selectedGpu = computed(() => s.value.gpus.find(g => g.uid === selectedUid.value) ?? null)

function nameOf(b: OwnedBuilding): string {
  const n = buildingOrdinal(b)
  return t(`housing.${b.tierId}` as never) + (n ? ` ${n}` : '')
}

// ---------- camera ----------

function clampPan() {
  const el = stageEl.value
  if (!el) return
  const vw = el.clientWidth
  const vh = el.clientHeight
  const m = 140 // keep at least this much world visible
  camera.x = Math.min(Math.max(camera.x, vw - WORLD_W * camera.zoom - m), m)
  camera.y = Math.min(Math.max(camera.y, vh - WORLD_H * camera.zoom - m), m)
}

/** Center the view on all facilities and zoom to fit them. */
function fitAll() {
  const el = stageEl.value
  if (!el || !game.state) return
  const bs = s.value.buildings
  const xs = bs.map(b => (b.pos.x / 100) * WORLD_W)
  const ys = bs.map(b => (b.pos.y / 100) * WORLD_H)
  const pad = 480
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad + 260 // room for spread docks on the right
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const zoom = Math.min(Math.max(Math.min(el.clientWidth / (maxX - minX), el.clientHeight / (maxY - minY)), ZOOM_MIN), 1.1)
  camera.zoom = zoom
  camera.x = el.clientWidth / 2 - ((minX + maxX) / 2) * zoom
  camera.y = el.clientHeight / 2 - ((minY + maxY) / 2) * zoom
  clampPan()
  commitCamera()
}

let camCommitTimer: number | null = null
function commitCamera() {
  setCamera({ x: camera.x, y: camera.y, zoom: camera.zoom })
  if (camCommitTimer != null) clearTimeout(camCommitTimer)
  camCommitTimer = window.setTimeout(() => commitLayout(), 450)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const el = stageEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const next = Math.min(Math.max(camera.zoom * Math.exp(-e.deltaY * 0.0012), ZOOM_MIN), ZOOM_MAX)
  const k = next / camera.zoom
  // keep the world point under the cursor fixed while zooming
  camera.x = sx - (sx - camera.x) * k
  camera.y = sy - (sy - camera.y) * k
  camera.zoom = next
  clampPan()
  commitCamera()
}

function zoomBy(factor: number) {
  const el = stageEl.value
  if (!el) return
  const sx = el.clientWidth / 2
  const sy = el.clientHeight / 2
  const next = Math.min(Math.max(camera.zoom * factor, ZOOM_MIN), ZOOM_MAX)
  const k = next / camera.zoom
  camera.x = sx - (sx - camera.x) * k
  camera.y = sy - (sy - camera.y) * k
  camera.zoom = next
  clampPan()
  commitCamera()
}

// ---------- pan & building drag ----------

interface Gesture {
  kind: 'pan' | 'building'
  uid?: string
  startX: number
  startY: number
  camX?: number
  camY?: number
  bStart?: { x: number; y: number }
}
const gesture = ref<Gesture | null>(null)

function onStageDown(e: PointerEvent) {
  if (e.button !== 0) return
  const target = e.target as HTMLElement
  // ignore drags starting on HUD, interactive world objects, or open modals —
  // capturing the pointer here would swallow their click events
  if (target.closest('.hud, .bgroup, .gpu-pop, .modal-backdrop')) return
  gesture.value = { kind: 'pan', startX: e.clientX, startY: e.clientY, camX: camera.x, camY: camera.y }
  stageEl.value?.setPointerCapture?.(e.pointerId)
}

function onBuildingDown(e: PointerEvent, b: OwnedBuilding) {
  if (e.button !== 0) return
  gesture.value = { kind: 'building', uid: b.uid, startX: e.clientX, startY: e.clientY, bStart: { ...b.pos } }
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  e.stopPropagation()
  e.preventDefault()
}

function onStageMove(e: PointerEvent) {
  const g = gesture.value
  if (!g) return
  const dx = e.clientX - g.startX
  const dy = e.clientY - g.startY
  if (g.kind === 'pan') {
    camera.x = g.camX! + dx
    camera.y = g.camY! + dy
    clampPan()
  } else if (g.kind === 'building' && g.bStart && g.uid) {
    const nx = g.bStart.x + ((dx / camera.zoom) / WORLD_W) * 100
    const ny = g.bStart.y + ((dy / camera.zoom) / WORLD_H) * 100
    setBuildingPos(g.uid, { x: Math.min(Math.max(nx, 5), 95), y: Math.min(Math.max(ny, 8), 92) })
  }
}

function onStageUp() {
  const g = gesture.value
  if (!g) return
  if (g.kind === 'building') commitLayout()
  else commitCamera()
  gesture.value = null
}

// ---------- GPU docking (per building) ----------

type DockMode = 'mini' | 'bubble' | 'spread'

function dockModeOf(b: OwnedBuilding): DockMode {
  if (!game.running) return 'spread'
  return hoverUid.value === b.uid ? 'bubble' : 'mini'
}

function dockLayoutOf(b: OwnedBuilding) {
  const n = Math.max(gpusIn(b.uid).length, 1)
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const mode = dockModeOf(b)
  if (mode === 'mini') return { cols, rows, spx: 64, spy: 48, scale: 0.4, ox: 88, oy: -104 }
  if (mode === 'bubble') {
    const scale = n > 8 ? 0.52 : 0.72
    const spx = scale * 236
    const spy = scale * 178
    return { cols, rows, spx, spy, scale, ox: 140, oy: -70 - ((rows - 1) / 2) * spy }
  }
  // spread (paused): bigger, vertically centered on the building
  return { cols, rows, spx: 208, spy: 158, scale: 0.95, ox: 150, oy: -((rows - 1) / 2) * 158 }
}

function slotStyle(b: OwnedBuilding, i: number) {
  const L = dockLayoutOf(b)
  const col = i % L.cols
  const row = Math.floor(i / L.cols)
  return {
    left: `${L.ox + col * L.spx}px`,
    top: `${L.oy + row * L.spy}px`,
    transform: `translate(-50%, -50%) scale(${L.scale})`,
    transitionDelay: dockModeOf(b) === 'bubble' ? `${i * 0.035}s` : '0s',
    zIndex: 10 + row,
  }
}

/** bounding box of the dock cluster — used for the bubble backdrop */
function bubbleRect(b: OwnedBuilding) {
  const L = dockLayoutOf(b)
  const n = gpusIn(b.uid).length
  const cols = Math.min(L.cols, n)
  const w = (cols - 1) * L.spx + 210 * L.scale + 40
  const h = (L.rows - 1) * L.spy + 150 * L.scale + 40
  return {
    left: `${L.ox - (210 * L.scale) / 2 - 20}px`,
    top: `${L.oy - (150 * L.scale) / 2 - 20}px`,
    width: `${w}px`,
    height: `${h}px`,
  }
}

function onGpuClick(g: OwnedGpu) {
  if (game.running) return
  selectedUid.value = selectedUid.value === g.uid ? null : g.uid
}

// popover position: next to the selected card's slot inside its building group
function popStyle(b: OwnedBuilding) {
  const list = gpusIn(b.uid)
  const i = list.findIndex(g => g.uid === selectedUid.value)
  if (i < 0) return {}
  const L = dockLayoutOf(b)
  const col = i % L.cols
  const row = Math.floor(i / L.cols)
  return {
    left: `${L.ox + col * L.spx + 118}px`,
    top: `${L.oy + row * L.spy - 40}px`,
  }
}

function askSell() {
  if (selectedGpu.value) pendingSell.value = selectedGpu.value
}

function confirmSell() {
  const g = pendingSell.value
  pendingSell.value = null
  if (!g) return
  const eco = gpuEconomics(g)
  const value = sellGpu(g.uid)
  toast(`💰 ${eco.model.name} → ${fmtUsd(value)}`)
  selectedUid.value = null
}

// leaving pause (game resumes) → deselect, collapse popover
watch(() => game.running, running => {
  if (running) selectedUid.value = null
})

// ---------- lifecycle ----------

function initCamera() {
  if (!game.state) return
  const cam = s.value.camera
  if (cam && cam.zoom >= ZOOM_MIN && cam.zoom <= ZOOM_MAX) {
    camera.x = cam.x
    camera.y = cam.y
    camera.zoom = cam.zoom
    clampPan()
  } else {
    fitAll()
  }
}

onMounted(() => {
  initCamera()
  stageEl.value?.addEventListener('wheel', onWheel, { passive: false })
})
onBeforeUnmount(() => {
  stageEl.value?.removeEventListener('wheel', onWheel)
})
watch(() => game.state?.id, () => initCamera())
</script>

<template>
  <main
    ref="stageEl"
    class="stage"
    :class="{ panning: !!gesture }"
    @pointerdown="onStageDown"
    @pointermove="onStageMove"
    @pointerup="onStageUp"
    @pointercancel="onStageUp"
  >
    <!-- world canvas -->
    <div
      class="world"
      :style="{
        width: `${WORLD_W}px`,
        height: `${WORLD_H}px`,
        transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
      }"
    >
      <div class="terrain"></div>

      <!-- facility groups: building + its docked GPUs move together -->
      <div
        v-for="b in s.buildings"
        :key="b.uid"
        class="bgroup"
        :style="{ left: `${b.pos.x}%`, top: `${b.pos.y}%`, zIndex: Math.round(b.pos.y * 10) }"
        @mouseenter="hoverUid = b.uid"
        @mouseleave="hoverUid = hoverUid === b.uid ? null : hoverUid"
      >
        <!-- bubble backdrop -->
        <Transition name="pop">
          <div v-if="dockModeOf(b) === 'bubble' && gpusIn(b.uid).length" class="bubble-bg" :style="bubbleRect(b)"></div>
        </Transition>

        <!-- building -->
        <div class="building" :title="nameOf(b)" @pointerdown="onBuildingDown($event, b)">
          <div class="ground-shadow"></div>
          <div class="b-icon">{{ housingById(b.tierId).icon }}</div>
          <div class="obj-label">
            <b>{{ nameOf(b) }}</b>
            <span class="num">{{ gpusIn(b.uid).length }}/{{ housingById(b.tierId).slots }}</span>
            <span v-if="game.running && gpusIn(b.uid).length" class="live-dot" title="mining"></span>
            <button
              v-if="freeSlotsIn(b) > 0"
              class="slot-add num"
              :title="t('addGpu')"
              @pointerdown.stop
              @click.stop="emit('openMarket', b.uid)"
            >＋</button>
          </div>
        </div>

        <!-- docked GPUs -->
        <div
          v-for="(g, i) in gpusIn(b.uid)"
          :key="g.uid"
          class="dockslot"
          :class="[`mode-${dockModeOf(b)}`, { selected: g.uid === selectedUid }]"
          :style="slotStyle(b, i)"
          @click.stop="onGpuClick(g)"
          @pointerdown.stop
        >
          <GpuCard3D
            :model="gpuById(g.modelId)"
            :power="g.power"
            :condition="g.condition"
            :running="game.running"
          />
          <div v-if="dockModeOf(b) !== 'mini'" class="obj-label slot-label">
            <b>{{ gpuById(g.modelId).name }}</b>
            <span class="num">{{ g.power }}%</span>
          </div>
        </div>

        <!-- in-world quick edit popover (paused only) -->
        <div
          v-if="selectedGpu && selectedGpu.buildingUid === b.uid && dockModeOf(b) === 'spread'"
          class="gpu-pop"
          :style="popStyle(b)"
          @pointerdown.stop
        >
          <div class="pop-head">
            <b>{{ gpuEconomics(selectedGpu).model.name }}</b>
            <button class="btn btn-icon btn-sm" @click="selectedUid = null">✕</button>
          </div>
          <div class="pop-row">
            <span class="lbl">{{ t('condition') }}</span>
            <div class="bar">
              <div
                class="fill"
                :style="{
                  width: `${Math.max(selectedGpu.condition, 0)}%`,
                  background:
                    selectedGpu.condition > 55 ? 'var(--up)' : selectedGpu.condition > 25 ? 'var(--warn)' : 'var(--down)',
                }"
              ></div>
            </div>
            <span class="num val">{{ fmtNum(selectedGpu.condition, 0) }}%</span>
          </div>
          <div class="pop-row">
            <span class="lbl">{{ t('powerLevel') }}</span>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              :value="selectedGpu.power"
              :disabled="selectedGpu.condition <= 0"
              :style="{ '--fill': `${((selectedGpu.power - 10) / 90) * 100}%` }"
              @input="setGpuPower(selectedGpu.uid, Number(($event.target as HTMLInputElement).value))"
            />
            <span class="num val">{{ selectedGpu.power }}%</span>
          </div>
          <div class="pop-row stats-row">
            <span
              v-if="selectedGpu.condition > 0"
              class="num"
              :class="gpuEconomics(selectedGpu).netUsd >= 0 ? 'up-text' : 'down-text'"
            >{{ gpuEconomics(selectedGpu).netUsd >= 0 ? '+' : '−' }}{{ fmtUsd(Math.abs(gpuEconomics(selectedGpu).netUsd)) }}{{ t('perDay') }}</span>
            <span v-else class="down-text">💀 {{ t('dead') }}</span>
            <span v-if="selectedGpu.condition > 0" class="mute tiny num">⏳ {{ fmtLife(gpuEconomics(selectedGpu).remainingDays) }}</span>
            <div class="spacer"></div>
            <button class="btn btn-danger btn-sm" @click="askSell">
              {{ t('sellFor', { price: fmtUsd(gpuEconomics(selectedGpu).sellValue, 0) }) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== HUD (fixed over the world) ===== -->
    <div class="hud stage-head">
      <span class="chip num">🏘️ {{ totals.buildings }} {{ t('housing') }}</span>
      <span class="chip num">🎴 {{ totals.used }} / {{ totals.slots }} {{ t('slots') }}</span>
      <button class="chip add-chip" @click="emit('openHousing')">＋ {{ t('addBuilding') }}</button>
    </div>

    <Transition name="drop">
      <div v-if="game.editPaused" class="hud pause-banner">
        <span>⏸ {{ t('pausedEditing') }}</span>
        <button class="btn btn-primary btn-sm" @click="endEdit()">▶ {{ t('resume') }}</button>
      </div>
    </Transition>

    <div class="hud zoomctl">
      <button class="btn btn-icon" title="Zoom +" @click="zoomBy(1.25)">＋</button>
      <span class="zoom-label num">{{ Math.round(camera.zoom * 100) }}%</span>
      <button class="btn btn-icon" title="Zoom −" @click="zoomBy(0.8)">−</button>
      <button class="btn btn-icon" title="Fit" @click="fitAll()">⌖</button>
    </div>

    <button v-if="totals.used < totals.slots" class="hud add-fab" @click="emit('openMarket')">
      ＋ {{ t('addGpu') }} <span class="num fab-count">{{ totals.slots - totals.used }}</span>
    </button>

    <p v-if="s.gpus.length === 0" class="hud start-hint">💡 {{ t('startHint') }}</p>

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
  </main>
</template>

<style scoped>
.stage {
  grid-area: stage;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(70% 60% at 50% 38%, var(--stage-glow), transparent 75%),
    linear-gradient(var(--bg2), var(--bg));
  cursor: grab;
  /* keep object z-indexes from leaking above modals */
  isolation: isolate;
}
.stage.panning { cursor: grabbing; }

/* modals rendered inside the isolated stage must sit above world objects & HUD */
.stage :deep(.modal-backdrop) { z-index: 2000; }

/* ---- world ---- */
.world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}
.terrain {
  position: absolute;
  inset: 0;
  border: 2px solid var(--border);
  border-radius: 40px;
  background-color: color-mix(in srgb, var(--panel) 30%, transparent);
  background-image: radial-gradient(var(--dot-grid) 1.5px, transparent 1.5px);
  background-size: 34px 34px;
  box-shadow: inset 0 0 160px var(--stage-glow);
}

/* ---- facility group ---- */
.bgroup { position: absolute; width: 0; height: 0; }

.building {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: grab;
  touch-action: none;
  z-index: 5;
}
.building:active { cursor: grabbing; }
.ground-shadow {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 110px;
  height: 26px;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.35), transparent);
  border-radius: 50%;
  pointer-events: none;
}
.b-icon {
  font-size: 88px;
  line-height: 1;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.35));
  user-select: none;
}

.obj-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-dim);
  background: color-mix(in srgb, var(--panel) 85%, transparent);
  border: 1px solid var(--border-soft);
  border-radius: 99px;
  padding: 3.5px 12px;
  white-space: nowrap;
  backdrop-filter: blur(3px);
}
.obj-label b { color: var(--text); font-weight: 750; }
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--up-text);
  box-shadow: 0 0 8px var(--up-text);
  animation: blink 1.4s ease-in-out infinite;
}
@keyframes blink { 50% { opacity: 0.3; } }

.slot-add {
  border: 1px solid var(--accent-border);
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 12px;
  font-weight: 800;
  border-radius: 99px;
  width: 20px;
  height: 20px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.slot-add:hover { filter: brightness(1.2); }

/* ---- dock slots ---- */
.dockslot {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition:
    left 0.5s cubic-bezier(0.3, 1.25, 0.45, 1),
    top 0.5s cubic-bezier(0.3, 1.25, 0.45, 1),
    transform 0.5s cubic-bezier(0.3, 1.25, 0.45, 1);
}
.dockslot.mode-mini { pointer-events: none; }
.dockslot.mode-bubble { pointer-events: none; }
.dockslot.mode-spread { cursor: pointer; }
.dockslot.mode-spread:hover :deep(.card) { transform: rotateX(4deg) rotateY(-2deg) scale(1.03); }
.dockslot.selected :deep(.gpu-svg) {
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.45)) drop-shadow(0 0 14px var(--accent));
}
.slot-label { font-size: 12px; padding: 2.5px 10px; }

.bubble-bg {
  position: absolute;
  background: color-mix(in srgb, var(--panel) 72%, transparent);
  border: 1.5px solid var(--accent-border);
  border-radius: 26px;
  backdrop-filter: blur(5px);
  box-shadow: var(--shadow), 0 0 30px var(--accent-soft);
  z-index: 1;
}
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.85); }
.pop-enter-active, .pop-leave-active { transition: all 0.22s cubic-bezier(0.3, 1.3, 0.5, 1); }

/* ---- in-world quick edit popover ---- */
.gpu-pop {
  position: absolute;
  z-index: 300;
  width: 264px;
  background: var(--panel);
  border: 1px solid var(--accent-border);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  cursor: default;
  animation: popIn 0.18s cubic-bezier(0.3, 1.3, 0.5, 1);
}
.pop-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pop-head b { font-size: 14.5px; }
.pop-row { display: flex; align-items: center; gap: 8px; }
.pop-row .lbl { font-size: 12px; font-weight: 600; color: var(--text-dim); width: 66px; flex-shrink: 0; }
.pop-row .bar { flex: 1; height: 6px; border-radius: 6px; background: var(--border); overflow: hidden; }
.pop-row .fill { height: 100%; border-radius: 6px; }
.pop-row .val { font-size: 12.5px; font-weight: 750; width: 38px; text-align: right; flex-shrink: 0; }
.pop-row input[type='range'] { flex: 1; }
.stats-row { font-size: 13px; font-weight: 700; flex-wrap: wrap; }
.stats-row .tiny { font-size: 11.5px; font-weight: 600; }

/* ---- HUD ---- */
.hud { z-index: 500; }
.stage-head {
  position: absolute;
  top: 12px;
  left: 14px;
  display: flex;
  gap: 8px;
}
.add-chip {
  cursor: pointer;
  color: var(--accent-strong);
  border-color: var(--accent-border);
  background: var(--accent-soft);
  font: 650 12.5px var(--font);
}
.add-chip:hover { filter: brightness(1.15); }

.pause-banner {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--panel3);
  border: 1px solid var(--warn);
  border-radius: 99px;
  padding: 7px 10px 7px 16px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: var(--shadow);
}
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translate(-50%, -16px); }
.drop-enter-active, .drop-leave-active { transition: all 0.22s ease; }

.zoomctl {
  position: absolute;
  right: 14px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: color-mix(in srgb, var(--panel) 88%, transparent);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 7px;
  backdrop-filter: blur(4px);
}
.zoom-label { font-size: 11.5px; font-weight: 700; color: var(--text-dim); }

.add-fab {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--accent-border);
  background: var(--panel);
  color: var(--accent-strong);
  font: 700 14px var(--font);
  border-radius: 99px;
  padding: 11px 20px;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: background 0.15s, transform 0.12s;
}
.add-fab:hover { background: var(--accent-soft); transform: translateX(-50%) scale(1.03); }
.fab-count {
  background: var(--accent-soft);
  border-radius: 99px;
  padding: 1px 8px;
  font-size: 12px;
}

.start-hint {
  position: absolute;
  bottom: 74px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dim);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 9px 20px;
  white-space: nowrap;
}
</style>
