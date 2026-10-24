import type { ReactNode } from 'react'
import { formatDate, daysBetween } from '../../lib/dates'
import { signedPercent, som } from '../../lib/format'
import { OUTLIER_THRESHOLD } from '../../lib/quotes'
import type { DeliveryCity, NormalisedQuote } from '../../types/quote'

interface ComparisonTableProps {
  quotes: NormalisedQuote[]
  total: number
  city: DeliveryCity
  deadline: string
  chosenId: string | null
  onRequestSample: (quote: NormalisedQuote) => void
}

interface Row {
  label: string
  /** Label for the stacked phone layout, where group headings are not shown. */
  short?: string
  group?: string
  strong?: boolean
  render: (q: NormalisedQuote) => ReactNode
}

/** Quotes on one basis: fabric included and delivered to the buyer's city, so columns compare like with like. */
export function ComparisonTable({ quotes, total, city, deadline, chosenId, onRequestSample }: ComparisonTableProps) {
  const cheapest = Math.min(...quotes.map((q) => q.normalisedUnit))
  const earliest = quotes.map((q) => q.readyBy).sort()[0]

  const rows: Row[] = [
    { group: 'Price per unit, som', label: 'Quoted', short: 'Quoted price', render: (q) => som(q.quote.unitPrice) },
    {
      label: 'Fabric',
      render: (q) =>
        q.quote.includesFabric ? (
          'Included'
        ) : (
          <>
            +{som(q.fabricAdded)} <span className="text-ink-3">not included; Kervan estimate added</span>
          </>
        ),
    },
    {
      label: `Delivery to ${city}`,
      render: (q) => (q.deliveryAdded ? `+${som(q.deliveryAdded)}` : <span className="text-ink-3">Local, none</span>),
    },
    {
      label: 'Like for like',
      strong: true,
      render: (q) => (
        <span className="text-[17px] font-medium">
          {som(q.normalisedUnit)}
          {q.normalisedUnit === cheapest && quotes.length > 1 && (
            <span className="ml-2 align-middle font-mono text-[11px] font-normal text-accent-strong">lowest</span>
          )}
        </span>
      ),
    },
    {
      label: 'Against the estimate',
      render: (q) =>
        q.outlier ? (
          <span className="text-warn">
            {signedPercent(q.deviation)}
            <span className="block text-xs leading-snug text-ink-2">
              Over {Math.round(OUTLIER_THRESHOLD * 100)}% away: Kervan asked the workshop what it includes. Not marked as wrong.
            </span>
          </span>
        ) : (
          signedPercent(q.deviation)
        ),
    },
    { label: `Batch of ${total}`, render: (q) => `${som(q.batchTotal)} som` },
    {
      group: 'Sample',
      label: 'Fee and time',
      short: 'Sample',
      render: (q) => `${som(q.quote.samplePrice)} som · ${q.quote.sampleDays} days`,
    },
    {
      group: 'Production',
      label: 'After approval',
      short: 'Production',
      render: (q) => `${q.quote.productionDays} working days`,
    },
    {
      label: 'Ready by',
      render: (q) => (
        <>
          {formatDate(q.readyBy)}
          {q.readyBy === earliest && quotes.length > 1 && (
            <span className="ml-2 font-mono text-[11px] text-accent-strong">earliest</span>
          )}
          <span className={`block text-xs ${q.meetsDeadline ? 'text-ink-3' : 'text-warn'}`}>
            {q.meetsDeadline ? 'Meets your date' : `${daysBetween(deadline, q.readyBy)} days after your date`}
          </span>
        </>
      ),
    },
    {
      label: 'Minimum',
      render: (q) => (
        <>
          {q.quote.minQuantity} pcs
          {q.belowMinimum && <span className="block text-xs text-warn">Above your {total}</span>}
        </>
      ),
    },
    { label: 'Valid until', render: (q) => formatDate(q.quote.validUntil) },
  ]

  const action = (q: NormalisedQuote) =>
    chosenId === q.workshop.id ? (
      <span className="inline-flex h-9 items-center text-sm font-medium text-accent-strong">Sample requested</span>
    ) : (
      <button
        type="button"
        disabled={chosenId !== null}
        onClick={() => onRequestSample(q)}
        className="h-9 rounded-[3px] border border-ink/70 px-3.5 text-sm font-medium hover:border-ink hover:bg-paper disabled:cursor-not-allowed disabled:border-rule-2 disabled:text-ink-3"
      >
        Request sample<span className="sr-only"> from {q.workshop.name}</span>
      </button>
    )

  return (
    <>
      {/* Wide screens: one column per workshop. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Quotes compared on a like-for-like basis</caption>
          <thead>
            <tr className="border-b border-ink align-bottom">
              <td className="w-48" />
              {quotes.map((q) => (
                <th key={q.workshop.id} scope="col" className="animate-arrive px-4 pb-3 font-normal">
                  <WorkshopHead q={q} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={`border-b ${row.strong ? 'border-ink/40 bg-sheet' : 'border-rule'}`}>
                <th scope="row" className="py-2.5 pr-4 align-top font-normal text-ink-2">
                  {row.group && <span className="block kicker">{row.group}</span>}
                  {row.label}
                </th>
                {quotes.map((q) => (
                  <td key={q.workshop.id} className="animate-arrive px-4 py-2.5 align-top tabular-nums">
                    {row.render(q)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {quotes.map((q) => (
                <td key={q.workshop.id} className="px-4 pt-4">
                  {action(q)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Narrow screens: the same rows, one block per workshop. */}
      <ol className="space-y-8 md:hidden">
        {quotes.map((q) => (
          <li key={q.workshop.id} className="animate-arrive border-t-2 border-ink pt-3">
            <WorkshopHead q={q} />
            <dl className="mt-3 divide-y divide-rule border-y border-rule text-sm">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 py-2 ${row.strong ? 'bg-sheet' : ''}`}
                >
                  <dt className="text-ink-2">{row.short ?? row.label}</dt>
                  <dd className="tabular-nums">{row.render(q)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3">{action(q)}</div>
          </li>
        ))}
      </ol>
    </>
  )
}

function WorkshopHead({ q }: { q: NormalisedQuote }) {
  const w = q.workshop
  return (
    <div>
      <p className="font-mono text-[11px] text-ink-3">{w.id}</p>
      <p className="mt-0.5 font-display text-xl leading-tight text-ink">{w.name}</p>
      <p className="mt-1 text-xs leading-snug text-ink-3">
        {w.district} · verified on site {formatDate(w.visitedOn, 'en-GB', false)}
        <br />
        {w.processes.join(', ')}
        <br />
        With Kervan: {w.history.quotes} quotes, {w.history.orders} {w.history.orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  )
}
