<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { CharRecord } from '@/types'
import { getFamiliesFor, getFamilyGroups } from '@/content'
import SectionHeading from '@/components/ui/SectionHeading.vue'

const props = defineProps<{ record: CharRecord }>()

const groups = computed(() => getFamiliesFor(props.record.char))
const total = computed(() => getFamilyGroups().length)
</script>

<template>
  <section>
    <SectionHeading
      id="family"
      eyebrow="Character family"
      title="字族：它和谁同宗"
      lead="按形旁与声旁归并。仅数据包内的 60 字可展开完整字源卡，外部关联字标注为参考。"
    />

    <div v-if="groups.length" class="families">
      <article v-for="group in groups" :key="group.id" class="family panel">
        <header class="family__head">
          <div class="family__hub">
            <span class="family__component serif">{{ group.component }}</span>
            <span class="family__kind">{{ group.kind }}</span>
          </div>
          <div>
            <h3 class="family__label serif">{{ group.label }}</h3>
            <p class="family__note">{{ group.note }}</p>
          </div>
        </header>

        <div class="family__members">
          <RouterLink
            v-for="member in group.members"
            :key="member"
            :to="`/char/${member}`"
            class="family__member"
            :class="{ 'family__member--current': member === record.char }"
          >
            <span class="serif">{{ member }}</span>
          </RouterLink>
          <span v-for="member in group.related" :key="member" class="family__related">
            {{ member }}
          </span>
        </div>

        <p class="family__related-note">虚线字为同族参考字，数据包未收录其完整字源卡。</p>
      </article>
    </div>

    <div v-else class="family-empty panel">
      <p>
        「{{ record.char }}」暂未归入 {{ total }} 个形旁/声旁字族中的任一组，属于本数据包中的独立字。
      </p>
      <RouterLink to="/family" class="btn">查看全部字族</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.families {
  display: grid;
  gap: 16px;
}

.family {
  padding: 24px 26px;
}

.family__head {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.07);
}

.family__hub {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.family__component {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  font-size: 28px;
  color: var(--gold-bright);
  background: var(--gold-dim);
}

.family__kind {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  color: var(--muted);
}

.family__label {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.family__note {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.75;
  color: var(--muted);
}

.family__members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
}

.family__member,
.family__related {
  display: grid;
  place-items: center;
  min-width: 44px;
  height: 44px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 21px;
  color: var(--text-soft);
  transition:
    border-color 0.3s,
    color 0.3s,
    background 0.3s,
    transform 0.3s var(--ease-out);
}

.family__member:hover {
  color: var(--gold-bright);
  border-color: var(--line-strong);
  background: var(--gold-dim);
  transform: translateY(-2px);
}

.family__member--current {
  color: #1a1408;
  border-color: var(--gold);
  background: linear-gradient(135deg, #d8b46a, #b8904a);
}

.family__related {
  color: #6f6c64;
  border-style: dashed;
  font-size: 18px;
}

.family__related-note {
  margin-top: 12px;
  font-size: 10.5px;
  color: var(--muted);
}

.family-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 26px 30px;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--muted);
}
</style>
