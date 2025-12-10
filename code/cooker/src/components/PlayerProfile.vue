<script setup>
import { computed } from 'vue'
import { useClickerStore } from '@/store/useClickerStore'
import { getTranslation } from '@/i18n/translations'

const store = useClickerStore()
const t = (key) => getTranslation(key, store.state.settings.language)

const player = computed(() => store.state.player)

const attackUpgradeCost = computed(() => {
  const attack = store.state.player.attack || 10
  const upgrades = (attack - 10) / 5
  return Math.floor(40000 * Math.pow(1.5, upgrades))
})

const hpUpgradeCost = computed(() => {
  const maxHp = store.state.player.maxHp || 50
  const upgrades = (maxHp - 50) / 10
  return Math.floor(30000 * Math.pow(1.5, upgrades))
})

function buyAttack() {
  const cost = attackUpgradeCost.value
  if (store.state.cookies >= cost) {
    store.buyAttackUpgrade(cost)
  }
}

function buyHp() {
  const cost = hpUpgradeCost.value
  if (store.state.cookies >= cost) {
    store.buyHpUpgrade(cost)
  }
}

const canBuyAttack = computed(() => store.state.cookies >= attackUpgradeCost.value)
const canBuyHp = computed(() => store.state.cookies >= hpUpgradeCost.value)

const defeatedBosses = computed(() => store.state.defeatedBosses || [])
const uniqueBosses = computed(() => {
  const bossMap = new Map()
  for (const boss of defeatedBosses.value) {
    if (!bossMap.has(boss.name)) {
      bossMap.set(boss.name, boss)
    }
  }
  return Array.from(bossMap.values())
})
</script>

<template>
  <div class="profile">
    <h3>👤 {{ t('player') }}</h3>
    
    <div class="player-visual">
      <div class="player-emoji">🧙‍♀️</div>
      <div class="player-name">Leblanc</div>
    </div>

    <div class="stats-grid">
      <!-- Attack -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">⚡</span>
          <span class="stat-name">{{ t('attack') }}</span>
        </div>
        <div class="stat-value">{{ player.attack || 15 }}</div>
        <button 
          class="upgrade-btn" 
          :disabled="!canBuyAttack"
          @click="buyAttack"
        >
          +5 {{ t('attack') }}
          <br>
          <span class="cost">{{ attackUpgradeCost.toLocaleString() }} 💰</span>
        </button>
      </div>

      <!-- HP -->
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">❤️</span>
          <span class="stat-name">{{ t('hp') }}</span>
        </div>
        <div class="stat-value">{{ player.currentHp || 50 }} / {{ player.maxHp || 50 }}</div>
        <div class="hp-bar">
          <div class="hp-fill" :style="{ width: ((player.currentHp || 50) / (player.maxHp || 50)) * 100 + '%' }"></div>
        </div>
        <button 
          class="upgrade-btn" 
          :disabled="!canBuyHp"
          @click="buyHp"
        >
          +10 MAX HP
          <br>
          <span class="cost">{{ hpUpgradeCost.toLocaleString() }} 💰</span>
        </button>
      </div>

    </div>

    <!-- Achievements -->
    <div class="achievements">
      <h4>🏆 {{ t('achievements') }}</h4>
      <div v-if="uniqueBosses.length === 0" class="no-achievements">
        {{ t('noBossesDefeated') }}
      </div>
      <div v-else class="boss-list">
        <div v-for="boss in uniqueBosses" :key="boss.name" class="boss-item">
          <span class="boss-name">{{ boss.name }}</span>
          <span class="boss-rank">{{ boss.rank }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
}

.profile h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.player-visual {
  text-align: center;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.player-emoji {
  font-size: 40px;
  margin-bottom: 6px;
}

.player-name {
  font-weight: 800;
  color: #e6e6f8;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.stat-icon {
  font-size: 16px;
}

.stat-name {
  color: #cfcfe9;
  font-weight: 600;
}

.stat-value {
  font-size: 16px;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 8px;
}

.hp-bar, .stamina-bar {
  width: 100%;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: width 0.3s ease;
}

.stamina-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}

.upgrade-btn {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #a855f7, #8b5cf6);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.3;
}

.upgrade-btn:hover:not(:disabled) {
  box-shadow: 0 6px 12px rgba(168, 85, 247, 0.3);
}

.upgrade-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cost {
  font-size: 10px;
  opacity: 0.8;
  display: block;
  margin-top: 2px;
}

.achievements {
  margin-top: 16px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 8px;
}

.achievements h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #fbbf24;
  font-weight: 700;
}

.no-achievements {
  color: #cfcfe9;
  font-size: 12px;
  text-align: center;
  padding: 8px;
  opacity: 0.7;
}

.boss-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boss-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.15);
  font-size: 12px;
}

.boss-name {
  font-weight: 600;
  color: #e6e6f8;
}

.boss-rank {
  background: linear-gradient(90deg, #a855f7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  font-size: 11px;
}

</style>
