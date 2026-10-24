import { costAt, type CostBreakdown, type UnitParams } from '../../lib/estimate'
import { signedPercent, som } from '../../lib/format'

interface BreakdownTableProps {
  params: UnitParams
  quantities: number[]
  /** The planned quantity, emphasised. */
  highlight: number
}

type Part = Exclude<keyof CostBreakdown, 'total'>

/** The estimate as a table: the components of c(q) down, batch sizes across. */
export function BreakdownTable({ params, quantities, highlight }: BreakdownTableProps) {
  const columns = quantities.map((q) => ({ q, cost: costAt(params, q) }))
  const base = columns[0]?.cost.total ?? 1

  const rows: { key: Part; label: string; term: string; detail?: string }[] = [
    {
      key: 'fabric',
      label: 'Fabric',
      term: 'm·p',
      detail: `${params.fabricKg.toFixed(2)} kg × ${som(params.fabricPricePerKg)} som`,
    },
    { key: 'trims', label: 'Rib, trims and labels', term: 'r' },
    { key: 'decoration', label: 'Decoration', term: 'd' },
    { key: 'packing', label: 'Packing', term: 'k' },
    { key: 'sewing', label: 'Sewing', term: 's(q)', detail: 'Cheaper per piece in longer runs' },
    {
      key: 'fixedPerUnit',
      label: 'Sample and set-up',
      term: 'F/q',
      detail: `${som(params.fixedPerStyle)} som spread over the batch`,
    },
  ]

  const cellClass = (q: number) =>
    `px-3 py-2.5 text-right font-mono tabular-nums ${q === highlight ? 'bg-accent-tint/60 text-ink' : ''}`

  return (
    <table className="w-full min-w-[560px] border-collapse text-sm">
      <caption className="sr-only">Unit cost in som by component and batch size</caption>
      <thead>
        <tr className="border-b border-ink">
          <th scope="col" className="py-2 pr-3 text-left text-xs font-normal text-ink-3">
            Component, som per unit
          </th>
          {columns.map(({ q }) => (
            <th
              key={q}
              scope="col"
              className={`px-3 py-2 text-right font-mono text-xs whitespace-nowrap ${q === highlight ? 'bg-accent-tint/60 font-medium text-accent-strong' : 'font-normal text-ink-3'}`}
            >
              {q} pcs{q === highlight && <span className="sr-only"> (your plan)</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-rule">
            <th scope="row" className="py-2.5 pr-3 text-left font-normal">
              <span className="mr-2 inline-block w-9 font-mono text-xs text-accent-strong">{row.term}</span>
              {row.label}
              {row.detail && <span className="block pl-11 text-xs text-ink-3">{row.detail}</span>}
            </th>
            {columns.map(({ q, cost }) => (
              <td key={q} className={cellClass(q)}>
                {som(cost[row.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-b border-ink">
          <th scope="row" className="py-3 pr-3 text-left font-medium">
            <span className="mr-2 inline-block w-9 font-mono text-xs text-accent-strong">c(q)</span>
            Unit cost
          </th>
          {columns.map(({ q, cost }) => (
            <td key={q} className={`${cellClass(q)} font-medium`}>
              {som(cost.total)}
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row" className="py-2 pr-3 text-left text-xs font-normal text-ink-3">
            Compared with {columns[0]?.q} pcs
          </th>
          {columns.map(({ q, cost }, i) => (
            <td key={q} className={`${cellClass(q)} text-xs text-ink-3`}>
              {i === 0 ? '—' : signedPercent(cost.total / base - 1)}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  )
}
