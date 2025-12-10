<script setup>
import CookieClicker from '@/components/CookieClicker.vue'
import PlayerProfile from '@/components/PlayerProfile.vue'
import UpgradePanel from '@/components/UpgradePanel.vue'
import SettingsBar from '@/components/SettingsBar.vue'
</script>

<template>
  <div class="topbar">

    <SettingsBar />
  </div>
  <main class="layout">
    <section class="left panel-glass fade-in">
      <PlayerProfile />
    </section>
    <section class="center panel-glass fade-in" style="animation-delay: .03s">
      <CookieClicker />
    </section>
    <section class="right panel-glass fade-in" style="animation-delay: .06s">
      <UpgradePanel />
    </section>
  </main>
</template>

<style scoped>
.topbar { max-width: 1800px; margin: 10px auto 0; padding: 0 16px; }
.layout {
  display: grid;
  grid-template-columns: 280px 1.5fr 350px;
  gap: 16px;
  max-width: 1900px;
  margin: 0 auto;
  padding: 16px;
  align-items: start;
}

.left {
  height: fit-content;
}

@media (max-width: 1400px) {
  .layout { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}

.panel-glass {
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

.fade-in { opacity: 0; transform: translateY(10px) scale(0.99); animation: popIn .35s ease forwards; }
@keyframes popIn { to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
