<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '@/data/useData'
import { runChecks, type ContentBundle } from '@/data/checks'
import type { ComponentAnnotation, ExampleContent, FamilyGroup, StoryContent } from '@/types'
import stories from '@/content/stories.json'
import examples from '@/content/examples.json'
import families from '@/content/families.json'
import components from '@/content/components.json'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

const { store, loading, error, reload } = useData()

const content: ContentBundle = {
  stories: stories as Record<string, StoryContent>,
  examples: examples as Record<string, ExampleContent>,
  families: families as FamilyGroup[],
  components: components as Record<string, ComponentAnnotation>,
}

const checks = computed(() => (store.value ? runChecks(store.value, content) : []))
const passed = computed(() => checks.value.filter((item) => item.status === 'pass').length)
const warned = computed(() => checks.value.filter((item) => item.status === 'warn').length)
const failed = computed(() => checks.value.filter((item) => item.status === 'fail').length)

const statusLabel: Record<string, string> = {
  pass: '通过',
  warn: '提醒',
  fail: '失败',
}

const methodCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const record of store.value?.chars ?? []) {
    const key = (record.structure?.method ?? '未详').replace('會意', '会意').replace('形聲', '形声')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

const typeCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const record of store.value?.chars ?? []) {
    for (const sense of record.senses) counts.set(sense.type, (counts.get(sense.type) ?? 0) + 1)
  }
  return [...counts.entries()]
})

const maxMethod = computed(() => Math.max(1, ...methodCounts.value.map((item) => item[1])))

const missingFrames = computed(
  () =>
    store.value?.chars.flatMap((record) =>
      record.frames
        .filter((frame) => frame.missing)
        .map((frame) => ({ char: record.char, simp: record.simp, stage: frame.stage })),
    ) ?? [],
)

const polyphonic = computed(
  () => store.value?.chars.filter((record) => record.readings.length > 1) ?? [],
)

const storyRange = computed(() => {
  const values = (store.value?.chars ?? []).map((record) => {
    const story = content.stories[record.char]
    return story ? [...story.text].length : 0
  })
  const valid = values.filter(Boolean)
  if (!valid.length) return null
  return {
    min: Math.round(Math.min(...valid) / 4.2),
    max: Math.round(Math.max(...valid) / 4.2),
  }
})
</script>

<template>
  <div class="validate container">
    <header class="validate__head">
      <p class="eyebrow">Data validation</p>
      <h1 class="section-title">数据核验：每一条都能对回数据包</h1>
      <p class="section-lead">
        这是本工具的自查页。它逐项检查字形帧、书证、多音对应、年代排序、构形标注与文案时长，不使用无法核实的占位数据。
      </p>
    </header>

    <div class="truth-banner">
      <span class="truth-banner__mark serif">缺</span>
      <div>
        <p class="truth-banner__title">赛题 char_truth.json 未随数据包提供</p>
        <p class="truth-banner__text">
          因此无法按官方「构形 ≥80%、义项序 ≥90%」的人工真值一致率给出分数。本页改用全量一致性自检，
          并在 README 与关于页如实说明，不伪造核验结果。
        </p>
      </div>
    </div>

    <div v-if="error" class="error panel">
      <p>数据加载失败：{{ error }}</p>
      <button class="btn btn--primary" @click="reload">重试</button>
    </div>

    <LoadingSkeleton v-else-if="loading" :lines="6" tall />

    <template v-else>
      <div class="summary">
        <div class="summary__item summary__item--pass">
          <span class="summary__value serif">{{ passed }}</span>
          <span class="summary__label">通过</span>
        </div>
        <div class="summary__item summary__item--warn">
          <span class="summary__value serif">{{ warned }}</span>
          <span class="summary__label">提醒</span>
        </div>
        <div class="summary__item" :class="failed ? 'summary__item--fail' : 'summary__item--pass'">
          <span class="summary__value serif">{{ failed }}</span>
          <span class="summary__label">失败</span>
        </div>
        <p class="summary__note">
          命令 <code>npm run validate</code> 会额外检查磁盘上的每一张字形图是否存在；浏览器端只校验路径字段。
        </p>
      </div>

      <ul class="checks">
        <li
          v-for="check in checks"
          :key="check.id"
          class="check panel"
          :class="`check--${check.status}`"
        >
          <span class="check__status">{{ statusLabel[check.status] }}</span>
          <div class="check__body">
            <p class="check__label">{{ check.label }}</p>
            <p class="check__detail">{{ check.detail }}</p>
          </div>
          <span class="check__icon" aria-hidden="true">
            {{ check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '×' }}
          </span>
        </li>
      </ul>

      <section class="distributions">
        <SectionHeading
          eyebrow="Distribution"
          title="数据分布"
          lead="以下统计直接来自 60 字数据包，可与其他页面的数字互相印证。"
        />

        <div class="dist-grid">
          <div class="dist panel">
            <h3 class="dist__title">造字法分布</h3>
            <ul class="bars">
              <li v-for="[method, count] in methodCounts" :key="method">
                <span class="bars__label">{{ method }}</span>
                <span class="bars__track">
                  <span class="bars__fill" :style="{ width: `${(count / maxMethod) * 100}%` }" />
                </span>
                <span class="bars__value">{{ count }}</span>
              </li>
            </ul>
          </div>

          <div class="dist panel">
            <h3 class="dist__title">义项类型</h3>
            <ul class="bars">
              <li v-for="[type, count] in typeCounts" :key="type">
                <span class="bars__label">{{ type }}</span>
                <span class="bars__track">
                  <span
                    class="bars__fill bars__fill--alt"
                    :style="{ width: `${(count / Math.max(...typeCounts.map((item) => item[1]))) * 100}%` }"
                  />
                </span>
                <span class="bars__value">{{ count }}</span>
              </li>
            </ul>
          </div>

          <div class="dist panel">
            <h3 class="dist__title">多音字</h3>
            <div class="polyphonic">
              <span v-for="record in polyphonic" :key="record.char" class="chip chip--gold">
                {{ record.simp }} · {{ record.readings.map((reading) => reading.modern).join('/') }}
              </span>
            </div>
          </div>

          <div class="dist panel">
            <h3 class="dist__title">文案时长</h3>
            <p v-if="storyRange" class="dist__big serif">{{ storyRange.min }}–{{ storyRange.max }} 秒</p>
            <p class="dist__note">60 条口播文案按 4.2 字/秒估算，全部落在 50–70 秒区间。</p>
          </div>
        </div>
      </section>

      <section class="missing">
        <SectionHeading
          eyebrow="Honest gaps"
          :title="`未见著录的 ${missingFrames.length} 帧`"
          lead="这 8 个字没有甲骨文图像。界面统一显示为「未见著录」，不以其他时代的字形冒充甲骨文。"
        />
        <div class="missing__list">
          <span v-for="frame in missingFrames" :key="frame.char" class="missing__item">
            <span class="serif">{{ frame.simp }}</span>
            <small>{{ frame.stage }}</small>
          </span>
        </div>
      </section>

      <div class="method-note panel">
        <h3 class="method-note__title serif">核验方法</h3>
        <ol class="method-note__list">
          <li>CSV 解析后按「字头」合并四张表，逐字建立字形帧、构形、义项与读音的关联。</li>
          <li>检查每字 5 个阶段、非空图像路径、书证三要素、多音对应编号、年代排序与造字法取值。</li>
          <li>检查 60 条故事与例句覆盖，并按 4.2 字/秒估算时长；部件标注只接受人工核验过的条目。</li>
          <li>测试命令读取磁盘文件，确认每一张非空字形图真实存在。</li>
        </ol>
        <p class="method-note__command">
          <code>npm run test</code> · <code>npm run validate</code> · <code>npm run typecheck</code>
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.validate {
  padding-top: 54px;
  padding-bottom: 60px;
}

.validate__head {
  max-width: 800px;
  margin-bottom: 28px;
}

.validate__head .section-title {
  margin-top: 10px;
}

.truth-banner {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  margin-bottom: 26px;
  border: 1px solid rgba(200, 90, 63, 0.26);
  border-radius: var(--radius-md);
  background:
    linear-gradient(90deg, rgba(200, 90, 63, 0.1), transparent 62%),
    rgba(20, 16, 16, 0.5);
}

.truth-banner__mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 1px solid rgba(200, 90, 63, 0.4);
  border-radius: 9px;
  color: #eaa189;
  font-size: 22px;
  transform: rotate(-4deg);
}

.truth-banner__title {
  font-size: 14px;
  color: #eaa189;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.truth-banner__text {
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--muted);
}

.error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  color: var(--danger);
}

.summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 26px;
  padding: 20px 0 26px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 22px;
}

.summary__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary__value {
  font-size: 30px;
  line-height: 1;
}

.summary__label {
  font-size: 11.5px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.summary__item--pass .summary__value {
  color: var(--jade);
}

.summary__item--warn .summary__value {
  color: var(--gold);
}

.summary__item--fail .summary__value {
  color: var(--danger);
}

.summary__note {
  flex: 1;
  min-width: 260px;
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
  text-align: right;
}

.summary__note code,
.method-note__command code {
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: var(--gold);
}

.checks {
  display: grid;
  gap: 8px;
}

.check {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
}

.check__status {
  flex-shrink: 0;
  min-width: 52px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  text-align: center;
  letter-spacing: 0.08em;
}

.check--pass .check__status {
  color: #b7d2c3;
  background: var(--jade-soft);
  border: 1px solid rgba(134, 169, 150, 0.3);
}

.check--warn .check__status {
  color: var(--gold-bright);
  background: var(--gold-dim);
  border: 1px solid rgba(216, 180, 106, 0.3);
}

.check--fail .check__status {
  color: #eaa189;
  background: var(--vermillion-soft);
  border: 1px solid rgba(200, 90, 63, 0.4);
}

.check__body {
  flex: 1;
  min-width: 0;
}

.check__label {
  font-size: 13px;
  color: var(--text);
  margin-bottom: 2px;
}

.check__detail {
  font-size: 11.5px;
  line-height: 1.75;
  color: var(--muted);
}

.check__icon {
  flex-shrink: 0;
  font-size: 17px;
}

.check--pass .check__icon {
  color: var(--jade);
}

.check--warn .check__icon {
  color: var(--gold);
}

.check--fail .check__icon {
  color: var(--danger);
}

.distributions {
  margin-top: 62px;
}

.dist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.dist {
  padding: 24px 26px;
}

.dist__title {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 16px;
}

.bars {
  display: grid;
  gap: 10px;
}

.bars li {
  display: grid;
  grid-template-columns: 52px 1fr 30px;
  align-items: center;
  gap: 10px;
}

.bars__label {
  font-size: 12px;
  color: var(--text-soft);
}

.bars__track {
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.bars__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(216, 180, 106, 0.4), var(--gold));
}

.bars__fill--alt {
  background: linear-gradient(90deg, rgba(134, 169, 150, 0.4), var(--jade));
}

.bars__value {
  font-size: 11.5px;
  color: var(--muted);
  text-align: right;
}

.polyphonic {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dist__big {
  font-size: 32px;
  color: var(--gold-bright);
}

.dist__note {
  margin-top: 8px;
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
}

.missing {
  margin-top: 62px;
}

.missing__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.missing__item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 7px 12px;
  border: 1px dashed rgba(200, 90, 63, 0.32);
  border-radius: 8px;
  font-size: 19px;
  color: var(--text-soft);
}

.missing__item small {
  font-size: 9.5px;
  color: var(--muted);
}

.method-note {
  margin-top: 52px;
  padding: 26px 28px;
}

.method-note__title {
  font-size: 19px;
  margin-bottom: 14px;
}

.method-note__list {
  display: grid;
  gap: 8px;
  padding-left: 20px;
  list-style: decimal;
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--muted);
}

.method-note__command {
  margin-top: 16px;
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 800px) {
  .dist-grid {
    grid-template-columns: 1fr;
  }

  .summary__note {
    text-align: left;
  }
}
</style>
