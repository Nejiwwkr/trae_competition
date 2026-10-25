<script setup lang="ts">
defineProps<{
  id?: string
  eyebrow?: string
  title: string
  lead?: string
}>()
</script>

<template>
  <header :id="id" class="head">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="lead" class="section-lead">{{ lead }}</p>
    <slot />
  </header>
</template>

<style scoped>
.head {
  margin-bottom: 28px;
}

.eyebrow + .section-title {
  margin-top: 10px;
}
</style>
