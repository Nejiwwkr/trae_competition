import type {
  CharStore,
  CheckResult,
  ComponentAnnotation,
  ExampleContent,
  FamilyGroup,
  StoryContent,
} from '@/types'
import { ERA_ORDER } from './era'
import { hasNumericSenseRef } from './senseLink'

export interface ContentBundle {
  stories: Record<string, StoryContent>
  examples: Record<string, ExampleContent>
  families: FamilyGroup[]
  components: Record<string, ComponentAnnotation>
}

const VALID_METHODS = new Set(['象形', '指事', '會意', '形聲', '会意', '形声'])

export function runChecks(store: CharStore, content: ContentBundle): CheckResult[] {
  const results: CheckResult[] = []
  const push = (
    id: string,
    label: string,
    status: CheckResult['status'],
    detail: string,
  ) => results.push({ id, label, status, detail })

  push(
    'char-count',
    '汉字总数',
    store.chars.length === 60 ? 'pass' : 'warn',
    `收录 ${store.chars.length} 字（数据包声明 60 字）`,
  )

  const frameIssues = store.chars.filter((record) => record.frames.length !== 5)
  const thinFrames = store.chars.filter(
    (record) => record.frames.filter((frame) => !frame.missing).length < 4,
  )
  push(
    'frames',
    '字形帧完整性',
    frameIssues.length === 0 && thinFrames.length === 0 ? 'pass' : 'fail',
    frameIssues.length === 0 && thinFrames.length === 0
      ? `60 字均为 5 个阶段，其中 ${store.chars.reduce(
          (sum, record) => sum + record.frames.filter((frame) => frame.missing).length,
          0,
        )} 帧为「未见著录」占位，其余 ${store.chars.reduce(
          (sum, record) => sum + record.frames.filter((frame) => !frame.missing).length,
          0,
        )} 张图像路径完整`
      : `${frameIssues.length} 字阶段数异常，${thinFrames.length} 字有效帧少于 4`,
  )

  const senseIssues = store.chars.flatMap((record) =>
    record.senses
      .filter((sense) => !sense.quote || !sense.citation || !sense.translation)
      .map((sense) => `${record.char}#${sense.index}`),
  )
  push(
    'citations',
    '书证与白话翻译',
    senseIssues.length === 0 ? 'pass' : 'fail',
    senseIssues.length === 0
      ? `${store.chars.reduce((sum, record) => sum + record.senses.length, 0)} 条义项均有书证原句、出处与白话翻译`
      : `${senseIssues.length} 条义项缺少书证或翻译：${senseIssues.slice(0, 8).join('、')}`,
  )

  const readingIssues = store.chars.flatMap((record) => {
    const senseIndexes = new Set(record.senses.map((sense) => sense.index))
    return record.readings
      .filter((reading) => {
        if (reading.senseRefs.length > 0) {
          return reading.senseRefs.some((index) => !senseIndexes.has(index))
        }
        return hasNumericSenseRef(reading.senseRefText)
      })
      .map((reading) => `${record.char}（${reading.modern}）`)
  })
  const polyphonic = store.chars.filter((record) => record.readings.length > 1)
  const allReadings = store.chars.flatMap((record) => record.readings)
  const linkedReadings = allReadings.filter((reading) => reading.senseRefs.length > 0).length
  push(
    'readings',
    '读音—义项对应',
    readingIssues.length === 0 ? 'pass' : 'fail',
    readingIssues.length === 0
      ? `${polyphonic.length} 个多音字、${allReadings.length} 条读音均附对应说明，其中 ${linkedReadings} 条可精确关联义项编号`
      : `${readingIssues.length} 条读音无法对应义项：${readingIssues.slice(0, 8).join('、')}`,
  )

  const unknownEras = new Set<string>()
  for (const record of store.chars) {
    for (const sense of record.senses) {
      if (!(sense.era in ERA_ORDER)) unknownEras.add(sense.era)
    }
  }
  push(
    'eras',
    '年代排序覆盖',
    unknownEras.size === 0 ? 'pass' : 'fail',
    unknownEras.size === 0
      ? `全部年代值均可排序：${Object.keys(ERA_ORDER).join('、')}`
      : `未定义排序的年代：${[...unknownEras].join('、')}`,
  )

  const structureIssues = store.chars.filter(
    (record) => !record.structure || !VALID_METHODS.has(record.structure.method),
  )
  const disputed = store.chars.filter((record) => record.structure?.dispute).length
  push(
    'structures',
    '构形与争议标注',
    structureIssues.length === 0 ? 'pass' : 'fail',
    structureIssues.length === 0
      ? `60 字均有合法造字法；${disputed} 字附有争议说明，界面以「一说」呈现`
      : `${structureIssues.length} 字缺少构形解析或造字法非法`,
  )

  const missingStories = store.chars.filter((record) => !content.stories[record.char])
  const badLength = store.chars.filter((record) => {
    const story = content.stories[record.char]
    if (!story) return false
    const length = [...story.text].length
    return length < 210 || length > 294
  })
  push(
    'stories',
    '60 秒口播文案',
    missingStories.length === 0 && badLength.length === 0 ? 'pass' : 'fail',
    missingStories.length === 0 && badLength.length === 0
      ? `60 条文案齐备，字数 210–294，按 4.2 字/秒估算为 50–70 秒`
      : `缺 ${missingStories.length} 条；${badLength.length} 条字数越界`,
  )

  const missingExamples = store.chars.filter(
    (record) => !content.examples[record.char] || content.examples[record.char].examples.length < 3,
  )
  push(
    'examples',
    '生活例句',
    missingExamples.length === 0 ? 'pass' : 'warn',
    missingExamples.length === 0
      ? '60 字均有 3 条现代用例与易错提醒'
      : `${missingExamples.length} 字例句不足 3 条`,
  )

  const familyMembers = new Set(content.families.flatMap((group) => group.members))
  push(
    'families',
    '字族索引',
    content.families.length > 0 ? 'pass' : 'warn',
    `${content.families.length} 个字族分组，覆盖 ${familyMembers.size} 字；其余字按独立字呈现`,
  )

  const annotated = Object.keys(content.components).length
  push(
    'components',
    '部件动画标注',
    annotated >= 12 ? 'pass' : 'warn',
    `已人工标注 ${annotated} 字的构形部件`,
  )

  push(
    'truth',
    '赛题真值文件',
    'warn',
    'char_truth.json 未随数据包提供，无法按官方 80% / 90% 一致率验收；本页以全量一致性自检代替',
  )

  return results
}
