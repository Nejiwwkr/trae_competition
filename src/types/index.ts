export type SenseType = '本义' | '引申义' | '假借义'

export interface GlyphFrame {
  char: string
  simp: string
  stage: string
  era: string
  fontName: string
  relPath: string
  sourceFile: string
  sourceUrl: string
  license: string
  eraCheck: string
  sourceNote: string
  missing: boolean
}

export interface StructureData {
  char: string
  simp: string
  method: string
  dispute: string
  analysis: string
  shuowen: string
  source: string
  note: string
}

export interface MeaningSense {
  char: string
  simp: string
  index: number
  type: SenseType
  gloss: string
  era: string
  quote: string
  citation: string
  translation: string
  note: string
  eraOrder: number
}

export interface Reading {
  char: string
  simp: string
  index: number
  modern: string
  fanqie: string
  initial: string
  rhyme: string
  tone: string
  oldChinese: string
  senseRefs: number[]
  senseRefText: string
  note: string
}

export interface CharRecord {
  char: string
  simp: string
  frames: GlyphFrame[]
  structure: StructureData | null
  senses: MeaningSense[]
  readings: Reading[]
}

export interface CharStore {
  chars: CharRecord[]
  byTraditional: Map<string, CharRecord>
  bySimplified: Map<string, CharRecord>
  pinyinIndex: Map<string, string[]>
}

export interface StoryContent {
  text: string
  seconds: number
  reviewed?: boolean
  generated?: boolean
}

export interface ExampleItem {
  sentence: string
  sense: string
  note?: string
}

export interface ExampleContent {
  examples: ExampleItem[]
  warning: string
  generated?: boolean
}

export interface ComponentPart {
  glyph: string
  label: string
  meaning: string
  position: 'left' | 'right' | 'top' | 'bottom' | 'inside' | 'outside'
}

export interface ComponentAnnotation {
  formula: string
  parts: ComponentPart[]
  note: string
}

export interface FamilyGroup {
  id: string
  kind: '形旁' | '声旁'
  component: string
  label: string
  members: string[]
  related: string[]
  note: string
}

export interface CheckResult {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
}
