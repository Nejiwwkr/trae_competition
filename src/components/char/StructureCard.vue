<script setup lang="ts">
import { computed } from 'vue'
import type { CharRecord } from '@/types'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import DisputeBadge from '@/components/ui/DisputeBadge.vue'

const props = defineProps<{ record: CharRecord }>()

const METHOD_INFO: Record<string, { label: string; note: string }> = {
  象形: { label: '象形', note: '描摹事物轮廓，以形表意' },
  指事: { label: '指事', note: '在象形基础上加符号，标示抽象概念' },
  會意: { label: '会意', note: '组合两个以上部件，会合出新义' },
  会意: { label: '会意', note: '组合两个以上部件，会合出新义' },
  形聲: { label: '形声', note: '形旁表义，声旁表音' },
  形声: { label: '形声', note: '形旁表义，声旁表音' },
}

const structure = computed(() => props.record.structure)
const method = computed(() => {
  const raw = structure.value?.method ?? ''
  return METHOD_INFO[raw] ?? { label: raw || '未详', note: '构形方式待考' }
})
</script>

<template>
  <section v-if="structure">
    <SectionHeading
      id="structure"
      eyebrow="Construction"
      title="六书构形：这个字是怎么造出来的"
      lead="依据《说文解字》与近代古文字学通行考释整理；有争议处明确标注「一说」。"
    />

    <div class="structure panel">
      <aside class="structure__method">
        <span class="structure__seal serif">{{ method.label }}</span>
        <p>{{ method.note }}</p>
        <span v-if="record.simp !== record.char" class="chip">简体 {{ record.simp }}</span>
      </aside>

      <div class="structure__body">
        <div class="structure__row">
          <p class="structure__label">构形解析</p>
          <p class="structure__analysis">{{ structure.analysis }}</p>
        </div>

        <div v-if="structure.dispute" class="structure__dispute">
          <DisputeBadge :text="structure.dispute" />
          <p>{{ structure.dispute }}</p>
        </div>

        <blockquote class="structure__shuowen">
          <span class="structure__quote-mark" aria-hidden="true">《</span>
          <p>{{ structure.shuowen }}</p>
        </blockquote>

        <div class="structure__meta">
          <p><span>数据来源</span>{{ structure.source }}</p>
          <p v-if="structure.note"><span>备注</span>{{ structure.note }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.structure {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0;
  overflow: hidden;
}

.structure__method {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 36px 22px;
  border-right: 1px solid var(--line);
  background:
    radial-gradient(circle at 50% 30%, rgba(216, 180, 106, 0.1), transparent 66%),
    rgba(0, 0, 0, 0.14);
  text-align: center;
}

.structure__seal {
  display: grid;
  place-items: center;
  width: 108px;
  height: 108px;
  border: 1px solid var(--line-strong);
  border-radius: 16px;
  font-size: 30px;
  letter-spacing: 0.1em;
  color: var(--gold-bright);
  background: rgba(216, 180, 106, 0.05);
  box-shadow:
    inset 0 0 32px rgba(216, 180, 106, 0.08),
    0 12px 30px rgba(0, 0, 0, 0.3);
  transform: rotate(-2deg);
}

.structure__method p {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--muted);
  max-width: 160px;
}

.structure__body {
  display: grid;
  gap: 22px;
  padding: 34px 36px;
}

.structure__label {
  margin-bottom: 8px;
  font-size: 11.5px;
  letter-spacing: 0.24em;
  color: var(--gold);
}

.structure__analysis {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.95;
  color: var(--text);
}

.structure__dispute {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(200, 90, 63, 0.22);
  border-radius: var(--radius-sm);
  background: rgba(200, 90, 63, 0.06);
  font-size: 13px;
  line-height: 1.85;
  color: #e0b8a9;
}

.structure__shuowen {
  position: relative;
  padding: 18px 22px 18px 42px;
  border-left: 2px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.structure__shuowen p {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 1.95;
  color: var(--text-soft);
}

.structure__quote-mark {
  position: absolute;
  left: 14px;
  top: 10px;
  font-family: var(--font-serif);
  font-size: 26px;
  color: var(--gold);
  opacity: 0.6;
}

.structure__meta {
  display: grid;
  gap: 6px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
}

.structure__meta p {
  display: flex;
  gap: 12px;
}

.structure__meta span {
  flex: 0 0 56px;
  color: #7f7b72;
}

@media (max-width: 820px) {
  .structure {
    grid-template-columns: 1fr;
  }

  .structure__method {
    flex-direction: row;
    justify-content: flex-start;
    padding: 22px;
    border-right: none;
    border-bottom: 1px solid var(--line);
    text-align: left;
  }

  .structure__seal {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    font-size: 22px;
  }

  .structure__method p {
    max-width: none;
  }

  .structure__body {
    padding: 24px 22px;
  }
}
</style>
