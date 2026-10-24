import { useId } from 'react'
import { COLOURS } from '../../data/catalog'
import { CONSTRUCTION } from '../../data/measurements'
import { isDark, mix } from '../../lib/colour'
import { pocketTopFromHps, printableWidth, sizeIndex } from '../../lib/grading'
import type { ColourCode, SizeCode, Spec } from '../../types/spec'
import { artworkRect, buildFlat, CX, UNIT, type Flat, type Pt, type Segment, type View } from './geometry'

interface GarmentFlatProps {
  spec: Spec
  view: View
  /** Accessible name of the drawing; omit when the drawing is decorative. */
  label?: string
  colour?: ColourCode
  size?: SizeCode
  /** Builder mode: show the limits the placement rules check against. */
  guides?: boolean
  /** Passport mode: points of measure and artwork dimensions. */
  dimensions?: boolean
  /** A 5 cm grid at the drawing's scale. */
  grid?: boolean
  className?: string
}

interface Palette {
  fill: string
  line: string
  detail: string
  stitch: string
  inside: string
  rib: string
  mark: string
  warn: string
  error: string
  paper: string
}

function paletteFor(hex: string, linedHood: boolean): Palette {
  const dark = isDark(hex)
  return {
    fill: hex,
    line: dark ? '#D9D5CC' : '#24262A',
    detail: dark ? 'rgba(232,228,220,0.5)' : 'rgba(36,38,42,0.45)',
    stitch: dark ? 'rgba(232,228,220,0.75)' : 'rgba(36,38,42,0.7)',
    inside: linedHood ? mix(hex, '#000000', dark ? 0.5 : 0.22) : mix(hex, '#ffffff', dark ? 0.16 : 0.35),
    rib: mix(hex, dark ? '#ffffff' : '#000000', 0.05),
    mark: dark ? '#6FCDC3' : '#0B6B66',
    warn: dark ? '#F2C76B' : '#8A5A00',
    error: dark ? '#FF9F86' : '#A3301B',
    paper: '#FAF9F6',
  }
}

const f = (n: number) => Math.round(n * 10) / 10

function Lines({ segments, stroke, width = 0.7, dash }: { segments: Segment[]; stroke: string; width?: number; dash?: string }) {
  if (segments.length === 0) return null
  const d = segments.map(([a, b]) => `M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}`).join('')
  return <path d={d} stroke={stroke} strokeWidth={width} strokeDasharray={dash} fill="none" />
}

const STITCH = '2.4 2'

export function GarmentFlat({
  spec,
  view,
  label,
  colour,
  size,
  guides = false,
  dimensions = false,
  grid = false,
  className,
}: GarmentFlatProps) {
  // useId output may contain characters that break url(#…) references.
  const id = `flat${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const drawSize = size ?? spec.sizes.base
  const hex = COLOURS[colour ?? spec.colours[0] ?? 'CLR-MLK'].hex
  const p = paletteFor(hex, spec.hood.lined)
  const flat = buildFlat({ ...spec, size: drawSize }, view)
  const art = artworkRect(spec.garment, spec.decoration, view)

  return (
    <svg
      viewBox={flat.viewBox}
      role={label ? 'img' : undefined}
      aria-labelledby={label ? `${id}-title` : undefined}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      {label && <title id={`${id}-title`}>{label}</title>}
      {grid && <GridPaper id={`${id}-grid`} viewBox={flat.viewBox} />}
      <g strokeLinejoin="round" strokeLinecap="round">
        {flat.sleeves.map((sleeve, i) => (
          <g key={i}>
            <path d={sleeve.outline} fill={p.fill} stroke={p.line} strokeWidth={1.2} />
            {sleeve.cuff && <path d={sleeve.cuff} fill={p.rib} stroke={p.line} strokeWidth={1.1} />}
            <Lines segments={sleeve.ribLines} stroke={p.detail} width={0.6} />
            <Lines segments={sleeve.hemStitches} stroke={p.stitch} dash={STITCH} />
          </g>
        ))}

        <path d={flat.body} fill={p.fill} stroke={p.line} strokeWidth={1.3} />
        {flat.hemRib && (
          <>
            <path d={flat.hemRib.outline} fill={p.rib} stroke={p.line} strokeWidth={1.1} />
            <Lines segments={flat.hemRib.lines} stroke={p.detail} width={0.6} />
          </>
        )}
        <Lines segments={flat.hemStitches} stroke={p.stitch} dash={STITCH} />
        {flat.seamStitches.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={p.stitch} strokeWidth={0.7} strokeDasharray={STITCH} />
        ))}

        <Neck flat={flat} p={p} />

        {flat.pocket && (
          <>
            <path d={flat.pocket.outline} fill={p.fill} stroke={p.line} strokeWidth={1.1} />
            <Lines segments={flat.pocket.stitches} stroke={p.stitch} dash={STITCH} />
          </>
        )}

        {flat.hood && (
          <g>
            <path d={flat.hood.outline} fill={p.fill} stroke={p.line} strokeWidth={1.3} />
            {flat.hood.opening && <path d={flat.hood.opening} fill={p.inside} stroke={p.line} strokeWidth={1.2} />}
            {flat.hood.openingStitch && (
              <path
                d={flat.hood.openingStitch}
                fill="none"
                stroke={p.stitch}
                strokeWidth={0.7}
                strokeDasharray={STITCH}
                transform={`translate(${CX} -30) scale(1.1) translate(${-CX} 30)`}
              />
            )}
            <Lines segments={flat.hood.seams} stroke={p.line} width={0.9} />
            {flat.hood.cords.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={mix(p.fill, p.line, 0.25)} strokeWidth={3.4} />
            ))}
            {flat.hood.cords.map((d, i) => (
              <path key={`o${i}`} d={d} fill="none" stroke={p.line} strokeWidth={0.5} strokeOpacity={0.6} />
            ))}
            {flat.hood.eyelets.map((e, i) => (
              <circle key={i} cx={e.x} cy={e.y} r={2.6} fill={mix(p.fill, '#9a9a9a', 0.6)} stroke={p.line} strokeWidth={0.8} />
            ))}
          </g>
        )}

        {art && (
          <ArtworkMark rect={art} colour={guides && artworkIsBlocked(spec) ? p.error : p.mark} method={spec.decoration.method} />
        )}
        {guides && art && <PlacementGuides spec={spec} p={p} view={view} />}
        {dimensions && art && <ArtworkDimensions rect={art} spec={spec} p={p} />}
        {dimensions && <PointsOfMeasure flat={flat} p={p} view={view} hoodie={spec.garment === 'GAR-HOODIE'} />}
      </g>
    </svg>
  )
}

/** Grid lines every 5 cm, aligned to the centre front and the shoulder point. */
function GridPaper({ id, viewBox }: { id: string; viewBox: string }) {
  const [x, y, w, h] = viewBox.split(' ').map(Number) as [number, number, number, number]
  const step = 5 * UNIT
  return (
    <>
      <defs>
        <pattern id={id} width={step} height={step} patternUnits="userSpaceOnUse" x={CX} y={0}>
          <path d={`M${step} 0H0V${step}`} fill="none" stroke="#D7D4CB" strokeWidth={0.45} />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </>
  )
}

function Neck({ flat, p }: { flat: Flat; p: Palette }) {
  const neck = flat.neck
  if (neck.kind === 'crew-front') {
    return (
      <g>
        <path d={neck.inside} fill={p.inside} stroke={p.line} strokeWidth={0.9} />
        <path d={neck.backRib} fill={mix(p.inside, p.fill, 0.5)} stroke={p.line} strokeWidth={0.9} />
        <path d={neck.frontRib} fill={p.rib} stroke={p.line} strokeWidth={1.1} />
        <Lines segments={neck.ribLines} stroke={p.detail} width={0.55} />
      </g>
    )
  }
  if (neck.kind === 'crew-back') {
    return (
      <g>
        <path d={neck.rib} fill={p.rib} stroke={p.line} strokeWidth={1.1} />
        <Lines segments={neck.ribLines} stroke={p.detail} width={0.55} />
      </g>
    )
  }
  return null
}

function artworkIsBlocked(spec: Spec): boolean {
  const d = spec.decoration
  if (d.placement === 'POS-LEFT-CHEST' || sizeIndex(spec.sizes.from) > sizeIndex(spec.sizes.to)) return false
  return d.widthCm > printableWidth(spec, spec.sizes.from)
}

type Rect = NonNullable<ReturnType<typeof artworkRect>>

function ArtworkMark({ rect, colour, method }: { rect: Rect; colour: string; method: Spec['decoration']['method'] }) {
  const short = method === 'DEC-DTF' ? 'DTF' : method === 'DEC-SCREEN' ? 'SCREEN' : 'EMB'
  return (
    <g>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        fill={colour}
        fillOpacity={0.16}
        stroke={colour}
        strokeWidth={1}
        strokeDasharray={method === 'DEC-EMB' ? '1.6 1.4' : undefined}
      />
      {rect.w > 34 && rect.h > 16 && (
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + 2.4}
          textAnchor="middle"
          fontFamily="IBM Plex Mono, monospace"
          fontSize={7}
          letterSpacing={0.6}
          fill={colour}
        >
          {short}
        </text>
      )}
    </g>
  )
}

function PlacementGuides({ spec, p, view }: { spec: Spec; p: Palette; view: View }) {
  const d = spec.decoration
  const smallest = spec.sizes.from
  const rect = artworkRect(spec.garment, d, view)
  if (!rect || d.placement === 'POS-LEFT-CHEST' || sizeIndex(smallest) > sizeIndex(spec.sizes.to)) return null

  const half = (printableWidth(spec, smallest) / 2) * UNIT
  const blocked = artworkIsBlocked(spec)
  const guideColour = blocked ? p.error : p.mark
  const top = rect.y - 10
  const bottom = rect.y + rect.h + 8

  const pocketLimit =
    view === 'front' && spec.pocket === 'PKT-KANGAROO'
      ? (pocketTopFromHps(spec, smallest) - CONSTRUCTION.pocketClearance) * UNIT
      : null
  const overPocket = pocketLimit !== null && rect.y + rect.h > pocketLimit

  return (
    <g
      fontFamily="IBM Plex Mono, monospace"
      fontSize={7.5}
      stroke={p.fill}
      strokeWidth={2.5}
      paintOrder="stroke"
      strokeLinejoin="round"
    >
      <path
        d={`M${CX - half} ${top}V${bottom}M${CX + half} ${top}V${bottom}`}
        fill="none"
        stroke={guideColour}
        strokeOpacity={blocked ? 1 : 0.7}
        strokeWidth={0.8}
        strokeDasharray="3 2"
      />
      <text x={CX + half} y={top - 3} textAnchor="middle" fill={guideColour}>
        max {smallest}
      </text>
      {overPocket && pocketLimit !== null && (
        <g>
          <path
            d={`M${CX - half} ${pocketLimit}H${CX + half}`}
            fill="none"
            stroke={p.warn}
            strokeWidth={0.9}
            strokeDasharray="3 2"
          />
          <text x={CX - half - 3} y={pocketLimit + 2.5} textAnchor="end" fill={p.warn}>
            pocket {smallest}
          </text>
        </g>
      )}
    </g>
  )
}

function DimLine({
  from,
  to,
  colour,
  label,
  labelAt,
  anchor = 'middle',
}: {
  from: Pt
  to: Pt
  colour: string
  label?: string
  labelAt?: Pt
  anchor?: 'start' | 'middle' | 'end'
}) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * 2.5
  const ny = (dx / len) * 2.5
  return (
    <g>
      <path
        d={`M${f(from.x)} ${f(from.y)}L${f(to.x)} ${f(to.y)}M${f(from.x - nx)} ${f(from.y - ny)}L${f(from.x + nx)} ${f(from.y + ny)}M${f(to.x - nx)} ${f(to.y - ny)}L${f(to.x + nx)} ${f(to.y + ny)}`}
        stroke={colour}
        strokeWidth={0.7}
        fill="none"
      />
      {label && labelAt && (
        <text x={labelAt.x} y={labelAt.y} textAnchor={anchor} fill={colour} fontFamily="IBM Plex Mono, monospace" fontSize={6.8}>
          {label}
        </text>
      )}
    </g>
  )
}

function ArtworkDimensions({ rect, spec, p }: { rect: Rect; spec: Spec; p: Palette }) {
  const d = spec.decoration
  return (
    <g>
      <DimLine
        from={{ x: rect.x, y: rect.y - 6 }}
        to={{ x: rect.x + rect.w, y: rect.y - 6 }}
        colour={p.mark}
        label={`${d.widthCm}`}
        labelAt={{ x: rect.x + rect.w / 2, y: rect.y - 9 }}
      />
      <DimLine
        from={{ x: rect.x + rect.w + 6, y: rect.y }}
        to={{ x: rect.x + rect.w + 6, y: rect.y + rect.h }}
        colour={p.mark}
        label={`${d.heightCm}`}
        labelAt={{ x: rect.x + rect.w + 10, y: rect.y + rect.h / 2 + 2.4 }}
        anchor="start"
      />
      {d.offsetCm > 0 && (
        <DimLine
          from={{ x: rect.x - 6, y: rect.neckY }}
          to={{ x: rect.x - 6, y: rect.y }}
          colour={p.mark}
          label={`${d.offsetCm}`}
          labelAt={{ x: rect.x - 10, y: (rect.neckY + rect.y) / 2 + 2.4 }}
          anchor="end"
        />
      )}
    </g>
  )
}

function Letter({ at, letter, p }: { at: Pt; letter: string; p: Palette }) {
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={5.4} fill={p.paper} stroke={p.mark} strokeWidth={0.8} />
      <text
        x={at.x}
        y={at.y + 2.4}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={7}
        fontWeight={500}
        fill={p.mark}
      >
        {letter}
      </text>
    </g>
  )
}

/** Lettered points of measure; letters match the rows of the measurement table. */
function PointsOfMeasure({ flat, p, view, hoodie }: { flat: Flat; p: Palette; view: View; hoodie: boolean }) {
  const a = flat.anchors
  const sleeve = flat.sleeves[1]
  const marks: { from: Pt; to: Pt; letter: string; at: Pt }[] = []

  if (view === 'front') {
    const chestL = { x: CX - a.chestHalf, y: a.chestY }
    const chestR = { x: CX + a.chestHalf, y: a.chestY }
    marks.push({ from: chestL, to: chestR, letter: 'A', at: { x: CX - a.chestHalf + 12, y: a.chestY } })

    const lengthX = a.hps.x + 6
    marks.push({ from: { x: lengthX, y: 0 }, to: { x: lengthX, y: a.hemY }, letter: 'B', at: { x: lengthX, y: a.hemY - 24 } })

    const shL = { x: 2 * CX - a.shoulder.x, y: a.shoulder.y + 3 }
    const shR = { x: a.shoulder.x, y: a.shoulder.y + 3 }
    marks.push({ from: shL, to: shR, letter: 'C', at: { x: CX - (a.shoulder.x - CX) + 14, y: a.shoulder.y + 3 } })

    const o = 8
    const sFrom = { x: sleeve.outerTop.x + sleeve.normal.x * o, y: sleeve.outerTop.y + sleeve.normal.y * o }
    const sTo = { x: sleeve.outerBottom.x + sleeve.normal.x * o, y: sleeve.outerBottom.y + sleeve.normal.y * o }
    marks.push({ from: sFrom, to: sTo, letter: 'D', at: { x: (sFrom.x + sTo.x) / 2, y: (sFrom.y + sTo.y) / 2 } })

    const hemY = a.hemY + 7
    marks.push({
      from: { x: CX - a.hemHalf, y: hemY },
      to: { x: CX + a.hemHalf, y: hemY },
      letter: 'E',
      at: { x: CX, y: hemY },
    })

    const c = 7
    const cFrom = { x: sleeve.innerBottom.x + sleeve.dir.x * c, y: sleeve.innerBottom.y + sleeve.dir.y * c }
    const cTo = { x: sleeve.outerBottom.x + sleeve.dir.x * c, y: sleeve.outerBottom.y + sleeve.dir.y * c }
    marks.push({
      from: cFrom,
      to: cTo,
      letter: 'F',
      at: { x: (cFrom.x + cTo.x) / 2 + sleeve.dir.x * 8, y: (cFrom.y + cTo.y) / 2 + sleeve.dir.y * 8 },
    })

    if (hoodie) {
      const x = CX - a.hoodHalfWidth - 10
      marks.push({ from: { x, y: 0 }, to: { x, y: a.hoodTop }, letter: 'G', at: { x, y: a.hoodTop / 2 } })
    } else {
      const y = -12
      marks.push({ from: { x: 2 * CX - a.hps.x, y }, to: { x: a.hps.x, y }, letter: 'G', at: { x: CX, y: y - 9 } })
    }
  } else if (hoodie) {
    const y = a.hoodTop + 42
    const half = a.hoodHalfWidth + 1
    marks.push({ from: { x: CX - half, y }, to: { x: CX + half, y }, letter: 'H', at: { x: CX - half + 12, y } })
  }

  return (
    <g>
      {marks.map((m) => (
        <g key={m.letter}>
          <DimLine from={m.from} to={m.to} colour={p.mark} />
          <Letter at={m.at} letter={m.letter} p={p} />
        </g>
      ))}
    </g>
  )
}
