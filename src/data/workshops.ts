import type { Workshop } from '../types/quote'

/**
 * Fictional workshops for the demo. The structure follows the workshop profile in
 * Appendix D of the project file; names, figures and visit dates are invented.
 */
export const WORKSHOPS: Workshop[] = [
  {
    id: 'KG-BSK-0042',
    name: 'Ornok Knit',
    district: 'Alamedin, Bishkek',
    city: 'Bishkek',
    processes: ['Cutting', 'Overlock', 'Flatlock', 'Coverstitch', 'DTF printing'],
    machines: '12 lockstitch, 4 overlock, 2 coverstitch, 1 DTF printer with heat press',
    minBatch: 20,
    visitedOn: '2026-10-09',
    history: { quotes: 6, orders: 1 },
  },
  {
    id: 'KG-BSK-0017',
    name: 'Kalyp Studio',
    district: 'Dordoi, Bishkek',
    city: 'Bishkek',
    processes: ['Cutting', 'Overlock', 'Coverstitch', 'Embroidery'],
    machines: '9 lockstitch, 3 overlock, 1 coverstitch, 1 six-head embroidery machine',
    minBatch: 30,
    visitedOn: '2026-10-06',
    history: { quotes: 4, orders: 0 },
  },
  {
    id: 'KG-BSK-0063',
    name: 'Tüymö Atelier',
    district: 'Sverdlov, Bishkek',
    city: 'Bishkek',
    processes: ['Cutting', 'Overlock', 'Coverstitch', 'Screen printing'],
    machines: '16 lockstitch, 5 overlock, 2 coverstitch, 4-colour screen carousel',
    minBatch: 50,
    visitedOn: '2026-10-13',
    history: { quotes: 3, orders: 0 },
  },
  {
    id: 'KG-BSK-0029',
    name: 'Sapat Tigüü',
    district: 'Oktyabr, Bishkek',
    city: 'Bishkek',
    processes: ['Cutting', 'Overlock', 'Flatlock', 'Coverstitch'],
    machines: '8 lockstitch, 3 overlock, 1 flatlock, 1 coverstitch',
    minBatch: 25,
    visitedOn: '2026-10-15',
    history: { quotes: 2, orders: 0 },
  },
]

export function findWorkshop(id: string): Workshop {
  const workshop = WORKSHOPS.find((w) => w.id === id)
  if (!workshop) throw new Error(`Unknown workshop ${id}`)
  return workshop
}

/**
 * How each demo workshop answers a request. Prices are derived from Kervan's estimate
 * for the requested batch so the comparison stays coherent with whatever was specified.
 */
export interface ReplyPlan {
  workshopId: string
  delayMs: number
  reply:
    | {
        kind: 'quote'
        /** Multiplier on the estimate (or on the estimate without fabric). */
        priceFactor: number
        includesFabric: boolean
        samplePrice: number
        sampleDays: number
        productionDays: number
        minQuantity: number
        validDays: number
      }
    | { kind: 'question' }
}

export const REPLY_PLANS: ReplyPlan[] = [
  {
    workshopId: 'KG-BSK-0042',
    delayMs: 900,
    reply: {
      kind: 'quote',
      priceFactor: 0.97,
      includesFabric: true,
      samplePrice: 2500,
      sampleDays: 4,
      productionDays: 10,
      minQuantity: 20,
      validDays: 14,
    },
  },
  {
    workshopId: 'KG-BSK-0017',
    delayMs: 1700,
    reply: {
      kind: 'quote',
      priceFactor: 1.04,
      includesFabric: false,
      samplePrice: 3000,
      sampleDays: 5,
      productionDays: 12,
      minQuantity: 30,
      validDays: 10,
    },
  },
  {
    workshopId: 'KG-BSK-0063',
    delayMs: 2500,
    reply: {
      kind: 'quote',
      priceFactor: 1.42,
      includesFabric: true,
      samplePrice: 3500,
      sampleDays: 6,
      productionDays: 8,
      minQuantity: 50,
      validDays: 7,
    },
  },
  { workshopId: 'KG-BSK-0029', delayMs: 3200, reply: { kind: 'question' } },
]
