import { describe, expect, it } from 'vitest'
import { BLANK_SPEC, EXAMPLE_SPEC } from '../data/specs'
import type { Spec } from '../types/spec'
import { checkSpec, hasErrors } from './rules'

const ids = (spec: Spec) => checkSpec(spec).map((i) => i.id)

describe('manufacturability rules', () => {
  it('passes the worked example without issues', () => {
    expect(checkSpec(EXAMPLE_SPEC)).toEqual([])
  })

  it('requires a style name', () => {
    expect(ids(BLANK_SPEC)).toContain('style-name')
    expect(hasErrors(checkSpec(BLANK_SPEC))).toBe(true)
  })

  it('blocks a centre print wider than the smallest size allows', () => {
    const wide = { ...EXAMPLE_SPEC, decoration: { ...EXAMPLE_SPEC.decoration, widthCm: 40 } }
    const issue = checkSpec(wide).find((i) => i.id === 'print-too-wide')
    expect(issue?.severity).toBe('error')
    expect(issue?.message).toContain('size S chest allows 38 cm')
  })

  it('warns when the artwork reaches the pocket on the smallest size', () => {
    const withXs = { ...EXAMPLE_SPEC, sizes: { ...EXAMPLE_SPEC.sizes, from: 'XS' as const } }
    const issue = checkSpec(withXs).find((i) => i.id === 'print-over-pocket')
    expect(issue?.severity).toBe('warning')
    expect(issue?.message).toContain('size XS')
  })

  it('does not apply pocket clearance without a pocket', () => {
    const noPocket = { ...EXAMPLE_SPEC, pocket: 'PKT-NONE' as const, sizes: { ...EXAMPLE_SPEC.sizes, from: 'XS' as const } }
    expect(ids(noPocket)).not.toContain('print-over-pocket')
  })

  it('advises DTF for small screen-printed runs', () => {
    const screen = { ...EXAMPLE_SPEC, decoration: { ...EXAMPLE_SPEC.decoration, method: 'DEC-SCREEN' as const } }
    expect(ids({ ...screen, plannedQuantity: 40 })).toContain('screen-small-run')
    expect(ids({ ...screen, plannedQuantity: 120 })).not.toContain('screen-small-run')
  })

  it('requires Russian on the care label', () => {
    const noRussian = { ...EXAMPLE_SPEC, labels: { ...EXAMPLE_SPEC.labels, careLangs: ['ky' as const] } }
    expect(ids(noRussian)).toContain('care-label-russian')
  })

  it('rejects colours the chosen fabric is not stocked in', () => {
    const heavyForest = { ...EXAMPLE_SPEC, fabric: 'FLEECE-3T-400' as const, colours: ['CLR-FOR' as const] }
    expect(ids(heavyForest)).toContain('colour-not-stocked')
  })

  it('keeps the base size inside the range', () => {
    const outside = { ...EXAMPLE_SPEC, sizes: { from: 'L' as const, to: 'XL' as const, base: 'M' as const } }
    expect(ids(outside)).toContain('base-size')
  })
})
