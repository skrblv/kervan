import { COST_MODEL, MIN_OBSERVATIONS } from '../../data/costModel'
import { formatDate } from '../../lib/dates'
import { basisFor } from '../../lib/estimate'
import { percent } from '../../lib/format'
import type { Spec } from '../../types/spec'

/** Every estimate is shown with what it rests on and how wrong it has been. */
export function DataBasis({ spec }: { spec: Spec }) {
  const { basis, provisional } = basisFor(spec)
  const product = spec.garment === 'GAR-HOODIE' ? 'hoodies' : 'sweatshirts'

  const rows: [string, string][] = [
    ['Model', `${COST_MODEL.version}, parametric`],
    ['Fitted on', `${basis.observations} quotes for ${product} from ${basis.workshops} workshops`],
    [
      'Measured error',
      basis.mape !== null ? `${percent(basis.mape)} MAPE on ${basis.heldOut} unseen quotes` : 'Not measured yet',
    ],
    ['Range shown', `±${Math.round(basis.band * 100)}%`],
    ['Updated', formatDate(basis.updated)],
  ]

  return (
    <section aria-labelledby="basis-title" className="border-t-2 border-ink pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="basis-title" className="kicker !text-ink">
          Data basis
        </h2>
        <span className="font-mono text-[11px] text-ink-3">Demo figures</span>
      </div>
      <dl className="mt-2 divide-y divide-rule text-sm">
        {rows.map(([term, value]) => (
          <div key={term} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2">
            <dt className="text-ink-3">{term}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {provisional && (
        <p className="mt-3 border-l-2 border-warn bg-sheet px-3 py-2 text-sm text-ink-2">
          Provisional: fewer than {MIN_OBSERVATIONS} quotes for {product}. Kervan shows a range only until the error can be
          measured.
        </p>
      )}
    </section>
  )
}
