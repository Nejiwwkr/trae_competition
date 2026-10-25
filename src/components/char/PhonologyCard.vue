<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CharRecord } from '@/types'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const props = defineProps<{ record: CharRecord }>()
const emit = defineEmits<{ select: [refs: number[]] }>()

const selectedIndex = ref(0)

const selected = computed(() => props.record.readings[selectedIndex.value] ?? props.record.readings[0])

const linkedSenses = computed(() => {
  const reading = selected.value
  if (!reading) return []
  return props.record.senses.filter((sense) => reading.senseRefs.includes(sense.index))
})

watch(
  selected,
  (reading) => {
    emit('select', reading?.senseRefs ?? [])
  },
  { immediate: true },
)

function pick(index: number) {
  selectedIndex.value = index
}

watch(
  () => props.record.char,
  () => {
    selectedIndex.value = 0
  },
)

const fields = computed(() => {
  const reading = selected.value
  if (!reading) return []
  return [
    { label: '广韵反切', value: reading.fanqie },
    {
      label: '中古声母',
      value: reading.initial,
    },
    { label: '中古韵目', value: reading.rhyme },
    { label: '中古声调', value: reading.tone },
    { label: '郑张上古拟音', value: reading.oldChinese },
    { label: '现代读音', value: reading.modern },
  ]
})
</script>

<template>
  <section>
    <SectionHeading
      id="phonology"
      eyebrow="Phonology"
      title="读音流变：从反切到今天的读音"
      :lead="`数据包共收录 ${record.readings.length} 条读音。中古音按《广韵》反切与声韵调标注，上古音采用郑张尚芳拟音。`"
    />

    <div class="phon panel">
      <aside class="phon__tabs">
        <p class="phon__tabs-label">读音</p>
        <button
          v-for="(reading, index) in record.readings"
          :key="reading.index"
          class="phon__tab"
          :class="{ 'phon__tab--active': index === selectedIndex }"
          @click="pick(index)"
        >
          <span class="phon__tab-pinyin">{{ reading.modern }}</span>
          <span class="phon__tab-ref">{{ reading.senseRefText }}</span>
        </button>
      </aside>

      <div v-if="selected" class="phon__body">
        <div class="phon__hero">
          <div>
            <p class="phon__hero-label">今读</p>
            <p class="phon__modern serif">{{ selected.modern }}</p>
          </div>
          <div class="phon__arrow" aria-hidden="true">⟶</div>
          <div>
            <p class="phon__hero-label">上古拟音</p>
            <p class="phon__old">{{ selected.oldChinese }}</p>
          </div>
        </div>

        <dl class="phon__grid">
          <div v-for="field in fields" :key="field.label" class="phon__cell">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value || '—' }}</dd>
          </div>
        </dl>

        <div v-if="linkedSenses.length" class="phon__senses">
          <p class="phon__senses-label">对应义项</p>
          <ul>
            <li v-for="sense in linkedSenses" :key="sense.index">
              <span class="phon__sense-index">{{ sense.index }}</span>
              <span class="phon__sense-type">{{ sense.type }}</span>
              <span class="phon__sense-gloss">{{ sense.gloss }}</span>
            </li>
          </ul>
        </div>
        <p v-else-if="selected.senseRefText" class="phon__senses-note">
          对应说明：{{ selected.senseRefText }}
        </p>

        <p v-if="selected.note" class="phon__note">{{ selected.note }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.phon {
  display: grid;
  grid-template-columns: 250px 1fr;
  overflow: hidden;
}

.phon__tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 26px 20px;
  border-right: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.14);
}

.phon__tabs-label {
  font-size: 11px;
  letter-spacing: 0.24em;
  color: var(--gold);
  margin-bottom: 4px;
}

.phon__tab {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  text-align: left;
  transition:
    border-color 0.3s,
    background 0.3s;
}

.phon__tab:hover {
  background: rgba(255, 255, 255, 0.03);
}

.phon__tab--active {
  border-color: var(--line-strong);
  background: var(--gold-dim);
}

.phon__tab-pinyin {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--text);
  letter-spacing: 0.04em;
}

.phon__tab--active .phon__tab-pinyin {
  color: var(--gold-bright);
}

.phon__tab-ref {
  font-size: 11px;
  line-height: 1.5;
  color: var(--muted);
}

.phon__body {
  display: grid;
  gap: 22px;
  padding: 30px 34px;
}

.phon__hero {
  display: flex;
  align-items: center;
  gap: 26px;
}

.phon__hero-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--muted);
  margin-bottom: 2px;
}

.phon__modern {
  font-size: 38px;
  line-height: 1.15;
  color: var(--gold-bright);
  letter-spacing: 0.03em;
}

.phon__old {
  font-family: var(--font-serif);
  font-size: 28px;
  line-height: 1.4;
  color: var(--text-soft);
  letter-spacing: 0.02em;
}

.phon__arrow {
  color: var(--line-strong);
  font-size: 22px;
}

.phon__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--line);
}

.phon__cell {
  padding: 14px 16px;
  background: rgba(13, 16, 21, 0.86);
}

.phon__cell dt {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-bottom: 4px;
}

.phon__cell dd {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 16px;
  color: var(--text-soft);
}

.phon__senses {
  border-top: 1px dashed rgba(255, 255, 255, 0.07);
  padding-top: 16px;
}

.phon__senses-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--gold);
  margin-bottom: 10px;
}

.phon__senses ul {
  display: grid;
  gap: 7px;
}

.phon__senses li {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13.5px;
  line-height: 1.7;
}

.phon__sense-index {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--line);
  font-size: 10.5px;
  color: var(--gold);
}

.phon__sense-type {
  color: var(--muted);
  font-size: 11.5px;
  flex-shrink: 0;
}

.phon__sense-gloss {
  color: var(--text-soft);
}

.phon__senses-note {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-soft);
}

.phon__note {
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.025);
}

@media (max-width: 900px) {
  .phon {
    grid-template-columns: 1fr;
  }

  .phon__tabs {
    flex-direction: row;
    flex-wrap: wrap;
    border-right: none;
    border-bottom: 1px solid var(--line);
    padding: 18px;
  }

  .phon__tabs-label {
    width: 100%;
  }

  .phon__tab {
    flex: 1 1 140px;
  }

  .phon__body {
    padding: 24px 22px;
  }

  .phon__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .phon__modern {
    font-size: 32px;
  }

  .phon__old {
    font-size: 23px;
  }
}
</style>
