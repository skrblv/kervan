import type { PomCode } from '../../data/measurements'
import { cm } from '../../lib/format'
import type { MeasurementRow } from '../../lib/grading'
import type { SizeCode } from '../../types/spec'

interface MeasurementTableProps {
  rows: MeasurementRow[]
  base: SizeCode
  caption: string
  pomLabel: (pom: PomCode) => string
  headers: { pom: string; tolerance: string }
  dense?: boolean
}

/** Graded measurements: points of measure down, sizes across, the base (sample) size marked. */
export function MeasurementTable({ rows, base, caption, pomLabel, headers, dense = false }: MeasurementTableProps) {
  const sizes = rows[0]?.values.map((v) => v.size) ?? []
  const cell = dense ? 'py-1.5' : 'py-2'
  return (
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-ink">
          <th scope="col" className={`${cell} w-8 pr-2 font-mono text-xs font-normal text-ink-3`}>
            <span className="sr-only">Letter</span>
          </th>
          <th scope="col" className={`${cell} pr-3 text-xs font-normal text-ink-3`}>
            {headers.pom}
          </th>
          {sizes.map((size) => (
            <th
              key={size}
              scope="col"
              className={`${cell} px-2 text-right font-mono text-xs ${size === base ? 'font-medium text-accent-strong' : 'font-normal text-ink-3'}`}
            >
              {size}
              {size === base && <span className="sr-only"> (base size)</span>}
            </th>
          ))}
          <th scope="col" className={`${cell} pl-3 text-right font-mono text-xs font-normal whitespace-nowrap text-ink-3`}>
            {headers.tolerance}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.pom} className="border-b border-rule">
            <td className={`${cell} pr-2 font-mono text-xs font-medium text-accent-strong`}>{row.letter}</td>
            <th scope="row" className={`${cell} pr-3 font-normal leading-snug text-ink`}>
              {pomLabel(row.pom)}
            </th>
            {row.values.map((v) => (
              <td
                key={v.size}
                className={`${cell} px-2 text-right font-mono tabular-nums ${v.size === base ? 'bg-accent-tint/60 font-medium' : ''}`}
              >
                {cm(v.value)}
              </td>
            ))}
            <td className={`${cell} pl-3 text-right font-mono tabular-nums text-ink-2`}>{cm(row.tolerance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
