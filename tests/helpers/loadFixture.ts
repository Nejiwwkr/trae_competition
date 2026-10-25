import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCharStore } from '@/data/buildStore'
import { parseCsv } from '@/data/csv'

const here = dirname(fileURLToPath(import.meta.url))

export const assetRoot = resolve(here, '../../assets/【发放给参赛队伍】汉字形音义溯源数据包')

export function readAsset(relativePath: string): string {
  return readFileSync(join(assetRoot, relativePath), 'utf8')
}

export function loadFixtureStore() {
  return buildCharStore({
    frames: parseCsv(readAsset('glyph_evolution/字形帧清单.csv')),
    structures: parseCsv(readAsset('glyph_evolution/构形解析.csv')),
    meanings: parseCsv(readAsset('meaning_evolution.csv')),
    phonology: parseCsv(readAsset('phonology.csv')),
  })
}
