import { findWorkshop } from '../../data/workshops'
import { formatDate, formatTime } from '../../lib/dates'
import { inspectionSample } from '../../lib/inspection'
import { ORDER_STAGES, type Order, type OrderStage } from '../../types/quote'

const STAGE_LABELS: Record<OrderStage, string> = {
  'sample-requested': 'Sample requested',
  'sample-submitted': 'Sample submitted',
  'sample-approved': 'Sample approved',
  'in-production': 'In production',
  inspection: 'Inspection',
  ready: 'Ready',
  delivered: 'Delivered',
  closed: 'Closed',
}

/** The order as Kervan records it: milestones and confirmations, never money. */
export function OrderRecord({ order, lot }: { order: Order; lot: number }) {
  const current = ORDER_STAGES.indexOf(order.stage)
  const workshop = findWorkshop(order.workshopId)
  const sample = inspectionSample(lot)

  const notes: Partial<Record<OrderStage, string>> = {
    'sample-approved': `locks v${order.passportVersion}`,
    inspection: `${sample.sample} of ${lot}, in person`,
  }

  return (
    <section aria-labelledby="order-title" className="animate-arrive border-t-2 border-ink pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="order-title" className="font-display text-[28px] leading-tight">
          Order record
        </h2>
        <p className="font-mono text-xs text-ink-3">
          {order.id} · {workshop.name} · passport v{order.passportVersion}
        </p>
      </div>

      <ol className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
        {ORDER_STAGES.map((stage, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'next'
          return (
            <li key={stage} aria-current={state === 'current' ? 'step' : undefined} className="relative">
              <div className="flex items-center">
                <span
                  aria-hidden
                  className={`size-2.5 shrink-0 rotate-45 border ${
                    state === 'current'
                      ? 'border-accent bg-accent'
                      : state === 'done'
                        ? 'border-ink bg-ink'
                        : 'border-rule-2 bg-paper'
                  }`}
                />
                {i < ORDER_STAGES.length - 1 && (
                  <span aria-hidden className="stitch ml-2 hidden h-2 flex-1 text-rule-2 lg:block" />
                )}
              </div>
              <p className={`mt-2 text-sm ${state === 'next' ? 'text-ink-3' : 'font-medium text-ink'}`}>{STAGE_LABELS[stage]}</p>
              {notes[stage] && <p className="text-xs text-ink-3">{notes[stage]}</p>}
            </li>
          )
        })}
      </ol>

      <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h3 className="kicker !text-ink">Event log</h3>
          <ol className="mt-2 divide-y divide-rule border-y border-rule text-sm">
            {[...order.events].reverse().map((event) => (
              <li key={event.at + event.stage} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2.5">
                <span className="font-mono text-xs text-ink-3">
                  {formatDate(event.at, 'en-GB', false)} {formatTime(event.at)}
                </span>
                <span>{event.note}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="text-sm text-ink-2">
          <h3 className="kicker !text-ink">What happens next</h3>
          <p className="mt-2">
            {workshop.name} confirms in Telegram and posts photos and measurements of the sample. Each step needs evidence from
            one side and confirmation from the other, and every transition is time-stamped.
          </p>
          <p className="mt-3">
            Payments go directly between you and the workshop: the sample fee now, then a deposit and the balance. Kervan records
            the agreed milestones only.
          </p>
        </div>
      </div>
    </section>
  )
}
