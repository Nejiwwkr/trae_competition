<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { CharRecord, GlyphFrame } from '@/types'
import { glyphImageUrl } from '@/data/loadData'
import { stageKey } from '@/data/buildStore'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import GlyphImage from '@/components/ui/GlyphImage.vue'
import SourceBadge from '@/components/ui/SourceBadge.vue'

const props = defineProps<{ record: CharRecord }>()

type FrameView = GlyphFrame & { key: string; src: string }

const frames = computed<FrameView[]>(() =>
  props.record.frames.map((frame) => ({
    ...frame,
    key: stageKey(frame.stage),
    src: frame.missing ? '' : glyphImageUrl(frame.relPath),
  })),
)

const active = ref<FrameView | null>(null)
const activeSrc = computed(() => (active.value?.missing ? '' : glyphImageUrl(active.value?.relPath ?? '')))

function close() {
  active.value = null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="glyph-section">
    <SectionHeading
      id="glyph"
      eyebrow="Glyph evolution"
      :title="`从甲骨到楷书：${record.char}的字形长卷`"
      :lead="`共 ${frames.length} 个阶段，${frames.filter((frame) => !frame.missing).length} 张字形图。点击任一帧可查看大图与来源。`"
    />

    <div class="timeline" role="list">
      <div class="timeline__rail" aria-hidden="true" />
      <article
        v-for="(frame, index) in frames"
        :key="frame.key"
        class="frame panel"
        :style="{ '--i': index }"
        role="listitem"
      >
        <header class="frame__head">
          <span class="frame__stage serif">{{ frame.key }}</span>
          <span v-if="frame.missing" class="chip chip--vermillion">未见著录</span>
        </header>

        <button
          class="frame__button"
          :aria-label="`查看${frame.key}字形大图`"
          @click="active = frame"
        >
          <GlyphImage
            :src="frame.src"
            :alt="`${record.char}的${frame.key}字形`"
            :stage="frame.key"
          />
        </button>

        <footer class="frame__foot">
          <p class="frame__era">{{ frame.era }}</p>
          <p class="frame__font">{{ frame.fontName }}</p>
          <SourceBadge :url="frame.sourceUrl" :license="frame.license" />
        </footer>
      </article>
    </div>

    <p class="timeline__note">
      楷书字形采用开源字体 Klee One（OFL）呈现；其余字形来自 Wikimedia Commons 公有领域字形系列，逐帧出处见各卡「来源」。
    </p>

    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="active"
          class="lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="`${record.char}的${active.key}字形大图`"
          @click.self="close"
        >
          <div class="lightbox__card panel">
            <header class="lightbox__head">
              <div>
                <p class="eyebrow">{{ active.key }}</p>
                <h3 class="serif">{{ record.char }}</h3>
              </div>
              <button class="lightbox__close" aria-label="关闭" @click="close">×</button>
            </header>
            <div class="lightbox__image">
              <GlyphImage
                :src="activeSrc"
                :alt="`${record.char}的${active.key}字形`"
                :stage="active.key"
                loading="eager"
              />
            </div>
            <div class="lightbox__meta">
              <p><span>年代</span>{{ active.era }}</p>
              <p><span>字体</span>{{ active.fontName }}</p>
              <p v-if="active.sourceFile"><span>源文件</span>{{ active.sourceFile }}</p>
              <p v-if="active.eraCheck"><span>核对</span>{{ active.eraCheck }}</p>
              <p class="lightbox__source">
                <span>来源</span>
                <a
                  v-if="active.sourceUrl"
                  :href="active.sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ active.sourceUrl }}
                </a>
                <em v-else>未见著录</em>
                <b v-if="active.license">许可：{{ active.license }}</b>
              </p>
              <p v-if="active.sourceNote" class="lightbox__note">{{ active.sourceNote }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.glyph-section {
  padding: 8px 0 20px;
}

.timeline {
  position: relative;
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 26px 4px 34px;
  perspective: 1400px;
  scroll-snap-type: x mandatory;
}

.timeline__rail {
  position: absolute;
  top: 44px;
  left: 4%;
  right: 4%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-strong), var(--line-strong), transparent);
  pointer-events: none;
}

.frame {
  position: relative;
  flex: 0 0 208px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  scroll-snap-align: start;
  transform: translateZ(0);
  transition:
    transform 0.5s var(--ease-out),
    border-color 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out);
  animation: fade-up 0.8s var(--ease-out) both;
  animation-delay: calc(var(--i) * 0.08s);
}

.frame:hover {
  transform: translateY(-6px) translateZ(20px);
  border-color: var(--line-strong);
  box-shadow:
    var(--shadow-card),
    0 24px 50px rgba(0, 0, 0, 0.45);
}

.frame__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
}

.frame__stage {
  font-size: 15px;
  letter-spacing: 0.14em;
  color: var(--gold-bright);
}

.frame__button {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 10px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 50% 40%, rgba(216, 180, 106, 0.08), transparent 68%),
    rgba(0, 0, 0, 0.18);
  transition: background 0.4s var(--ease-out);
}

.frame__button:hover {
  background:
    radial-gradient(circle at 50% 40%, rgba(216, 180, 106, 0.16), transparent 70%),
    rgba(0, 0, 0, 0.22);
}

.frame__button :deep(img) {
  transition: transform 0.6s var(--ease-out);
}

.frame:hover .frame__button :deep(img) {
  transform: scale(1.05);
}

.frame__foot {
  display: grid;
  gap: 5px;
}

.frame__era {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--muted);
}

.frame__font {
  font-size: 12.5px;
  color: var(--text-soft);
}

.timeline__note {
  margin-top: 4px;
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(4, 6, 8, 0.82);
  backdrop-filter: blur(10px);
}

.lightbox__card {
  width: min(92vw, 760px);
  max-height: 88vh;
  overflow-y: auto;
  padding: 26px;
  background: rgba(16, 20, 26, 0.96);
}

.lightbox__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lightbox__head h3 {
  margin-top: 4px;
  font-size: 34px;
  font-weight: 500;
}

.lightbox__close {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 50%;
  font-size: 22px;
  color: var(--muted);
  transition:
    color 0.2s,
    border-color 0.2s;
}

.lightbox__close:hover {
  color: var(--gold);
  border-color: var(--line-strong);
}

.lightbox__image {
  height: min(44vh, 360px);
  margin: 18px 0;
  padding: 18px;
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 42%, rgba(216, 180, 106, 0.1), transparent 68%),
    rgba(0, 0, 0, 0.22);
}

.lightbox__meta {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: var(--text-soft);
}

.lightbox__meta p {
  display: flex;
  gap: 12px;
  line-height: 1.7;
}

.lightbox__meta span {
  flex: 0 0 52px;
  color: var(--muted);
}

.lightbox__source {
  flex-wrap: wrap;
  align-items: baseline;
}

.lightbox__source a {
  color: var(--gold);
  word-break: break-all;
  border-bottom: 1px solid transparent;
}

.lightbox__source a:hover {
  border-color: var(--line-strong);
}

.lightbox__source b {
  font-weight: 400;
  color: var(--muted);
}

.lightbox__source em {
  color: var(--muted);
  font-style: normal;
}

.lightbox__note {
  color: var(--muted);
  font-size: 12px;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s var(--ease-out);
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .frame {
    flex-basis: 186px;
  }

  .timeline {
    gap: 14px;
  }
}
</style>
