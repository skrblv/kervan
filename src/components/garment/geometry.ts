import { CONSTRUCTION } from '../../data/measurements'
import { measure, pocketTopFromHps } from '../../lib/grading'
import type {
  CordCode,
  Decoration,
  FinishCode,
  FitCode,
  GarmentCode,
  HoodPanelCode,
  PocketCode,
  SeamCode,
  SizeCode,
} from '../../types/spec'

/**
 * Geometry of a technical flat drawn to scale from the graded measurements.
 * Coordinates are SVG units (UNIT per cm), with the high point of the shoulder (HPS) at y = 0
 * and the centre front at x = CX. Only the right half is computed; the left half is mirrored.
 */
export const UNIT = 3
export const CX = 200

export type View = 'front' | 'back'

export interface FlatInput {
  garment: GarmentCode
  fit: FitCode
  finish: FinishCode
  pocket: PocketCode
  hood: { panels: HoodPanelCode; lined: boolean }
  drawcord: CordCode
  seams: SeamCode
  size: SizeCode
}

export interface Pt {
  x: number
  y: number
}
export type Segment = [Pt, Pt]

const pt = (x: number, y: number): Pt => ({ x, y })
const add = (a: Pt, b: Pt): Pt => pt(a.x + b.x, a.y + b.y)
const scale = (a: Pt, k: number): Pt => pt(a.x * k, a.y * k)
const lerp = (a: Pt, b: Pt, t: number): Pt => pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
const mirror = (a: Pt): Pt => pt(2 * CX - a.x, a.y)
const r = (n: number) => Math.round(n * 10) / 10
const s = (a: Pt) => `${r(a.x)} ${r(a.y)}`

function quadAt(p0: Pt, c: Pt, p1: Pt, t: number): Pt {
  const u = 1 - t
  return pt(u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, u * u * p0.y + 2 * u * t * c.y + t * t * p1.y)
}

/** A symmetric quadratic curve between mirrored end points that dips to `dip` at centre. */
function neckCurve(endRight: Pt, dip: number) {
  const start = mirror(endRight)
  const control = pt(CX, 2 * dip - endRight.y)
  return { start, control, end: endRight, d: `M ${s(start)} Q ${s(control)} ${s(endRight)}` }
}

/** Lines across a band between two curves sampled at the same parameters (rib texture). */
function bandLines(a: (t: number) => Pt, b: (t: number) => Pt, count: number): Segment[] {
  return Array.from({ length: count - 1 }, (_, i) => {
    const t = (i + 1) / count
    return [a(t), b(t)]
  })
}

export interface Sleeve {
  outline: string
  cuff: string | null
  ribLines: Segment[]
  hemStitches: Segment[]
  /** Anchors for dimension lines. */
  outerTop: Pt
  outerBottom: Pt
  innerBottom: Pt
  dir: Pt
  normal: Pt
}

export interface Flat {
  viewBox: string
  body: string
  sleeves: [Sleeve, Sleeve]
  hemRib: { outline: string; lines: Segment[] } | null
  hemStitches: Segment[]
  neck:
    | { kind: 'crew-front'; inside: string; backRib: string; frontRib: string; ribLines: Segment[] }
    | { kind: 'crew-back'; rib: string; ribLines: Segment[] }
    | { kind: 'none' }
  hood: {
    outline: string
    opening: string | null
    openingStitch: string | null
    seams: Segment[]
    eyelets: Pt[]
    cords: string[]
  } | null
  pocket: { outline: string; stitches: Segment[] } | null
  seamStitches: string[]
  anchors: {
    hps: Pt
    shoulder: Pt
    underarm: Pt
    chestY: number
    chestHalf: number
    hemHalf: number
    hemY: number
    hoodTop: number
    hoodHalfWidth: number
  }
}

const BOTTOM_MARGIN = 14

export function viewBoxFor(garment: GarmentCode): { x: number; y: number; w: number; h: number } {
  const top = garment === 'GAR-HOODIE' ? -118 : -34
  const bottom = 236
  return { x: 22, y: top, w: 356, h: bottom - top + BOTTOM_MARGIN }
}

export function buildFlat(input: FlatInput, view: View): Flat {
  const cut = { fit: input.fit, finish: input.finish }
  const cmAt = (pom: Parameters<typeof measure>[1]) => measure(cut, pom, input.size) * UNIT
  const hoodie = input.garment === 'GAR-HOODIE'
  const rib = input.finish !== 'HEM-SELF-CS'

  const neckHalf = cmAt('POM-NECK') / 2
  const chestHalf = cmAt('POM-CHEST') / 2
  const shoulderHalf = cmAt('POM-SHOULDER') / 2
  const hemHalf = cmAt('POM-HEM') / 2
  const length = cmAt('POM-LENGTH')
  const sleeveLength = cmAt('POM-SLEEVE')
  const cuffWidth = cmAt('POM-CUFF')
  const armholeDepth = CONSTRUCTION.armholeDepth[input.fit] * UNIT
  const hemRibHeight = rib ? CONSTRUCTION.hemRibHeight * UNIT : 0
  const cuffRibHeight = rib ? CONSTRUCTION.cuffRibHeight * UNIT : 0
  const shoulderSlope = (input.fit === 'FIT-OVR' ? 3.5 : 4.5) * UNIT

  const hps = pt(CX + neckHalf, 0)
  const shoulder = pt(CX + shoulderHalf, shoulderSlope)
  const underarm = pt(CX + chestHalf, armholeDepth)
  const hemY = length
  const ribTop = hemY - hemRibHeight
  const ribTopHalf = rib ? hemHalf + 3 : chestHalf
  // Leaves the shoulder vertically and meets the underarm horizontally, like a set-in sleeve seam.
  const armholeControl = pt(shoulder.x, underarm.y)
  const chestY = underarm.y + 2 * UNIT

  // ---- Body ---------------------------------------------------------------
  const frontDrop = (hoodie ? CONSTRUCTION.frontNeckDrop['GAR-HOODIE'] : CONSTRUCTION.frontNeckDrop['GAR-SWEAT']) * UNIT
  const neckDip = view === 'front' ? frontDrop : CONSTRUCTION.backNeckDrop * UNIT
  const neckline = neckCurve(hps, neckDip)

  const sideBottom = rib
    ? `L ${s(pt(underarm.x, ribTop - 10))} Q ${s(pt(underarm.x, ribTop))} ${s(pt(CX + ribTopHalf, ribTop))}`
    : `L ${s(pt(underarm.x, hemY))}`
  const sideBottomLeft = rib
    ? `L ${s(pt(CX - ribTopHalf, ribTop))} Q ${s(pt(2 * CX - underarm.x, ribTop))} ${s(pt(2 * CX - underarm.x, ribTop - 10))}`
    : `L ${s(pt(2 * CX - underarm.x, hemY))}`
  const body = [
    `M ${s(mirror(hps))}`,
    `Q ${s(neckline.control)} ${s(hps)}`,
    `L ${s(shoulder)}`,
    `Q ${s(armholeControl)} ${s(underarm)}`,
    sideBottom,
    sideBottomLeft,
    `L ${s(mirror(underarm))}`,
    `Q ${s(mirror(armholeControl))} ${s(mirror(shoulder))}`,
    'Z',
  ].join(' ')

  // ---- Hem ------------------------------------------------------------------
  let hemRib: Flat['hemRib'] = null
  const hemStitches: Segment[] = []
  if (rib) {
    const tl = pt(CX - ribTopHalf, ribTop)
    const tr = pt(CX + ribTopHalf, ribTop)
    const br = pt(CX + hemHalf, hemY)
    const bl = pt(CX - hemHalf, hemY)
    hemRib = {
      outline: `M ${s(tl)} L ${s(tr)} L ${s(br)} L ${s(bl)} Z`,
      lines: bandLines(
        (t) => lerp(tl, tr, t),
        (t) => lerp(bl, br, t),
        Math.round((ribTopHalf * 2) / 4.2),
      ),
    }
  } else {
    for (const off of [5, 8]) hemStitches.push([pt(CX - chestHalf + 1, hemY - off), pt(CX + chestHalf - 1, hemY - off)])
  }

  // ---- Sleeves --------------------------------------------------------------
  const sleeveEnd = rib ? cuffWidth * 1.18 : cuffWidth
  const outerLength = sleeveLength - cuffRibHeight
  // Tilt the sleeve just enough to hang clear of the body side seam.
  let angle = (12 * Math.PI) / 180
  while (angle < (40 * Math.PI) / 180) {
    const innerX = shoulder.x + outerLength * Math.sin(angle) - sleeveEnd * Math.cos(angle)
    if (innerX >= underarm.x + 7) break
    angle += Math.PI / 360
  }
  const dir = pt(Math.sin(angle), Math.cos(angle))
  const normal = pt(Math.cos(angle), -Math.sin(angle))

  const outerTop = add(shoulder, scale(dir, outerLength))
  const innerTop = add(outerTop, scale(normal, -sleeveEnd))
  const rightSleeve: Sleeve = {
    outline: `M ${s(shoulder)} L ${s(outerTop)} L ${s(innerTop)} L ${s(underarm)} Q ${s(armholeControl)} ${s(shoulder)} Z`,
    cuff: null,
    ribLines: [],
    hemStitches: [],
    outerTop: shoulder,
    outerBottom: outerTop,
    innerBottom: innerTop,
    dir,
    normal,
  }
  if (rib) {
    const inset = (sleeveEnd - cuffWidth) / 2
    const cto = add(outerTop, scale(normal, -inset))
    const cti = add(innerTop, scale(normal, inset))
    const cbo = add(cto, scale(dir, cuffRibHeight))
    const cbi = add(cti, scale(dir, cuffRibHeight))
    rightSleeve.cuff = `M ${s(cto)} L ${s(cbo)} L ${s(cbi)} L ${s(cti)} Z`
    rightSleeve.ribLines = bandLines(
      (t) => lerp(cti, cto, t),
      (t) => lerp(cbi, cbo, t),
      7,
    )
    rightSleeve.outerBottom = cbo
    rightSleeve.innerBottom = cbi
  } else {
    rightSleeve.hemStitches = [5, 8].map((off) => [add(outerTop, scale(dir, -off)), add(innerTop, scale(dir, -off))])
  }
  const mirrorSegments = (segments: Segment[]): Segment[] => segments.map(([a, b]) => [mirror(a), mirror(b)])
  const mirrorPath = (d: string) =>
    d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${r(2 * CX - Number(x))} ${y}`)
  const leftSleeve: Sleeve = {
    ...rightSleeve,
    outline: mirrorPath(rightSleeve.outline),
    cuff: rightSleeve.cuff ? mirrorPath(rightSleeve.cuff) : null,
    ribLines: mirrorSegments(rightSleeve.ribLines),
    hemStitches: mirrorSegments(rightSleeve.hemStitches),
    outerTop: mirror(rightSleeve.outerTop),
    outerBottom: mirror(rightSleeve.outerBottom),
    innerBottom: mirror(rightSleeve.innerBottom),
    dir: pt(-dir.x, dir.y),
    normal: pt(-normal.x, normal.y),
  }

  // ---- Neck (sweatshirt) ------------------------------------------------------
  let neck: Flat['neck'] = { kind: 'none' }
  if (!hoodie && view === 'front') {
    const band = 2.2 * UNIT
    const inner = pt(hps.x - 3, -3)
    const frontInner = neckCurve(inner, frontDrop - band)
    const backTop = neckCurve(inner, 3)
    const backBottom = neckCurve(inner, 3 + band)
    neck = {
      kind: 'crew-front',
      inside: `${backBottom.d} Q ${s(frontInner.control)} ${s(mirror(inner))} Z`,
      backRib: `${backTop.d} Q ${s(backBottom.control)} ${s(mirror(inner))} Z`,
      frontRib: `${neckline.d} L ${s(inner)} Q ${s(frontInner.control)} ${s(mirror(inner))} Z`,
      ribLines: [
        ...bandLines(
          (t) => quadAt(neckline.start, neckline.control, neckline.end, t),
          (t) => quadAt(frontInner.start, frontInner.control, frontInner.end, t),
          22,
        ),
        ...bandLines(
          (t) => quadAt(backTop.start, backTop.control, backTop.end, t),
          (t) => quadAt(backBottom.start, backBottom.control, backBottom.end, t),
          16,
        ),
      ],
    }
  } else if (!hoodie) {
    const top = neckCurve(pt(hps.x - 2, -5), 0)
    neck = {
      kind: 'crew-back',
      rib: `${neckline.d} L ${s(top.end)} Q ${s(top.control)} ${s(top.start)} Z`,
      ribLines: bandLines(
        (t) => quadAt(neckline.start, neckline.control, neckline.end, t),
        (t) => quadAt(top.start, top.control, top.end, t),
        20,
      ),
    }
  }

  // ---- Hood -------------------------------------------------------------------
  const hoodTop = -(measure(cut, 'POM-HOOD-H', input.size) - 3) * UNIT
  const hoodHalfWidth = neckHalf + 15
  let hood: Flat['hood'] = null
  if (hoodie) {
    const base = pt(hps.x + 7, 12)
    const W = hoodHalfWidth
    const bottomDip = view === 'front' ? 31 : 6
    const outline = [
      `M ${s(mirror(base))}`,
      `C ${s(pt(CX - W - 4, -20))} ${s(pt(CX - W - 2, hoodTop + 30))} ${s(pt(CX - W + 12, hoodTop + 8))}`,
      `C ${s(pt(CX - W + 24, hoodTop - 4))} ${s(pt(CX + W - 24, hoodTop - 4))} ${s(pt(CX + W - 12, hoodTop + 8))}`,
      `C ${s(pt(CX + W + 2, hoodTop + 30))} ${s(pt(CX + W + 4, -20))} ${s(base)}`,
      `Q ${s(pt(CX, 2 * bottomDip - base.y))} ${s(mirror(base))} Z`,
    ].join(' ')

    const seams: Segment[] = []
    let opening: string | null = null
    let openingStitch: string | null = null
    let eyelets: Pt[] = []
    let cords: string[] = []
    if (view === 'front') {
      const crown = hoodTop + 14
      opening = [
        `M ${s(pt(CX, 32))}`,
        `C ${s(pt(CX - 14, 26))} ${s(pt(CX - 30, -4))} ${s(pt(CX - 30, -38))}`,
        `C ${s(pt(CX - 30, crown + 12))} ${s(pt(CX - 18, crown))} ${s(pt(CX, crown))}`,
        `C ${s(pt(CX + 18, crown))} ${s(pt(CX + 30, crown + 12))} ${s(pt(CX + 30, -38))}`,
        `C ${s(pt(CX + 30, -4))} ${s(pt(CX + 14, 26))} ${s(pt(CX, 32))} Z`,
      ].join(' ')
      openingStitch = opening
      if (input.hood.panels === 'HOOD-3P') {
        seams.push([pt(CX - 12, crown + 0.5), pt(CX - 10, hoodTop - 1)], [pt(CX + 12, crown + 0.5), pt(CX + 10, hoodTop - 1)])
      } else {
        seams.push([pt(CX, crown), pt(CX, hoodTop - 1)])
      }
      if (input.drawcord === 'CORD-FLAT-EYE') {
        eyelets = [pt(CX - 10, 21), pt(CX + 10, 21)]
        cords = [
          `M ${s(pt(CX - 10, 23))} C ${s(pt(CX - 11, 46))} ${s(pt(CX - 14, 72))} ${s(pt(CX - 15, 98))}`,
          `M ${s(pt(CX + 10, 23))} C ${s(pt(CX + 12, 50))} ${s(pt(CX + 14, 78))} ${s(pt(CX + 17, 106))}`,
        ]
      }
    } else if (input.hood.panels === 'HOOD-3P') {
      seams.push([pt(CX - 13, hoodTop + 1), pt(CX - 9, 7)], [pt(CX + 13, hoodTop + 1), pt(CX + 9, 7)])
    } else {
      seams.push([pt(CX, hoodTop - 1), pt(CX, 6)])
    }
    hood = { outline, opening, openingStitch, seams, eyelets, cords }
  }

  // ---- Pocket -----------------------------------------------------------------
  let pocket: Flat['pocket'] = null
  if (view === 'front' && input.pocket === 'PKT-KANGAROO') {
    const top = pocketTopFromHps(cut, input.size) * UNIT
    const bottom = rib ? ribTop : hemY - 3 * UNIT
    const topHalf = chestHalf * 0.54
    const bottomHalf = chestHalf * 0.72
    const slant = 11 * UNIT
    const a = pt(CX + topHalf, top)
    const b = pt(CX + bottomHalf, top + slant)
    const v = pt(b.x - a.x, b.y - a.y)
    const len = Math.hypot(v.x, v.y)
    const inward = pt((-v.y / len) * 3, (v.x / len) * 3)
    const slantStitch: Segment = [add(a, inward), add(b, inward)]
    pocket = {
      outline: [
        `M ${s(mirror(a))} L ${s(a)} L ${s(b)} L ${s(pt(b.x, bottom))}`,
        `L ${s(pt(2 * CX - b.x, bottom))} L ${s(mirror(b))} Z`,
      ].join(' '),
      stitches: [
        [pt(CX - topHalf + 4, top + 3), pt(CX + topHalf - 4, top + 3)],
        slantStitch,
        [mirror(slantStitch[0]), mirror(slantStitch[1])],
      ],
    }
  }

  // ---- Visible seams ------------------------------------------------------------
  const seamStitches: string[] = []
  if (input.seams === 'SEAM-FLAT') {
    for (const side of [1, -1]) {
      const o = 2.5 * side
      const sh = pt(shoulder.x - o, shoulder.y + 1)
      const ua = pt(underarm.x - o, underarm.y - 1)
      const c = pt(armholeControl.x - o, armholeControl.y)
      const d = `M ${s(sh)} Q ${s(c)} ${s(ua)}`
      seamStitches.push(d, mirrorPath(d))
    }
  }

  return {
    viewBox: (() => {
      const v = viewBoxFor(input.garment)
      return `${v.x} ${v.y} ${v.w} ${v.h}`
    })(),
    body,
    sleeves: [leftSleeve, rightSleeve],
    hemRib,
    hemStitches,
    neck,
    hood,
    pocket,
    seamStitches,
    anchors: {
      hps,
      shoulder,
      underarm,
      chestY,
      chestHalf,
      hemHalf: rib ? hemHalf : chestHalf,
      hemY,
      hoodTop: hoodTop - 1,
      hoodHalfWidth,
    },
  }
}

/** Where the artwork sits on the given view, in drawing units; null when it is on the other side. */
export function artworkRect(garment: GarmentCode, decoration: Decoration, view: View) {
  if (decoration.method === 'DEC-NONE') return null
  const onBack = decoration.placement === 'POS-BACK-CENTER'
  if ((view === 'back') !== onBack) return null
  const neckDrop = onBack ? CONSTRUCTION.backNeckDrop : CONSTRUCTION.frontNeckDrop[garment]
  const w = decoration.widthCm * UNIT
  const h = decoration.heightCm * UNIT
  const centreX = decoration.placement === 'POS-LEFT-CHEST' ? CX + 10 * UNIT : CX
  const y = (neckDrop + decoration.offsetCm) * UNIT
  return { x: centreX - w / 2, y, w, h, neckY: neckDrop * UNIT, centreX }
}
