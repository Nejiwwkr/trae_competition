<script setup lang="ts">
withDefaults(defineProps<{ lines?: number; tall?: boolean }>(), { lines: 4, tall: false })
</script>

<template>
  <div class="loading panel" :class="{ 'loading--tall': tall }" aria-busy="true" aria-label="正在加载">
    <div class="loading__title" />
    <div v-for="line in lines" :key="line" class="loading__line" :style="{ width: `${94 - line * 7}%` }" />
  </div>
</template>

<style scoped>
.loading {
  display: grid;
  gap: 14px;
  padding: 32px;
  overflow: hidden;
}

.loading__title {
  width: 38%;
  height: 26px;
  border-radius: 8px;
  background: linear-gradient(100deg, rgba(255, 255, 255, 0.04), rgba(216, 180, 106, 0.12), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: ink-sweep 1.6s linear infinite;
}

.loading__line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(100deg, rgba(255, 255, 255, 0.03), rgba(216, 180, 106, 0.08), rgba(255, 255, 255, 0.03));
  background-size: 200% 100%;
  animation: ink-sweep 1.6s linear infinite;
}

.loading--tall {
  min-height: 420px;
  align-content: start;
}
</style>
