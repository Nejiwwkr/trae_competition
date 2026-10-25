import type {
  CharRecord,
  CharStore,
  GlyphFrame,
  MeaningSense,
  Reading,
  SenseType,
  StructureData,
} from '@/types'
import type { CsvRow } from './csv'
import { compareSenses, eraOrder } from './era'
import { parseSenseRefs } from './senseLink'
import { normalizePinyin } from './normalize'

const STAGE_ORDER = ['甲骨文', '金文', '小篆', '隶书', '楷书']

export function stageKey(stage: string): string {
  return stage.replace(/（[^）]*）/g, '').trim()
}

function stageRank(stage: string): number {
  const index = STAGE_ORDER.indexOf(stageKey(stage))
  return index === -1 ? 99 : index
}

export interface RawTables {
  frames: CsvRow[]
  structures: CsvRow[]
  meanings: CsvRow[]
  phonology: CsvRow[]
}

export function buildCharStore(tables: RawTables): CharStore {
  const charOrder: string[] = []
  const frameMap = new Map<string, GlyphFrame[]>()
  const structureMap = new Map<string, StructureData>()
  const senseMap = new Map<string, MeaningSense[]>()
  const readingMap = new Map<string, Reading[]>()

  const ensure = (char: string) => {
    if (char && !charOrder.includes(char)) charOrder.push(char)
  }

  for (const row of tables.frames) {
    const char = row['字头']
    if (!char) continue
    ensure(char)
    const relPath = row['相对路径'] ?? ''
    const frame: GlyphFrame = {
      char,
      simp: row['简体'] || char,
      stage: row['阶段'],
      era: row['年代'],
      fontName: row['字体名称'],
      relPath,
      sourceFile: row['源文件名'],
      sourceUrl: row['来源页URL'],
      license: row['许可'],
      eraCheck: row['年代类型核对'],
      sourceNote: row['来源说明'],
      missing: !relPath || row['阶段'].includes('未见著录'),
    }
    const list = frameMap.get(char) ?? []
    list.push(frame)
    frameMap.set(char, list)
  }

  for (const row of tables.structures) {
    const char = row['字头']
    if (!char) continue
    ensure(char)
    structureMap.set(char, {
      char,
      simp: row['简体'] || char,
      method: row['造字法'],
      dispute: row['争议标注'],
      analysis: row['构形解析'],
      shuowen: row['说文解字依据'],
      source: row['数据来源'],
      note: row['备注'],
    })
  }

  for (const row of tables.meanings) {
    const char = row['字头']
    if (!char) continue
    ensure(char)
    const sense: MeaningSense = {
      char,
      simp: row['简体'] || char,
      index: Number(row['义项序号']) || 0,
      type: (row['类型'] as SenseType) || '引申义',
      gloss: row['释义'],
      era: row['年代'],
      quote: row['书证原句'],
      citation: row['出处'],
      translation: row['白话翻译'],
      note: row['备注'],
      eraOrder: eraOrder(row['年代']),
    }
    const list = senseMap.get(char) ?? []
    list.push(sense)
    senseMap.set(char, list)
  }

  for (const row of tables.phonology) {
    const char = row['字头']
    if (!char) continue
    ensure(char)
    const reading: Reading = {
      char,
      simp: row['简体'] || char,
      index: Number(row['读音序']) || 0,
      modern: row['现代读音'],
      fanqie: row['广韵反切'],
      initial: row['中古声母'],
      rhyme: row['中古韵目'],
      tone: row['中古声调'],
      oldChinese: row['郑张上古拟音'],
      senseRefs: parseSenseRefs(row['对应义项']),
      senseRefText: row['对应义项'],
      note: row['备注'],
    }
    const list = readingMap.get(char) ?? []
    list.push(reading)
    readingMap.set(char, list)
  }

  const byTraditional = new Map<string, CharRecord>()
  const bySimplified = new Map<string, CharRecord>()
  const pinyinIndex = new Map<string, string[]>()

  const chars = charOrder
    .map<CharRecord>((char) => {
      const frames = (frameMap.get(char) ?? []).sort((a, b) => stageRank(a.stage) - stageRank(b.stage))
      const senses = (senseMap.get(char) ?? []).sort(compareSenses)
      const readings = (readingMap.get(char) ?? []).sort((a, b) => a.index - b.index)
      for (const reading of readings) {
        if (reading.senseRefText.includes('全部义项')) {
          reading.senseRefs = senses.map((sense) => sense.index)
        } else if (reading.senseRefs.length === 0 && senses.length === 1) {
          reading.senseRefs = [senses[0].index]
        }
      }
      return {
        char,
        simp: frames[0]?.simp || structureMap.get(char)?.simp || char,
        frames,
        structure: structureMap.get(char) ?? null,
        senses,
        readings,
      }
    })
    .filter((record) => record.frames.length > 0 || record.senses.length > 0)

  for (const record of chars) {
    byTraditional.set(record.char, record)
    bySimplified.set(record.simp, record)
  }

  for (const record of chars) {
    for (const reading of record.readings) {
      const key = normalizePinyin(reading.modern)
      if (!key) continue
      const list = pinyinIndex.get(key) ?? []
      if (!list.includes(record.char)) list.push(record.char)
      pinyinIndex.set(key, list)
    }
  }

  return { chars, byTraditional, bySimplified, pinyinIndex }
}

export function findChar(store: CharStore | null, input: string): CharRecord | null {
  if (!store || !input) return null
  return store.byTraditional.get(input) ?? store.bySimplified.get(input) ?? null
}
