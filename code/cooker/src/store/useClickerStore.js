import { reactive, computed, watch } from 'vue'

// Ranking system thresholds
const RANKS = [
  { rank: 'Iron', minGold: 0, image: 'iron.png', boss: null },
  { rank: 'Bronze', minGold: 10000, image: 'bronze.png', boss: { name: 'Scuttle Crab', emoji: '🦀', health: 50 } },
  { rank: 'Silver', minGold: 50000, image: 'silver.png', boss: { name: 'Rift Herald', emoji: '🐉', health: 100 } },
  { rank: 'Gold', minGold: 150000, image: 'gold.png', boss: { name: 'Dragon', emoji: '🔥', health: 150 } },
  { rank: 'Platinum', minGold: 500000, image: 'platinium.png', boss: { name: 'Nashor', emoji: '👹', health: 200 } },
  { rank: 'Diamond', minGold: 1500000, image: 'diamond.png', boss: { name: 'Baron Nashor', emoji: '👹', health: 250 } },
  { rank: 'Master', minGold: 5000000, image: 'master.png', boss: { name: 'Elder Dragon', emoji: '🐲', health: 300 } },
  { rank: 'Grandmaster', minGold: 15000000, image: 'grandmaster.png', boss: { name: 'Void Herald', emoji: '👾', health: 350 } },
  { rank: 'Challenger', minGold: 50000000, image: 'challanger.png', boss: { name: 'Nexus', emoji: '💎', health: 500 } }
]

function getRankInfo(gold) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (gold >= RANKS[i].minGold) {
      const nextRank = i < RANKS.length - 1 ? RANKS[i + 1] : null
      return {
        current: RANKS[i],
        next: nextRank,
        progress: nextRank ? ((gold - RANKS[i].minGold) / (nextRank.minGold - RANKS[i].minGold)) * 100 : 100
      }
    }
  }
  return { current: RANKS[0], next: RANKS[1], progress: 0 }
}

// Singleton reactive state for the clicker
let state
let started = false

function defaultUpgrades() {
  return [
    // Click power upgrades (CPC) - Jungle Camps
    { id: 'cpc-1', name: 'Wraiths', type: 'cpc', basePrice: 10, priceMultiplier: 1.15, valuePerBuy: 1, count: 0, descriptionKey: 'wraiths_desc' },
    { id: 'cpc-2', name: 'Wolves', type: 'cpc', basePrice: 200, priceMultiplier: 1.15, valuePerBuy: 5, count: 0, descriptionKey: 'wolves_desc' },
    { id: 'cpc-3', name: 'Golems', type: 'cpc', basePrice: 1000, priceMultiplier: 1.15, valuePerBuy: 15, count: 0, descriptionKey: 'golems_desc' },

    // Production upgrades (CPS) - Champions
    { id: 'cps-1', name: 'Garen', type: 'cps', basePrice: 50, priceMultiplier: 1.15, valuePerBuy: 0.5, count: 0, descriptionKey: 'garen_desc' },
    { id: 'cps-2', name: 'Ahri', type: 'cps', basePrice: 200, priceMultiplier: 1.15, valuePerBuy: 2, count: 0, descriptionKey: 'ahri_desc' },
    { id: 'cps-3', name: 'Ashe', type: 'cps', basePrice: 1000, priceMultiplier: 1.15, valuePerBuy: 8, count: 0, descriptionKey: 'ashe_desc' },
    { id: 'cps-4', name: 'Yasuo', type: 'cps', basePrice: 5000, priceMultiplier: 1.15, valuePerBuy: 30, count: 0, descriptionKey: 'yasuo_desc' },
    { id: 'cps-5', name: 'Lux', type: 'cps', basePrice: 20000, priceMultiplier: 1.15, valuePerBuy: 120, count: 0, descriptionKey: 'lux_desc' },
    { id: 'cps-6', name: 'Faker', type: 'cps', basePrice: 120000, priceMultiplier: 1.15, valuePerBuy: 600, count: 0, descriptionKey: 'faker_desc' },
    { id: 'cps-7', name: 'Dopa', type: 'cps', basePrice: 600000, priceMultiplier: 1.15, valuePerBuy: 2500, count: 0, descriptionKey: 'dopa_desc' },
    { id: 'cps-8', name: 'Scuttle Crab', type: 'cps', basePrice: 3000000, priceMultiplier: 1.15, valuePerBuy: 11000, count: 0, descriptionKey: 'scuttleCrab_desc' },
  ]
}

function load() {
  try {
    const raw = localStorage.getItem('cooker_v2')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed
  } catch (_) {
    return null
  }
}

function save() {
  try {
    localStorage.setItem('cooker_v2', JSON.stringify(state))
  } catch (_) {
    // ignore
  }
}

function ensureState() {
  if (state) return
  const persisted = load()
  state = reactive(
    persisted || {
      cookies: 0,
      upgrades: defaultUpgrades(),
      lastTick: Date.now(),
      settings: {
        sound: true,
        confetti: true,
        battleMusic: true,
        reducedMotion: false,
        language: 'en',
      },
      player: {
        attack: 10,
        maxHp: 50,
        currentHp: 50
      },
      defeatedBosses: []
    }
  )

  // migrate: ensure any newly added default upgrades exist in save
  try {
    const defs = defaultUpgrades()
    const map = new Map(state.upgrades.map(u => [u.id, u]))
    for (const d of defs) {
      if (!map.has(d.id)) {
        state.upgrades.push({ ...d, count: 0 })
      } else {
        // refresh static fields in case balancing changed (keep count)
        const u = map.get(d.id)
        u.type = d.type
        u.basePrice = d.basePrice
        u.priceMultiplier = d.priceMultiplier
        u.valuePerBuy = d.valuePerBuy
        u.description = d.description
      }
    }
  } catch (_) { /* ignore */ }

  // settings migration
  try {
    state.settings = state.settings || { sound: true, confetti: true, battleMusic: true, reducedMotion: false, language: 'en' }
    if (typeof state.settings.sound !== 'boolean') state.settings.sound = true
    if (typeof state.settings.confetti !== 'boolean') state.settings.confetti = true
    if (typeof state.settings.battleMusic !== 'boolean') state.settings.battleMusic = true
    if (typeof state.settings.reducedMotion !== 'boolean') state.settings.reducedMotion = false
    if (typeof state.settings.language !== 'string') state.settings.language = 'en'
  } catch (_) { /* ignore */ }

  // player migration
  try {
    state.player = state.player || {
      attack: 10,
      maxHp: 50,
      currentHp: 50
    }
  } catch (_) { /* ignore */ }

  // Derived values
  Object.defineProperty(state, 'cpc', {
    enumerable: false,
    get() {
      const base = 1
      const extra = state.upgrades
        .filter(u => u.type === 'cpc')
        .reduce((sum, u) => sum + u.valuePerBuy * u.count, 0)
      return base + extra
    }
  })

  Object.defineProperty(state, 'cps', {
    enumerable: false,
    get() {
      return state.upgrades
        .filter(u => u.type === 'cps')
        .reduce((sum, u) => sum + u.valuePerBuy * u.count, 0)
    }
  })

  // Persist on any change
  watch(state, () => save(), { deep: true })
}

function priceForNext(u) {
  return Math.floor(u.basePrice * Math.pow(u.priceMultiplier, u.count))
}

function priceForQuantity(u, qty) {
  let total = 0
  for (let i = 0; i < qty; i++) {
    total += Math.floor(u.basePrice * Math.pow(u.priceMultiplier, u.count + i))
  }
  return total
}

function maxAffordable(upgradeId) {
  const u = state.upgrades.find(x => x.id === upgradeId)
  if (!u) return 0
  let c = Math.floor(state.cookies)
  let next = priceForNext(u)
  let k = 0
  // cap to avoid infinite loops in extreme cases
  while (c >= next && k < 1000) {
    c -= next
    k++
    next = Math.floor(u.basePrice * Math.pow(u.priceMultiplier, u.count + k))
  }
  return k
}

function startTicker() {
  if (started) return
  started = true
  setInterval(() => {
    if (!state) return
    // catch-up in case of tab being inactive
    const now = Date.now()
    const dtSec = Math.max(0, (now - state.lastTick) / 1000)
    state.lastTick = now
    const add = state.cps * dtSec
    if (add > 0) state.cookies += add
  }, 250)
}

export function useClickerStore() {
  ensureState()
  startTicker()

  const cookies = computed(() => Math.floor(state.cookies))
  const cps = computed(() => state.cps)
  const cpc = computed(() => state.cpc)

  function click() {
    state.cookies += state.cpc
  }

  function canBuy(upgradeId) {
    const u = state.upgrades.find(x => x.id === upgradeId)
    if (!u) return false
    return state.cookies >= priceForNext(u)
  }

  function canBuyQuantity(upgradeId, qty) {
    const u = state.upgrades.find(x => x.id === upgradeId)
    if (!u) return false
    return state.cookies >= priceForQuantity(u, qty)
  }

  function buy(upgradeId) {
    const u = state.upgrades.find(x => x.id === upgradeId)
    if (!u) return false
    const price = priceForNext(u)
    if (state.cookies < price) return false
    state.cookies -= price
    u.count += 1
    return true
  }

  function buyQuantity(upgradeId, qty) {
    const u = state.upgrades.find(x => x.id === upgradeId)
    if (!u) return 0
    let bought = 0
    for (let i = 0; i < qty; i++) {
      const price = Math.floor(u.basePrice * Math.pow(u.priceMultiplier, u.count))
      if (state.cookies < price) break
      state.cookies -= price
      u.count += 1
      bought++
    }
    return bought
  }

  function reset() {
    state.cookies = 0
    state.upgrades = defaultUpgrades()
    state.lastTick = Date.now()
    state.player.attack = 10
    state.player.maxHp = 50
    state.player.currentHp = 50
    state.defeatedBosses = []
    save()
  }

  // Player stat upgrades
  function buyAttackUpgrade(cost) {
    if (state.cookies >= cost) {
      state.cookies -= cost
      state.player.attack += 5
      save()
      return true
    }
    return false
  }

  function buyHpUpgrade(cost) {
    if (state.cookies >= cost) {
      state.cookies -= cost
      state.player.maxHp += 10
      state.player.currentHp += 10
      save()
      return true
    }
    return false
  }

  function restoreHp() {
    state.player.currentHp = state.player.maxHp
  }

  // settings actions
  function setSound(v) { state.settings.sound = !!v }
  function setConfetti(v) { state.settings.confetti = !!v }
  function setBattleMusic(v) { state.settings.battleMusic = !!v }
  function setReducedMotion(v) { state.settings.reducedMotion = !!v }
  function setLanguage(lang) { state.settings.language = lang }

  function addDefeatedBoss(bossName, rank) {
    const boss = { name: bossName, rank, timestamp: Date.now() }
    state.defeatedBosses.push(boss)
    save()
  }

  return {
    // state
    state,
    cookies,
    cps,
    cpc,
    // actions
    click,
    canBuy,
    canBuyQuantity,
    buy,
    buyQuantity,
    reset,
    priceForNext,
    priceForQuantity,
    maxAffordable,
    // player upgrades
    buyAttackUpgrade,
    buyHpUpgrade,
    restoreHp,
    // settings
    setSound,
    setConfetti,
    setBattleMusic,
    setReducedMotion,
    setLanguage,
    // ranking
    getRankInfo,
    // bosses
    addDefeatedBoss,
    // persistence
    save
  }
}
