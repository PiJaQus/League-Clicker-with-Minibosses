<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useClickerStore } from '@/store/useClickerStore'
import { playBattleMusic, playVictoryFanfare, playDefeatSound, playBossAttackWarning } from '@/utils/battleMusic'
import { startStrudelBattleMusic, stopStrudelBattleMusic } from '@/utils/strudelBattle'

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

const props = defineProps({
  boss: Object,
  nextRank: String
})

const emit = defineEmits(['victory', 'close'])

const store = useClickerStore()
const bossHealth = ref(props.boss.health)
const playerHp = ref(store.state.player?.currentHp || 50)
const battleLog = ref([])
const isAttacking = ref(false)
const battleLogEl = ref(null)
const musicStarted = ref(false)

// Start battle music when component mounts
onMounted(() => {
  if (!musicStarted.value) {
    // Start background music (quiet) - async but don't wait
    startStrudelBattleMusic().catch(() => {})
    // Also play the intro sound effect
    playBattleMusic()
    musicStarted.value = true
  }
})

// Stop music when component unmounts
onUnmounted(() => {
  stopStrudelBattleMusic()
  musicStarted.value = false
})

// Watch for battle music setting changes
watch(() => store.state.settings.battleMusic, (newVal) => {
  if (newVal && musicStarted.value) {
    startStrudelBattleMusic().catch(() => {})
  } else if (!newVal) {
    stopStrudelBattleMusic()
  }
})

// Watch for sound setting changes (affects both battle music and effects)
watch(() => store.state.settings.sound, (newVal) => {
  if (!newVal) {
    stopStrudelBattleMusic()
  } else if (store.state.settings.battleMusic && musicStarted.value) {
    startStrudelBattleMusic().catch(() => {})
  }
})

// Auto-scroll battle log to bottom
watch(battleLog, async () => {
  await nextTick()
  if (battleLogEl.value) {
    battleLogEl.value.scrollTop = battleLogEl.value.scrollHeight
  }
}, { deep: true })

const bossHealthPercent = computed(() => {
  return Math.max(0, (bossHealth.value / props.boss.health) * 100)
})

const playerHealthPercent = computed(() => {
  const maxHp = store.state.player?.maxHp || 50
  return Math.max(0, (playerHp.value / maxHp) * 100)
})

const isVictory = computed(() => bossHealth.value <= 0)
const isDefeat = computed(() => playerHp.value <= 0)

const getRankImageUrl = computed(() => {
  const rankInfo = store.getRankInfo(store.state.cookies)
  if (rankInfo.current) {
    const filename = rankInfo.current.image
    return rankImages[filename] || ironImg
  }
  return ironImg
})

function performAttack(attackType) {
  if (isVictory.value || isDefeat.value || isAttacking.value) return
  
  isAttacking.value = true
  
  // Attack types with multipliers
  const attacks = {
    light: { hitChance: 0.9, multiplier: 1, name: 'Light Attack' },
    medium: { hitChance: 0.6, multiplier: 2, name: 'Medium Attack' },
    heavy: { hitChance: 0.3, multiplier: 3, name: 'Heavy Attack' }
  }
  
  const attack = attacks[attackType]
  const hit = Math.random() < attack.hitChance
  
  if (hit) {
    const baseDamage = store.state.player.attack * attack.multiplier
    bossHealth.value -= baseDamage
    battleLog.value.push(`✅ ${attack.name} HIT! +${baseDamage} damage`)
  } else {
    battleLog.value.push(`❌ ${attack.name} MISSED!`)
  }
  
  if (bossHealth.value <= 0) {
    playVictoryFanfare() // Play victory sound
    const goldReward = Math.floor(props.boss.health * 100)
    store.state.cookies += goldReward
    store.restoreHp()
    
    // Add to defeated bosses
    store.addDefeatedBoss(props.boss.name, props.nextRank)
    
    // Get current rank info and reset gold to minimum of current rank
    const currentRankInfo = store.getRankInfo(store.state.cookies)
    // Reset to current rank's minimum (not next rank)
    store.state.cookies = currentRankInfo.current.minGold
    
    battleLog.value.push(`🎉 Victory! +${goldReward} gold`)
    battleLog.value.push(`⭐ Promoted to ${props.nextRank}!`)
    emit('victory', goldReward)
    isAttacking.value = false
    return
  }
  
  // Boss attacks back - fixed damage ranges
  setTimeout(() => {
    // Boss has 30% chance to miss
    const bossHits = Math.random() < 0.7
    
    if (bossHits) {
      playBossAttackWarning() // Play warning sound
      // Boss lvl 1: 10-20, lvl 2: 15-25, lvl 3: 20-30, etc.
      const bossLevel = Math.floor(props.boss.health / 50)
      const minDamage = 10 + (bossLevel - 1) * 5
      const maxDamage = 20 + (bossLevel - 1) * 5
      const bossDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage
      playerHp.value -= bossDamage
      battleLog.value.push(`${props.boss.name} dealt ${bossDamage} damage!`)
    } else {
      battleLog.value.push(`${props.boss.name} MISSED!`)
    }
    
    if (playerHp.value <= 0) {
      playDefeatSound() // Play defeat sound
      const goldLost = Math.floor(store.state.cookies / 2)
      store.state.cookies -= goldLost
      battleLog.value.push(`💀 Defeat! You lost this rank.`)
      battleLog.value.push(`💸 Lost ${goldLost.toLocaleString()} gold!`)
    }
    
    isAttacking.value = false
  }, 600)
}

function skip() {
  emit('close')
}
</script>

<template>
  <div class="boss-modal-overlay" @click="skip">
    <div class="boss-modal" @click.stop>
      <div class="boss-header">
        <h2>⚔️ Boss Fight!</h2>
        <p class="rank-text">Defeat {{ boss.name }} to reach <strong>{{ nextRank }}</strong></p>
      </div>

      <div class="battle-container">
        <!-- Player -->
        <div class="battle-side player-side">
          <div class="side-emoji">🧙‍♀️</div>
          <div class="side-name">You</div>
          <div class="health-bar">
            <div class="health-fill" :style="{ width: playerHealthPercent + '%' }"></div>
          </div>
          <div class="health-text">{{ Math.max(0, playerHp) }} / {{ store.state.player?.maxHp || 50 }} HP</div>
        </div>

        <!-- VS -->
        <div class="vs-text">⚔️</div>

        <!-- Boss -->
        <div class="battle-side boss-side">
          <div class="side-emoji">{{ boss.emoji }}</div>
          <div class="side-name">{{ boss.name }}</div>
          <div class="health-bar">
            <div class="health-fill" :style="{ width: bossHealthPercent + '%' }"></div>
          </div>
          <div class="health-text">{{ Math.max(0, bossHealth) }} / {{ boss.health }} HP</div>
        </div>
      </div>

      <!-- Battle Log -->
      <div v-if="!isVictory && !isDefeat" class="battle-log" ref="battleLogEl">
        <div v-for="(log, i) in battleLog" :key="i" class="log-entry">{{ log }}</div>
      </div>

      <div v-if="!isVictory && !isDefeat" class="battle-actions">
        <div class="attack-buttons">
          <button class="attack-btn light-attack" :disabled="isAttacking" @click="performAttack('light')">
            🗡️ Light Attack
            <br>
            <span class="hit-chance">90% hit</span>
          </button>
          <button class="attack-btn medium-attack" :disabled="isAttacking" @click="performAttack('medium')">
            ⚡ Medium Attack
            <br>
            <span class="hit-chance">60% hit</span>
          </button>
          <button class="attack-btn heavy-attack" :disabled="isAttacking" @click="performAttack('heavy')">
            💥 Heavy Attack
            <br>
            <span class="hit-chance">30% hit</span>
          </button>
        </div>
        <button class="skip-btn" @click="skip">Skip (lose this rank)</button>
      </div>

      <div v-if="isVictory" class="victory-section">
        <!-- Achievement Label -->
        <div class="achievement-label">🏆 Achievement Unlocked</div>
        
        <!-- Boss Info at top -->
        <div class="victory-boss-info">
          <div class="boss-emoji-large">{{ boss.emoji }}</div>
          <div class="boss-name-large">{{ boss.name }}</div>
        </div>

        <!-- Victory Message -->
        <div class="victory-text">🎉 VICTORY! 🎉</div>
        <p class="victory-message">You defeated {{ boss.name }}!</p>
        <p class="reward-text">+{{ Math.floor(boss.health * 100) }} Gold Bonus</p>

        <!-- Promotion -->
        <div class="rank-promotion">
          <p class="next-rank-text">Promoted to:</p>
          <img :src="getRankImageUrl" :alt="nextRank" class="rank-badge">
          <p class="rank-name">{{ nextRank }}</p>
        </div>

        <p class="adventure-text">Ready for your next adventure?</p>
        <button class="continue-btn" @click="() => emit('close')">Continue Adventure</button>
      </div>

      <div v-if="isDefeat" class="defeat-section">
        <div class="defeat-text">💀 Defeat!</div>
        <p>You were defeated by {{ boss.name }}</p>
        <p>You lost this rank. Buy more HP/Attack upgrades and try again!</p>
        <button class="continue-btn" @click="() => emit('close')">Go Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boss-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;     /* środek w pionie */
    justify-content: center; /* środek w poziomie */
    z-index: 1000;
    backdrop-filter: blur(4px);

}

.boss-modal {
    position: relative; /* już NIE fixed */
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.1));
    border: 2px solid rgba(168, 85, 247, 0.5);
    border-radius: 20px;
    padding: 32px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: popIn 0.4s ease;
    display: flex;
    flex-direction: column;
    margin: auto;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.boss-header {
  text-align: center;
  margin-bottom: 24px;
}

.boss-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.rank-text {
  margin: 0;
  color: #cfcfe9;
  font-size: 14px;
}

.battle-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.battle-side {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.side-emoji {
  font-size: 50px;
  margin-bottom: 8px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.side-name {
  font-size: 14px;
  font-weight: 800;
  color: #e6e6f8;
  margin-bottom: 8px;
}

.vs-text {
  font-size: 24px;
  text-align: center;
}

.health-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.health-bar {
  width: 100%;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: width 0.3s ease;
}

.health-text {
  text-align: center;
  font-size: 12px;
  color: #cfcfe9;
  font-weight: 600;
}

.battle-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attack-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.attack-btn {
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.3;
}

.light-attack {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.medium-attack {
  background: linear-gradient(135deg, #fbbf24, #f97316);
}

.heavy-attack {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.attack-btn:hover:not(:disabled) {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.attack-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hit-chance {
  font-size: 10px;
  opacity: 0.9;
  display: block;
  margin-top: 2px;
}

.skip-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #cfcfe9;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.victory-section {
  text-align: center;
  animation: victoryPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.achievement-label {
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.victory-boss-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.boss-emoji-large {
  font-size: 48px;
}

.boss-name-large {
  font-size: 16px;
  font-weight: 700;
  color: #a855f7;
}

.victory-text {
  font-size: 48px;
  margin-bottom: 12px;
  animation: victoryBounce 1s ease-in-out infinite;
}

@keyframes victoryPop {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes victoryBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.victory-message {
  font-size: 16px;
  color: #e6e6f8;
  margin: 8px 0;
}

.rank-promotion {
  margin: 16px 0;
  padding: 16px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.next-rank-text {
  font-size: 14px;
  color: #a855f7;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.rank-badge {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(168, 85, 247, 0.4);
  margin: 8px 0;
  animation: rankPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes rankPop {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.rank-name {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 8px 0 0 0;
}

.adventure-text {
  font-size: 14px;
  color: #cfcfe9;
  margin: 16px 0 8px 0;
  font-style: italic;
}

.victory-section p {
  margin: 8px 0;
  color: #e6e6f8;
}

.reward-text {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(90deg, #fbbf24, #f97316);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.continue-btn {
  width: 100%;
  padding: 12px 20px;
  margin-top: 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #a855f7, #8b5cf6);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-btn:hover {
  box-shadow: 0 8px 16px rgba(168, 85, 247, 0.4);
}

.battle-log {
  max-height: 60px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 12px;
  font-size: 11px;
  line-height: 1.4;
}

.log-entry {
  color: #cfcfe9;
  margin: 2px 0;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.defeat-section {
  text-align: center;
}

.defeat-text {
  font-size: 32px;
  margin-bottom: 12px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.defeat-section p {
  margin: 8px 0;
  color: #e6e6f8;
}
</style>
