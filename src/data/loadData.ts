import type { CharStore } from '@/types'
import { buildCharStore } from './buildStore'
import { parseCsv } from './csv'

const DATA_BASE = `${import.meta.env.BASE_URL}data/`

async function fetchText(relativePath: string): Promise<string> {
  const response = await fetch(encodeURI(`${DATA_BASE}${relativePath}`))
  if (!response.ok) {
    throw new Error(`加载数据失败：${relativePath}（HTTP ${response.status}）`)
  }
  return response.text()
}

export async function loadCharStore(): Promise<CharStore> {
  const [framesText, structuresText, meaningsText, phonologyText] = await Promise.all([
    fetchText('glyph_evolution/字形帧清单.csv'),
    fetchText('glyph_evolution/构形解析.csv'),
    fetchText('meaning_evolution.csv'),
    fetchText('phonology.csv'),
  ])

  return buildCharStore({
    frames: parseCsv(framesText),
    structures: parseCsv(structuresText),
    meanings: parseCsv(meaningsText),
    phonology: parseCsv(phonologyText),
  })
}

export function glyphImageUrl(relPath: string): string {
  if (!relPath) return ''
  return encodeURI(`${DATA_BASE}glyph_evolution/${relPath}`)
}

export function dataFileUrl(relativePath: string): string {
  return encodeURI(`${DATA_BASE}${relativePath}`)
}
