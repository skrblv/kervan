import { describe, expect, it } from 'vitest'
import { BLANK_SPEC, EXAMPLE_SPEC } from '../data/specs'
import { baseSewingAt, costAt, efficientBatch, estimateAt, unitParams } from './estimate'

describe('cost model', () => {
  it('reproduces the illustrative table in Appendix E for the reference hoodie', () => {
    const params = unitParams(EXAMPLE_SPEC)
    const totals = [30, 50, 100, 200, 300].map((q) => Math.round(costAt(params, q).total))
    expect(totals).toEqual([1462, 1345, 1245, 1190, 1162])
  })

  it('splits the reference cost into the documented components', () => {
    const c = costAt(unitParams(EXAMPLE_SPEC), 30)
    expect(Math.round(c.fabric)).toBe(600)
    expect(c.trims).toBe(80)
    expect(c.decoration).toBe(150)
    expect(c.sewing).toBe(450)
    expect(Math.round(c.fixedPerUnit)).toBe(167)
  })

  it('interpolates sewing between calibrated points and flattens beyond the last', () => {
    expect(baseSewingAt(30)).toBe(450)
    expect(baseSewingAt(75)).toBeGreaterThan(350)
    expect(baseSewingAt(75)).toBeLessThan(400)
    expect(baseSewingAt(600)).toBe(300)
    expect(baseSewingAt(20)).toBeGreaterThan(450)
  })

  it('flags the smallest batch where doubling saves less than 5%', () => {
    const params = unitParams(EXAMPLE_SPEC)
    const q = efficientBatch(params)
    expect(q).toBe(90)
    const saving = (costAt(params, q).total - costAt(params, 2 * q).total) / costAt(params, q).total
    expect(saving).toBeLessThan(0.05)
  })

  it('moves the efficient batch up when set-up costs grow', () => {
    const screen = { ...EXAMPLE_SPEC, decoration: { ...EXAMPLE_SPEC.decoration, method: 'DEC-SCREEN' as const, inkColours: 3 } }
    expect(efficientBatch(unitParams(screen))).toBeGreaterThan(efficientBatch(unitParams(EXAMPLE_SPEC)))
  })

  it('shows a point estimate only when the model is calibrated for the product type', () => {
    expect(estimateAt(EXAMPLE_SPEC, 80).point).not.toBeNull()
    const sweatshirt = { ...BLANK_SPEC, garment: 'GAR-SWEAT' as const }
    const e = estimateAt(sweatshirt, 80)
    expect(e.point).toBeNull()
    expect(e.low).toBeLessThan(e.high)
  })

  it('makes a sweatshirt cheaper than the same hoodie', () => {
    const sweatshirt = { ...EXAMPLE_SPEC, garment: 'GAR-SWEAT' as const, pocket: 'PKT-NONE' as const }
    expect(costAt(unitParams(sweatshirt), 80).total).toBeLessThan(costAt(unitParams(EXAMPLE_SPEC), 80).total)
  })
})
