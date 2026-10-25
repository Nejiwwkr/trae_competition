<script setup lang="ts">
import { computed } from 'vue'
import type { CharRecord, MeaningSense } from '@/types'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const props = withDefaults(
  defineProps<{
    record: CharRecord
    highlight?: number[]
  }>(),
  { highlight: () => [] },
)

const senses = computed(() => props.record.senses)

function typeClass(sense: MeaningSense): string {
  if (sense.type === '本义') return 'ben'
  if (sense.type === '假借义') return 'jia'
  return 'yin'
}

function isHighlighted(sense: MeaningSense): boolean {
  return props.highlight.includes(sense.index)
}

const counts = computed(() => {
  const result = { 本义: 0, 引申义: 0, 假借义: 0 }
  for (const sense of senses.value) result[sense.type] += 1
  return result
})
</script>

<template>
  <section>
    <SectionHeading
      id="meaning"
      eyebrow="Semantic evolution"
      title="义项流变：一个字如何长出新意思"
      lead="按年代先后排列。每条义项附书证原句、出处与白话翻译，可逐条回溯。"
    >
      <div class="legend">
        <span class="legend__item legend__item--ben">本义 {{ counts.本义 }}</span>
        <span class="legend__item legend__item--yin">引申义 {{ counts.引申义 }}</span>
        <span class="legend__item legend__item--jia">假借义 {{ counts.假借义 }}</span>
      </div>
    </SectionHeading>

    <ol class="senses">
      <li
        v-for="(sense, index) in senses"
        :key="sense.index"
        class="sense"
        :class="[`sense--${typeClass(sense)}`, { 'sense--highlight': isHighlighted(sense) }]"
        :style="{ '--i': index }"
      >
        <div class="sense__rail" aria-hidden="true">
          <span class="sense__dot" />
        </div>

        <article class="sense__card panel">
          <header class="sense__head">
            <span class="sense__type">{{ sense.type }}</span>
            <span class="sense__era">{{ sense.era }}</span>
            <span class="sense__index">义项 {{ sense.index }}</span>
          </header>

          <h3 class="sense__gloss serif">{{ sense.gloss }}</h3>

          <blockquote class="sense__quote">
            <p>{{ sense.quote }}</p>
            <footer>
              <cite>{{ sense.citation }}</cite>
            </footer>
          </blockquote>

          <p class="sense__translation">
            <span class="sense__translation-label">白话</span>
            {{ sense.translation }}
          </p>

          <p v-if="sense.note" class="sense__note">{{ sense.note }}</p>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.legend__item::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.legend__item--ben {
  color: var(--gold);
}

.legend__item--yin {
  color: var(--jade);
}

.legend__item--jia {
  color: var(--ink-blue);
}

.senses {
  position: relative;
  display: grid;
  gap: 18px;
  padding-left: 34px;
}

.sense {
  position: relative;
  animation: fade-up 0.7s var(--ease-out) both;
  animation-delay: calc(var(--i) * 0.06s);
}

.sense__rail {
  position: absolute;
  left: -34px;
  top: 0;
  bottom: -18px;
  width: 18px;
}

.sense__rail::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 26px;
  bottom: -18px;
  width: 1px;
  background: linear-gradient(180deg, var(--line-strong), var(--line));
}

.sense:last-child .sense__rail::before {
  bottom: 50%;
}

.sense__dot {
  position: absolute;
  left: 3px;
  top: 20px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid var(--bg);
  background: var(--gold);
  box-shadow: 0 0 0 1px var(--gold), 0 0 16px rgba(216, 180, 106, 0.45);
}

.sense--yin .sense__dot {
  background: var(--jade);
  box-shadow: 0 0 0 1px var(--jade), 0 0 16px rgba(134, 169, 150, 0.4);
}

.sense--jia .sense__dot {
  background: var(--ink-blue);
  box-shadow: 0 0 0 1px var(--ink-blue), 0 0 16px rgba(107, 143, 179, 0.4);
}

.sense__card {
  padding: 24px 28px;
  border-radius: var(--radius-md);
  transition:
    border-color 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out),
    transform 0.4s var(--ease-out);
}

.sense--highlight .sense__card {
  border-color: var(--line-strong);
  box-shadow:
    var(--shadow-card),
    0 0 40px rgba(216, 180, 106, 0.08);
  transform: translateX(4px);
}

.sense__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sense__type {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--gold-bright);
  border: 1px solid rgba(216, 180, 106, 0.3);
  background: var(--gold-dim);
}

.sense--yin .sense__type {
  color: #b7d2c3;
  border-color: rgba(134, 169, 150, 0.3);
  background: var(--jade-soft);
}

.sense--jia .sense__type {
  color: #a9c4de;
  border-color: rgba(107, 143, 179, 0.3);
  background: var(--ink-blue-soft);
}

.sense__era {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.sense__index {
  margin-left: auto;
  font-size: 11px;
  color: #6f6c64;
}

.sense__gloss {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--text);
}

.sense__quote {
  position: relative;
  margin: 16px 0 12px;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.sense__quote p {
  font-family: var(--font-serif);
  font-size: 15.5px;
  line-height: 1.95;
  color: var(--text-soft);
}

.sense__quote footer {
  margin-top: 8px;
  text-align: right;
}

.sense__quote cite {
  font-size: 12px;
  font-style: normal;
  color: var(--gold);
  letter-spacing: 0.04em;
}

.sense__translation {
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-soft);
}

.sense__translation-label {
  display: inline-block;
  margin-right: 8px;
  padding: 0 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.12em;
}

.sense__note {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
}

@media (max-width: 720px) {
  .senses {
    padding-left: 26px;
  }

  .sense__rail {
    left: -26px;
  }

  .sense__card {
    padding: 20px;
  }

  .sense__gloss {
    font-size: 19px;
  }
}
</style>
