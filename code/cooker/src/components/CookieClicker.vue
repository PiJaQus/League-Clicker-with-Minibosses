<script setup>
import { onMounted, computed, unref, ref, watch } from 'vue'
import { useClickerStore } from '@/store/useClickerStore'
import { confettiAt } from '@/utils/confetti.js'
import { playClickSound } from '@/utils/sound.js'
import { getTranslation } from '@/i18n/translations'
import BossFight from './BossFight.vue'

const store = useClickerStore()
const t = (key) => getTranslation(key, store.state.settings.language)

// Import rank images
import ironImg from '@/assets/iron.png'
import bronzeImg from '@/assets/bronze.png'
import silverImg from '@/assets/silver.png'
import goldImg from '@/assets/gold.png'
import platiniumImg from '@/assets/platinium.png'
import diamondImg from '@/assets/diamond.png'
import masterImg from '@/assets/master.png'
import grandmasterImg from '@/assets/grandmaster.png'
import changerImg from '@/assets/challanger.png'

const rankImages = {
  'iron.png': ironImg,
  'bronze.png': bronzeImg,
  'silver.png': silverImg,
  'gold.png': goldImg,
  'platinium.png': platiniumImg,
  'diamond.png': diamondImg,
  'master.png': masterImg,
  'grandmaster.png': grandmasterImg,
  'challanger.png': changerImg
}

onMounted(() => {
  // keyboard support for clicking
  function handleKeyDown(e) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault()
      // simulate click event with center coordinates
      const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2
      })
      handleClick(evt)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
})

const cookiesText = computed(() => {
  const n = Number(unref(store.cookies) ?? 0)
  return Math.floor(n).toLocaleString()
})
const cpsText = computed(() => {
  const n = Number(unref(store.cps) ?? 0)
  return (isFinite(n) ? n : 0).toFixed(1)
})
const cpcText = computed(() => {
  const n = Number(unref(store.cpc) ?? 0)
  return (isFinite(n) ? n : 0).toFixed(0)
})

const rankInfo = computed(() => {
  return store.getRankInfo(Math.floor(unref(store.cookies)))
})

const rankImageUrl = computed(() => {
  const filename = rankInfo.value.current.image
  return rankImages[filename] || ironImg
})

const floaters = ref([])
const popAnim = ref(false)
const showBossFight = ref(false)
const currentBoss = ref(null)
const previousRank = ref(null)
const hideContentDuringVictory = ref(false)

watch(
  () => rankInfo.value.current.rank,
  (newRank, oldRank) => {
    if (oldRank && newRank !== oldRank && rankInfo.value.current.boss && !showBossFight.value) {
      // Check if boss already defeated
      const bossName = rankInfo.value.current.boss.name
      const alreadyDefeated = store.state.defeatedBosses?.some(b => b.name === bossName)
      
      if (!alreadyDefeated) {
        previousRank.value = oldRank
        currentBoss.value = rankInfo.value.current.boss
        showBossFight.value = true
      }
    }
  },
  { immediate: false }
)

function handleClick(e) {
  store.click()
  // bounce
  popAnim.value = true
  setTimeout(() => (popAnim.value = false), 150)

  // floating +cookies text
  const id = Date.now() + Math.random()
  const dx = (Math.random() * 140 - 70).toFixed(0) + 'px'
  const dy = (-(20 + Math.random() * 60)).toFixed(0) + 'px'
  const text = '+' + Math.round(Number(unref(store.cpc) ?? 1))
  floaters.value.push({ id, dx, dy, text })
  setTimeout(() => {
    floaters.value = floaters.value.filter(f => f.id !== id)
  }, 800)

  // effects
  const settings = store.state.settings || {}
  if (settings.sound) {
    playClickSound()
  }
  if (settings.confetti && !settings.reducedMotion) {
    // confetti from mouse/touch position, or center if keyboard
    const x = (e && typeof e.clientX === 'number') ? e.clientX : window.innerWidth / 2
    const y = (e && typeof e.clientY === 'number') ? e.clientY : window.innerHeight / 2
    confettiAt(x, y, { count: 12, duration: 800, size: 25, imageUrl: new URL('@/assets/leblanc.jpg', import.meta.url).href })
  }
}
</script>

<template>
  <div class="clicker-layout">
    <!-- CENTER: Ranks, Cooker, Quest Rules -->
    <div v-show="!hideContentDuringVictory" class="center-panel">
      <div class="rank-display">
        <div class="rank-badge-img">
          <img :src="rankImageUrl" :alt="rankInfo.current.rank" class="rank-img">
          <div class="rank-label">{{ rankInfo.current.rank }}</div>
        </div>
        <div class="rank-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: rankInfo.progress + '%' }"></div>
          </div>
          <div class="progress-text" v-if="rankInfo.next">
            {{ rankInfo.next.rank }}: {{ rankInfo.next.minGold.toLocaleString() }}
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><span class="label">{{ t('goldLabel') }}</span><span class="value">{{ cookiesText }}</span></div>
        <div class="stat"><span class="label">{{ t('perSecond') }}</span><span class="value">{{ cpsText }}</span></div>
        <div class="stat"><span class="label">{{ t('perClick') }}</span><span class="value">{{ cpcText }}</span></div>
      </div>

      <div class="cookie-wrap">
        <div class="cookie-stage">
          <div class="cookie" :class="{ pop: popAnim }" @click="handleClick($event)" title="Click to earn gold">
            <img src="@/assets/leblanc.jpg" alt="Leblanc" class="cookie-img">
          </div>
          <div class="floaters">
            <div v-for="f in floaters" :key="f.id" class="floater" :style="{ '--dx': f.dx, '--dy': f.dy }">{{ f.text }}</div>
          </div>
        </div>
      </div>

      <div class="quest-rules">
        <h3>⚔️ {{ t('gameRules') }}</h3>
        <p>{{ t('reachChallenger') }}</p>
        <ul>
          <li>{{ t('clickLeblanc') }}</li>
          <li>{{ t('buyUpgrades') }}</li>
          <li>{{ t('defeatBosses') }}</li>
          <li>{{ t('upgradeAttackHp') }}</li>
        </ul>
      </div>
    </div>
  </div>

  <BossFight 
    v-if="showBossFight && currentBoss"
    :boss="currentBoss"
    :nextRank="rankInfo.current.rank"
    @close="() => { showBossFight = false; hideContentDuringVictory = false }"
    @victory="hideContentDuringVictory = true"
  />
</template>

<style scoped>
.clicker-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--color-text);
}

.center-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 {
  margin: 0;
}

.rank-display {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.rank-badge-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rank-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(168, 85, 247, 0.4);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
}

.rank-label {
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.rank-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #cfcfe9;
  text-align: center;
  opacity: 0.8;
}

.quest-rules {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
}

.quest-rules h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.quest-rules p {
  margin: 0 0 10px 0;
  color: #e6e6f8;
}

.quest-rules ul {
  margin: 0;
  padding-left: 20px;
  color: #cfcfe9;
}

.quest-rules li {
  margin: 6px 0;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat {
  background: var(--color-background-soft, #f4f4f4);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label { color: #666; font-size: 12px; }
.value { font-weight: 700; font-size: 20px; }

.cookie-wrap { display: flex; justify-content: center; padding: 12px 0; }
.cookie-stage { position: relative; width: 260px; height: 260px; display: grid; place-items: center; }
.cookie {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background:
    radial-gradient(#6b3f1d 8px, transparent 9px) 40px 50px/200px 200px no-repeat,
    radial-gradient(#6b3f1d 6px, transparent 7px) 110px 120px/200px 200px no-repeat,
    radial-gradient(#6b3f1d 5px, transparent 6px) 150px 70px/200px 200px no-repeat,
    radial-gradient(circle at 30% 30%, #f7c08a, #cd9157 70%);
  box-shadow: inset 0 12px 30px rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.3);
  display: grid;
  place-items: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.06s ease, filter 0.2s ease;
  animation: bob 3s ease-in-out infinite;
}
.cookie.pop { animation: pop .15s ease; }
.cookie-emoji { font-size: 72px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2)); }
.cookie-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); }

.floaters { position: absolute; inset: 0; pointer-events: none; }
.floater {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #ffd166;
  text-shadow: 0 2px 0 rgba(0,0,0,0.35);
  font-weight: 800;
  animation: floatPop 800ms ease-out forwards;
}

.actions { display: flex; gap: 8px; }
.secondary {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
@keyframes floatPop {
  0% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.9); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% - 80px)) scale(1.2); }
}
</style>
