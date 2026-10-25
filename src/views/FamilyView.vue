<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useData } from '@/data/useData'
import { getFamilyGroups } from '@/content'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

type Filter = '全部' | '形旁' | '声旁'

const { store, loading, error, reload } = useData()
const filter = ref<Filter>('全部')

const allGroups = getFamilyGroups()
const groups = computed(() => {
  if (filter.value === '全部') return allGroups
  return allGroups.filter((group) => group.kind === filter.value)
})

const covered = computed(() => new Set(allGroups.flatMap((group) => group.members)))
const independent = computed(
  () => store.value?.chars.filter((record) => !covered.value.has(record.char)) ?? [],
)

const stats = computed(() => [
  { value: allGroups.length, label: '字族分组' },
  { value: covered.value.size, label: '已归组汉字' },
  { value: independent.value.length || 60 - covered.value.size, label: '独立字' },
])

const filters: Filter[] = ['全部', '形旁', '声旁']

const glossOf = (char: string) =>
  store.value?.byTraditional.get(char)?.senses[0]?.gloss ?? '数据包未收录'
</script>

<template>
  <div class="family-view container">
    <header class="family-view__head">
      <p class="eyebrow">Character family</p>
      <h1 class="section-title">字族：按形旁与声旁看汉字的关系</h1>
      <p class="section-lead">
        同一个形旁提示共同的意义范畴，同一个声旁提示相近的读音。这里只呈现可核验的关系，外部参考字明确标注。
      </p>
    </header>

    <div v-if="error" class="error panel">
      <p>数据加载失败：{{ error }}</p>
      <button class="btn btn--primary" @click="reload">重试</button>
    </div>

    <LoadingSkeleton v-else-if="loading" :lines="5" tall />

    <template v-else>
      <div class="family-stats">
        <div v-for="item in stats" :key="item.label" class="family-stats__item">
          <span class="family-stats__value serif">{{ item.value }}</span>
          <span class="family-stats__label">{{ item.label }}</span>
        </div>
        <div class="family-filters">
          <button
            v-for="item in filters"
            :key="item"
            class="family-filters__item"
            :class="{ 'family-filters__item--active': filter === item }"
            @click="filter = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div class="trees">
        <article v-for="group in groups" :key="group.id" class="tree panel">
          <div class="tree__hub">
            <span class="tree__component serif">{{ group.component }}</span>
            <div class="tree__hub-meta">
              <p class="tree__label serif">{{ group.label }}</p>
              <span class="chip" :class="group.kind === '形旁' ? 'chip--jade' : 'chip--blue'">
                {{ group.kind }}
              </span>
            </div>
          </div>

          <div class="tree__connector" aria-hidden="true" />

          <div class="tree__members">
            <RouterLink
              v-for="member in group.members"
              :key="member"
              :to="`/char/${member}`"
              class="tree__node"
            >
              <span class="tree__node-char serif">{{ member }}</span>
              <span class="tree__node-gloss">{{ glossOf(member) }}</span>
            </RouterLink>
            <span v-for="member in group.related" :key="member" class="tree__node tree__node--ghost">
              <span class="tree__node-char serif">{{ member }}</span>
              <span class="tree__node-gloss">参考字</span>
            </span>
          </div>

          <p class="tree__note">{{ group.note }}</p>
        </article>
      </div>

      <section v-if="independent.length" class="independent">
        <SectionHeading
          eyebrow="Standalone"
          :title="`独立字（${independent.length}）`"
          lead="这些字在数据包内暂未归入同形旁或同声旁分组。指事字、独体象形字常属此类。"
        />
        <div class="independent__list">
          <RouterLink
            v-for="record in independent"
            :key="record.char"
            :to="`/char/${record.char}`"
            class="independent__item"
          >
            <span class="serif">{{ record.simp }}</span>
            <small>{{ record.structure?.method }}</small>
          </RouterLink>
        </div>
      </section>

      <section class="family-note panel">
        <p>
          字族的划分依据《说文解字》部首传统与数据包中的构形解析。部分字的归部存在争议（如「樂」从木、
          「春」从日），本页采用通行处理，并在字源卡中以「一说」标注争议。
        </p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.family-view {
  padding-top: 54px;
  padding-bottom: 60px;
}

.family-view__head {
  max-width: 780px;
  margin-bottom: 34px;
}

.family-view__head .section-title {
  margin-top: 10px;
}

.error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  color: var(--danger);
}

.family-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 28px;
  padding: 18px 0 30px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 26px;
}

.family-stats__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.family-stats__value {
  font-size: 28px;
  color: var(--gold-bright);
  line-height: 1;
}

.family-stats__label {
  font-size: 11.5px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.family-filters {
  display: flex;
  gap: 4px;
  margin-left: auto;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
}

.family-filters__item {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12.5px;
  color: var(--muted);
  transition:
    color 0.25s,
    background 0.25s;
}

.family-filters__item--active {
  color: var(--gold-bright);
  background: var(--gold-dim);
}

.trees {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.tree {
  display: grid;
  grid-template-columns: 170px 46px 1fr;
  grid-template-areas:
    "hub connector members"
    "note note note";
  align-items: center;
  gap: 0 12px;
  padding: 24px 26px;
}

.tree__hub {
  grid-area: hub;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tree__component {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: var(--gold-dim);
  color: var(--gold-bright);
  font-size: 28px;
}

.tree__hub-meta {
  display: grid;
  gap: 4px;
  justify-items: start;
}

.tree__label {
  font-size: 16px;
  letter-spacing: 0.06em;
}

.tree__connector {
  grid-area: connector;
  position: relative;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), var(--line));
}

.tree__connector::before {
  content: "";
  position: absolute;
  left: 0;
  top: -3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
}

.tree__members {
  grid-area: members;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tree__node {
  display: grid;
  gap: 1px;
  justify-items: center;
  min-width: 58px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition:
    border-color 0.3s,
    background 0.3s,
    transform 0.3s var(--ease-out);
}

.tree__node:hover {
  border-color: var(--line-strong);
  background: var(--gold-dim);
  transform: translateY(-2px);
}

.tree__node-char {
  font-size: 22px;
  color: var(--text);
}

.tree__node-gloss {
  font-size: 9px;
  color: var(--muted);
  max-width: 96px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree__node--ghost {
  border-style: dashed;
  opacity: 0.54;
}

.tree__node--ghost .tree__node-char {
  color: var(--muted);
}

.tree__note {
  grid-area: note;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
}

.independent {
  margin-top: 56px;
}

.independent__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.independent__item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 20px;
  color: var(--text-soft);
  transition:
    border-color 0.3s,
    color 0.3s,
    background 0.3s;
}

.independent__item small {
  font-size: 10px;
  color: var(--muted);
}

.independent__item:hover {
  border-color: var(--line-strong);
  color: var(--gold-bright);
  background: var(--gold-dim);
}

.family-note {
  margin-top: 46px;
  padding: 22px 26px;
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--muted);
}

@media (max-width: 1100px) {
  .trees {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .tree {
    grid-template-columns: 1fr;
    grid-template-areas:
      "hub"
      "members"
      "note";
    gap: 16px;
  }

  .tree__connector {
    display: none;
  }

  .family-filters {
    margin-left: 0;
  }
}
</style>
