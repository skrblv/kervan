/**
 * The Production Passport data model. Every value a workshop acts on is a coded
 * glossary term (e.g. `FLEECE-3T-320`), so the same spec renders in any
 * supported language without free-text translation.
 */

export type Lang = 'ru' | 'ky' | 'kk' | 'tr' | 'en'

export type GarmentCode = 'GAR-HOODIE' | 'GAR-SWEAT'
export type FitCode = 'FIT-REG' | 'FIT-RLX' | 'FIT-OVR'
export type FabricCode = 'FLEECE-3T-280' | 'FLEECE-3T-320' | 'FLEECE-3T-400' | 'TERRY-2T-260'
export type ColourCode = 'CLR-BLK' | 'CLR-MLK' | 'CLR-GRM' | 'CLR-NVY' | 'CLR-FOR' | 'CLR-SND'
export type HoodPanelCode = 'HOOD-2P' | 'HOOD-3P'
export type PocketCode = 'PKT-KANGAROO' | 'PKT-NONE'
export type FinishCode = 'RIB-1X1' | 'RIB-2X2' | 'HEM-SELF-CS'
export type CordCode = 'CORD-FLAT-EYE' | 'CORD-NONE'
export type SeamCode = 'SEAM-OL-CS' | 'SEAM-FLAT'
export type DecorationMethod = 'DEC-NONE' | 'DEC-DTF' | 'DEC-SCREEN' | 'DEC-EMB'
export type PlacementCode = 'POS-FRONT-CENTER' | 'POS-LEFT-CHEST' | 'POS-BACK-CENTER'
export type NeckLabelCode = 'LBL-NECK-PRINT' | 'LBL-NECK-WOVEN' | 'LBL-NECK-NONE'
export type PackingCode = 'PACK-POLY-10' | 'PACK-BULK'

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const
export type SizeCode = (typeof SIZES)[number]

export interface SizeRange {
  from: SizeCode
  to: SizeCode
  /** The size the sample is sewn in; graded measurements are anchored to it. */
  base: SizeCode
}

export interface Decoration {
  method: DecorationMethod
  placement: PlacementCode
  widthCm: number
  heightCm: number
  /** Distance from the neckline seam at centre front (or centre back) to the top of the artwork. */
  offsetCm: number
  /** Screen printing only. */
  inkColours: number
}

/** A workshop question answered by the founder. It is tied to one spec field and creates a new version. */
export interface Clarification {
  fieldPath: string
  question: string
  answer: string
  workshopId: string
  answeredAt: string
}

export interface Spec {
  styleName: string
  garment: GarmentCode
  fit: FitCode
  /** Rough batch size used for rules and the estimate; exact sizes come with the quote request. */
  plannedQuantity: number
  fabric: FabricCode
  colours: ColourCode[]
  /** Ignored for sweatshirts. */
  hood: { panels: HoodPanelCode; lined: boolean }
  pocket: PocketCode
  finish: FinishCode
  /** Ignored for sweatshirts. */
  drawcord: CordCode
  seams: SeamCode
  sizes: SizeRange
  decoration: Decoration
  labels: { neck: NeckLabelCode; careLangs: Lang[] }
  packing: PackingCode
  clarifications: Clarification[]
}

export type BuilderStepId = 'garment' | 'fabric' | 'construction' | 'sizes' | 'decoration' | 'labels'

export type Severity = 'error' | 'warning'

/** Output of a manufacturability rule. Errors block the passport; warnings advise. */
export interface Issue {
  id: string
  severity: Severity
  step: BuilderStepId
  message: string
  hint?: string
}

export interface PassportVersion {
  version: number
  /** SHA-256 of the canonical JSON of `snapshot`; quotes, samples and inspections refer to it. */
  hash: string
  lockedAt: string
  snapshot: Spec
}
