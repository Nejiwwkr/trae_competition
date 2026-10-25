<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  glyph?: string
}>()
</script>

<template>
  <div class="empty panel">
    <div class="empty__glyph serif">{{ glyph ?? '阙' }}</div>
    <h2 class="empty__title serif">{{ title }}</h2>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <div class="empty__action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 72px 32px;
  gap: 14px;
}

.empty__glyph {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border: 1px solid var(--line);
  border-radius: 18px;
  font-size: 40px;
  color: var(--gold);
  margin-bottom: 6px;
}

.empty__title {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.empty__desc {
  max-width: 520px;
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.9;
}

.empty__action {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}
</style>
