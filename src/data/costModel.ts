import type { FabricCode, FitCode, GarmentCode, PackingCode } from '../types/spec'

/**
 * Parameters of the unit-cost model c(q) = m·p + r + d + k + s(q) + F/q.
 *
 * The reference hoodie (3-panel lined hood, kangaroo pocket, 1×1 rib, drawcord,
 * 320 g/m² fleece, A4 DTF front print, printed neck label, polybag) reproduces the
 * illustrative table in Appendix E of the project file: 1,462 som at 30 units,
 * 1,345 at 50, 1,245 at 100, 1,190 at 200 and 1,162 at 300.
 *
 * In the pilot these values are fitted to real workshop quotes; here they are demo values.
 */
export const COST_MODEL = {
  version: 'v0.3',
  somPerUsd: 87.45,

  /** Sewing price per piece (som) at a given quantity, for the reference hoodie. */
  sewingCurve: [
    [30, 450],
    [50, 400],
    [100, 350],
    [200, 320],
    [300, 300],
  ] as const satisfies readonly (readonly [number, number])[],
  sewingGarmentFactor: { 'GAR-HOODIE': 1, 'GAR-SWEAT': 0.78 } satisfies Record<GarmentCode, number>,
  sewingAdjust: {
    twoPanelHood: -20,
    unlinedHood: -30,
    hoodieWithoutPocket: -25,
    sweatshirtWithPocket: 25,
    noDrawcord: -10,
    flatlock: 20,
    selfHem: -10,
  },

  /** Fabric per unit in kg, including cutting waste, at the reference weight. */
  fabricKg: { body: 0.59, hoodLined: 0.13, hoodUnlined: 0.07, pocket: 0.03, referenceGsm: 320 },
  fitFactor: { 'FIT-REG': 1, 'FIT-RLX': 1.06, 'FIT-OVR': 1.14 } satisfies Record<FitCode, number>,
  fabricPricePerKg: {
    'FLEECE-3T-280': 790,
    'FLEECE-3T-320': 800,
    'FLEECE-3T-400': 840,
    'TERRY-2T-260': 880,
  } satisfies Record<FabricCode, number>,

  /** Rib, thread, care label and trims per unit (som). */
  trims: { base: 55, rib2x2: 5, selfHem: -15, drawcord: 20, printedNeckLabel: 5, wovenNeckLabel: 12 },

  /** Decoration per unit, by artwork area in cm² (upper bound → som). */
  dtfByArea: [
    [100, 60],
    [624, 150],
    [1247, 230],
    [Number.POSITIVE_INFINITY, 320],
  ] as const satisfies readonly (readonly [number, number])[],
  embroideryByArea: [
    [100, 110],
    [225, 160],
    [Number.POSITIVE_INFINITY, 240],
  ] as const satisfies readonly (readonly [number, number])[],
  screenPerInkColour: 30,
  screenSetupPerInkColour: 1500,
  embroiderySetup: 1200,

  packing: { 'PACK-POLY-10': 15, 'PACK-BULK': 5 } satisfies Record<PackingCode, number>,

  /** Sample and pattern adjustment, spread over the batch (som per style). */
  fixedPerStyle: 5000,

  /** "Efficient batch": the smallest quantity at which doubling saves less than this share. */
  efficientDoublingSaving: 0.05,
} as const

/** What the estimate is based on. It is shown next to every number. */
export interface ModelBasis {
  observations: number
  workshops: number
  /** Mean absolute percentage error on held-out quotes; null until there is enough data. */
  mape: number | null
  heldOut: number
  updated: string
  /** Half-width of the range shown around the estimate. */
  band: number
}

/** Fewer than this many observations keeps an estimate "provisional" (range only). */
export const MIN_OBSERVATIONS = 10
/** Above this error the estimate is shown as a range only. */
export const MAX_MAPE_FOR_POINT = 0.2

export const MODEL_BASIS: Record<GarmentCode, ModelBasis> = {
  'GAR-HOODIE': { observations: 34, workshops: 7, mape: 0.163, heldOut: 10, updated: '2026-10-18', band: 0.11 },
  'GAR-SWEAT': { observations: 9, workshops: 4, mape: null, heldOut: 0, updated: '2026-10-18', band: 0.2 },
}

/** Kervan's estimate of delivery cost per unit from Bishkek workshops. */
export const DELIVERY_PER_UNIT = { Bishkek: 0, Osh: 60, Almaty: 70, Astana: 110 } as const
