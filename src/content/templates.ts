import type { CharRecord, ExampleContent, ExampleItem, StoryContent } from '@/types'

const CLOSING = '一个字，就是一条走了三千年的路。'
const PADDING = '字形与义项彼此印证，让这个字的历史变得可触可感。'

function charLength(text: string): number {
  return [...text].length
}

function stageName(stage: string): string {
  return stage.replace(/（[^）]*）/g, '').trim()
}

function senseSegment(sense: CharRecord['senses'][number], withTranslation = true): string {
  const translation = withTranslation && sense.translation ? `意思是：${sense.translation}` : ''
  return `${sense.era}时，它表示「${sense.gloss}」。${sense.citation}里写：「${sense.quote}」${translation}`
}

function truncate(text: string, max: number): string {
  const chars = [...text]
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join('')}…`
}

export function buildStory(record: CharRecord): StoryContent {
  const structure = record.structure
  const opening = structure
    ? `「${record.char}」，${structure.method}字。${structure.analysis}`
    : `「${record.char}」，一个走过三千年的汉字。`
  const presentFrames = record.frames.filter((frame) => !frame.missing)
  const stageNames = presentFrames.map((frame) => stageName(frame.stage))
  const missingOracle = record.frames.some((frame) => frame.missing)
  const glyph = stageNames.length
    ? `从${stageNames[0]}到楷书，它留下了${stageNames.length}个阶段的字形：${stageNames.join('、')}。${missingOracle ? '甲骨文一栏未见著录，本卡以金文为最早存世字形。' : ''}`
    : ''
  const reading = record.readings[0]
  const fullReading = reading
    ? `读音上，中古作「${reading.fanqie}」，${reading.initial}母、${reading.rhyme}韵、${reading.tone}声；郑张上古拟音 ${reading.oldChinese}，今天读 ${reading.modern}。`
    : ''
  const shortReading = reading ? `中古反切「${reading.fanqie}」，今天读 ${reading.modern}。` : ''
  const dispute = structure?.dispute ? `构形上还有一说：${structure.dispute}。` : ''

  const segments = [opening, glyph]
  const projected = (extra: string[]) =>
    charLength([...segments, ...extra, fullReading, CLOSING].join(''))

  let addedSense = false
  for (const [index, sense] of record.senses.entries()) {
    const segment = senseSegment(sense)
    if (projected([segment]) <= 288) {
      segments.push(segment)
      addedSense = true
    } else if (index === 0) {
      segments.push(truncate(senseSegment(sense, false), 90))
      addedSense = true
    }
    if (addedSense && charLength(segments.join('')) >= 240) break
  }

  if (fullReading && charLength([...segments, fullReading, CLOSING].join('')) <= 292) {
    segments.push(fullReading)
  } else if (shortReading) {
    segments.push(shortReading)
  }

  if (dispute && charLength([...segments, dispute, CLOSING].join('')) <= 292) {
    segments.push(dispute)
  }

  while (charLength([...segments, CLOSING].join('')) < 212) {
    segments.push(PADDING)
  }

  const text = [...segments, CLOSING].join('')
  return { text, seconds: Math.round(charLength(text) / 4.2), generated: true }
}

export function buildExamples(record: CharRecord): ExampleContent {
  const first = record.senses[0]
  const second = record.senses[1]
  const last = record.senses[record.senses.length - 1]
  const examples: ExampleItem[] = []

  if (first) {
    examples.push({
      sentence: `读古书遇到「${record.char}」，先想想它是不是「${first.gloss}」的意思。`,
      sense: `本义：${first.gloss}`,
      note: first.citation ? `见${first.citation}` : '',
    })
  }
  if (second) {
    examples.push({
      sentence: `今天书面语里的「${record.char}」，仍保留着「${second.gloss}」这一层意思。`,
      sense: `${second.type}：${second.gloss}`,
      note: second.citation ? `书证出自${second.citation}` : '',
    })
  }
  if (last) {
    examples.push({
      sentence: `理解「${record.char}」的${last.type}「${last.gloss}」，有助于读懂相关古文。`,
      sense: `${last.type}：${last.gloss}`,
      note: last.citation ? `书证出自${last.citation}` : '',
    })
  }

  const warning =
    record.readings.length > 1
      ? `「${record.char}」是多音字，读音与义项相关：${record.readings
          .map((reading) => `${reading.modern}（${reading.senseRefText}）`)
          .join('；')}。`
      : `注意区分「${record.char}」的古义与今义，避免以今律古。`

  return { examples, warning, generated: true }
}
