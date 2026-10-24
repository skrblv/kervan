import { useEffect, useMemo, useState } from 'react'
import { CONTAINER, EmptyState, PageHeader } from '../components/layout/AppShell'
import { ComparisonTable } from '../components/quotes/ComparisonTable'
import { OrderRecord } from '../components/quotes/OrderRecord'
import { QuestionCard } from '../components/quotes/QuestionCard'
import { SampleDialog } from '../components/quotes/SampleDialog'
import { ButtonLink } from '../components/ui/Button'
import { findWorkshop } from '../data/workshops'
import { formatDate } from '../lib/dates'
import { som } from '../lib/format'
import { shortHash } from '../lib/passport'
import { demoReplies, normaliseQuote } from '../lib/quotes'
import { useAppState, useDispatch } from '../state/store'
import type { NormalisedQuote, QuoteRequest, WorkshopReply } from '../types/quote'
import type { PassportVersion } from '../types/spec'

export function QuotesPage() {
  const { request, versions } = useAppState()
  const version = request ? versions.find((v) => v.version === request.passportVersion) : undefined

  if (!request || !version) {
    return (
      <div className={CONTAINER}>
        <EmptyState
          title="No request has been sent yet."
          action={
            <ButtonLink to={versions.length ? '/request' : '/passport'}>
              {versions.length ? 'Make a request' : 'Go to the passport'}
            </ButtonLink>
          }
        >
          Quotes appear here once a request for a locked passport version has gone out to workshops.
        </EmptyState>
      </div>
    )
  }
  return <Comparison request={request} version={version} />
}

/** Reveals the simulated replies one by one the first time, then shows them all. */
function useArrivals(replies: WorkshopReply[], alreadyArrived: boolean, onDone: () => void) {
  const [count, setCount] = useState(alreadyArrived ? replies.length : 0)
  useEffect(() => {
    if (alreadyArrived) return
    const timers = replies.map((r, i) => window.setTimeout(() => setCount((c) => Math.max(c, i + 1)), r.delayMs))
    const done = window.setTimeout(onDone, Math.max(...replies.map((r) => r.delayMs)) + 50)
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(done)
    }
    // `onDone` is left out on purpose: it only flips a flag in the store and must not restart the timers.
  }, [replies, alreadyArrived])
  return count
}

function Comparison({ request, version }: { request: QuoteRequest; version: PassportVersion }) {
  const { repliesArrived, order, spec } = useAppState()
  const dispatch = useDispatch()
  const snapshot = version.snapshot
  const replies = useMemo(() => demoReplies(snapshot, request), [snapshot, request])
  const arrived = useArrivals(replies, repliesArrived, () => dispatch({ type: 'replies/arrived' }))
  const [choosing, setChoosing] = useState<NormalisedQuote | null>(null)

  const visible = replies.slice(0, arrived)
  const complete = arrived === replies.length
  const quotes = visible
    .flatMap((r) => (r.kind === 'quote' ? [normaliseQuote(r.quote, snapshot, request)] : []))
    .sort((a, b) => (complete ? a.normalisedUnit - b.normalisedUnit : 0))
  const questions = visible.flatMap((r) => (r.kind === 'question' ? [r.question] : []))

  const requestSample = (q: NormalisedQuote) => {
    const at = new Date().toISOString()
    dispatch({
      type: 'order/create',
      order: {
        id: `KRV-OR-${request.id.slice(7)}`,
        requestId: request.id,
        workshopId: q.workshop.id,
        passportVersion: request.passportVersion,
        samplePrice: q.quote.samplePrice,
        sampleDays: q.quote.sampleDays,
        stage: 'sample-requested',
        events: [
          {
            at,
            stage: 'sample-requested',
            note: `Sample requested from ${q.workshop.name}; fee ${som(q.quote.samplePrice)} som paid directly.`,
          },
        ],
      },
    })
    setChoosing(null)
  }

  const summary: [string, string][] = [
    ['Request', request.id],
    ['Passport', `v${request.passportVersion} · ${shortHash(request.passportHash)}`],
    ['Units', String(request.total)],
    ['Ready by', formatDate(request.deadline)],
    ['Deliver to', request.city],
    ['Sent', formatDate(request.sentAt)],
  ]

  return (
    <div className={CONTAINER}>
      <PageHeader kicker="05 · Compare quotes" title="Same passport, same basis, side by side.">
        Each quote is brought to a like-for-like unit price: fabric included and delivered to {request.city}. Kervan does not rank
        workshops; it shows what each price contains.
      </PageHeader>

      <dl className="grid grid-cols-2 border-y border-rule sm:grid-cols-3 lg:grid-cols-6">
        {summary.map(([term, value]) => (
          <div key={term} className="border-b border-rule py-3 pr-4 lg:border-b-0">
            <dt className="kicker">{term}</dt>
            <dd className="mt-0.5 font-mono text-[13px]">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="replies-title" className="mt-8">
        <h2 id="replies-title" className="sr-only">
          Replies
        </h2>
        <ul aria-live="polite" className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {replies.map((r, i) => {
            const w = findWorkshop(r.kind === 'quote' ? r.quote.workshopId : r.question.workshopId)
            const status = i >= arrived ? 'Waiting for reply' : r.kind === 'quote' ? 'Quoted' : 'Asked a question'
            return (
              <li key={w.id} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`size-2 rotate-45 ${i >= arrived ? 'animate-pulse border border-rule-2' : r.kind === 'quote' ? 'bg-accent' : 'border border-warn bg-warn-tint'}`}
                />
                <span className="text-ink">{w.name}</span>
                <span className="text-ink-3">{status}</span>
              </li>
            )
          })}
        </ul>
        {!complete && <p className="mt-2 text-sm text-ink-3">Demo: replies are simulated and arrive over a few seconds.</p>}
      </section>

      <section aria-label="Quote comparison" className="mt-10">
        {quotes.length > 0 ? (
          <ComparisonTable
            quotes={quotes}
            total={request.total}
            city={request.city}
            deadline={request.deadline}
            chosenId={order?.requestId === request.id ? order.workshopId : null}
            onRequestSample={setChoosing}
          />
        ) : (
          <p className="border-t border-rule py-10 text-center text-ink-3">
            The request card is with the workshops. Quotes usually come within 48 hours.
          </p>
        )}
      </section>

      {questions.length > 0 && (
        <section aria-label="Questions from workshops" className="mt-16 space-y-8">
          {questions.map((q) => (
            <QuestionCard
              key={q.workshopId}
              question={q}
              answer={spec.clarifications.find((c) => c.workshopId === q.workshopId && c.fieldPath === q.fieldPath)}
              onAnswer={(answer) =>
                dispatch({
                  type: 'question/answer',
                  clarification: {
                    fieldPath: q.fieldPath,
                    question: q.text,
                    answer,
                    workshopId: q.workshopId,
                    answeredAt: new Date().toISOString(),
                  },
                })
              }
            />
          ))}
        </section>
      )}

      {order && order.requestId === request.id && (
        <div className="mt-16">
          <OrderRecord order={order} lot={request.total} />
        </div>
      )}

      <SampleDialog
        quote={choosing}
        version={request.passportVersion}
        hash={request.passportHash}
        onCancel={() => setChoosing(null)}
        onConfirm={requestSample}
      />
    </div>
  )
}
