<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { CharRecord, GlyphFrame } from '@/types'
import { useData } from '@/data/useData'
import { stageKey } from '@/data/buildStore'
import { glyphImageUrl } from '@/data/loadData'
import GlyphImage from '@/components/ui/GlyphImage.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

interface Question {
  record: CharRecord
  frame: GlyphFrame
  options: CharRecord[]
}

const { store, loading, error, reload } = useData()

const question = ref<Question | null>(null)
const selected = ref<string | null>(null)
const answered = ref(false)
const showHint = ref(false)
const round = ref(0)

const best = ref(Number(localStorage.getItem('ziyuan-puzzle-best') ?? 0))
const attempts = ref(Number(localStorage.getItem('ziyuan-puzzle-attempts') ?? 0))
const correct = ref(Number(localStorage.getItem('ziyuan-puzzle-correct') ?? 0))
const streak = ref(Number(localStorage.getItem('ziyuan-puzzle-streak') ?? 0))

const accuracy = computed(() =>
  attempts.value === 0 ? '—' : `${Math.round((correct.value / attempts.value) * 100)}%`,
)

const ANCIENT_STAGES = new Set(['甲骨文', '金文'])

const pool = computed(
  () =>
    store.value?.chars.filter((record) =>
      record.frames.some((frame) => !frame.missing && ANCIENT_STAGES.has(stageKey(frame.stage))),
    ) ?? [],
)

function pick<T>(items: T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildQuestion(): Question | null {
  const candidates = pool.value.filter((record) => record.char !== question.value?.record.char)
  const record = pick(candidates.length ? candidates : pool.value)
  if (!record) return null

  const ancient =
    record.frames.find(
      (frame) => !frame.missing && ANCIENT_STAGES.has(stageKey(frame.stage)),
    ) ?? record.frames.find((frame) => !frame.missing)
  if (!ancient) return null

  const sameMethod = pool.value.filter(
    (item) =>
      item.char !== record.char && item.structure?.method === record.structure?.method,
  )
  const others: CharRecord[] = []
  for (const item of shuffle(sameMethod)) {
    if (others.length >= 3) break
    others.push(item)
  }
  for (const item of shuffle(pool.value)) {
    if (others.length >= 3) break
    if (item.char === record.char || others.includes(item)) continue
    others.push(item)
  }

  return { record, frame: ancient, options: shuffle([record, ...others.slice(0, 3)]) }
}

function next() {
  const nextQuestion = buildQuestion()
  if (!nextQuestion) return
  question.value = nextQuestion
  selected.value = null
  answered.value = false
  showHint.value = false
  round.value += 1
}

function choose(option: CharRecord) {
  if (!question.value || answered.value) return
  selected.value = option.char
  answered.value = true
  attempts.value += 1

  if (option.char === question.value.record.char) {
    correct.value += 1
    streak.value += 1
    best.value = Math.max(best.value, streak.value)
  } else {
    streak.value = 0
  }

  localStorage.setItem('ziyuan-puzzle-best', String(best.value))
  localStorage.setItem('ziyuan-puzzle-attempts', String(attempts.value))
  localStorage.setItem('ziyuan-puzzle-correct', String(correct.value))
  localStorage.setItem('ziyuan-puzzle-streak', String(streak.value))
}

const frameSrc = computed(() =>
  question.value?.frame.missing ? '' : glyphImageUrl(question.value?.frame.relPath ?? ''),
)

const isCorrect = computed(
  () => answered.value && selected.value === question.value?.record.char,
)

watch(
  pool,
  (value) => {
    if (value.length && !question.value) next()
  },
  { immediate: true },
)

function optionClass(option: CharRecord): string {
  if (!answered.value) return ''
  if (option.char === question.value?.record.char) return 'option--correct'
  if (option.char === selected.value) return 'option--wrong'
  return 'option--dim'
}

function onKeydown(event: KeyboardEvent) {
  if (!question.value) return
  if (answered.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    next()
    return
  }
  const index = Number(event.key) - 1
  if (!answered.value && index >= 0 && index < question.value.options.length) {
    choose(question.value.options[index])
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="puzzle container">
    <header class="puzzle__head">
      <p class="eyebrow">Glyph puzzle</p>
      <h1 class="section-title">看形猜字：你还认得出它的前身吗</h1>
      <p class="section-lead">
        每题给出一幅甲骨文或金文字形，四选一。答对即可打开完整字源卡；按 1–4 选择，答后按回车下一题。
      </p>
    </header>

    <div v-if="error" class="error panel">
      <p>数据加载失败：{{ error }}</p>
      <button class="btn btn--primary" @click="reload">重试</button>
    </div>

    <LoadingSkeleton v-else-if="loading" :lines="5" tall />

    <EmptyState
      v-else-if="!question"
      glyph="谜"
      title="题库暂时为空"
      description="数据包中没有可用于猜字的古文字形帧。"
    />

    <template v-else>
      <div class="puzzle__stats">
        <div class="puzzle__stat">
          <span class="puzzle__stat-value serif">{{ streak }}</span>
          <span class="puzzle__stat-label">当前连击</span>
        </div>
        <div class="puzzle__stat">
          <span class="puzzle__stat-value serif">{{ best }}</span>
          <span class="puzzle__stat-label">最佳连击</span>
        </div>
        <div class="puzzle__stat">
          <span class="puzzle__stat-value serif">{{ accuracy }}</span>
          <span class="puzzle__stat-label">正确率</span>
        </div>
        <span class="puzzle__round">第 {{ round }} 题</span>
      </div>

      <div class="puzzle__grid">
        <div class="puzzle__glyph panel">
          <div class="puzzle__stage">
            <span class="chip chip--gold">{{ stageKey(question.frame.stage) }}</span>
            <span class="chip">{{ question.frame.era }}</span>
          </div>
          <div class="puzzle__image">
            <GlyphImage
              :src="frameSrc"
              :alt="`${stageKey(question.frame.stage)}字形`"
              :stage="stageKey(question.frame.stage)"
              loading="eager"
            />
          </div>
          <button v-if="!answered" class="btn btn--ghost puzzle__hint" @click="showHint = !showHint">
            {{ showHint ? '收起提示' : '给点提示' }}
          </button>
          <p v-if="showHint && !answered" class="puzzle__hint-text">
            造字法：{{ question.record.structure?.method }} · 现代读音：
            {{ question.record.readings[0]?.modern }}
          </p>
        </div>

        <div class="puzzle__panel">
          <p class="puzzle__question serif">这是今天哪个字？</p>

          <div class="puzzle__options">
            <button
              v-for="(option, index) in question.options"
              :key="option.char"
              class="option panel"
              :class="optionClass(option)"
              :disabled="answered"
              @click="choose(option)"
            >
              <span class="option__key">{{ index + 1 }}</span>
              <span class="option__char serif">{{ option.simp }}</span>
              <span v-if="answered" class="option__pinyin">
                {{ option.readings[0]?.modern }}
              </span>
            </button>
          </div>

          <Transition name="feedback">
            <div v-if="answered" class="feedback" :class="isCorrect ? 'feedback--ok' : 'feedback--no'">
              <p class="feedback__title serif">
                {{ isCorrect ? '认出来了' : '再看一眼' }}
              </p>
              <p class="feedback__body">
                答案是
                <strong class="serif">{{ question.record.simp }}</strong>
                <template v-if="question.record.char !== question.record.simp">
                  （繁体 {{ question.record.char }}）
                </template>
                ，{{ question.record.structure?.method.replace('會意', '会意').replace('形聲', '形声') }}字。
                {{ question.record.structure?.analysis }}
              </p>
              <div class="feedback__actions">
                <RouterLink :to="`/char/${question.record.char}`" class="btn btn--ghost">
                  展开完整字源卡
                </RouterLink>
                <button class="btn btn--primary" @click="next">下一题（回车）</button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <p class="puzzle__note">
        题目只使用数据包中有可靠古文字形的字；干扰项优先取自同一造字法，避免靠字形之外的线索猜测。
      </p>
    </template>
  </div>
</template>

<style scoped>
.puzzle {
  padding-top: 54px;
  padding-bottom: 60px;
}

.puzzle__head {
  max-width: 780px;
  margin-bottom: 30px;
}

.puzzle__head .section-title {
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

.puzzle__stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
  padding: 16px 0 26px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 26px;
}

.puzzle__stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.puzzle__stat-value {
  font-size: 28px;
  color: var(--gold-bright);
  line-height: 1;
}

.puzzle__stat-label {
  font-size: 11.5px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.puzzle__round {
  margin-left: auto;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.puzzle__grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 22px;
  align-items: stretch;
}

.puzzle__glyph {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 26px;
}

.puzzle__stage {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.puzzle__image {
  flex: 1;
  min-height: 360px;
  padding: 22px;
  border-radius: var(--radius-md);
  background:
    radial-gradient(circle at 50% 46%, rgba(216, 180, 106, 0.14), transparent 64%),
    rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.puzzle__hint {
  align-self: flex-start;
}

.puzzle__hint-text {
  font-size: 12.5px;
  color: var(--gold);
}

.puzzle__panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(16, 20, 26, 0.6);
}

.puzzle__question {
  font-size: 24px;
  letter-spacing: 0.06em;
}

.puzzle__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
  border-radius: var(--radius-md);
  text-align: left;
  transition:
    border-color 0.3s,
    background 0.3s,
    transform 0.3s var(--ease-out),
    opacity 0.3s;
}

.option:not(:disabled):hover {
  border-color: var(--line-strong);
  background: var(--gold-dim);
  transform: translateY(-2px);
}

.option__key {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 6px;
  font-size: 11px;
  color: var(--muted);
}

.option__char {
  font-size: 34px;
  line-height: 1;
  color: var(--text);
}

.option__pinyin {
  margin-left: auto;
  font-size: 11px;
  color: var(--muted);
}

.option--correct {
  border-color: var(--jade);
  background: var(--jade-soft);
}

.option--correct .option__char {
  color: #c8e0d2;
}

.option--wrong {
  border-color: var(--vermillion);
  background: var(--vermillion-soft);
}

.option--dim {
  opacity: 0.4;
}

.feedback {
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
}

.feedback--ok {
  border-color: rgba(134, 169, 150, 0.36);
  background: rgba(134, 169, 150, 0.07);
}

.feedback--no {
  border-color: rgba(200, 90, 63, 0.32);
  background: rgba(200, 90, 63, 0.06);
}

.feedback__title {
  font-size: 19px;
  color: var(--gold-bright);
}

.feedback--ok .feedback__title {
  color: #c8e0d2;
}

.feedback__body {
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--text-soft);
}

.feedback__body strong {
  font-size: 20px;
  color: var(--gold-bright);
}

.feedback__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.feedback-enter-active,
.feedback-leave-active {
  transition:
    opacity 0.3s var(--ease-out),
    transform 0.3s var(--ease-out);
}

.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.puzzle__note {
  margin-top: 22px;
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
}

@media (max-width: 900px) {
  .puzzle__grid {
    grid-template-columns: 1fr;
  }

  .puzzle__image {
    min-height: 280px;
  }
}

@media (max-width: 560px) {
  .puzzle__options {
    grid-template-columns: 1fr;
  }
}
</style>
