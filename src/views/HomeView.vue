<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useData } from '@/data/useData'
import { glyphImageUrl } from '@/data/loadData'
import { getStory } from '@/content'
import CharSearch from '@/components/search/CharSearch.vue'
import GlyphImage from '@/components/ui/GlyphImage.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import HeroScene from '@/components/hero/HeroScene.vue'

const { store, loading, error, reload } = useData()

const hotChars = ['人', '水', '日', '月', '明', '武', '牧', '初', '見', '心', '道', '福']

const hot = computed(() =>
  hotChars
    .map((char) => store.value?.byTraditional.get(char))
    .filter((record): record is NonNullable<typeof record> => Boolean(record))
    .map((record) => {
      const ancient = record.frames.find((frame) => !frame.missing) ?? record.frames[0]
      const modern = record.frames[record.frames.length - 1]
      return {
        record,
        ancientSrc: ancient?.missing ? '' : glyphImageUrl(ancient?.relPath ?? ''),
        modernSrc: modern?.missing ? '' : glyphImageUrl(modern?.relPath ?? ''),
        reading: record.readings[0]?.modern ?? '',
      }
    }),
)

const featured = computed(() => store.value?.byTraditional.get('明') ?? null)

const orbitFrames = computed(() => {
  if (!featured.value) return []
  return featured.value.frames.map((frame) => ({
    ...frame,
    src: frame.missing ? '' : glyphImageUrl(frame.relPath),
  }))
})

const featuredStory = computed(() => (featured.value ? getStory(featured.value) : null))

const stats = computed(() => {
  const chars = store.value?.chars ?? []
  return [
    { value: chars.length || 60, label: '收录汉字' },
    { value: chars.reduce((sum, record) => sum + record.frames.length, 0) || 300, label: '字形帧' },
    { value: chars.reduce((sum, record) => sum + record.senses.length, 0) || 172, label: '义项' },
    { value: chars.reduce((sum, record) => sum + record.readings.length, 0) || 82, label: '读音记录' },
  ]
})

const features = [
  {
    glyph: '册',
    title: '批量生词本',
    desc: '一次粘贴 10 个字，逐字核对后批量生成可下载的字源卡。',
    to: '/batch',
  },
  {
    glyph: '族',
    title: '字族联想',
    desc: '按形旁与声旁归并，看看一个字和哪些字同宗同源。',
    to: '/family',
  },
  {
    glyph: '谜',
    title: '看形猜字',
    desc: '只给一幅甲骨文或金文，你能认出它今天写作什么吗？',
    to: '/puzzle',
  },
  {
    glyph: '验',
    title: '数据核验',
    desc: '帧完整性、书证、多音对应与文案时长，全量展开自查。',
    to: '/validate',
  },
]
</script>

<template>
  <div class="home">
    <section class="hero container">
      <HeroScene />
      <div class="hero__copy">
        <p class="eyebrow reveal">AI x 文学 · 第四题「字源」</p>
        <h1 class="hero__title serif reveal reveal--delay-1">
          一个字，<br />就是一条<span class="hero__accent">三千年</span>的路。
        </h1>
        <p class="hero__lead reveal reveal--delay-2">
          从甲骨到楷书，从反切到今音，从本义到假借。输入一个汉字，展开它的形、音、义。
        </p>

        <div class="hero__search reveal reveal--delay-3">
          <CharSearch size="lg" />
          <div class="hero__quick">
            <span class="hero__quick-label">试试</span>
            <RouterLink
              v-for="char in ['明', '行', '水', '樂', '道', '福']"
              :key="char"
              :to="`/char/${char}`"
              class="hero__quick-item serif"
            >
              {{ char }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="hero__orbit" aria-hidden="true">
        <div class="orbit__glow" />
        <div class="orbit">
          <div
            v-for="(frame, index) in orbitFrames"
            :key="frame.stage"
            class="orbit__item panel"
            :style="{ '--i': index }"
          >
            <GlyphImage
              :src="frame.src"
              :alt="`明的${frame.stage}字形`"
              :stage="frame.stage"
              loading="eager"
            />
            <span class="orbit__stage">{{ frame.stage.replace(/（.*?）/g, '') }}</span>
          </div>
        </div>
        <div class="orbit__base" />
        <p class="orbit__caption serif">明 · 日月相合</p>
      </div>
    </section>

    <div class="container">
      <form v-if="error" class="error-bar panel" @submit.prevent="reload">
        <span>数据加载失败：{{ error }}</span>
        <button class="btn btn--primary" type="submit">重试</button>
      </form>

      <LoadingSkeleton v-else-if="loading" class="home__loading" :lines="6" tall />

      <template v-else>
        <section class="stats" aria-label="数据规模">
          <div v-for="item in stats" :key="item.label" class="stats__item">
            <span class="stats__value serif">{{ item.value }}</span>
            <span class="stats__label">{{ item.label }}</span>
          </div>
          <p class="stats__note">
            来源：赛题官方《汉字形音义溯源数据包》。8 字无甲骨文帧，界面以「未见著录」如实呈现。
          </p>
        </section>

        <section class="featured panel">
          <div class="featured__glyph">
            <GlyphImage
              v-if="orbitFrames.length"
              :src="orbitFrames[orbitFrames.length - 1]?.src ?? ''"
              alt="明的楷书字形"
              stage="楷书"
              loading="eager"
            />
          </div>
          <div class="featured__body">
            <p class="eyebrow">今日一字</p>
            <h2 class="serif featured__title">明 <span class="featured__pinyin">míng</span></h2>
            <p class="featured__analysis">{{ featured?.structure?.analysis }}</p>
            <p class="featured__story">{{ featuredStory?.text.slice(0, 108) }}…</p>
            <RouterLink to="/char/明" class="btn btn--primary">
              展开「明」的字源卡
              <span aria-hidden="true">↗</span>
            </RouterLink>
          </div>
          <div class="featured__aside" aria-hidden="true">
            <span class="featured__seal serif">日月</span>
            <span class="featured__seal featured__seal--alt serif">相合</span>
          </div>
        </section>

        <section class="block">
          <header class="block__head">
            <div>
              <p class="eyebrow">Featured characters</p>
              <h2 class="section-title">从这些字开始</h2>
            </div>
            <p class="block__lead">悬停可看它的甲骨文/金文形。数据包共收录 60 字。</p>
          </header>

          <div class="hot-grid">
            <RouterLink
              v-for="item in hot"
              :key="item.record.char"
              :to="`/char/${item.record.char}`"
              class="hot panel"
            >
              <div class="hot__image">
                <span class="hot__layer hot__layer--modern">
                  <GlyphImage
                    :src="item.modernSrc"
                    :alt="`${item.record.char}的楷书字形`"
                    stage="楷书"
                    loading="eager"
                  />
                </span>
                <span class="hot__layer hot__layer--ancient">
                  <GlyphImage
                    :src="item.ancientSrc"
                    :alt="`${item.record.char}的早期字形`"
                    stage="古文字"
                    loading="eager"
                  />
                </span>
              </div>
              <div class="hot__meta">
                <div class="hot__title">
                  <span class="serif">{{ item.record.simp }}</span>
                  <span class="hot__pinyin">{{ item.reading }}</span>
                </div>
                <p class="hot__gloss">{{ item.record.senses[0]?.gloss }}</p>
                <span class="hot__method chip">{{ item.record.structure?.method }}</span>
              </div>
            </RouterLink>
          </div>
        </section>

        <section class="block">
          <header class="block__head">
            <div>
              <p class="eyebrow">Tools</p>
              <h2 class="section-title">不止查一个字</h2>
            </div>
            <p class="block__lead">批量出卡、字族联想、字形谜题与数据自查。</p>
          </header>

          <div class="feature-grid">
            <RouterLink
              v-for="(feature, index) in features"
              :key="feature.to"
              :to="feature.to"
              class="feature panel"
              :style="{ '--i': index }"
            >
              <span class="feature__glyph serif">{{ feature.glyph }}</span>
              <h3 class="feature__title serif">{{ feature.title }}</h3>
              <p class="feature__desc">{{ feature.desc }}</p>
              <span class="feature__arrow" aria-hidden="true">↗</span>
            </RouterLink>
          </div>
        </section>

        <section class="manifesto">
          <p class="manifesto__text serif">
            「字源」不是把古字当作装饰，而是让每一笔来历、每一读流变、每一义出处，都能被看见、被核对。
          </p>
          <RouterLink to="/about" class="btn btn--ghost">数据来源与 AI 参与说明</RouterLink>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 40px;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 32px;
  min-height: min(760px, calc(100vh - var(--nav-h)));
  padding-top: 48px;
  padding-bottom: 40px;
}

.hero__copy {
  position: relative;
  z-index: 2;
}

.hero__title {
  margin-top: 18px;
  font-size: clamp(40px, 5.6vw, 76px);
  font-weight: 500;
  line-height: 1.24;
  letter-spacing: 0.02em;
}

.hero__accent {
  position: relative;
  color: var(--gold-bright);
  padding: 0 0.06em;
}

.hero__accent::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.04em;
  height: 0.32em;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(200, 90, 63, 0.4), rgba(216, 180, 106, 0.18));
  z-index: -1;
}

.hero__lead {
  margin-top: 22px;
  max-width: 560px;
  font-size: 16px;
  line-height: 2;
  color: var(--muted);
}

.hero__search {
  margin-top: 34px;
  max-width: 620px;
}

.hero__quick {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-left: 6px;
}

.hero__quick-label {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.12em;
}

.hero__quick-item {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 18px;
  color: var(--text-soft);
  transition:
    color 0.3s,
    border-color 0.3s,
    transform 0.3s var(--ease-out),
    background 0.3s;
}

.hero__quick-item:hover {
  color: var(--gold-bright);
  border-color: var(--line-strong);
  background: var(--gold-dim);
  transform: translateY(-2px);
}

.hero__orbit {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  height: 560px;
  perspective: 1400px;
}

.orbit__glow {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(216, 180, 106, 0.16), transparent 64%);
  filter: blur(6px);
}

.orbit {
  position: relative;
  width: 190px;
  height: 270px;
  transform-style: preserve-3d;
  animation: orbit-spin 40s linear infinite;
}

.orbit__item {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 14px;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent),
    rgba(18, 22, 28, 0.9);
  transform: rotateY(calc(var(--i) * 72deg)) translateZ(210px);
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.5);
}

.orbit__item :deep(.glyph) {
  height: 190px;
}

.orbit__stage {
  font-size: 12px;
  letter-spacing: 0.24em;
  color: var(--muted);
}

.orbit__base {
  position: absolute;
  bottom: 58px;
  width: 420px;
  height: 100px;
  border-radius: 50%;
  border: 1px solid rgba(216, 180, 106, 0.16);
  background: radial-gradient(ellipse at center, rgba(216, 180, 106, 0.1), transparent 68%);
  transform: rotateX(72deg);
  filter: blur(0.5px);
}

.orbit__caption {
  position: absolute;
  bottom: 18px;
  font-size: 13px;
  letter-spacing: 0.34em;
  color: var(--muted);
}

@keyframes orbit-spin {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}

.hero__orbit:hover .orbit {
  animation-play-state: paused;
}

.error-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  color: var(--danger);
  font-size: 14px;
}

.home__loading {
  margin-top: 24px;
}

.stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px 46px;
  margin: 12px 0 52px;
  padding: 22px 28px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.stats__item {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.stats__value {
  font-size: 30px;
  color: var(--gold-bright);
  line-height: 1;
}

.stats__label {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.12em;
}

.stats__note {
  flex: 1;
  min-width: 260px;
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
  text-align: right;
}

.featured {
  display: grid;
  grid-template-columns: 230px 1fr 150px;
  gap: 32px;
  align-items: center;
  padding: 34px 38px;
  overflow: hidden;
}

.featured::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 320px at 12% 20%, rgba(216, 180, 106, 0.09), transparent 60%),
    radial-gradient(500px 300px at 92% 80%, rgba(107, 143, 179, 0.06), transparent 60%);
  pointer-events: none;
}

.featured__glyph {
  position: relative;
  height: 210px;
  padding: 16px;
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 42%, rgba(216, 180, 106, 0.12), transparent 68%),
    rgba(0, 0, 0, 0.18);
}

.featured__body {
  position: relative;
  display: grid;
  gap: 12px;
  justify-items: start;
}

.featured__title {
  font-size: 34px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.featured__pinyin {
  margin-left: 8px;
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--muted);
  letter-spacing: 0.04em;
}

.featured__analysis {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 1.9;
  color: var(--text-soft);
}

.featured__story {
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--muted);
}

.featured__aside {
  position: relative;
  display: grid;
  gap: 14px;
  justify-items: center;
}

.featured__seal {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  border: 1px solid rgba(200, 90, 63, 0.4);
  border-radius: 10px;
  font-size: 26px;
  color: #eaa189;
  background: rgba(200, 90, 63, 0.08);
  transform: rotate(4deg);
}

.featured__seal--alt {
  transform: rotate(-5deg);
  border-color: var(--line-strong);
  color: var(--gold);
  background: var(--gold-dim);
}

.block {
  margin-top: 76px;
}

.block__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}

.block__lead {
  max-width: 380px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--muted);
  text-align: right;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.hot {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-md);
  transition:
    transform 0.4s var(--ease-out),
    border-color 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out);
}

.hot:hover {
  transform: translateY(-6px);
  border-color: var(--line-strong);
  box-shadow:
    var(--shadow-card),
    0 0 36px rgba(216, 180, 106, 0.08);
}

.hot__image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  background:
    radial-gradient(circle at 50% 42%, rgba(216, 180, 106, 0.08), transparent 68%),
    rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.hot__layer {
  position: absolute;
  inset: 8px;
  transition:
    opacity 0.5s var(--ease-out),
    transform 0.6s var(--ease-out);
}

.hot__layer--ancient {
  opacity: 0;
  transform: scale(0.96);
}

.hot:hover .hot__layer--modern {
  opacity: 0;
}

.hot:hover .hot__layer--ancient {
  opacity: 1;
  transform: scale(1);
}

.hot__meta {
  display: grid;
  gap: 3px;
}

.hot__title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  font-size: 20px;
}

.hot__pinyin {
  font-size: 11.5px;
  font-family: var(--font-sans);
  color: var(--muted);
}

.hot__gloss {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--muted);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.hot__method {
  justify-self: start;
  margin-top: 4px;
  font-size: 10.5px;
  padding: 2px 8px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.feature {
  display: grid;
  gap: 10px;
  padding: 26px 24px;
  border-radius: var(--radius-md);
  transition:
    transform 0.4s var(--ease-out),
    border-color 0.4s var(--ease-out);
}

.feature:hover {
  transform: translateY(-5px);
  border-color: var(--line-strong);
}

.feature__glyph {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 24px;
  color: var(--gold);
  background: rgba(216, 180, 106, 0.05);
}

.feature__title {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.feature__desc {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--muted);
}

.feature__arrow {
  justify-self: end;
  color: var(--muted);
  transition:
    color 0.3s,
    transform 0.3s var(--ease-out);
}

.feature:hover .feature__arrow {
  color: var(--gold-bright);
  transform: translate(2px, -2px);
}

.manifesto {
  display: grid;
  justify-items: center;
  gap: 22px;
  margin: 94px 0 30px;
  padding: 58px 24px;
  text-align: center;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: radial-gradient(600px 200px at 50% 100%, rgba(216, 180, 106, 0.06), transparent 70%);
}

.manifesto__text {
  max-width: 760px;
  font-size: clamp(19px, 2.4vw, 27px);
  line-height: 1.9;
  letter-spacing: 0.04em;
  color: var(--text-soft);
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: 0;
    padding-top: 56px;
  }

  .hero__orbit {
    height: 480px;
    order: -1;
  }

  .hot-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .featured {
    grid-template-columns: 200px 1fr;
  }

  .featured__aside {
    display: none;
  }
}

@media (max-width: 720px) {
  .hero__title {
    font-size: clamp(34px, 10vw, 48px);
  }

  .hero__orbit {
    height: 380px;
    transform: scale(0.82);
  }

  .stats {
    gap: 18px 28px;
  }

  .stats__note {
    text-align: left;
  }

  .featured {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .featured__glyph {
    height: 160px;
  }

  .hot-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .block__lead {
    text-align: left;
  }
}
</style>
