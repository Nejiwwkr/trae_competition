<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    stage?: string
    loading?: 'lazy' | 'eager'
    tone?: 'paper' | 'plain'
  }>(),
  { src: '', stage: '', loading: 'lazy', tone: 'paper' },
)

const loaded = ref(false)
const failed = ref(false)

watch(
  () => props.src,
  () => {
    loaded.value = false
    failed.value = false
  },
)

function onLoad() {
  loaded.value = true
}

function onError() {
  loaded.value = true
  failed.value = true
}
</script>

<template>
  <div v-if="!src || failed" class="placeholder" role="img" :aria-label="`${alt}（未见著录）`">
    <span class="placeholder__seal">阙</span>
    <span class="placeholder__text">{{ stage || '字形' }}<br />未见著录</span>
  </div>
  <div
    v-else
    class="glyph"
    :class="[`glyph--${tone}`, { 'glyph--loaded': loaded }]"
  >
    <div v-if="!loaded" class="skeleton" aria-hidden="true" />
    <img
      :src="src"
      :alt="alt"
      :loading="loading"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<style scoped>
.glyph {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.glyph--paper {
  padding: 9%;
  border-radius: 10px;
  background:
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.62), transparent 58%),
    radial-gradient(circle at 78% 84%, rgba(126, 98, 58, 0.16), transparent 62%),
    linear-gradient(155deg, #efe8d7 0%, #e4dac4 58%, #d9cdb3 100%);
  box-shadow:
    inset 0 0 0 1px rgba(84, 63, 34, 0.14),
    inset 0 0 26px rgba(110, 86, 48, 0.14),
    0 10px 24px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.glyph--paper::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}

.glyph img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition:
    opacity 0.5s var(--ease-out),
    transform 0.6s var(--ease-out);
}

.glyph--paper img {
  filter: contrast(1.04) saturate(0.92);
}

.glyph--plain img {
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.35));
}

.glyph--loaded img {
  opacity: 1;
}

.skeleton {
  position: absolute;
  inset: 18%;
  border-radius: 12px;
  background: linear-gradient(
    100deg,
    rgba(60, 48, 30, 0.06) 20%,
    rgba(90, 72, 44, 0.18) 45%,
    rgba(60, 48, 30, 0.06) 70%
  );
  background-size: 200% 100%;
  animation: ink-sweep 1.6s linear infinite;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  border: 1px dashed rgba(216, 180, 106, 0.24);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.015);
  color: var(--muted);
  text-align: center;
}

.placeholder__seal {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(200, 90, 63, 0.4);
  border-radius: 6px;
  color: #eaa189;
  font-family: var(--font-kai);
  font-size: 18px;
  transform: rotate(-6deg);
}

.placeholder__text {
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.08em;
}
</style>
