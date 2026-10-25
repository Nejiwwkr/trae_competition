export function normalizeCharInput(raw: string): string {
  const trimmed = raw.trim()
  const chars = [...trimmed]
  return chars.length === 1 ? chars[0] : ''
}

export function normalizePinyin(raw: string): string {
  let out = ''
  for (const ch of raw.normalize('NFD')) {
    const code = ch.codePointAt(0) ?? 0
    if (code < 0x300 || code > 0x36f) out += ch
  }
  return out.replace(/\s+/g, '').toLowerCase()
}

export function splitBatchInput(raw: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const char of [...raw]) {
    if (/[㐀-鿿豈-﫿]/.test(char) && !seen.has(char)) {
      seen.add(char)
      result.push(char)
    }
  }
  return result
}
