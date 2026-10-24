import type {
  ColourCode,
  CordCode,
  DecorationMethod,
  FabricCode,
  FinishCode,
  FitCode,
  GarmentCode,
  HoodPanelCode,
  NeckLabelCode,
  PackingCode,
  PlacementCode,
  PocketCode,
  SeamCode,
} from '../types/spec'

/** A founder-facing choice. `code` is the glossary term that ends up in the passport. */
export interface Option<C extends string> {
  code: C
  name: string
  description: string
}

export const GARMENTS: Option<GarmentCode>[] = [
  { code: 'GAR-HOODIE', name: 'Hoodie', description: 'Hood, optional kangaroo pocket and drawcord.' },
  { code: 'GAR-SWEAT', name: 'Sweatshirt', description: 'Crew neck with a rib band. Fewer operations.' },
]

export const FITS: Option<FitCode>[] = [
  { code: 'FIT-REG', name: 'Regular', description: 'Set-in sleeves, close to the body. Chest 56 cm on M.' },
  { code: 'FIT-RLX', name: 'Relaxed', description: 'A little more room through the body. Chest 60 cm on M.' },
  { code: 'FIT-OVR', name: 'Oversized', description: 'Boxy, dropped shoulder. Chest 64 cm on M.' },
]

export interface FabricOption {
  code: FabricCode
  name: string
  gsm: number
  cotton: number
  polyester: number
  brushed: boolean
  colours: ColourCode[]
  note: string
}

/** Fabrics the pilot workshops keep in stock, so quotes do not depend on custom fabric development. */
export const FABRICS: FabricOption[] = [
  {
    code: 'FLEECE-3T-280',
    name: '3-thread fleece, brushed',
    gsm: 280,
    cotton: 80,
    polyester: 20,
    brushed: true,
    colours: ['CLR-BLK', 'CLR-MLK', 'CLR-GRM', 'CLR-NVY', 'CLR-SND'],
    note: 'Lighter; good for spring and merchandise.',
  },
  {
    code: 'FLEECE-3T-320',
    name: '3-thread fleece, brushed',
    gsm: 320,
    cotton: 80,
    polyester: 20,
    brushed: true,
    colours: ['CLR-BLK', 'CLR-MLK', 'CLR-GRM', 'CLR-NVY', 'CLR-FOR', 'CLR-SND'],
    note: 'The usual choice for brand hoodies.',
  },
  {
    code: 'FLEECE-3T-400',
    name: '3-thread fleece, brushed, heavy',
    gsm: 400,
    cotton: 80,
    polyester: 20,
    brushed: true,
    colours: ['CLR-BLK', 'CLR-MLK', 'CLR-GRM'],
    note: 'Dense and warm; fewer colours in stock.',
  },
  {
    code: 'TERRY-2T-260',
    name: '2-thread loopback terry',
    gsm: 260,
    cotton: 100,
    polyester: 0,
    brushed: false,
    colours: ['CLR-BLK', 'CLR-MLK', 'CLR-GRM', 'CLR-SND'],
    note: 'Unbrushed, all cotton; drapes softly.',
  },
]

export interface ColourOption {
  code: ColourCode
  name: string
  hex: string
}

export const COLOURS: Record<ColourCode, ColourOption> = {
  'CLR-BLK': { code: 'CLR-BLK', name: 'Black', hex: '#232325' },
  'CLR-MLK': { code: 'CLR-MLK', name: 'Milk', hex: '#ECE6D8' },
  'CLR-GRM': { code: 'CLR-GRM', name: 'Grey melange', hex: '#A9A8A3' },
  'CLR-NVY': { code: 'CLR-NVY', name: 'Navy', hex: '#262E48' },
  'CLR-FOR': { code: 'CLR-FOR', name: 'Forest', hex: '#2F4B3B' },
  'CLR-SND': { code: 'CLR-SND', name: 'Sand', hex: '#CDB89B' },
}

export const HOOD_PANELS: Option<HoodPanelCode>[] = [
  { code: 'HOOD-2P', name: 'Two-panel', description: 'One centre seam over the crown.' },
  { code: 'HOOD-3P', name: 'Three-panel', description: 'A centre strip; rounder shape, holds better.' },
]

export const POCKETS: Option<PocketCode>[] = [
  { code: 'PKT-KANGAROO', name: 'Kangaroo pocket', description: 'One front pocket with two hand openings.' },
  { code: 'PKT-NONE', name: 'No pocket', description: 'Clean front; more room for a large print.' },
]

export const FINISHES: Option<FinishCode>[] = [
  { code: 'RIB-1X1', name: '1×1 rib cuffs and hem', description: 'Fine rib; the most common finish.' },
  { code: 'RIB-2X2', name: '2×2 rib cuffs and hem', description: 'Chunkier rib with more stretch.' },
  { code: 'HEM-SELF-CS', name: 'Self-fabric hem', description: 'Turned and coverstitched; straight, open cuffs.' },
]

export const CORDS: Option<CordCode>[] = [
  { code: 'CORD-FLAT-EYE', name: 'Flat drawcord, metal eyelets', description: 'Cord in body colour.' },
  { code: 'CORD-NONE', name: 'No drawcord', description: 'Plain hood opening.' },
]

export const SEAMS: Option<SeamCode>[] = [
  { code: 'SEAM-OL-CS', name: 'Overlock, coverstitch hems', description: 'Standard construction.' },
  { code: 'SEAM-FLAT', name: 'Flatlock seams', description: 'Flat, visible seams; sporty look.' },
]

export const DECORATION_METHODS: Option<DecorationMethod>[] = [
  { code: 'DEC-NONE', name: 'None', description: 'Plain garment.' },
  { code: 'DEC-DTF', name: 'DTF print', description: 'Full colour, no set-up cost. Good for small runs.' },
  { code: 'DEC-SCREEN', name: 'Screen print', description: 'Durable, cheaper per piece at volume; set-up per colour.' },
  { code: 'DEC-EMB', name: 'Embroidery', description: 'Stitched logo; best kept small on fleece.' },
]

export const PLACEMENTS: Option<PlacementCode>[] = [
  { code: 'POS-FRONT-CENTER', name: 'Front, centre', description: 'Measured from the front neckline.' },
  { code: 'POS-LEFT-CHEST', name: 'Left chest', description: 'Small logo on the wearer’s left.' },
  { code: 'POS-BACK-CENTER', name: 'Back, centre', description: 'Measured from the back neckline.' },
]

export const NECK_LABELS: Option<NeckLabelCode>[] = [
  { code: 'LBL-NECK-PRINT', name: 'Printed neck label', description: 'Printed inside the back neck; no itch.' },
  { code: 'LBL-NECK-WOVEN', name: 'Woven neck label', description: 'Sewn-in brand label.' },
  { code: 'LBL-NECK-NONE', name: 'No neck label', description: 'Care label only.' },
]

export const PACKING: Option<PackingCode>[] = [
  { code: 'PACK-POLY-10', name: 'Individual polybag', description: 'Folded, one per bag, 10 per carton.' },
  { code: 'PACK-BULK', name: 'Bulk', description: 'Folded, no bags, packed in cartons.' },
]

export function findFabric(code: FabricCode): FabricOption {
  const fabric = FABRICS.find((f) => f.code === code)
  if (!fabric) throw new Error(`Unknown fabric ${code}`)
  return fabric
}
