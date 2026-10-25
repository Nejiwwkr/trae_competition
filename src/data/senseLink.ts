export function parseSenseRefs(text: string): number[] {
  const refs = new Set<number>()
  for (const match of text.matchAll(/义项\s*([0-9]+(?:\s*[、,，和及]\s*[0-9]+)*)/g)) {
    for (const number of match[1].matchAll(/[0-9]+/g)) {
      refs.add(Number(number[0]))
    }
  }
  return [...refs].sort((a, b) => a - b)
}

export function hasNumericSenseRef(text: string): boolean {
  return /义项\s*[0-9]/.test(text)
}
