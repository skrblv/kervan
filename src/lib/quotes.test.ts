import { describe, expect, it } from 'vitest'
import { EXAMPLE_SPEC } from '../data/specs'
import type { QuoteRequest } from '../types/quote'
import { costAt, unitParams } from './estimate'
import { demoReplies, normaliseQuote } from './quotes'

const request: QuoteRequest = {
  id: 'KRV-RQ-0108',
  passportVersion: 1,
  passportHash: 'x',
  matrix: { 'CLR-BLK': { S: 15, M: 30, L: 25, XL: 10 } },
  total: 80,
  deadline: '2026-11-27',
  city: 'Bishkek',
  cardLang: 'ru',
  note: '',
  sentAt: '2026-10-22',
}

describe('quote normalisation', () => {
  const replies = demoReplies(EXAMPLE_SPEC, request)
  const quotes = replies.flatMap((r) => (r.kind === 'quote' ? [r.quote] : []))

  it('produces three quotes and one field-linked question', () => {
    expect(quotes).toHaveLength(3)
    const question = replies.find((r) => r.kind === 'question')
    expect(question?.kind === 'question' && question.question.fieldPath).toBe('drawcord')
  })

  it('adds the estimated fabric cost when a workshop quotes without fabric', () => {
    const noFabric = quotes.find((q) => !q.includesFabric)!
    const n = normaliseQuote(noFabric, EXAMPLE_SPEC, request)
    const fabric = Math.round(costAt(unitParams(EXAMPLE_SPEC), 80).fabric)
    expect(n.fabricAdded).toBe(fabric)
    expect(n.normalisedUnit).toBe(noFabric.unitPrice + fabric)
  })

  it('adds delivery for buyers outside Bishkek', () => {
    const n = normaliseQuote(quotes[0]!, EXAMPLE_SPEC, { ...request, city: 'Almaty' })
    expect(n.deliveryAdded).toBe(70)
  })

  it('flags quotes more than 35% from the estimate instead of rejecting them', () => {
    const flagged = quotes.map((q) => normaliseQuote(q, EXAMPLE_SPEC, request)).filter((n) => n.outlier)
    expect(flagged.map((n) => n.workshop.id)).toEqual(['KG-BSK-0063'])
  })

  it('checks the minimum quantity and the deadline', () => {
    const n = normaliseQuote(quotes[2]!, EXAMPLE_SPEC, { ...request, total: 40 })
    expect(n.belowMinimum).toBe(true)
    const late = normaliseQuote(quotes[0]!, EXAMPLE_SPEC, { ...request, deadline: '2026-10-30' })
    expect(late.meetsDeadline).toBe(false)
  })
})
