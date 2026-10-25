<script setup lang="ts">
defineProps<{ text?: string }>()
</script>

<template>
  <span class="dispute" :title="text || undefined">
    <span class="dispute__mark" aria-hidden="true">说</span>
    一说
  </span>
</template>

<style scoped>
.dispute {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px 2px 4px;
  border: 1px solid rgba(200, 90, 63, 0.4);
  border-radius: 999px;
  background: var(--vermillion-soft);
  color: #eaa189;
  font-size: 11.5px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.dispute__mark {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: rgba(200, 90, 63, 0.28);
  font-size: 10px;
  font-family: var(--font-kai);
  color: #f3c2b1;
}
</style>
