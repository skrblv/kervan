import type { Spec } from '../types/spec'

/** Where a new specification starts: sensible defaults, no decoration, no name yet. */
export const BLANK_SPEC: Spec = {
  styleName: '',
  garment: 'GAR-HOODIE',
  fit: 'FIT-REG',
  plannedQuantity: 50,
  fabric: 'FLEECE-3T-320',
  colours: ['CLR-BLK'],
  hood: { panels: 'HOOD-2P', lined: false },
  pocket: 'PKT-KANGAROO',
  finish: 'RIB-1X1',
  drawcord: 'CORD-FLAT-EYE',
  seams: 'SEAM-OL-CS',
  sizes: { from: 'S', to: 'XL', base: 'M' },
  decoration: {
    method: 'DEC-NONE',
    placement: 'POS-FRONT-CENTER',
    widthCm: 28,
    heightCm: 20,
    offsetCm: 8,
    inkColours: 1,
  },
  labels: { neck: 'LBL-NECK-PRINT', careLangs: ['ru', 'ky'] },
  packing: 'PACK-POLY-10',
  clarifications: [],
}

/**
 * The worked example from section 5.4 of the project file: a Bishkek brand
 * needs 80 black hoodies with a printed front (passport in Appendix D).
 */
export const EXAMPLE_SPEC: Spec = {
  ...BLANK_SPEC,
  styleName: 'Core Hoodie FW26',
  plannedQuantity: 80,
  hood: { panels: 'HOOD-3P', lined: true },
  decoration: { ...BLANK_SPEC.decoration, method: 'DEC-DTF' },
}
