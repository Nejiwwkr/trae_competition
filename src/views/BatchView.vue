<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CharRecord } from '@/types'
import { useData } from '@/data/useData'
import { findChar, stageKey } from '@/data/buildStore'
import { glyphImageUrl } from '@/data/loadData'
import { splitBatchInput } from '@/data/normalize'
import { useShareImage } from '@/composables/useShareImage'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import GlyphImage from '@/components/ui/GlyphImage.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'

const { store, loading, error, reload } = useData()
const { exporting, error: exportError, exportNode } = useShareImage()

const raw = ref('')
const results = ref<{ char: string; record: CharRecord | null }[]>([])
const tooMany = ref(false)
const deduplicated = ref(0)
const generated = ref(false)

const rawHanCount = computed(
  () => [...raw.value].filter((char) => /[㐀-鿿豈-﫿]/.test(char)).length,
)

const foundCount = computed(() => results.value.filter((item) => item.record).length)
const missingCount = computed(() => results.value.filter((item) => !item.record).length)

function generate() {
  const unique = splitBatchInput(raw.value)
  deduplicated.value = Math.max(0, rawHanCount.value - unique.length)
  tooMany.value = unique.length > 10
  results.value = unique
    .slice(0, 10)
    .map((char) => ({ char, record: findChar(store.value, char) }))
  generated.value = true
}

function fillExample() {
  raw.value = '明 行 道 福 水 樂 見 心 北 城'
}

const cardElements = new Map<string, HTMLElement>()

function setCardRef(char: string, element: unknown) {
  if (element instanceof HTMLElement) cardElements.set(char, element)
  else cardElements.delete(char)
}

const cardFrames = (record: CharRecord) =>
  record.frames.map((frame) => ({
    ...frame,
    key: stageKey(frame.stage),
    src: frame.missing ? '' : glyphImageUrl(frame.relPath),
  }))

const methodLabel = (record: CharRecord) =>
  (record.structure?.method ?? '').replace('會意', '会意').replace('形聲', '形声')

function exportRatio(element: HTMLElement): number {
  return element.offsetWidth ? Math.min(3, Math.max(2, 1080 / element.offsetWidth)) : 2
}

async function exportOne(char: string) {
  const element = cardElements.get(char)
  if (!element) return
  try {
    await exportNode(element, `字源卡-${char}.png`, { pixelRatio: exportRatio(element) })
  } catch {
    /* exportError 已更新 */
  }
}

async function exportAll() {
  for (const item of results.value) {
    if (!item.record) continue
    const element = cardElements.get(item.record.char)
    if (!element) continue
    try {
      await exportNode(element, `字源卡-${item.record.char}.png`, {
        pixelRatio: exportRatio(element),
      })
      await new Promise((resolve) => setTimeout(resolve, 350))
    } catch {
      return
    }
  }
}
</script>

<template>
  <div class="batch container">
    <header class="batch__head">
      <p class="eyebrow">Batch import</p>
      <h1 class="section-title">批量生词本：一次十张字源卡</h1>
      <p class="section-lead">
        粘贴或输入 10 个汉字，自动去重、逐字核对，然后批量导出 PNG。数据包外的字会被明确标出，不会生成假数据。
      </p>
    </header>

    <div v-if="error" class="error panel">
      <p>数据加载失败：{{ error }}</p>
      <button class="btn btn--primary" @click="reload">重试</button>
    </div>

    <LoadingSkeleton v-else-if="loading" :lines="4" />

    <template v-else>
      <div class="batch__input panel">
        <label for="batch-input" class="batch__label">生词本</label>
        <textarea
          id="batch-input"
          v-model="raw"
          rows="3"
          placeholder="例如：明 行 道 福 水 樂 見 心 北 城"
          spellcheck="false"
        />
        <div class="batch__meta">
          <p>
            已输入 {{ rawHanCount }} 个汉字<span v-if="deduplicated">，去重 {{ deduplicated }} 个</span>
            <span v-if="tooMany" class="batch__warn">，超出 10 字的部分将被截断</span>
          </p>
          <div class="batch__actions">
            <button class="btn btn--ghost" @click="fillExample">填入示例</button>
            <button class="btn btn--primary" @click="generate">生成字源卡</button>
          </div>
        </div>
      </div>

      <div v-if="exportError" class="error panel batch__export-error">
        导出失败：{{ exportError }}
      </div>

      <template v-if="generated">
        <div class="batch__summary">
          <span class="chip chip--jade">成功 {{ foundCount }}</span>
          <span v-if="missingCount" class="chip chip--vermillion">未收录 {{ missingCount }}</span>
          <span class="batch__summary-note">
            未收录的字不会出现在导出结果中。数据包仅覆盖 60 字。
          </span>
          <button
            v-if="foundCount > 1"
            class="btn btn--primary batch__export-all"
            :disabled="exporting"
            @click="exportAll"
          >
            {{ exporting ? '正在导出…' : `导出全部 ${foundCount} 张` }}
          </button>
        </div>

        <div v-if="results.length === 0" class="batch__empty panel">
          还没有识别到汉字，请在上方输入。
        </div>

        <div v-else class="batch__grid">
          <div v-for="item in results" :key="item.char" class="batch__cell">
            <template v-if="item.record">
              <article :ref="(el) => setCardRef(item.char, el)" class="batch-card">
                <header class="batch-card__head">
                  <span class="batch-card__char serif">{{ item.record.simp }}</span>
                  <div class="batch-card__title">
                    <p class="batch-card__pinyin">
                      {{ item.record.readings.map((reading) => reading.modern).join(' / ') }}
                    </p>
                    <span class="batch-card__method">{{ methodLabel(item.record) }}</span>
                  </div>
                  <span class="batch-card__brand serif">字源</span>
                </header>

                <div class="batch-card__glyphs">
                  <figure v-for="frame in cardFrames(item.record)" :key="frame.key">
                    <div class="batch-card__glyph">
                      <img
                        v-if="frame.src"
                        :src="frame.src"
                        :alt="`${item.record.char}的${frame.key}字形`"
                        crossorigin="anonymous"
                      />
                      <span v-else class="batch-card__missing serif">阙</span>
                    </div>
                    <figcaption>{{ frame.key }}</figcaption>
                  </figure>
                </div>

                <p class="batch-card__gloss">{{ item.record.senses[0]?.gloss }}</p>
                <p class="batch-card__analysis">
                  {{ item.record.structure?.analysis }}
                </p>

                <footer class="batch-card__foot">
                  <span>{{ item.record.senses[0]?.citation }}</span>
                  <span>Wikimedia Commons · Klee One OFL</span>
                </footer>
              </article>

              <div class="batch__cell-actions">
                <RouterLink :to="`/char/${item.record.char}`" class="btn btn--ghost">
                  查看完整字源卡 →
                </RouterLink>
                <button class="btn" :disabled="exporting" @click="exportOne(item.record.char)">
                  下载 PNG
                </button>
              </div>
            </template>

            <div v-else class="batch-missing panel">
              <span class="batch-missing__char serif">{{ item.char }}</span>
              <p>数据包未收录「{{ item.char }}」</p>
              <span>请换用 60 字数据集中的汉字</span>
            </div>
          </div>
        </div>
      </template>

      <section v-else class="batch__tips">
        <SectionHeading
          eyebrow="How it works"
          title="三步得到一组字源卡"
          lead="所有内容来自官方数据包，导出图片含来源与许可信息。"
        />
        <ol class="steps">
          <li class="step panel">
            <span class="step__no serif">一</span>
            <p>粘贴生词本，逗号、空格或换行分隔均可，自动去重并限制为 10 字。</p>
          </li>
          <li class="step panel">
            <span class="step__no serif">二</span>
            <p>逐字核对：收录字生成五阶段字形卡，未收录字明确标注，不伪造内容。</p>
          </li>
          <li class="step panel">
            <span class="step__no serif">三</span>
            <p>单张或全部导出 1080 像素宽的 PNG，可用于课堂、笔记或社交分享。</p>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<style scoped>
.batch {
  padding-top: 54px;
  padding-bottom: 60px;
}

.batch__head {
  max-width: 780px;
  margin-bottom: 34px;
}

.batch__head .section-title {
  margin-top: 10px;
}

.error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
  color: var(--danger);
}

.batch__export-error {
  margin-top: 18px;
}

.batch__input {
  padding: 26px 28px;
}

.batch__label {
  display: block;
  margin-bottom: 10px;
  font-size: 11.5px;
  letter-spacing: 0.22em;
  color: var(--gold);
}

.batch__input textarea {
  width: 100%;
  min-height: 104px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.2);
  resize: vertical;
  font-family: var(--font-serif);
  font-size: 20px;
  line-height: 1.9;
  letter-spacing: 0.12em;
  outline: none;
  transition: border-color 0.3s;
}

.batch__input textarea:focus {
  border-color: var(--line-strong);
}

.batch__input textarea::placeholder {
  color: #6f6c64;
  font-size: 16px;
  letter-spacing: 0.06em;
}

.batch__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
  font-size: 12px;
  color: var(--muted);
}

.batch__warn {
  color: var(--vermillion);
}

.batch__actions {
  display: flex;
  gap: 10px;
}

.batch__summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 30px 0 20px;
}

.batch__summary-note {
  font-size: 12px;
  color: var(--muted);
}

.batch__export-all {
  margin-left: auto;
}

.batch__empty {
  padding: 26px;
  color: var(--muted);
  font-size: 13px;
}

.batch__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 22px;
}

.batch__cell {
  display: grid;
  gap: 10px;
  align-content: start;
}

.batch-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 22px 24px;
  border: 1px solid rgba(216, 180, 106, 0.25);
  border-radius: var(--radius-md);
  background:
    radial-gradient(300px 180px at 86% 0%, rgba(216, 180, 106, 0.13), transparent 64%),
    linear-gradient(165deg, #12161c, #0b0e13);
  color: var(--text);
}

.batch-card__head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.batch-card__char {
  font-size: 54px;
  line-height: 1;
  color: var(--gold-bright);
}

.batch-card__title {
  display: grid;
  gap: 3px;
  flex: 1;
}

.batch-card__pinyin {
  font-size: 12px;
  color: var(--text-soft);
}

.batch-card__method {
  justify-self: start;
  padding: 1px 8px;
  border: 1px solid rgba(216, 180, 106, 0.3);
  border-radius: 999px;
  font-size: 10px;
  color: var(--gold);
}

.batch-card__brand {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: rgba(216, 180, 106, 0.5);
}

.batch-card__glyphs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.batch-card__glyphs figure {
  display: grid;
  gap: 4px;
  justify-items: center;
}

.batch-card__glyph {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  padding: 7%;
  border-radius: 5px;
  background:
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.6), transparent 58%),
    linear-gradient(155deg, #efe8d7, #d9cdb3);
  box-shadow: inset 0 0 0 1px rgba(84, 63, 34, 0.14);
}

.batch-card__glyph img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.batch-card__missing {
  font-size: 14px;
  color: #6f6c64;
}

.batch-card__glyphs figcaption {
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.08em;
}

.batch-card__gloss {
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.7;
}

.batch-card__analysis {
  font-size: 11.5px;
  line-height: 1.8;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.batch-card__foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(216, 180, 106, 0.14);
  font-size: 9px;
  color: var(--muted);
}

.batch__cell-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.batch-missing {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 40px 20px;
  border-style: dashed;
  text-align: center;
  color: var(--muted);
}

.batch-missing__char {
  font-size: 46px;
  color: #6f6c64;
}

.batch-missing p {
  font-size: 13px;
  color: var(--text-soft);
}

.batch-missing span {
  font-size: 11.5px;
}

.batch__tips {
  margin-top: 60px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.step {
  display: flex;
  gap: 16px;
  padding: 24px;
}

.step__no {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 50%;
  font-size: 20px;
  color: var(--gold);
}

.step p {
  font-size: 13px;
  line-height: 1.9;
  color: var(--muted);
}

@media (max-width: 900px) {
  .steps {
    grid-template-columns: 1fr;
  }

  .batch__grid {
    grid-template-columns: 1fr;
  }
}
</style>
