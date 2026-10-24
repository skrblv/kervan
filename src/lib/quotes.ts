import { DELIVERY_PER_UNIT } from '../data/costModel'
import { findWorkshop, REPLY_PLANS } from '../data/workshops'
import type { NormalisedQuote, Quote, QuoteRequest, WorkshopQuestion, WorkshopReply } from '../types/quote'
import type { Spec } from '../types/spec'
import { addDays, addWorkingDays } from './dates'
import { costAt, unitParams } from './estimate'

/** A quote this far from the estimate triggers a clarifying question rather than a "wrong" mark. */
export const OUTLIER_THRESHOLD = 0.35
/** Working days a founder typically needs to check and approve a sample. */
export const APPROVAL_DAYS = 2

const roundTo10 = (value: number) => Math.round(value / 10) * 10

function questionFor(spec: Spec): WorkshopQuestion {
  if (spec.garment === 'GAR-HOODIE' && spec.drawcord === 'CORD-FLAT-EYE') {
    return {
      workshopId: 'KG-BSK-0029',
      fieldPath: 'drawcord',
      fieldLabel: 'Drawcord',
      text: 'Should the drawcord match the body colour? We have white flat cord in stock; a matching colour adds 3–4 days.',
    }
  }
  return {
    workshopId: 'KG-BSK-0029',
    fieldPath: 'finish',
    fieldLabel: 'Cuffs and hem',
    text: 'Our rib for this colour comes from a different dye lot and can look slightly darker than the body. Is that acceptable?',
  }
}

/** Demo replies, priced from the estimate for the requested batch so they stay coherent with the spec. */
export function demoReplies(spec: Spec, request: QuoteRequest): WorkshopReply[] {
  const cost = costAt(unitParams(spec), request.total)
  return REPLY_PLANS.map((plan): WorkshopReply => {
    if (plan.reply.kind === 'question') return { kind: 'question', question: questionFor(spec), delayMs: plan.delayMs }
    const r = plan.reply
    const basis = r.includesFabric ? cost.total : cost.total - cost.fabric
    const quote: Quote = {
      workshopId: plan.workshopId,
      unitPrice: roundTo10(basis * r.priceFactor),
      includesFabric: r.includesFabric,
      samplePrice: r.samplePrice,
      sampleDays: r.sampleDays,
      productionDays: r.productionDays,
      minQuantity: r.minQuantity,
      validUntil: addDays(request.sentAt, r.validDays),
    }
    return { kind: 'quote', quote, delayMs: plan.delayMs }
  })
}

/** Brings a quote to a like-for-like basis: fabric included, delivered to the buyer's city. */
export function normaliseQuote(quote: Quote, spec: Spec, request: QuoteRequest): NormalisedQuote {
  const cost = costAt(unitParams(spec), request.total)
  const fabricAdded = quote.includesFabric ? 0 : Math.round(cost.fabric)
  const deliveryAdded = DELIVERY_PER_UNIT[request.city]
  const normalisedUnit = quote.unitPrice + fabricAdded + deliveryAdded
  const deviation = (quote.unitPrice + fabricAdded - cost.total) / cost.total
  const readyBy = addWorkingDays(request.sentAt, quote.sampleDays + APPROVAL_DAYS + quote.productionDays)
  return {
    quote,
    workshop: findWorkshop(quote.workshopId),
    fabricAdded,
    deliveryAdded,
    normalisedUnit,
    batchTotal: normalisedUnit * request.total,
    deviation,
    outlier: Math.abs(deviation) > OUTLIER_THRESHOLD,
    readyBy,
    meetsDeadline: readyBy <= request.deadline,
    belowMinimum: request.total < quote.minQuantity,
  }
}
