<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CharRecord } from '@/types'
import { getComponentAnnotation } from '@/content'
import { glyphImageUrl } from '@/data/loadData'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import GlyphImage from '@/components/ui/GlyphImage.vue'

const props = defineProps<{ record: CharRecord }>()

const annotation = computed(() => getComponentAnnotation(props.record.char))
const playing = ref(false)

const modernFrame = computed(() => {
  const frames = props.record.frames.filter((frame) => !frame.missing)
  return frames[frames.length - 1] ?? null
})

const modernSrc = computed(() => (modernFrame.value ? glyphImageUrl(modernFrame.value.relPath) : ''))

function play() {
  playing.value = false
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      playing.value = true
    })
  })
}

onMounted(() => {
  setTimeout(play, 400)
})
</script>

<template>
  <section>
    <SectionHeading
      id="components"
      eyebrow="Component animation"
      title="拆开来看：部件如何合成一个字"
      lead="仅对构形明确、部件可辨识的字提供演示，不做推测性拆解。"
    />

    <div v-if="annotation" class="comp panel">
      <div class="comp__stage">
        <div class="comp__target" aria-hidden="true" />
        <div class="comp__watermark" aria-hidden="true">
          <GlyphImage :src="modernSrc" :alt="record.char" stage="楷书" tone="plain" />
        </div>
        <span
          v-for="(part, index) in annotation.parts"
          :key="`${part.glyph}-${index}`"
          class="part"
          :class="[`part--${part.position}`, { 'part--in': playing }]"
          :style="{ '--delay': `${index * 200}ms` }"
        >
          <span class="part__glyph serif">{{ part.glyph }}</span>
          <span class="part__label">{{ part.label }}</span>
        </span>
      </div>

      <div class="comp__info">
        <p class="eyebrow">构形</p>
        <p class="comp__formula serif">{{ annotation.formula }}</p>
        <ul class="comp__parts">
          <li v-for="(part, index) in annotation.parts" :key="index">
            <span class="comp__part-glyph serif">{{ part.glyph }}</span>
            <div>
              <p class="comp__part-label">{{ part.label }}</p>
              <p class="comp__part-meaning">{{ part.meaning }}</p>
            </div>
          </li>
        </ul>
        <p class="comp__note">{{ annotation.note }}</p>
        <button class="btn" @click="play">
          <span aria-hidden="true">↻</span>
          重播构形
        </button>
      </div>
    </div>

    <div v-else class="comp-empty panel">
      <span class="comp-empty__seal serif">析</span>
      <p>
        「{{ record.char }}」的部件拆分暂未人工标注，可参看上方构形解析。为避免误导，本工具不对未核验的字做自动拆解。
      </p>
    </div>
  </section>
</template>

<style scoped>
.comp {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 34px;
  padding: 30px;
}

.comp__stage {
  position: relative;
  height: 360px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background:
    radial-gradient(circle at 50% 48%, rgba(216, 180, 106, 0.12), transparent 62%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent),
    rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.comp__target {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(216, 180, 106, 0.22);
  border-radius: 50%;
}

.comp__watermark {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 190px;
  height: 190px;
  transform: translate(-50%, -50%);
  opacity: 0.1;
}

.comp__watermark :deep(img) {
  filter: invert(1) brightness(1.6);
}

.part {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transform: translate(-50%, -50%) scale(calc(var(--base-scale, 1) * 0.6));
  transition:
    opacity 0.55s var(--ease-out) var(--delay),
    transform 0.8s var(--ease-out) var(--delay);
}

.part--in {
  opacity: 1;
  transform: translate(-50%, -50%) scale(var(--base-scale, 1));
}

.part--left {
  left: 22%;
  top: 50%;
}

.part--right {
  left: 78%;
  top: 50%;
}

.part--top {
  left: 50%;
  top: 22%;
}

.part--bottom {
  left: 50%;
  top: 78%;
}

.part--inside {
  left: 50%;
  top: 50%;
  --base-scale: 0.82;
}

.part--outside {
  left: 30%;
  top: 82%;
  --base-scale: 0.9;
}

.part__glyph {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background:
    radial-gradient(circle at 50% 40%, rgba(216, 180, 106, 0.16), transparent 70%),
    rgba(14, 18, 23, 0.92);
  color: var(--gold-bright);
  font-size: 40px;
  line-height: 1;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.4);
}

.part__label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.comp__info {
  display: grid;
  align-content: center;
  gap: 14px;
}

.comp__formula {
  font-size: 32px;
  color: var(--gold-bright);
  letter-spacing: 0.06em;
}

.comp__parts {
  display: grid;
  gap: 10px;
}

.comp__parts li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comp__part-glyph {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 9px;
  font-size: 20px;
  color: var(--text-soft);
}

.comp__part-label {
  font-size: 13px;
  color: var(--text);
}

.comp__part-meaning {
  font-size: 11.5px;
  color: var(--muted);
}

.comp__note {
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--muted);
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.025);
}

.comp__info .btn {
  justify-self: start;
}

.comp-empty {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 26px 30px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--muted);
}

.comp-empty__seal {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border: 1px dashed var(--line);
  border-radius: 10px;
  font-size: 24px;
  color: var(--gold);
}

@media (max-width: 900px) {
  .comp {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .comp__stage {
    height: 320px;
  }
}
</style>
