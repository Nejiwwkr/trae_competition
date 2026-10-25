<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useData } from '@/data/useData'
import { findChar, stageKey } from '@/data/buildStore'
import { glyphImageUrl } from '@/data/loadData'
import GlyphTimeline from '@/components/char/GlyphTimeline.vue'
import StructureCard from '@/components/char/StructureCard.vue'
import ComponentAnimation from '@/components/char/ComponentAnimation.vue'
import MeaningTimeline from '@/components/char/MeaningTimeline.vue'
import PhonologyCard from '@/components/char/PhonologyCard.vue'
import StoryCard from '@/components/char/StoryCard.vue'
import ShareCard from '@/components/char/ShareCard.vue'
import FamilyPanel from '@/components/char/FamilyPanel.vue'
import ModernExamples from '@/components/char/ModernExamples.vue'
import GlyphImage from '@/components/ui/GlyphImage.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const props = defineProps<{ char: string }>()

const { store, loading, error, reload } = useData()

const record = computed(() => findChar(store.value, props.char))
const highlighted = ref<number[]>([])

watch(
  () => props.char,
  () => {
    highlighted.value = []
  },
)

const method = computed(() => {
  const raw = record.value?.structure?.method ?? ''
  return raw.replace('會意', '会意').replace('形聲', '形声')
})

const modernFrame = computed(() => {
  const frames = record.value?.frames.filter((frame) => !frame.missing) ?? []
  return frames[frames.length - 1] ?? null
})

const modernSrc = computed(() => (modernFrame.value ? glyphImageUrl(modernFrame.value.relPath) : ''))

const eraSpan = computed(() => {
  const frames = record.value?.frames ?? []
  const eras = frames.map((frame) => frame.era).filter(Boolean)
  if (!eras.length) return ''
  return `${eras[0]} — ${eras[eras.length - 1]}`
})

const anchors = [
  { id: 'glyph', label: '字形' },
  { id: 'structure', label: '构形' },
  { id: 'components', label: '部件' },
  { id: 'meaning', label: '义项' },
  { id: 'phonology', label: '读音' },
  { id: 'story', label: '故事' },
  { id: 'share', label: '分享卡' },
  { id: 'family', label: '字族' },
  { id: 'examples', label: '例句' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const neighbors = computed(() => {
  const chars = store.value?.chars ?? []
  const index = chars.findIndex((item) => item.char === record.value?.char)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: chars[(index - 1 + chars.length) % chars.length] ?? null,
    next: chars[(index + 1) % chars.length] ?? null,
  }
})
</script>

<template>
  <div class="char-view">
    <div v-if="loading && !record" class="container char-loading">
      <LoadingSkeleton :lines="5" tall />
      <LoadingSkeleton class="char-loading__block" :lines="4" />
    </div>

    <div v-else-if="error" class="container char-loading">
      <div class="error panel">
        <p>数据加载失败：{{ error }}</p>
        <button class="btn btn--primary" @click="reload">重试</button>
      </div>
    </div>

    <div v-else-if="!record" class="container char-missing">
      <EmptyState
        :glyph="char"
        :title="`「${char}」暂未收录`"
        description="赛题数据包共收录 60 字，本工具只展示有可靠字形、义项与读音数据的汉字，避免以东拼西凑的内容冒充字源。"
      >
        <RouterLink to="/" class="btn btn--primary">回到首页查字</RouterLink>
        <RouterLink to="/batch" class="btn">试试批量生词本</RouterLink>
      </EmptyState>

      <div class="missing-suggest">
        <p class="eyebrow">可从这些字开始</p>
        <div class="missing-suggest__list">
          <RouterLink
            v-for="char in ['明', '行', '水', '樂', '道', '福']"
            :key="char"
            :to="`/char/${char}`"
            class="missing-suggest__item serif"
          >
            {{ char }}
          </RouterLink>
        </div>
      </div>
    </div>

    <template v-else>
      <header class="char-head">
        <span class="char-head__watermark serif" aria-hidden="true">{{ record.char }}</span>
        <div class="container char-head__inner">
          <div class="char-head__copy">
            <nav class="crumb" aria-label="面包屑">
              <RouterLink to="/">字源</RouterLink>
              <span aria-hidden="true">/</span>
              <span>字源卡</span>
              <span aria-hidden="true">/</span>
              <span class="crumb__current">{{ record.simp }}</span>
            </nav>

            <div class="char-head__title">
              <h1 class="char-head__glyph serif">{{ record.simp }}</h1>
              <div class="char-head__title-meta">
                <p v-if="record.char !== record.simp" class="char-head__trad">
                  繁体 {{ record.char }}
                </p>
                <div class="char-head__readings">
                  <span
                    v-for="reading in record.readings"
                    :key="reading.index"
                    class="chip chip--gold"
                  >
                    {{ reading.modern }}
                  </span>
                </div>
                <p class="char-head__gloss">{{ record.senses[0]?.gloss }}</p>
              </div>
            </div>

            <div class="char-head__chips">
              <span class="chip chip--jade">{{ method }}</span>
              <span class="chip">{{ record.frames.length }} 个字形阶段</span>
              <span class="chip">{{ record.senses.length }} 条义项</span>
              <span class="chip">{{ record.readings.length }} 条读音</span>
              <span v-if="eraSpan" class="chip char-head__era">{{ eraSpan }}</span>
            </div>
          </div>

          <div class="char-head__aside">
            <div class="char-head__image">
              <GlyphImage
                :src="modernSrc"
                :alt="`${record.char}的现代字形`"
                stage="楷书"
                loading="eager"
              />
            </div>
            <p class="char-head__aside-label">
              楷书 · {{ stageKey(modernFrame?.stage ?? '楷书') }}
            </p>
          </div>
        </div>
      </header>

      <nav class="anchors" aria-label="本页章节">
        <div class="container anchors__inner">
          <button
            v-for="anchor in anchors"
            :key="anchor.id"
            class="anchors__item"
            @click="scrollTo(anchor.id)"
          >
            {{ anchor.label }}
          </button>
        </div>
      </nav>

      <div class="container char-body">
        <GlyphTimeline :record="record" />
        <StructureCard :record="record" />
        <ComponentAnimation :record="record" />
        <MeaningTimeline :record="record" :highlight="highlighted" />
        <PhonologyCard :record="record" @select="highlighted = $event" />
        <StoryCard :record="record" />
        <ShareCard :record="record" />
        <FamilyPanel :record="record" />
        <ModernExamples :record="record" />

        <section class="continue">
          <RouterLink
            v-if="neighbors.prev"
            :to="`/char/${neighbors.prev.char}`"
            class="continue__link panel"
          >
            <span class="continue__label">上一个字</span>
            <span class="continue__char serif">{{ neighbors.prev.simp }}</span>
          </RouterLink>
          <div class="continue__center">
            <p class="eyebrow">Continue exploring</p>
            <p>继续溯源</p>
          </div>
          <RouterLink
            v-if="neighbors.next"
            :to="`/char/${neighbors.next.char}`"
            class="continue__link continue__link--next panel"
          >
            <span class="continue__label">下一个字</span>
            <span class="continue__char serif">{{ neighbors.next.simp }}</span>
          </RouterLink>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.char-view {
  padding-bottom: 40px;
}

.char-loading {
  display: grid;
  gap: 20px;
  padding-top: 40px;
}

.char-loading__block {
  min-height: 260px;
}

.error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 26px;
  color: var(--danger);
}

.char-missing {
  padding: 60px 0;
}

.missing-suggest {
  display: flex;
  align-items: center;
  gap: 18px;
  justify-content: center;
  margin-top: 34px;
}

.missing-suggest__list {
  display: flex;
  gap: 8px;
}

.missing-suggest__item {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 20px;
  color: var(--text-soft);
  transition:
    color 0.3s,
    border-color 0.3s;
}

.missing-suggest__item:hover {
  color: var(--gold-bright);
  border-color: var(--line-strong);
}

.char-head {
  position: relative;
  padding: 42px 0 34px;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
  background:
    radial-gradient(700px 360px at 16% 0%, rgba(216, 180, 106, 0.1), transparent 62%),
    radial-gradient(560px 340px at 88% 20%, rgba(107, 143, 179, 0.06), transparent 62%);
}

.char-head__watermark {
  position: absolute;
  right: 2vw;
  top: 50%;
  transform: translateY(-50%);
  font-size: min(44vw, 440px);
  line-height: 1;
  color: rgba(216, 180, 106, 0.032);
  pointer-events: none;
  user-select: none;
}

.char-head__inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 40px;
  align-items: center;
}

.crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.crumb a:hover {
  color: var(--gold);
}

.crumb__current {
  color: var(--text-soft);
}

.char-head__title {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-top: 18px;
}

.char-head__glyph {
  font-size: clamp(84px, 11vw, 132px);
  line-height: 1;
  font-weight: 500;
  color: var(--gold-bright);
  text-shadow: 0 18px 50px rgba(216, 180, 106, 0.16);
}

.char-head__title-meta {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.char-head__trad {
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.char-head__readings {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.char-head__gloss {
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.7;
  color: var(--text-soft);
  max-width: 520px;
}

.char-head__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.char-head__era {
  color: var(--muted);
  white-space: normal;
  overflow-wrap: anywhere;
}

.char-head__aside {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.char-head__image {
  width: 190px;
  height: 190px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 42%, rgba(216, 180, 106, 0.13), transparent 66%),
    rgba(0, 0, 0, 0.18);
  box-shadow: var(--shadow-card);
}

.char-head__aside-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--muted);
}

.anchors {
  position: sticky;
  top: var(--nav-h);
  z-index: 40;
  border-bottom: 1px solid rgba(216, 180, 106, 0.1);
  background: rgba(10, 12, 16, 0.8);
  backdrop-filter: blur(16px);
}

.anchors__inner {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}

.anchors__inner::-webkit-scrollbar {
  display: none;
}

.anchors__item {
  flex-shrink: 0;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--muted);
  border-bottom: 1px solid transparent;
  transition:
    color 0.25s,
    border-color 0.25s;
}

.anchors__item:hover {
  color: var(--gold-bright);
  border-color: var(--line-strong);
}

.char-body {
  display: grid;
  gap: 86px;
  padding-top: 48px;
}

.char-body > * {
  min-width: 0;
}

.continue {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}

.continue__link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: var(--radius-md);
  transition:
    border-color 0.3s,
    transform 0.3s var(--ease-out);
}

.continue__link--next {
  justify-content: flex-end;
  text-align: right;
}

.continue__link:hover {
  border-color: var(--line-strong);
  transform: translateY(-2px);
}

.continue__label {
  font-size: 11.5px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.continue__char {
  font-size: 32px;
  color: var(--gold-bright);
}

.continue__center {
  text-align: center;
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 900px) {
  .char-head__inner {
    grid-template-columns: 1fr;
  }

  .char-head__aside {
    display: none;
  }

  .char-head__watermark {
    font-size: 70vw;
    right: -10vw;
  }

  .char-body {
    gap: 64px;
    padding-top: 30px;
  }

  .char-head__title {
    gap: 16px;
  }

  .char-head__glyph {
    font-size: 80px;
  }

  .continue {
    grid-template-columns: 1fr;
  }

  .continue__center {
    order: -1;
  }
}
</style>
