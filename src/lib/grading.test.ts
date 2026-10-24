import { describe, expect, it } from 'vitest'
import { EXAMPLE_SPEC } from '../data/specs'
import { measure, measurementTable, pocketTopFromHps, printableWidth, sizesInRange } from './grading'
import { inspectionSample } from './inspection'

describe('size grading', () => {
  const regular = { fit: 'FIT-REG' as const, finish: 'RIB-1X1' as const }

  it('grades from the size M base values', () => {
    expect(measure(regular, 'POM-CHEST', 'M')).toBe(56)
    expect(measure(regular, 'POM-CHEST', 'S')).toBe(54)
    expect(measure(regular, 'POM-CHEST', 'XL')).toBe(60)
    expect(measure(regular, 'POM-SHOULDER', 'L')).toBe(49.5)
  })

  it('follows the chest when the hem is not drawn in by rib', () => {
    const selfHem = { ...regular, finish: 'HEM-SELF-CS' as const }
    expect(measure(selfHem, 'POM-HEM', 'L')).toBe(measure(selfHem, 'POM-CHEST', 'L') - 1)
    expect(measure(selfHem, 'POM-CUFF', 'M')).toBe(13)
  })

  it('builds a lettered table for every size in range', () => {
    const table = measurementTable(EXAMPLE_SPEC)
    expect(table.map((r) => r.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
    expect(table[0]!.values.map((v) => v.size)).toEqual(['S', 'M', 'L', 'XL'])
    expect(table[0]!.tolerance).toBe(2)
  })

  it('derives the limits used by the placement rules', () => {
    expect(sizesInRange({ from: 'XS', to: 'M' })).toEqual(['XS', 'S', 'M'])
    expect(printableWidth(regular, 'S')).toBe(38)
    expect(pocketTopFromHps(regular, 'S')).toBe(40)
  })
})

describe('ISO 2859-1 general level II', () => {
  it('matches the sample sizes quoted in the project file', () => {
    expect(inspectionSample(80)).toEqual({ letter: 'E', sample: 13 })
    expect(inspectionSample(51)).toEqual({ letter: 'E', sample: 13 })
    expect(inspectionSample(91)).toEqual({ letter: 'F', sample: 20 })
    expect(inspectionSample(30)).toEqual({ letter: 'D', sample: 8 })
  })
})
