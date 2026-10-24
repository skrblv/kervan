import type { ColourCode, SizeCode } from './spec'

export type DeliveryCity = 'Bishkek' | 'Almaty' | 'Astana' | 'Osh'

export interface Workshop {
  id: string
  name: string
  district: string
  city: 'Bishkek'
  processes: string[]
  /** Self-reported, checked on the verification visit. */
  machines: string
  minBatch: number
  visitedOn: string
  history: { quotes: number; orders: number }
}

/** Quantities by colour, then by size. */
export type QuantityMatrix = Partial<Record<ColourCode, Partial<Record<SizeCode, number>>>>

export interface QuoteRequest {
  id: string
  passportVersion: number
  passportHash: string
  matrix: QuantityMatrix
  total: number
  deadline: string
  city: DeliveryCity
  cardLang: 'ru' | 'ky'
  note: string
  sentAt: string
}

/** A workshop's structured answer to a request card, as entered in Telegram. */
export interface Quote {
  workshopId: string
  unitPrice: number
  includesFabric: boolean
  samplePrice: number
  sampleDays: number
  /** Working days after sample approval. */
  productionDays: number
  minQuantity: number
  validUntil: string
}

export interface WorkshopQuestion {
  workshopId: string
  fieldPath: string
  fieldLabel: string
  text: string
}

export type WorkshopReply =
  { kind: 'quote'; quote: Quote; delayMs: number } | { kind: 'question'; question: WorkshopQuestion; delayMs: number }

/** A quote brought to the same basis as the others: fabric included, delivered to the buyer's city. */
export interface NormalisedQuote {
  quote: Quote
  workshop: Workshop
  fabricAdded: number
  deliveryAdded: number
  normalisedUnit: number
  batchTotal: number
  /** Relative difference from Kervan's estimate, e.g. 0.42 = 42% above. */
  deviation: number
  /** More than 35% from the estimate: a clarifying question is sent instead of marking it wrong. */
  outlier: boolean
  readyBy: string
  meetsDeadline: boolean
  belowMinimum: boolean
}

export const ORDER_STAGES = [
  'sample-requested',
  'sample-submitted',
  'sample-approved',
  'in-production',
  'inspection',
  'ready',
  'delivered',
  'closed',
] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export interface OrderEvent {
  at: string
  stage: OrderStage
  note: string
}

/** Kervan records milestones only; payments go directly between founder and workshop. */
export interface Order {
  id: string
  requestId: string
  workshopId: string
  passportVersion: number
  samplePrice: number
  sampleDays: number
  stage: OrderStage
  events: OrderEvent[]
}
