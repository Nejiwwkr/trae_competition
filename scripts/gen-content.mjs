import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataRoot = join(root, 'assets', '【发放给参赛队伍】汉字形音义溯源数据包')

function readCsv(relativePath) {
  const text = readFileSync(join(dataRoot, relativePath), 'utf8').replace(/^﻿/, '')
  return Papa.parse(text, { header: true, skipEmptyLines: 'greedy' }).data
}

const rows = {
  frames: readCsv('glyph_evolution/字形帧清单.csv'),
  structures: readCsv('glyph_evolution/构形解析.csv'),
  meanings: readCsv('meaning_evolution.csv'),
  phonology: readCsv('phonology.csv'),
}

const chars = []
const byChar = new Map()

function ensure(char) {
  if (!byChar.has(char)) {
    const record = { char, frames: [], senses: [], readings: [], structure: null }
    byChar.set(char, record)
    chars.push(char)
  }
  return byChar.get(char)
}

for (const row of rows.frames) {
  if (!row['字头']) continue
  const record = ensure(row['字头'])
  record.frames.push({
    stage: (row['阶段'] || '').replace(/（[^）]*）/g, '').trim(),
    missing: !row['相对路径'] || (row['阶段'] || '').includes('未见著录'),
  })
}
for (const row of rows.structures) {
  if (!row['字头']) continue
  ensure(row['字头']).structure = row
}
for (const row of rows.meanings) {
  if (!row['字头']) continue
  const record = ensure(row['字头'])
  record.senses.push({
    index: Number(row['义项序号']) || 0,
    type: row['类型'],
    gloss: row['释义'],
    era: row['年代'],
    quote: row['书证原句'],
    citation: row['出处'],
    translation: row['白话翻译'],
  })
}
for (const row of rows.phonology) {
  if (!row['字头']) continue
  ensure(row['字头']).readings.push({
    index: Number(row['读音序']) || 0,
    modern: row['现代读音'],
    fanqie: row['广韵反切'],
    initial: row['中古声母'],
    rhyme: row['中古韵目'],
    tone: row['中古声调'],
    oldChinese: row['郑张上古拟音'],
    senseRefText: row['对应义项'],
  })
}

for (const record of byChar.values()) {
  record.senses.sort((a, b) => a.index - b.index)
  record.readings.sort((a, b) => a.index - b.index)
}

const charLength = (text) => [...text].length

function senseSegment(sense, withTranslation = true) {
  const translation = withTranslation && sense.translation ? `意思是：${sense.translation}` : ''
  return `${sense.era}时，它表示「${sense.gloss}」。${sense.citation}里写：「${sense.quote}」${translation}`
}

function readingSegment(reading, short = false) {
  if (!reading) return ''
  if (short) return `中古反切「${reading.fanqie}」，今天读 ${reading.modern}。`
  return `读音上，中古作「${reading.fanqie}」，${reading.initial}母、${reading.rhyme}韵、${reading.tone}声；郑张上古拟音 ${reading.oldChinese}，今天读 ${reading.modern}。`
}

const CLOSING = '一个字，就是一条走了三千年的路。'
const PADDING = '字形与义项彼此印证，让这个字的历史变得可触可感。'

function truncate(text, max) {
  const charsText = [...text]
  if (charsText.length <= max) return text
  return `${charsText.slice(0, max - 1).join('')}…`
}

function buildStory(record) {
  const structure = record.structure
  const opening = structure
    ? `「${record.char}」，${structure['造字法']}字。${structure['构形解析']}`
    : `「${record.char}」，一个走过三千年的汉字。`
  const presentFrames = record.frames.filter((frame) => !frame.missing)
  const stageNames = presentFrames.map((frame) => frame.stage)
  const missingOracle = record.frames.some((frame) => frame.missing)
  const glyph = stageNames.length
    ? `从${stageNames[0]}到楷书，它留下了${stageNames.length}个阶段的字形：${stageNames.join('、')}。${missingOracle ? '甲骨文一栏未见著录，本卡以金文为最早存世字形。' : ''}`
    : ''
  const reading = readingSegment(record.readings[0])
  const shortReading = readingSegment(record.readings[0], true)
  const dispute = structure && structure['争议标注'] ? `构形上还有一说：${structure['争议标注']}。` : ''

  const segments = [opening, glyph]
  const senses = record.senses.map((sense) => senseSegment(sense))
  const projected = (extra) => charLength([...segments, ...extra, reading, CLOSING].join(''))

  let addedSense = false
  for (const [index, segment] of senses.entries()) {
    if (projected([segment]) <= 288) {
      segments.push(segment)
      addedSense = true
    } else if (index === 0) {
      segments.push(truncate(senseSegment(record.senses[0], false), 90))
      addedSense = true
    }
    if (addedSense && charLength(segments.join('')) >= 240) break
  }

  if (charLength([...segments, reading, CLOSING].join('')) <= 292) {
    segments.push(reading)
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

const stories = {}
const stats = []

for (const char of chars) {
  const record = byChar.get(char)
  stories[char] = buildStory(record)
  stats.push({ char, length: charLength(stories[char].text), seconds: stories[char].seconds })
}

writeFileSync(join(root, 'src/content/stories.json'), `${JSON.stringify(stories, null, 2)}\n`, 'utf8')

const lengths = stats.map((item) => item.length)
const outOfRange = stats.filter((item) => item.seconds < 50 || item.seconds > 70)

console.log(`已生成 ${chars.length} 条故事（例句以 src/content/examples.json 为准，不在此覆盖）`)
console.log(`故事字数 ${Math.min(...lengths)}–${Math.max(...lengths)}，估算 ${Math.round(Math.min(...lengths) / 4.2)}–${Math.round(Math.max(...lengths) / 4.2)} 秒`)
if (outOfRange.length) {
  console.log('超出 50–70 秒的字：', outOfRange.map((item) => `${item.char}(${item.seconds}s)`).join(' '))
}
