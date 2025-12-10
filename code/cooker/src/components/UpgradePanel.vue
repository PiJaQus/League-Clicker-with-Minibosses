<script setup>
import { computed, ref } from 'vue'
import { useClickerStore } from '@/store/useClickerStore'
import { confettiCenter } from '@/utils/confetti.js'
import { playBuySound } from '@/utils/sound.js'
import { getTranslation } from '@/i18n/translations'

const store = useClickerStore()
const t = (key) => getTranslation(key, store.state.settings.language)

const qtyOptions = [1, 10, 25, 'Max']
const selectedQty = ref(1)
const sortKey = ref('cost') // 'cost' | 'name' | 'owned'
const typeFilter = ref('all') // 'all' | 'cpc' | 'cps'

const upgradesRaw = computed(() => store.state.upgrades)

function qtyFor(u) {
  const sel = selectedQty.value
  if (sel === 'Max') {
    const m = store.maxAffordable(u.id)
    return m > 0 ? m : 0
  }
  return Number(sel) || 1
}

function price(u) {
  return store.priceForNext(u)
}
function canBuy(u) {
  return store.canBuy(u.id)
}
function buy(u) {
  const ok = store.buy(u.id)
  if (ok) {
    const s = store.state.settings || {}
    if (s.sound) playBuySound()
    if (s.confetti && !s.reducedMotion) confettiCenter({ count: 15, size: 25, imageUrl: new URL('@/assets/leblanc.jpg', import.meta.url).href })
  }
}

function iconFor(u) {
  // Jungle camps (CPC)
  if (/wraith/i.test(u.name)) return '👻'
  if (/wolf/i.test(u.name)) return '🐺'
  if (/golem/i.test(u.name)) return '🪨'
  
  // Champions (CPS)
  if (/garen/i.test(u.name)) return '⚔️'
  if (/ahri/i.test(u.name)) return '🦊'
  if (/ashe/i.test(u.name)) return '🏹'
  if (/yasuo/i.test(u.name)) return '🌪️'
  if (/lux/i.test(u.name)) return '✨'
  if (/faker|dopa/i.test(u.name)) return '👑'
  if (/scuttle/i.test(u.name)) return '🦀'
  
  return '⭐'
}

function costForQty(u) {
  const q = qtyFor(u)
  if (!q) return 0
  return store.priceForQuantity(u, q)
}
function canBuyQty(u) {
  const q = qtyFor(u)
  if (!q) return false
  return store.canBuyQuantity(u.id, q)
}
function buyQty(u) {
  const q = qtyFor(u)
  if (!q) return
  const bought = store.buyQuantity(u.id, q)
  if (bought > 0) {
    const s = store.state.settings || {}
    if (s.sound) playBuySound()
    if (s.confetti && !s.reducedMotion) confettiCenter({ count: 18, size: 25, imageUrl: new URL('@/assets/leblanc.jpg', import.meta.url).href })
  }
}

const upgradesFiltered = computed(() => {
  const t = typeFilter.value
  if (t === 'all') return upgradesRaw.value
  return upgradesRaw.value.filter(u => u.type === t)
})

const upgrades = computed(() => {
  const arr = [...upgradesFiltered.value]
  const key = sortKey.value
  arr.sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name)
    if (key === 'owned') return b.count - a.count
    // default cost sort by next price ascending
    return price(a) - price(b)
  })
  return arr
})

function buyAllAffordable() {
  // iterate until nothing else affordable for current qty
  let any = true
  let totalBought = 0
  let guard = 0
  while (any && guard++ < 200) {
    any = false
    for (const u of upgrades.value) {
      if (canBuyQty(u)) {
        const q = qtyFor(u)
        const b = store.buyQuantity(u.id, q)
        if (b > 0) { any = true; totalBought += b }
      }
    }
  }
  if (totalBought > 0) {
    const s = store.state.settings || {}
    if (s.sound) playBuySound()
    if (s.confetti && !s.reducedMotion) confettiCenter({ count: 24, size: 25, imageUrl: new URL('@/assets/leblanc.jpg', import.meta.url).href })
  }
}
</script>

<template>
  <div class="panel">
    <h2 class="panel-title">🎮 {{ t('upgrades') }}</h2>

    <div class="toolbar">
      <div class="group">
        <span class="label">Qty:</span>
        <button v-for="opt in qtyOptions" :key="opt" class="chip" :class="{ active: selectedQty === opt }" @click="selectedQty = opt">{{ opt }}</button>
      </div>
      <div class="group">
        <span class="label">Sort:</span>
        <button class="chip" :class="{ active: sortKey === 'cost' }" @click="sortKey = 'cost'">{{ t('cost') }}</button>
        <button class="chip" :class="{ active: sortKey === 'name' }" @click="sortKey = 'name'">Name</button>
        <button class="chip" :class="{ active: sortKey === 'owned' }" @click="sortKey = 'owned'">{{ t('owned') }}</button>
      </div>
      <div class="group">
        <span class="label">Type:</span>
        <button class="chip" :class="{ active: typeFilter === 'all' }" @click="typeFilter = 'all'">All</button>
        <button class="chip" :class="{ active: typeFilter === 'cpc' }" @click="typeFilter = 'cpc'">{{ t('camps') }}</button>
        <button class="chip" :class="{ active: typeFilter === 'cps' }" @click="typeFilter = 'cps'">{{ t('champions') }}</button>
      </div>
      <div class="spacer" />
      <button class="buyall" @click="buyAllAffordable">{{ t('buyAllAffordable') }}</button>
    </div>

    <div class="list">
      <div v-for="u in upgrades" :key="u.id" class="card" :class="{ disabled: !canBuyQty(u) }">
        <div class="main">
          <div class="title"><span class="icon">{{ iconFor(u) }}</span>{{ u.name }}</div>
          <div class="desc">{{ t(u.descriptionKey) }}</div>
        </div>
        <div class="meta">
          <div class="owned">{{ t('owned') }}: <span class="pill">{{ u.count }}</span></div>
          <div class="price">Next: {{ price(u).toLocaleString() }}</div>
          <div class="price accent" v-if="qtyFor(u) > 1">Qty ({{ qtyFor(u) }}): {{ costForQty(u).toLocaleString() }}</div>
          <button :disabled="!canBuyQty(u)" @click="buyQty(u)">{{ t('buy') }} {{ qtyFor(u) === 0 ? '' : qtyFor(u) }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.panel-title {
  background: linear-gradient(90deg, var(--accent), #8ec5ff, var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.toolbar { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; }
.toolbar .group { display: flex; gap: 6px; align-items: center; }
.toolbar .label { opacity: .9; font-size: 13px; color: #e6e6f8; }
.chip { padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #fff; cursor: pointer; font-size: 13px; }
.chip.active { background: linear-gradient(135deg, var(--accent), #8ec5ff); border-color: transparent; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
.spacer { flex: 1; }
.buyall {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #000;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
  transition: all 0.15s ease;
}

.buyall:hover {
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.4);
}

.list { display: flex; flex-direction: column; gap: 14px; }
.card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  transition: transform .12s ease, box-shadow .2s ease, background .2s ease;
}
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px; /* gradient border */
  background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); background: rgba(255,255,255,0.1); }
.card.disabled { opacity: .7; }
.title { font-weight: 800; display: flex; align-items: center; gap: 8px; }
.icon { font-size: 20px; }
.desc { color: #cfcfe9; font-size: 12px; opacity: .9; }
.meta { display: grid; grid-auto-flow: row; gap: 6px; align-content: center; text-align: right; }
.price { color: #f6f6ff; opacity: .95; }
.price.accent { color: var(--accent-2); }
.pill { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 22px; padding: 0 8px; border-radius: 999px; background: rgba(255,255,255,0.15); }
button {
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #10b981, #19d3a6);
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(16,185,129,0.35);
  transition: transform .08s ease, box-shadow .2s ease, filter .2s ease;
}
button:hover { transform: translateY(-1px); filter: brightness(1.05); }
button:active { transform: translateY(0); }
button:disabled { background: linear-gradient(135deg, #7a7a7a, #9a9a9a); box-shadow: none; cursor: not-allowed; opacity: .7; }
</style>
