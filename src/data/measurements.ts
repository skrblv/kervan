import type { FitCode } from '../types/spec'

export type PomCode =
  'POM-CHEST' | 'POM-LENGTH' | 'POM-SHOULDER' | 'POM-SLEEVE' | 'POM-HEM' | 'POM-CUFF' | 'POM-HOOD-H' | 'POM-HOOD-W' | 'POM-NECK'

/** A point of measure: base value on size M per fit, grade per size step and tolerance, in cm. */
export interface PointOfMeasure {
  code: PomCode
  base: Record<FitCode, number>
  grade: number
  tolerance: number
}

const same = (value: number): Record<FitCode, number> => ({ 'FIT-REG': value, 'FIT-RLX': value, 'FIT-OVR': value })

export const POMS: Record<PomCode, PointOfMeasure> = {
  'POM-CHEST': { code: 'POM-CHEST', base: { 'FIT-REG': 56, 'FIT-RLX': 60, 'FIT-OVR': 64 }, grade: 2, tolerance: 2 },
  'POM-LENGTH': { code: 'POM-LENGTH', base: { 'FIT-REG': 70, 'FIT-RLX': 71, 'FIT-OVR': 72 }, grade: 2, tolerance: 1 },
  'POM-SHOULDER': { code: 'POM-SHOULDER', base: { 'FIT-REG': 48, 'FIT-RLX': 52, 'FIT-OVR': 58 }, grade: 1.5, tolerance: 1 },
  'POM-SLEEVE': { code: 'POM-SLEEVE', base: { 'FIT-REG': 62, 'FIT-RLX': 61, 'FIT-OVR': 56 }, grade: 1, tolerance: 1 },
  'POM-HEM': { code: 'POM-HEM', base: { 'FIT-REG': 48, 'FIT-RLX': 52, 'FIT-OVR': 56 }, grade: 2, tolerance: 1 },
  'POM-CUFF': { code: 'POM-CUFF', base: same(9), grade: 0.5, tolerance: 0.5 },
  'POM-HOOD-H': { code: 'POM-HOOD-H', base: same(35), grade: 1, tolerance: 1 },
  'POM-HOOD-W': { code: 'POM-HOOD-W', base: same(25), grade: 0.5, tolerance: 1 },
  'POM-NECK': { code: 'POM-NECK', base: same(19), grade: 0.5, tolerance: 0.5 },
}

/** With a self-fabric hem the hem and cuffs are not drawn in by rib. */
export const SELF_HEM_OVERRIDES: Partial<Record<PomCode, { offsetFromChest?: number; value?: number }>> = {
  'POM-HEM': { offsetFromChest: -1 },
  'POM-CUFF': { value: 13 },
}

/** Fixed construction dimensions used by the rules and the drawing (cm). */
export const CONSTRUCTION = {
  hemRibHeight: 6,
  cuffRibHeight: 7,
  pocketHeight: 22,
  /** Front neck depth at centre front, below the shoulder point. */
  frontNeckDrop: { 'GAR-HOODIE': 10, 'GAR-SWEAT': 9 },
  backNeckDrop: 2,
  armholeDepth: { 'FIT-REG': 24, 'FIT-RLX': 25, 'FIT-OVR': 28 } satisfies Record<FitCode, number>,
  /** Clear margin from each side seam that a centre print must keep. */
  printSideMargin: 8,
  /** Clearance kept between artwork and the pocket opening. */
  pocketClearance: 1,
  leftChestMaxWidth: 12,
  embroideryMaxWidth: 12,
} as const
