<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopNav from '@/components/layout/TopNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <TopNav />
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-main {
  min-height: calc(100vh - var(--nav-h) - 180px);
}
</style>
