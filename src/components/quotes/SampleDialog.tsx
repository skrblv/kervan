import { useEffect, useRef, useState } from 'react'
import { addWorkingDays, formatDate, todayIso } from '../../lib/dates'
import { som } from '../../lib/format'
import { shortHash } from '../../lib/passport'
import type { NormalisedQuote } from '../../types/quote'
import { Button } from '../ui/Button'

interface SampleDialogProps {
  quote: NormalisedQuote | null
  version: number
  hash: string
  onCancel: () => void
  onConfirm: (quote: NormalisedQuote) => void
}

/** Confirms a sample request. Native <dialog> gives focus trapping and Escape handling. */
export function SampleDialog({ quote, version, hash, onCancel, onConfirm }: SampleDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (quote && !dialog.open) {
      setBusy(false)
      dialog.showModal()
    }
    if (!quote && dialog.open) dialog.close()
  }, [quote])

  const confirm = () => {
    if (!quote) return
    setBusy(true)
    window.setTimeout(() => onConfirm(quote), 700)
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="sample-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] border border-rule-2 bg-sheet p-0 text-ink backdrop:bg-ink/40"
    >
      {quote && (
        <>
          <div className="p-6">
            <p className="kicker">Request a sample</p>
            <h2 id="sample-title" className="mt-2 font-display text-2xl">
              {quote.workshop.name}
            </h2>
            <dl className="mt-5 divide-y divide-rule border-y border-rule text-sm">
              <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 py-2.5">
                <dt className="text-ink-3">Sample fee</dt>
                <dd>
                  <span className="font-medium">{som(quote.quote.samplePrice)} som</span>, paid directly to the workshop. It does
                  not go through Kervan.
                </dd>
              </div>
              <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 py-2.5">
                <dt className="text-ink-3">Ready</dt>
                <dd>
                  In {quote.quote.sampleDays} working days, around{' '}
                  {formatDate(addWorkingDays(todayIso(), quote.quote.sampleDays))}
                </dd>
              </div>
              <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 py-2.5">
                <dt className="text-ink-3">Made to</dt>
                <dd>
                  Passport v{version} <span className="font-mono text-xs text-ink-3">{shortHash(hash)}</span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-ink-2">
              When you approve the sample, v{version} becomes the reference for the whole batch. You can comment field by field;
              up to two revision rounds are usual.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t border-rule bg-paper px-6 py-4">
            <Button variant="secondary" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={confirm} loading={busy}>
              Request sample
            </Button>
          </div>
        </>
      )}
    </dialog>
  )
}
