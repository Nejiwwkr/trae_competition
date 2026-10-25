import Papa from 'papaparse'

export type CsvRow = Record<string, string>

export function parseCsv(text: string): CsvRow[] {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const result = Papa.parse<CsvRow>(clean, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  })

  return result.data
    .filter((row) => Object.values(row).some((value) => value && value.trim()))
    .map((row) => {
      const cleanRow: CsvRow = {}
      for (const [key, value] of Object.entries(row)) {
        cleanRow[key.trim()] = (value ?? '').trim()
      }
      return cleanRow
    })
}
