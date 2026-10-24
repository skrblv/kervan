/**
 * ISO 2859-1, general inspection level II: lot size → sample size code letter and sample size.
 * Example from the project file: a lot of 51–90 garments → 13 pieces (code E).
 */
const LEVEL_II: { maxLot: number; letter: string; sample: number }[] = [
  { maxLot: 8, letter: 'A', sample: 2 },
  { maxLot: 15, letter: 'B', sample: 3 },
  { maxLot: 25, letter: 'C', sample: 5 },
  { maxLot: 50, letter: 'D', sample: 8 },
  { maxLot: 90, letter: 'E', sample: 13 },
  { maxLot: 150, letter: 'F', sample: 20 },
  { maxLot: 280, letter: 'G', sample: 32 },
  { maxLot: 500, letter: 'H', sample: 50 },
  { maxLot: 1200, letter: 'J', sample: 80 },
]

export function inspectionSample(lot: number): { letter: string; sample: number } {
  const row = LEVEL_II.find((r) => lot <= r.maxLot) ?? LEVEL_II[LEVEL_II.length - 1]!
  return { letter: row.letter, sample: Math.min(row.sample, lot) }
}
