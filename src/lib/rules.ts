import { COLOURS, findFabric } from '../data/catalog'
import { COST_MODEL } from '../data/costModel'
import { CONSTRUCTION } from '../data/measurements'
import type { Issue, Spec } from '../types/spec'
import { pocketTopFromHps, printableWidth, sizeIndex, sizesInRange } from './grading'

const A3_AREA = 1247

/**
 * Manufacturability and completeness rules. Each rule returns at most one issue.
 * Errors block the passport; warnings advise and stay visible to the founder.
 */
const RULES: ((spec: Spec) => Issue | null)[] = [
  (spec) =>
    spec.styleName.trim() === ''
      ? {
          id: 'style-name',
          severity: 'error',
          step: 'garment',
          message: 'The style needs a name.',
          hint: 'Workshops see it on the request card.',
        }
      : null,

  (spec) => {
    const q = spec.plannedQuantity
    if (!Number.isFinite(q) || q < 10 || q > 1000)
      return {
        id: 'quantity-range',
        severity: 'error',
        step: 'garment',
        message: 'Planned quantity must be between 10 and 1,000.',
      }
    if (q < 20)
      return {
        id: 'quantity-low',
        severity: 'warning',
        step: 'garment',
        message: `Most verified workshops start at 20–30 units per style; ${q} may not get quotes.`,
      }
    if (q > 300)
      return {
        id: 'quantity-high',
        severity: 'warning',
        step: 'garment',
        message: 'Pilot workshops take up to 300 units per style; a larger run would be split between workshops.',
      }
    return null
  },

  (spec) =>
    spec.colours.length === 0
      ? { id: 'colours-empty', severity: 'error', step: 'fabric', message: 'Choose at least one colour.' }
      : null,

  (spec) => {
    const fabric = findFabric(spec.fabric)
    const missing = spec.colours.filter((c) => !fabric.colours.includes(c))
    if (missing.length === 0) return null
    const names = missing.map((c) => COLOURS[c].name).join(', ')
    return {
      id: 'colour-not-stocked',
      severity: 'error',
      step: 'fabric',
      message: `${names} is not stocked in ${fabric.gsm} g/m² ${fabric.brushed ? 'fleece' : 'terry'}.`,
      hint: 'Pick another colour or fabric. Custom dyeing is outside the pilot.',
    }
  },

  (spec) => {
    const { from, to, base } = spec.sizes
    if (sizeIndex(from) > sizeIndex(to))
      return { id: 'size-order', severity: 'error', step: 'sizes', message: 'The first size must come before the last.' }
    if (!sizesInRange(spec.sizes).includes(base))
      return {
        id: 'base-size',
        severity: 'error',
        step: 'sizes',
        message: `Base size ${base} is outside the range ${from}–${to}.`,
        hint: 'The sample is sewn in the base size.',
      }
    return null
  },

  (spec) => {
    const d = spec.decoration
    if (d.method === 'DEC-NONE' || d.placement === 'POS-LEFT-CHEST') return null
    if (sizeIndex(spec.sizes.from) > sizeIndex(spec.sizes.to)) return null
    const smallest = spec.sizes.from
    const max = printableWidth(spec, smallest)
    if (d.widthCm <= max) return null
    return {
      id: 'print-too-wide',
      severity: 'error',
      step: 'decoration',
      message: `The artwork is ${d.widthCm} cm wide; the size ${smallest} chest allows ${max} cm.`,
      hint: `That keeps ${CONSTRUCTION.printSideMargin} cm clear of each side seam. Reduce the width or start the range at a larger size.`,
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method === 'DEC-NONE' || d.placement !== 'POS-FRONT-CENTER' || spec.pocket !== 'PKT-KANGAROO') return null
    const smallest = spec.sizes.from
    const bottom = CONSTRUCTION.frontNeckDrop[spec.garment] + d.offsetCm + d.heightCm
    const limit = pocketTopFromHps(spec, smallest) - CONSTRUCTION.pocketClearance
    if (bottom <= limit) return null
    return {
      id: 'print-over-pocket',
      severity: 'warning',
      step: 'decoration',
      message: `On size ${smallest} the artwork runs ${bottom - limit} cm into the pocket area.`,
      hint: 'Pressing across the pocket edge leaves an uneven transfer. Raise or shorten the artwork, or drop the pocket.',
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method === 'DEC-NONE' || d.placement !== 'POS-LEFT-CHEST' || d.widthCm <= CONSTRUCTION.leftChestMaxWidth) return null
    return {
      id: 'left-chest-wide',
      severity: 'warning',
      step: 'decoration',
      message: `A left-chest logo wider than ${CONSTRUCTION.leftChestMaxWidth} cm reaches the armhole on smaller sizes.`,
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method !== 'DEC-EMB' || d.widthCm <= CONSTRUCTION.embroideryMaxWidth) return null
    return {
      id: 'embroidery-wide',
      severity: 'warning',
      step: 'decoration',
      message: `Embroidery wider than ${CONSTRUCTION.embroideryMaxWidth} cm tends to pucker on brushed fleece.`,
      hint: 'Consider DTF or a smaller logo.',
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method !== 'DEC-SCREEN') return null
    const perColour = Math.floor(spec.plannedQuantity / Math.max(1, spec.colours.length))
    if (perColour >= 50) return null
    return {
      id: 'screen-small-run',
      severity: 'warning',
      step: 'decoration',
      message: `Screen printing under 50 units per colour is usually uneconomic (${perColour} planned).`,
      hint: 'DTF has no set-up cost and suits small runs.',
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method !== 'DEC-SCREEN' || d.inkColours <= 4) return null
    return {
      id: 'screen-many-inks',
      severity: 'warning',
      step: 'decoration',
      message: `${d.inkColours} ink colours need ${d.inkColours} screens; each adds about ${COST_MODEL.screenSetupPerInkColour.toLocaleString('en-US')} som of set-up.`,
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method !== 'DEC-DTF' || d.widthCm * d.heightCm <= A3_AREA) return null
    return {
      id: 'dtf-over-a3',
      severity: 'warning',
      step: 'decoration',
      message: 'The artwork is larger than A3; most DTF presses in the pilot take A3.',
    }
  },

  (spec) => {
    const d = spec.decoration
    if (d.method === 'DEC-NONE' || d.offsetCm >= 3) return null
    return {
      id: 'print-near-neck',
      severity: 'warning',
      step: 'decoration',
      message: 'Less than 3 cm below the neckline seam leaves no room for the press.',
    }
  },

  (spec) => {
    if (spec.garment !== 'GAR-HOODIE' || !spec.hood.lined || findFabric(spec.fabric).gsm < 400) return null
    return {
      id: 'heavy-lined-hood',
      severity: 'warning',
      step: 'construction',
      message: 'A lined hood in 400 g/m² fleece is heavy and stiff.',
      hint: 'Use a single-layer hood with this fabric.',
    }
  },

  (spec) =>
    spec.labels.careLangs.includes('ru')
      ? null
      : {
          id: 'care-label-russian',
          severity: 'error',
          step: 'labels',
          message: 'The care label must include Russian.',
          hint: 'EAEU labelling rules (TR CU 017/2011) require product information in Russian.',
        },
]

export function checkSpec(spec: Spec): Issue[] {
  return RULES.map((rule) => rule(spec)).filter((issue): issue is Issue => issue !== null)
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((i) => i.severity === 'error')
}
