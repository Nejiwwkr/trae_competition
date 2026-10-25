<script setup lang="ts">
import { computed } from 'vue'
import type { CharRecord } from '@/types'
import { getExamples } from '@/content'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const props = defineProps<{ record: CharRecord }>()

const content = computed(() => getExamples(props.record))
</script>

<template>
  <section>
    <SectionHeading
      id="examples"
      eyebrow="Modern usage"
      title="今天怎么用：例句与易错提醒"
      lead="三条现代用例对应不同义项，并附一条常见误用提醒。"
    >
      <span v-if="content.generated" class="chip chip--blue">据义项自动成文</span>
    </SectionHeading>

    <div class="examples">
      <article
        v-for="(example, index) in content.examples"
        :key="index"
        class="example panel"
      >
        <span class="example__index serif">{{ String(index + 1).padStart(2, '0') }}</span>
        <p class="example__sentence">{{ example.sentence }}</p>
        <p class="example__sense">{{ example.sense }}</p>
        <p v-if="example.note" class="example__note">{{ example.note }}</p>
      </article>
    </div>

    <div v-if="content.warning" class="warning">
      <span class="warning__mark serif">误</span>
      <div>
        <p class="warning__title">易错提醒</p>
        <p class="warning__text">{{ content.warning }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.examples {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.example {
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 22px 24px;
  border-radius: var(--radius-md);
}

.example__index {
  font-size: 13px;
  letter-spacing: 0.16em;
  color: var(--gold);
}

.example__sentence {
  font-family: var(--font-serif);
  font-size: 17px;
  line-height: 1.9;
  color: var(--text);
}

.example__sense {
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.07);
  font-size: 12px;
  color: var(--jade);
  line-height: 1.7;
}

.example__note {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.7;
}

.warning {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-top: 18px;
  padding: 18px 22px;
  border: 1px solid rgba(200, 90, 63, 0.24);
  border-radius: var(--radius-md);
  background:
    linear-gradient(90deg, rgba(200, 90, 63, 0.09), transparent 60%),
    rgba(20, 16, 16, 0.5);
}

.warning__mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid rgba(200, 90, 63, 0.4);
  border-radius: 9px;
  color: #eaa189;
  font-size: 20px;
  transform: rotate(-5deg);
}

.warning__title {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #eaa189;
  margin-bottom: 4px;
}

.warning__text {
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--text-soft);
}

@media (max-width: 900px) {
  .examples {
    grid-template-columns: 1fr;
  }
}
</style>
