<script setup lang="ts">
defineProps<{
  url?: string
  license?: string
  label?: string
}>()
</script>

<template>
  <span class="source">
    <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer" class="source__link">
      {{ label ?? '来源' }} ↗
    </a>
    <span v-if="license" class="source__license">{{ license }}</span>
  </span>
</template>

<style scoped>
.source {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.5;
}

.source__link {
  color: var(--text-soft);
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.source__link:hover {
  color: var(--gold-bright);
  border-color: var(--line-strong);
}

.source__license {
  padding-left: 8px;
  border-left: 1px solid var(--line);
}
</style>
