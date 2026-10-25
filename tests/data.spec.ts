import { describe, expect, it } from 'vitest'
import { findChar, stageKey } from '@/data/buildStore'
import { parseCsv } from '@/data/csv'
import { eraOrder } from '@/data/era'
import { splitBatchInput } from '@/data/normalize'
import { parseSenseRefs } from '@/data/senseLink'
import { loadFixtureStore, readAsset } from './helpers/loadFixture'

describe('CSV 解析', () => {
  it('去除 BOM 并保留中文表头', () => {
    const rows = parseCsv(readAsset('meaning_evolution.csv'))
    expect(Object.keys(rows[0])).toContain('字头')
    expect(rows[0]['字头']).toBe('人')
  })

  it('过滤空行', () => {
    const rows = parseCsv(readAsset('phonology.csv'))
    expect(rows.every((row) => row['字头'])).toBe(true)
  })

  it('可解析引号内的逗号', () => {
    const rows = parseCsv('字头,释义\n人,"人类；人, 众人"\n')
    expect(rows[0]['释义']).toBe('人类；人, 众人')
  })
})

describe('数据仓库', () => {
  const store = loadFixtureStore()

  it('收录 60 字与 300 条字形帧', () => {
    expect(store.chars).toHaveLength(60)
    expect(store.chars.reduce((sum, record) => sum + record.frames.length, 0)).toBe(300)
  })

  it('8 字缺少甲骨文帧并标记 missing', () => {
    const missing = store.chars.flatMap((record) =>
      record.frames.filter((frame) => frame.missing).map((frame) => record.char),
    )
    expect(new Set(missing)).toEqual(new Set(['漢', '湛', '環', '賜', '賞', '道', '過', '城']))
    expect(missing).toHaveLength(8)
  })

  it('字形帧按甲骨文到楷书排序', () => {
    const record = findChar(store, '明')
    expect(record?.frames.map((frame) => stageKey(frame.stage))).toEqual([
      '甲骨文',
      '金文',
      '小篆',
      '隶书',
      '楷书',
    ])
  })

  it('简体字可映射到繁体字头', () => {
    expect(findChar(store, '乐')?.char).toBe('樂')
    expect(findChar(store, '车')?.char).toBe('車')
    expect(findChar(store, '见')?.char).toBe('見')
    expect(findChar(store, '行')?.char).toBe('行')
  })

  it('行有三读并正确关联义项', () => {
    const record = findChar(store, '行')
    expect(record?.readings).toHaveLength(3)
    expect(record?.readings.map((reading) => reading.modern)).toEqual(['xíng', 'háng', 'xìng'])
    expect(record?.readings.map((reading) => reading.senseRefs)).toEqual([[1, 2], [3], [4]])
  })

  it('义项按年代排序，且记录原始序号', () => {
    const record = findChar(store, '行')
    const orders = record!.senses.map((sense) => eraOrder(sense.era))
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
    expect(new Set(record!.senses.map((sense) => sense.index))).toEqual(new Set([1, 2, 3, 4]))
  })

  it('每个字都有构形、义项与读音', () => {
    for (const record of store.chars) {
      expect(record.structure, record.char).not.toBeNull()
      expect(record.senses.length, record.char).toBeGreaterThan(0)
      expect(record.readings.length, record.char).toBeGreaterThan(0)
    }
  })

  it('拼音索引支持无声调检索', () => {
    expect(store.pinyinIndex.get('xing')).toContain('行')
    expect(store.pinyinIndex.get('ri')).toContain('日')
  })
})

describe('工具函数', () => {
  it('解析多种对应义项写法', () => {
    expect(parseSenseRefs('义项1、2（道路/行走）')).toEqual([1, 2])
    expect(parseSenseRefs('义项4（德行、品行）')).toEqual([4])
    expect(parseSenseRefs('')).toEqual([])
  })

  it('批量输入去重且仅保留汉字', () => {
    expect(splitBatchInput('人, 水 人\n日月 abc')).toEqual(['人', '水', '日', '月'])
  })

  it('未知字返回 null', () => {
    expect(findChar(loadFixtureStore(), '龘')).toBeNull()
  })
})
