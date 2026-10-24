import { findFabric } from '../data/catalog'
import { COST_MODEL as M, MAX_MAPE_FOR_POINT, MIN_OBSERVATIONS, MODEL_BASIS, type ModelBasis } from '../data/costModel'
import type { Decoration, Spec } from '../types/spec'

/** Per-unit inputs of c(q) = m·p + r + d + k + s(q) + F/q for one spec. */
export interface UnitParams {
  fabricKg: number
  fabricPricePerKg: number
  trims: number
  decoration: number
  packing: number
  sewingFactor: number
  sewingOffset: number
  fixedPerStyle: number
}

export interface CostBreakdown {
  fabric: number
  trims: number
  decoration: number
  packing: number
  sewing: number
  fixedPerUnit: number
  total: number
}

export interface Estimate {
  quantity: number
  breakdown: CostBreakdown
  /** Null while the model is provisional or its error is too high: then only the range is shown. */
  point: number | null
  low: number
  high: number
}

export const STANDARD_QUANTITIES = [30, 50, 100, 200] as const

/** Base sewing price, interpolated on log(quantity) between the calibrated points. */
export function baseSewingAt(quantity: number): number {
  const curve = M.sewingCurve
  const first = curve[0]
  const second = curve[1]
  const last = curve[curve.length - 1]!
  if (quantity >= last[0]) return last[1]
  if (quantity <= first[0]) {
    const slope = (second[1] - first[1]) / Math.log(second[0] / first[0])
    return first[1] + slope * Math.log(quantity / first[0])
  }
  for (let i = 0; i < curve.length - 1; i++) {
    const [q0, s0] = curve[i]!
    const [q1, s1] = curve[i + 1]!
    if (quantity <= q1) {
      const t = Math.log(quantity / q0) / Math.log(q1 / q0)
      return s0 + t * (s1 - s0)
    }
  }
  return last[1]
}

function areaPrice(table: readonly (readonly [number, number])[], area: number): number {
  return (table.find(([maxArea]) => area <= maxArea) ?? table[table.length - 1]!)[1]
}

export function decorationCost(decoration: Decoration): { perUnit: number; setup: number } {
  const area = decoration.widthCm * decoration.heightCm
  switch (decoration.method) {
    case 'DEC-NONE':
      return { perUnit: 0, setup: 0 }
    case 'DEC-DTF':
      return { perUnit: areaPrice(M.dtfByArea, area), setup: 0 }
    case 'DEC-SCREEN':
      return {
        perUnit: M.screenPerInkColour * decoration.inkColours,
        setup: M.screenSetupPerInkColour * decoration.inkColours,
      }
    case 'DEC-EMB':
      return { perUnit: areaPrice(M.embroideryByArea, area), setup: M.embroiderySetup }
  }
}

export function unitParams(spec: Spec): UnitParams {
  const hoodie = spec.garment === 'GAR-HOODIE'
  const fabric = findFabric(spec.fabric)
  const kg = M.fabricKg

  const hoodKg = hoodie ? (spec.hood.lined ? kg.hoodLined : kg.hoodUnlined) : 0
  const pocketKg = spec.pocket === 'PKT-KANGAROO' ? kg.pocket : 0
  const fabricKg = (kg.body * M.fitFactor[spec.fit] + hoodKg + pocketKg) * (fabric.gsm / kg.referenceGsm)

  const t = M.trims
  const finishTrims = spec.finish === 'RIB-2X2' ? t.rib2x2 : spec.finish === 'HEM-SELF-CS' ? t.selfHem : 0
  const cordTrims = hoodie && spec.drawcord === 'CORD-FLAT-EYE' ? t.drawcord : 0
  const labelTrims =
    spec.labels.neck === 'LBL-NECK-PRINT' ? t.printedNeckLabel : spec.labels.neck === 'LBL-NECK-WOVEN' ? t.wovenNeckLabel : 0

  const a = M.sewingAdjust
  let sewingOffset = 0
  if (hoodie) {
    if (spec.hood.panels === 'HOOD-2P') sewingOffset += a.twoPanelHood
    if (!spec.hood.lined) sewingOffset += a.unlinedHood
    if (spec.pocket === 'PKT-NONE') sewingOffset += a.hoodieWithoutPocket
    if (spec.drawcord === 'CORD-NONE') sewingOffset += a.noDrawcord
  } else if (spec.pocket === 'PKT-KANGAROO') {
    sewingOffset += a.sweatshirtWithPocket
  }
  if (spec.seams === 'SEAM-FLAT') sewingOffset += a.flatlock
  if (spec.finish === 'HEM-SELF-CS') sewingOffset += a.selfHem

  const decoration = decorationCost(spec.decoration)

  return {
    fabricKg,
    fabricPricePerKg: M.fabricPricePerKg[spec.fabric],
    trims: t.base + finishTrims + cordTrims + labelTrims,
    decoration: decoration.perUnit,
    packing: M.packing[spec.packing],
    sewingFactor: M.sewingGarmentFactor[spec.garment],
    sewingOffset,
    fixedPerStyle: M.fixedPerStyle + decoration.setup,
  }
}

export function costAt(params: UnitParams, quantity: number): CostBreakdown {
  const fabric = params.fabricKg * params.fabricPricePerKg
  const sewing = baseSewingAt(quantity) * params.sewingFactor + params.sewingOffset
  const fixedPerUnit = params.fixedPerStyle / quantity
  return {
    fabric,
    trims: params.trims,
    decoration: params.decoration,
    packing: params.packing,
    sewing,
    fixedPerUnit,
    total: fabric + params.trims + params.decoration + params.packing + sewing + fixedPerUnit,
  }
}

/** The smallest quantity (in steps of 10) at which doubling the batch saves less than 5% per unit. */
export function efficientBatch(params: UnitParams): number {
  for (let q = 20; q <= 300; q += 10) {
    const now = costAt(params, q).total
    const doubled = costAt(params, q * 2).total
    if ((now - doubled) / now < M.efficientDoublingSaving) return q
  }
  return 300
}

export interface BasisStatus {
  basis: ModelBasis
  provisional: boolean
  showPoint: boolean
}

export function basisFor(spec: Spec): BasisStatus {
  const basis = MODEL_BASIS[spec.garment]
  const provisional = basis.observations < MIN_OBSERVATIONS
  const showPoint = !provisional && basis.mape !== null && basis.mape <= MAX_MAPE_FOR_POINT
  return { basis, provisional, showPoint }
}

export function estimateAt(spec: Spec, quantity: number, params = unitParams(spec)): Estimate {
  const breakdown = costAt(params, quantity)
  const { basis, showPoint } = basisFor(spec)
  return {
    quantity,
    breakdown,
    point: showPoint ? breakdown.total : null,
    low: breakdown.total * (1 - basis.band),
    high: breakdown.total * (1 + basis.band),
  }
}

export function toUsd(som: number): number {
  return som / M.somPerUsd
}

/** Change in unit cost (som) if `next` replaced `spec`, at the planned quantity. */
export function costDelta(spec: Spec, next: Spec): number {
  const q = Math.max(10, Number.isFinite(spec.plannedQuantity) ? spec.plannedQuantity : 10)
  return costAt(unitParams(next), q).total - costAt(unitParams(spec), q).total
}
