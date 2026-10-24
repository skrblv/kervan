import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { IssueList } from '../components/checks/IssueList'
import { BatchCurve } from '../components/estimate/BatchCurve'
import { BreakdownTable } from '../components/estimate/BreakdownTable'
import { DataBasis } from '../components/estimate/DataBasis'
import { CONTAINER, PageHeader } from '../components/layout/AppShell'
import { ButtonLink } from '../components/ui/Button'
import { NumberInput } from '../components/ui/fields'
import { OUTLIER_THRESHOLD } from '../lib/quotes'
import { basisFor, costAt, efficientBatch, estimateAt, STANDARD_QUANTITIES, toUsd, unitParams } from '../lib/estimate'
import { percent, som, usd } from '../lib/format'
import { useSpec } from '../state/store'

const roundTo100 = (value: number) => Math.round(value / 100) * 100

const TERMS: [string, string][] = [
  ['m·p', 'fabric per unit, including cutting waste, times its price per kg'],
  ['r', 'rib, thread, labels and trims'],
  ['d', 'decoration per piece'],
  ['k', 'packing'],
  ['s(q)', 'sewing price per piece at quantity q'],
  ['F', 'fixed cost per style: sample, pattern adjustment, print set-up'],
]

export function EstimatePage() {
  const { spec, errors, update } = useSpec()
  const params = useMemo(() => unitParams(spec), [spec])
  const q = Math.min(1000, Math.max(10, Number.isFinite(spec.plannedQuantity) ? spec.plannedQuantity : 50))
  const estimate = estimateAt(spec, q, params)
  const { basis, showPoint } = basisFor(spec)
  const efficient = efficientBatch(params)
  const doubled = costAt(params, q * 2).total
  const doublingSaves = (estimate.breakdown.total - doubled) / estimate.breakdown.total
  const quantities = [...new Set([...STANDARD_QUANTITIES, q])].sort((a, b) => a - b)

  return (
    <div className={CONTAINER}>
      <PageHeader kicker="02 · Estimate" title="What it should cost, before you ask anyone.">
        A transparent unit-cost model, calibrated on workshop quotes and published with its error. It is a guide for planning the
        batch, not a quote.
      </PageHeader>

      <section
        aria-label="Estimate by batch size"
        className="grid gap-10 border-t border-rule pt-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-14"
      >
        <div>
          <p className="kicker">At your planned quantity</p>
          <p className="mt-3 text-[52px] leading-none font-medium tracking-[-0.02em]">
            {showPoint ? som(estimate.breakdown.total) : `${som(estimate.low)}–${som(estimate.high)}`}
            <span className="ml-2 text-lg font-normal tracking-normal text-ink-3">som</span>
          </p>
          <p className="mt-2 text-ink-2">
            per unit
            {showPoint && (
              <>
                {' '}
                · range{' '}
                <span className="font-mono text-sm tabular-nums">
                  {som(estimate.low)}–{som(estimate.high)}
                </span>
              </>
            )}{' '}
            · ≈ {showPoint ? usd(toUsd(estimate.breakdown.total)) : `${usd(toUsd(estimate.low))}–${usd(toUsd(estimate.high))}`}
          </p>
          <p className="mt-1 text-sm text-ink-3">
            Batch of {q}: about{' '}
            {showPoint
              ? som(roundTo100(estimate.breakdown.total * q))
              : `${som(roundTo100(estimate.low * q))}–${som(roundTo100(estimate.high * q))}`}{' '}
            som before delivery.
          </p>

          <NumberInput
            id="estimate-quantity"
            label="Planned quantity"
            value={spec.plannedQuantity}
            onChange={(plannedQuantity) => update((s) => ({ ...s, plannedQuantity }))}
            min={10}
            max={1000}
            step={10}
            unit="pcs"
            className="mt-8 max-w-[15rem]"
            hint="Changes the planned quantity in your specification."
          />

          <p className="mt-6 border-t border-rule pt-4 text-sm text-ink-2">
            {doublingSaves >= 0.05 ? (
              <>
                Doubling to {q * 2} units would cut the unit cost by{' '}
                <strong className="font-medium text-ink">{percent(doublingSaves)}</strong> (
                {som(estimate.breakdown.total - doubled)} som).
              </>
            ) : (
              <>
                Past the efficient batch: doubling to {q * 2} units saves only{' '}
                <strong className="font-medium text-ink">{percent(Math.max(0, doublingSaves))}</strong> per unit.
              </>
            )}{' '}
            The efficient batch for this spec is about {efficient} units.
          </p>
        </div>

        <figure className="min-w-0">
          <BatchCurve params={params} band={basis.band} showPoint={showPoint} planned={q} efficient={efficient} />
          <figcaption className="mt-3 text-sm text-ink-3">
            Unit cost by batch size, log scale. The shaded band is the ±{Math.round(basis.band * 100)}% range; the dashed rule is
            where doubling the batch starts saving less than 5%. Hover to read any quantity; every value is in the table below.
          </figcaption>
        </figure>
      </section>

      <section className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] lg:gap-14">
        <div className="min-w-0">
          <h2 className="font-display text-[28px] leading-tight">Where the money goes</h2>
          <p className="mt-1.5 text-ink-2">
            Per unit, by component. Only sewing and the fixed costs move with quantity.
            {!showPoint && ' While the model is provisional these are central values; plan with the range above.'}
          </p>
          <div className="mt-6 overflow-x-auto">
            <BreakdownTable params={params} quantities={quantities} highlight={q} />
          </div>
        </div>

        <aside className="space-y-10">
          <DataBasis spec={spec} />
          <section aria-labelledby="formula-title">
            <h2 id="formula-title" className="kicker !text-ink">
              How it is calculated
            </h2>
            <p className="mt-3 border-y border-rule py-3 text-center font-mono text-[15px]">
              c(q) = m·p + r + d + k + s(q) + F/q
            </p>
            <dl className="mt-3 space-y-1.5 text-sm">
              {TERMS.map(([term, text]) => (
                <div key={term} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2">
                  <dt className="font-mono text-accent-strong">{term}</dt>
                  <dd className="text-ink-2">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-ink-3">
              A workshop quote more than {Math.round(OUTLIER_THRESHOLD * 100)}% away from this estimate triggers a clarifying
              question, not a rejection.
            </p>
          </section>
        </aside>
      </section>

      <section aria-label="Next step" className="mt-16 border-t-2 border-ink pt-6">
        {errors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <div>
              <h2 className="font-medium">
                Fix {errors.length === 1 ? 'one thing' : `${errors.length} things`} before the passport
              </h2>
              <IssueList issues={errors} compact />
            </div>
            <ButtonLink to={`/spec?step=${errors[0]!.step}`} variant="secondary">
              Back to the specification
            </ButtonLink>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl text-ink-2">
              Next, Kervan turns the specification into a Production Passport that workshops can read in their own language.
            </p>
            <ButtonLink to="/passport">
              Generate the Production Passport
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        )}
      </section>
    </div>
  )
}
