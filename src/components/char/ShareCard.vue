<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { CharRecord } from '@/types'
import { glyphImageUrl } from '@/data/loadData'
import { stageKey } from '@/data/buildStore'
import { getStory } from '@/content'
import { useShareImage } from '@/composables/useShareImage'
import { useTilt } from '@/composables/useTilt'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const props = defineProps<{ record: CharRecord }>()

const tiltRef = ref<HTMLElement | null>(null)
const scaleRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
useTilt(tiltRef, 6)

const scale = ref(1)
let observer: ResizeObserver | null = null

onMounted(() => {
  observer = new ResizeObserver(() => {
    const width = scaleRef.value?.clientWidth ?? 540
    scale.value = Math.min(1, width / 540)
  })
  if (scaleRef.value) observer.observe(scaleRef.value)
})

onBeforeUnmount(() => observer?.disconnect())

const frames = computed(() =>
  props.record.frames.map((frame) => ({
    ...frame,
    key: stageKey(frame.stage),
    src: frame.missing ? '' : glyphImageUrl(frame.relPath),
  })),
)

const method = computed(() => {
  const raw = props.record.structure?.method ?? ''
  return raw.replace('會意', '会意').replace('形聲', '形声')
})

const analysis = computed(() => {
  const text = props.record.structure?.analysis ?? ''
  return [...text].length > 86 ? `${[...text].slice(0, 86).join('')}…` : text
})

const senses = computed(() => props.record.senses.slice(0, 3))
const reading = computed(() => props.record.readings[0])
const story = computed(() => getStory(props.record))

const { exporting, error, exportNode } = useShareImage()

async function download() {
  if (!cardRef.value) return
  try {
    await exportNode(cardRef.value, `字源卡-${props.record.char}.png`)
  } catch {
    /* 错误已写入 error */
  }
}
</script>

<template>
  <section>
    <SectionHeading
      id="share"
      eyebrow="Share card"
      title="把这条三千年，带走"
      lead="一张 1080 像素宽的字源卡，含字形序列、构形、义项、读音与来源。"
    />

    <div class="share panel">
      <div ref="scaleRef" class="share__preview">
        <div ref="tiltRef" class="share__tilt">
          <div
            class="share__scale"
            :style="{ transform: `scale(${scale})`, height: `${740 * scale}px` }"
          >
            <article ref="cardRef" class="share-card">
              <header class="sc__head">
                <div class="sc__brand">
                  <span class="sc__brand-mark serif">字</span>
                  <div>
                    <strong class="serif">字源</strong>
                    <small>形 · 音 · 义</small>
                  </div>
                </div>
                <span class="sc__no serif">{{ String(record.senses.length).padStart(2, '0') }} 义</span>
              </header>

              <div class="sc__title">
                <span class="sc__char serif">{{ record.simp }}</span>
                <div class="sc__title-meta">
                  <p v-if="record.char !== record.simp" class="sc__trad serif">{{ record.char }}</p>
                  <p class="sc__pinyin">
                    {{ record.readings.map((item) => item.modern).join(' / ') }}
                  </p>
                  <span class="sc__method">{{ method }}</span>
                </div>
              </div>

              <div class="sc__glyphs">
                <figure v-for="frame in frames" :key="frame.key" class="sc__glyph">
                  <div class="sc__glyph-img">
                    <img
                      v-if="frame.src"
                      :src="frame.src"
                      :alt="`${record.char}的${frame.key}字形`"
                      crossorigin="anonymous"
                    />
                    <span v-else class="sc__glyph-missing serif">阙</span>
                  </div>
                  <figcaption>{{ frame.key }}</figcaption>
                </figure>
              </div>

              <p class="sc__analysis">{{ analysis }}</p>

              <div class="sc__senses">
                <div v-for="sense in senses" :key="sense.index" class="sc__sense">
                  <span class="sc__sense-type">{{ sense.type }}</span>
                  <p class="sc__sense-gloss">{{ sense.gloss }}</p>
                  <p class="sc__sense-cite">{{ sense.citation }}：{{ sense.quote }}</p>
                </div>
              </div>

              <div class="sc__reading">
                <div>
                  <span>反切</span>
                  <strong>{{ reading?.fanqie }}</strong>
                </div>
                <div>
                  <span>上古拟音</span>
                  <strong>{{ reading?.oldChinese }}</strong>
                </div>
                <div>
                  <span>今读</span>
                  <strong>{{ reading?.modern }}</strong>
                </div>
              </div>

              <footer class="sc__foot">
                <p>{{ story.seconds }} 秒 · {{ [...story.text].length }} 字</p>
                <p>字形：Wikimedia Commons 公有领域 / Klee One OFL；义项：《說文解字》及数据包考释。</p>
                <p>数据核验与争议标注见本站「数据核验」页</p>
              </footer>

              <span class="sc__stamp serif">源</span>
            </article>
          </div>
        </div>
      </div>

      <div class="share__actions">
        <button class="btn btn--primary" :disabled="exporting" @click="download">
          <span aria-hidden="true">↓</span>
          {{ exporting ? '正在生成图片…' : '下载字源卡 PNG' }}
        </button>
        <p class="share__hint">导出为 1080 像素宽高清图；图片包含数据来源与许可信息。</p>
        <p v-if="error" class="share__error">导出失败：{{ error }}。请稍后重试。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.share {
  display: grid;
  grid-template-columns: minmax(0, 560px) 1fr;
  gap: 36px;
  align-items: center;
  padding: 30px;
}

.share__preview {
  width: 100%;
  min-width: 0;
}

.share__tilt {
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  transform: perspective(1200px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transition: transform 0.4s var(--ease-out);
  transform-style: preserve-3d;
}

.share__scale {
  transform-origin: top left;
  width: 540px;
  overflow: hidden;
}

.share-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 540px;
  height: 740px;
  padding: 34px 36px 28px;
  overflow: hidden;
  background:
    radial-gradient(420px 260px at 84% 4%, rgba(216, 180, 106, 0.13), transparent 64%),
    radial-gradient(380px 260px at 10% 92%, rgba(200, 90, 63, 0.08), transparent 64%),
    linear-gradient(165deg, #12161c 0%, #0c0f14 62%, #0a0c10 100%);
  color: var(--text);
  border: 1px solid rgba(216, 180, 106, 0.24);
  border-radius: 18px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
}

.share-card::before {
  content: "";
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(216, 180, 106, 0.1);
  border-radius: 12px;
  pointer-events: none;
}

.sc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sc__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sc__brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(216, 180, 106, 0.4);
  border-radius: 8px;
  color: var(--gold-bright);
  font-size: 19px;
}

.sc__brand strong {
  display: block;
  font-size: 15px;
  letter-spacing: 0.22em;
}

.sc__brand small {
  font-size: 9px;
  letter-spacing: 0.24em;
  color: var(--muted);
}

.sc__no {
  color: var(--gold);
  font-size: 13px;
  letter-spacing: 0.16em;
}

.sc__title {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 22px 0 18px;
}

.sc__char {
  font-size: 78px;
  line-height: 1;
  color: var(--gold-bright);
  text-shadow: 0 10px 30px rgba(216, 180, 106, 0.16);
}

.sc__title-meta {
  display: grid;
  gap: 4px;
}

.sc__trad {
  font-size: 18px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.sc__pinyin {
  font-size: 14px;
  color: var(--text-soft);
  letter-spacing: 0.04em;
}

.sc__method {
  justify-self: start;
  padding: 1px 8px;
  border: 1px solid rgba(216, 180, 106, 0.3);
  border-radius: 999px;
  font-size: 10.5px;
  color: var(--gold);
}

.sc__glyphs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.sc__glyph {
  display: grid;
  gap: 4px;
  justify-items: center;
}

.sc__glyph-img {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  padding: 7%;
  border-radius: 5px;
  background:
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.6), transparent 58%),
    linear-gradient(155deg, #efe8d7, #d9cdb3);
  box-shadow: inset 0 0 0 1px rgba(84, 63, 34, 0.14);
}

.sc__glyph-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sc__glyph-missing {
  font-size: 17px;
  color: #6f6c64;
}

.sc__glyph figcaption {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.sc__analysis {
  margin-top: 14px;
  font-family: var(--font-serif);
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-soft);
}

.sc__senses {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.sc__sense {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 2px 8px;
  padding-top: 7px;
  border-top: 1px dashed rgba(255, 255, 255, 0.07);
}

.sc__sense-type {
  grid-row: span 2;
  align-self: start;
  padding-top: 1px;
  font-size: 10px;
  color: var(--gold);
  letter-spacing: 0.06em;
}

.sc__sense-gloss {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text);
}

.sc__sense-cite {
  font-family: var(--font-serif);
  font-size: 10px;
  line-height: 1.6;
  color: var(--muted);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.sc__reading {
  display: flex;
  gap: 22px;
  margin-top: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(216, 180, 106, 0.06);
  border: 1px solid rgba(216, 180, 106, 0.12);
}

.sc__reading div {
  display: grid;
  gap: 1px;
}

.sc__reading span {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.sc__reading strong {
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-soft);
}

.sc__foot {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(216, 180, 106, 0.14);
  display: grid;
  gap: 3px;
  font-size: 9px;
  line-height: 1.6;
  color: var(--muted);
}

.sc__stamp {
  position: absolute;
  right: 38px;
  bottom: 64px;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(200, 90, 63, 0.42);
  border-radius: 8px;
  color: #eaa189;
  font-size: 24px;
  transform: rotate(-8deg);
  opacity: 0.75;
}

.share__actions {
  display: grid;
  gap: 12px;
  align-content: center;
  justify-items: start;
}

.share__hint {
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
}

.share__error {
  font-size: 12px;
  color: var(--danger);
}

@media (max-width: 1000px) {
  .share {
    grid-template-columns: 1fr;
  }

  .share__actions {
    justify-items: center;
    text-align: center;
  }
}

@media (max-width: 620px) {
  .share {
    padding: 18px;
  }
}
</style>
