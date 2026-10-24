import { useMemo, useState, type PointerEvent } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { costAt, STANDARD_QUANTITIES, type UnitParams } from '../../lib/estimate'
import { som } from '../../lib/format'

interface BatchCurveProps {
  params: UnitParams
  /** Half-width of the uncertainty band, e.g. 0.11. */
  band: number
  /** False while the model is provisional: the band is drawn without a central line. */
  showPoint: boolean
  planned: number
  efficient: number
}

const Q_MIN = 20
const Q_MAX = 300
const HEIGHT = 300
const M = { top: 34, right: 18, bottom: 34, left: 56 }
const X_TICKS = [20, 30, 50, 100, 200, 300]

const COLOURS = {
  line: '#0b6b66',
  band: '#dae9e5',
  grid: '#e4e1d9',
  axis: '#ada99f',
  text: '#62666c',
  ink: '#16181b',
  surface: '#efede7',
}

function niceStep(span: number): number {
  const raw = span / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw
}

/** Unit cost against batch size on a log scale, where the steep part of the curve lives. */
export function BatchCurve({ params, band, showPoint, planned, efficient }: BatchCurveProps) {
  const [box, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const plotW = Math.max(200, width - M.left - M.right)
  const plotH = HEIGHT - M.top - M.bottom

  const model = useMemo(() => {
    const samples = Array.from({ length: 64 }, (_, i) => Q_MIN * (Q_MAX / Q_MIN) ** (i / 63))
    const points = samples.map((q) => ({ q, c: costAt(params, q).total }))
    const lo = Math.min(...points.map((p) => p.c)) * (1 - band)
    const hi = Math.max(...points.map((p) => p.c)) * (1 + band)
    const step = niceStep(hi - lo)
    const yMin = Math.floor(lo / step) * step
    const yMax = Math.ceil(hi / step) * step
    const yTicks: number[] = []
    for (let v = yMin; v <= yMax + 1e-6; v += step) yTicks.push(v)
    return { points, yMin, yMax, yTicks }
  }, [params, band])

  const x = (q: number) => M.left + (Math.log(q / Q_MIN) / Math.log(Q_MAX / Q_MIN)) * plotW
  const y = (c: number) => M.top + (1 - (c - model.yMin) / (model.yMax - model.yMin)) * plotH
  const toQ = (px: number) => Q_MIN * (Q_MAX / Q_MIN) ** ((px - M.left) / plotW)

  const line = model.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.q).toFixed(1)} ${y(p.c).toFixed(1)}`).join('')
  const upper = model.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.q).toFixed(1)} ${y(p.c * (1 + band)).toFixed(1)}`).join('')
  const lower = [...model.points]
    .reverse()
    .map((p) => `L${x(p.q).toFixed(1)} ${y(p.c * (1 - band)).toFixed(1)}`)
    .join('')

  const plannedQ = Math.min(Q_MAX, Math.max(Q_MIN, planned))
  const plannedCost = costAt(params, plannedQ).total
  const first = costAt(params, 30).total
  const last = costAt(params, 200).total

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const q = Math.round(toQ(e.clientX - rect.left + M.left) / 10) * 10
    setHover(Math.min(Q_MAX, Math.max(Q_MIN, q)))
  }

  const hoverCost = hover !== null ? costAt(params, hover).total : 0
  const tooltipLeft = hover !== null ? Math.min(Math.max(x(hover) - 80, 4), width - 164) : 0
  const labelRight = x(plannedQ) > M.left + plotW * 0.62

  return (
    <div ref={box} className="relative w-full">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Unit cost falls from ${som(first)} som at 30 units to ${som(last)} som at 200 units. Beyond about ${efficient} units, doubling the batch saves less than 5 percent.`}
        className="block overflow-visible"
      >
        <text x={M.left - 8} y={M.top - 16} textAnchor="end" fontSize={11} fill={COLOURS.text}>
          som / unit
        </text>
        {model.yTicks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={M.left + plotW} y1={y(v)} y2={y(v)} stroke={COLOURS.grid} strokeWidth={1} />
            <text
              x={M.left - 8}
              y={y(v) + 4}
              textAnchor="end"
              fontSize={11}
              fill={COLOURS.text}
              className="font-mono tabular-nums"
            >
              {som(v)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={M.left + plotW} y1={M.top + plotH} y2={M.top + plotH} stroke={COLOURS.axis} strokeWidth={1} />
        {X_TICKS.map((q) => (
          <text
            key={q}
            x={x(q)}
            y={M.top + plotH + 20}
            textAnchor="middle"
            fontSize={11}
            fill={COLOURS.text}
            className="font-mono tabular-nums"
          >
            {q}
          </text>
        ))}

        <path d={`${upper}${lower}Z`} fill={COLOURS.band} fillOpacity={showPoint ? 0.85 : 1} />
        {showPoint ? (
          <path d={line} fill="none" stroke={COLOURS.line} strokeWidth={2} strokeLinejoin="round" />
        ) : (
          <path d={line} fill="none" stroke={COLOURS.line} strokeWidth={1} strokeDasharray="4 3" />
        )}

        {/* Efficient batch: a threshold, so it is the one dashed rule on the chart. */}
        <line
          x1={x(efficient)}
          x2={x(efficient)}
          y1={M.top - 6}
          y2={M.top + plotH}
          stroke={COLOURS.text}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text x={x(efficient) + 6} y={M.top - 2} fontSize={11} fill={COLOURS.ink}>
          Efficient batch ≈ {efficient}
        </text>

        {showPoint &&
          STANDARD_QUANTITIES.map((q) => (
            <circle
              key={q}
              cx={x(q)}
              cy={y(costAt(params, q).total)}
              r={4}
              fill={COLOURS.line}
              stroke={COLOURS.surface}
              strokeWidth={2}
            />
          ))}

        <line x1={x(plannedQ)} x2={x(plannedQ)} y1={y(plannedCost)} y2={M.top + plotH} stroke={COLOURS.ink} strokeWidth={1} />
        <circle cx={x(plannedQ)} cy={y(plannedCost)} r={5.5} fill={COLOURS.ink} stroke={COLOURS.surface} strokeWidth={2} />
        <text
          x={x(plannedQ) + (labelRight ? -10 : 10)}
          y={y(plannedCost) - 10}
          textAnchor={labelRight ? 'end' : 'start'}
          fontSize={12}
          fontWeight={500}
          fill={COLOURS.ink}
          stroke={COLOURS.surface}
          strokeWidth={4}
          paintOrder="stroke"
        >
          Your plan: {planned} ·{' '}
          {showPoint ? som(plannedCost) : `${som(plannedCost * (1 - band))}–${som(plannedCost * (1 + band))}`} som
        </text>

        {hover !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={M.top}
              y2={M.top + plotH}
              stroke={COLOURS.ink}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            <circle cx={x(hover)} cy={y(hoverCost)} r={4} fill={COLOURS.surface} stroke={COLOURS.line} strokeWidth={2} />
          </g>
        )}
        <rect
          x={M.left}
          y={M.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>

      {hover !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute w-40 border border-rule-2 bg-sheet px-3 py-2 shadow-[0_6px_18px_-10px_rgba(22,24,27,0.4)]"
          style={{ left: tooltipLeft, top: 0 }}
        >
          <p className="text-[15px] font-medium tabular-nums text-ink">
            {showPoint ? `${som(hoverCost)} som` : `${som(hoverCost * (1 - band))}–${som(hoverCost * (1 + band))}`}
          </p>
          <p className="text-xs text-ink-3">
            per unit at {hover} units
            {showPoint && (
              <>
                <br />
                range {som(hoverCost * (1 - band))}–{som(hoverCost * (1 + band))}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
