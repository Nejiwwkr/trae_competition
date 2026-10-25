export const ERA_ORDER: Record<string, number> = {
  商周: 10,
  西周: 12,
  '西周—春秋': 15,
  春秋: 20,
  战国: 30,
  秦: 32,
  西汉: 40,
  两汉: 45,
  东汉: 50,
  三国: 55,
  西晋: 60,
  东晋: 65,
  南朝: 70,
}

export const ERA_LABELS = Object.keys(ERA_ORDER)

export function eraOrder(era: string): number {
  return ERA_ORDER[era] ?? 999
}

export function compareSenses<T extends { eraOrder: number; index: number }>(a: T, b: T): number {
  return a.eraOrder - b.eraOrder || a.index - b.index
}
