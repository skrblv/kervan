import { CONSTRUCTION, POMS, SELF_HEM_OVERRIDES, type PomCode } from '../data/measurements'
import { SIZES, type FinishCode, type FitCode, type GarmentCode, type SizeCode, type SizeRange } from '../types/spec'

const ANCHOR: SizeCode = 'M'

export function sizeIndex(size: SizeCode): number {
  return SIZES.indexOf(size)
}

export function sizesInRange(range: Pick<SizeRange, 'from' | 'to'>): SizeCode[] {
  return SIZES.slice(sizeIndex(range.from), sizeIndex(range.to) + 1)
}

export function pomsFor(garment: GarmentCode): PomCode[] {
  const shared: PomCode[] = ['POM-CHEST', 'POM-LENGTH', 'POM-SHOULDER', 'POM-SLEEVE', 'POM-HEM', 'POM-CUFF']
  return garment === 'GAR-HOODIE' ? [...shared, 'POM-HOOD-H', 'POM-HOOD-W'] : [...shared, 'POM-NECK']
}

interface Cut {
  fit: FitCode
  finish: FinishCode
}

/** One measurement for one size: the M value plus a grade increment per size step. */
export function measure(cut: Cut, pom: PomCode, size: SizeCode): number {
  const steps = sizeIndex(size) - sizeIndex(ANCHOR)
  const point = POMS[pom]
  const override = cut.finish === 'HEM-SELF-CS' ? SELF_HEM_OVERRIDES[pom] : undefined
  if (override?.offsetFromChest !== undefined) return measure(cut, 'POM-CHEST', size) + override.offsetFromChest
  const base = override?.value ?? point.base[cut.fit]
  return base + point.grade * steps
}

export interface MeasurementRow {
  pom: PomCode
  letter: string
  values: { size: SizeCode; value: number }[]
  tolerance: number
}

export function measurementTable(spec: Cut & { garment: GarmentCode; sizes: SizeRange }): MeasurementRow[] {
  const sizes = sizesInRange(spec.sizes)
  return pomsFor(spec.garment).map((pom, i) => ({
    pom,
    letter: String.fromCharCode(65 + i),
    values: sizes.map((size) => ({ size, value: measure(spec, pom, size) })),
    tolerance: POMS[pom].tolerance,
  }))
}

/** Widest centre artwork that keeps the side margins on the given size. */
export function printableWidth(cut: Cut, size: SizeCode): number {
  return measure(cut, 'POM-CHEST', size) - 2 * CONSTRUCTION.printSideMargin
}

/** Distance from the shoulder point (HPS) down to the top of the kangaroo pocket. */
export function pocketTopFromHps(cut: Cut, size: SizeCode): number {
  const hem = cut.finish === 'HEM-SELF-CS' ? 3 : CONSTRUCTION.hemRibHeight
  return measure(cut, 'POM-LENGTH', size) - hem - CONSTRUCTION.pocketHeight
}
