import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { EXAMPLE_SPEC } from '../data/specs'
import { canonicalJson, changedFields, passportState, specHash } from './passport'
import { sha256 } from './sha256'

describe('sha256', () => {
  it('matches the FIPS 180-4 test vectors', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    )
  })

  it('matches Node for multi-block, non-Latin input', () => {
    const text = canonicalJson(EXAMPLE_SPEC) + 'Футер трёхнитка · Үч жиптүү · Үш жіпті · şardonlu'
    expect(sha256(text)).toBe(createHash('sha256').update(text, 'utf8').digest('hex'))
  })
})

describe('passport versions', () => {
  it('hashes independently of key order', () => {
    const reordered = Object.fromEntries(Object.entries(EXAMPLE_SPEC).reverse()) as typeof EXAMPLE_SPEC
    expect(JSON.stringify(reordered)).not.toBe(JSON.stringify(EXAMPLE_SPEC))
    expect(specHash(reordered)).toBe(specHash(EXAMPLE_SPEC))
  })

  it('lists changed fields as dotted paths', () => {
    const edited = { ...EXAMPLE_SPEC, decoration: { ...EXAMPLE_SPEC.decoration, widthCm: 30 }, colours: ['CLR-MLK' as const] }
    expect(changedFields(EXAMPLE_SPEC, edited)).toEqual(['colours', 'decoration.widthCm'])
  })

  it('reports locked when the spec equals the latest version, otherwise the next draft', () => {
    const v1 = { version: 1, hash: specHash(EXAMPLE_SPEC), lockedAt: '2026-10-22T10:00:00Z', snapshot: EXAMPLE_SPEC }
    expect(passportState(EXAMPLE_SPEC, [v1]).kind).toBe('locked')
    const draft = passportState({ ...EXAMPLE_SPEC, plannedQuantity: 100 }, [v1])
    expect(draft).toMatchObject({ kind: 'draft', version: 2, changes: ['plannedQuantity'] })
    expect(passportState(EXAMPLE_SPEC, [])).toMatchObject({ kind: 'draft', version: 1 })
  })
})
