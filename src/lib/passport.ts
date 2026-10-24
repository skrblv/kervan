import type { PassportVersion, Spec } from '../types/spec'
import { sha256 } from './sha256'

/** JSON with object keys sorted at every level, so equal specs always hash the same. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function specHash(spec: Spec): string {
  return sha256(canonicalJson(spec))
}

export function passportId(spec: Pick<Spec, 'garment'>): string {
  return spec.garment === 'GAR-HOODIE' ? 'APP-HOODIE-01' : 'APP-SWEAT-01'
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`
}

/** Flattens nested objects to dotted paths; arrays are compared as whole values. */
function flatten(value: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out)
    }
  } else {
    out[prefix] = canonicalJson(value)
  }
  return out
}

/** Paths whose values differ between two versions of a spec. */
export function changedFields(previous: Spec, next: Spec): string[] {
  const a = flatten(previous)
  const b = flatten(next)
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].filter((k) => a[k] !== b[k]).sort()
}

const FIELD_LABELS: Record<string, string> = {
  styleName: 'Style name',
  garment: 'Garment',
  fit: 'Fit',
  plannedQuantity: 'Planned quantity',
  fabric: 'Fabric',
  colours: 'Colours',
  'hood.panels': 'Hood panels',
  'hood.lined': 'Hood lining',
  pocket: 'Pocket',
  finish: 'Cuffs and hem',
  drawcord: 'Drawcord',
  seams: 'Seams',
  'sizes.from': 'Smallest size',
  'sizes.to': 'Largest size',
  'sizes.base': 'Base size',
  'decoration.method': 'Decoration method',
  'decoration.placement': 'Artwork placement',
  'decoration.widthCm': 'Artwork width',
  'decoration.heightCm': 'Artwork height',
  'decoration.offsetCm': 'Artwork position',
  'decoration.inkColours': 'Ink colours',
  'labels.neck': 'Neck label',
  'labels.careLangs': 'Care label languages',
  packing: 'Packing',
  clarifications: 'Clarifications',
}

export function fieldLabel(path: string): string {
  return FIELD_LABELS[path] ?? path
}

export type PassportState =
  | { kind: 'none' }
  | { kind: 'locked'; current: PassportVersion }
  | { kind: 'draft'; version: number; previous: PassportVersion | null; changes: string[] }

/** Is the spec on screen the same as the last locked version, or a new draft? */
export function passportState(spec: Spec, versions: PassportVersion[]): PassportState {
  const latest = versions[versions.length - 1] ?? null
  if (latest && canonicalJson(latest.snapshot) === canonicalJson(spec)) return { kind: 'locked', current: latest }
  return {
    kind: 'draft',
    version: (latest?.version ?? 0) + 1,
    previous: latest,
    changes: latest ? changedFields(latest.snapshot, spec) : [],
  }
}
