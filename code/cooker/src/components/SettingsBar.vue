<script setup>
import {computed, onMounted, ref, nextTick, watch} from 'vue'
import {useClickerStore} from '@/store/useClickerStore'
import {getTranslation} from '@/i18n/translations'

const store = useClickerStore()

const sound = computed({
    get: () => store.state.settings.sound,
    set: v => {
        store.setSound(v)
        store.save?.()
    }
})
const confetti = computed({
    get: () => store.state.settings.confetti,
    set: v => {
        store.setConfetti(v)
        store.save?.()
    }
})
const battleMusic = computed({
    get: () => store.state.settings.battleMusic,
    set: v => {
        store.setBattleMusic(v)
        store.save?.()
    }
})
const language = computed({
    get: () => store.state.settings.language,
    set: v => {
        store.setLanguage(v)
        store.save?.()
    }
})

const t = (key) => getTranslation(key, language.value)

// Force re-render when language changes
watch(() => language.value, () => {
    nextTick()
})

const showAdminPopup = ref(false)
const showResetConfirm = ref(false)

function handleReset() {
    showResetConfirm.value = true
}

function confirmReset() {
    showResetConfirm.value = false
    store.reset()
}

function cancelReset() {
    showResetConfirm.value = false
}

function openAdminPanel() {
    const password = prompt('Admin password:')
    if (password === 'leblanc') {
        showAdminPopup.value = true
    } else if (password) {
        alert('Wrong password!')
    }
}

function addGold(amount) {
    store.state.cookies += amount
}

function closeAdminPanel() {
    showAdminPopup.value = false
}

onMounted(() => {
    // cleanup reduced motion on mount
    if (typeof document !== 'undefined') {
        document.body.classList.remove('reduced-motion')
    }
})
</script>

<template>
    <div class="topbar-content">
        <div class="logo-section">
            <img src="@/assets/lol.svg.png" alt="Title" class="title">
            <img src="@/assets/madeby.png" alt="Made By" class="madeby">
        </div>
        <div class="controls">
            <div class="admin">
                <div class="group">
                    <span class="label">Admin</span>
                    <button class="chip admin-btn" @click="openAdminPanel">🔐 Unlock</button>
                </div>
            </div>
            <div class="game-controls">
                <div class="group">
                    <span class="label">{{ t('game') }}</span>
                    <select v-model="language" class="chip language-chip">
                        <option value="en">English</option>
                        <option value="pl">Polski</option>
                        <option value="de">Deutsch</option>
                    </select>
                    <button class="chip reset-btn" @click="handleReset">{{ t('resetGame') }}</button>
                </div>
            </div>
            <div class="settings">
                <div class="group">
                    <span class="label">{{ t('settings') }}</span>
                    <button class="chip" :class="{ active: sound }" @click="sound = !sound">{{ t('soundToggle') }}</button>
                    <button class="chip" :class="{ active: battleMusic }" @click="battleMusic = !battleMusic">{{ t('battleMusicToggle') }}</button>
                    <button class="chip" :class="{ active: confetti }" @click="confetti = !confetti">{{ t('confettiToggle') }}</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <div v-if="showResetConfirm" class="admin-overlay" @click="cancelReset">
        <div class="admin-popup" @click.stop>
            <h3>⚠️ Reset Game</h3>
            <p class="reset-warning">Are you sure you want to reset the game? You will lose all progress!</p>
            <div class="reset-buttons">
                <button class="reset-confirm-btn" @click="confirmReset">Yes, Reset</button>
                <button class="reset-cancel-btn" @click="cancelReset">Cancel</button>
            </div>
        </div>
    </div>


    <!-- Admin Popup -->
    <div v-if="showAdminPopup" class="admin-overlay" @click="closeAdminPanel">
        <div class="admin-popup" @click.stop>
            <h3>💰 Admin Panel</h3>

            <!-- Balance -->
            <div class="admin-balance">
                <span class="balance-label">Current Balance:</span>
                <span class="balance-value">{{ store.state.cookies.toLocaleString() }} 💰</span>
            </div>

            <!-- Gold Buttons -->
            <div class="admin-buttons">
                <button class="admin-gold-btn" @click="addGold(1000)">+1,000</button>
                <button class="admin-gold-btn" @click="addGold(5000)">+5,000</button>
                <button class="admin-gold-btn" @click="addGold(9990)">+9,990</button>
                <button class="admin-gold-btn" @click="addGold(20000)">+20,000</button>
                <button class="admin-gold-btn" @click="addGold(50000)">+50,000</button>
                <button class="admin-gold-btn" @click="addGold(100000)">+100,000</button>
                <button class="admin-gold-btn" @click="addGold(500000)">+500,000</button>
                <button class="admin-gold-btn" @click="addGold(1000000)">+1,000,000</button>
            </div>

            <button class="admin-close-btn" @click="closeAdminPanel">Close</button>
        </div>
    </div>
</template>

<style scoped>
.topbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.admin {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
}

.settings {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
}

.game-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
}

.language-chip {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
}

.language-chip:hover {
    background: rgba(255, 255, 255, 0.1);
}

.language-chip option {
    background: #1a1a2e;
    color: #fff;
}

.reset-btn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: transparent;
}

.reset-btn:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.title {
    width: 350px;
    height: auto;
    object-fit: contain;
}

.madeby {
    width: 500px;
    height: auto;
    object-fit: contain;
    opacity: 0.9;
}

.group {
    display: flex;
    gap: 8px;
    align-items: center;
}

.label {
    opacity: .9;
    font-size: 13px;
    color: #e6e6f8;
    margin-right: 6px;
}

.chip {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
}

.chip.active {
    background: linear-gradient(135deg, var(--accent), #8ec5ff);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.chip.reset-btn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: transparent;
}

.chip.reset-btn:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.chip.admin-btn {
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    border-color: transparent;
}

.chip.admin-btn:hover {
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

.chip.settings-btn {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border-color: transparent;
}

.chip.settings-btn:hover {
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

.language-select {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
}

.language-select:hover {
    background: rgba(255, 255, 255, 0.1);
}

.language-select option {
    background: #1a1a2e;
    color: #fff;
}

.admin-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.admin-popup {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.15));
    border: 2px solid rgba(168, 85, 247, 0.4);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    min-width: 350px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.admin-popup h3 {
    margin: 0;
    font-size: 20px;
    color: #fff;
}

.admin-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 12px;
    background: rgba(251, 191, 36, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(251, 191, 36, 0.3);
}

.admin-label {
    color: #cfcfe9;
    font-size: 13px;
    font-weight: 600;
}

.admin-select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.05);
    color: #fff;
    cursor: pointer;
    font-size: 13px;
}

.admin-select:hover {
    background: rgba(251, 191, 36, 0.15);
}

.admin-select option {
    background: #1a1a2e;
    color: #fff;
}

.admin-balance {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin: 0;
    padding: 12px;
    background: rgba(251, 191, 36, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(251, 191, 36, 0.3);
}

.balance-label {
    color: #cfcfe9;
    font-size: 13px;
}

.balance-value {
    font-size: 18px;
    font-weight: 800;
    color: #fbbf24;
}

.admin-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 0;
    width: 100%;
}

.admin-gold-btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #fbbf24, #f97316);
    color: #000;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.admin-gold-btn:hover {
    box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
    transform: translateY(-2px);
}

.admin-reset-btn {
    width: 100%;
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0;
}

.admin-reset-btn:hover {
    box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
}

.admin-close-btn {
    width: 100%;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    color: #cfcfe9;
    cursor: pointer;
    transition: all 0.2s ease;
}

.admin-close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.reset-warning {
    color: #cfcfe9;
    font-size: 14px;
    margin: 16px 0;
    line-height: 1.5;
}

.reset-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.reset-confirm-btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.reset-confirm-btn:hover {
    box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4);
    transform: translateY(-2px);
}

.reset-cancel-btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    color: #cfcfe9;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.reset-cancel-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

</style>
