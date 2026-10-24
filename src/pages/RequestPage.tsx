import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { CONTAINER, EmptyState, PageHeader } from '../components/layout/AppShell'
import { distribute, matrixTotal, SizeMatrix } from '../components/request/SizeMatrix'
import { RequestCard } from '../components/request/RequestCard'
import { Button, ButtonLink } from '../components/ui/Button'
import { Segmented } from '../components/ui/choices'
import { SelectInput, TextArea, TextInput } from '../components/ui/fields'
import { addDays, daysBetween, formatDate, todayIso } from '../lib/dates'
import { costAt, unitParams } from '../lib/estimate'
import { som } from '../lib/format'
import { sizesInRange } from '../lib/grading'
import { passportId } from '../lib/passport'
import { useAppState, useDispatch, useSpec } from '../state/store'
import type { DeliveryCity, QuantityMatrix } from '../types/quote'
import type { Spec } from '../types/spec'

const CITIES: { value: DeliveryCity; label: string }[] = [
  { value: 'Bishkek', label: 'Bishkek, Kyrgyzstan' },
  { value: 'Osh', label: 'Osh, Kyrgyzstan' },
  { value: 'Almaty', label: 'Almaty, Kazakhstan' },
  { value: 'Astana', label: 'Astana, Kazakhstan' },
]
const MIN_TOTAL = 10
const MIN_DAYS = 14
const COMFORTABLE_DAYS = 28
const NOTE_LIMIT = 280

/** Workshop processes a request needs; used by the team to shortlist workshops. */
function requiredProcesses(spec: Spec): string[] {
  const processes = ['Cutting', 'Overlock', 'Coverstitch']
  if (spec.seams === 'SEAM-FLAT') processes.push('Flatlock')
  const method = spec.decoration.method
  if (method === 'DEC-DTF') processes.push('DTF printing')
  if (method === 'DEC-SCREEN') processes.push('Screen printing')
  if (method === 'DEC-EMB') processes.push('Embroidery')
  return processes
}

export function RequestPage() {
  const { versions, request } = useAppState()
  const { passport } = useSpec()
  const latest = versions[versions.length - 1]

  if (!latest) {
    return (
      <div className={CONTAINER}>
        <EmptyState title="Lock a passport version first." action={<ButtonLink to="/passport">Go to the passport</ButtonLink>}>
          Workshops quote against a fixed, hashed specification, so a request can only be made from a locked passport version.
        </EmptyState>
      </div>
    )
  }

  return (
    <RequestForm
      key={latest.version}
      snapshot={latest.snapshot}
      version={latest.version}
      hash={latest.hash}
      unlockedChanges={passport.kind === 'draft' ? passport.changes.length : 0}
      previousRequest={request ? { id: request.id, sentAt: request.sentAt, version: request.passportVersion } : null}
    />
  )
}

interface RequestFormProps {
  snapshot: Spec
  version: number
  hash: string
  unlockedChanges: number
  previousRequest: { id: string; sentAt: string; version: number } | null
}

interface Errors {
  matrix?: string
  deadline?: string
  city?: string
  note?: string
}

function RequestForm({ snapshot, version, hash, unlockedChanges, previousRequest }: RequestFormProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sizes = sizesInRange(snapshot.sizes)
  const [matrix, setMatrix] = useState<QuantityMatrix>(() => distribute(snapshot.plannedQuantity, snapshot.colours, sizes))
  const [deadline, setDeadline] = useState(() => addDays(todayIso(), 35))
  const [city, setCity] = useState<DeliveryCity | ''>('Bishkek')
  const [cardLang, setCardLang] = useState<'ru' | 'ky'>('ru')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const summary = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const total = matrixTotal(matrix)
  const days = deadline ? daysBetween(todayIso(), deadline) : 0
  const unit = costAt(unitParams(snapshot), Math.max(MIN_TOTAL, total)).total
  const label = `${passportId(snapshot)}_v${version}`

  const validate = (): Errors => {
    const next: Errors = {}
    if (total < MIN_TOTAL) next.matrix = `Enter at least ${MIN_TOTAL} units across sizes and colours.`
    if (!deadline) next.deadline = 'Choose a date the batch should be ready by.'
    else if (days < MIN_DAYS) next.deadline = `At least ${MIN_DAYS} days are needed for a sample and production.`
    if (!city) next.city = 'Choose where the batch goes.'
    if (note.length > NOTE_LIMIT) next.note = `Keep the note under ${NOTE_LIMIT} characters.`
    return next
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summary.current?.focus())
      return
    }
    setSending(true)
    // Stands in for the team shortlisting workshops and the bot sending cards.
    timer.current = window.setTimeout(() => {
      const sentAt = todayIso()
      dispatch({
        type: 'request/send',
        request: {
          id: `KRV-RQ-${sentAt.slice(2).replace(/-/g, '')}-${version}`,
          passportVersion: version,
          passportHash: hash,
          matrix,
          total,
          deadline,
          city: city as DeliveryCity,
          cardLang,
          note: note.trim(),
          sentAt,
        },
      })
      navigate('/quotes')
    }, 1100)
  }

  const errorList = Object.values(errors).filter(Boolean)

  return (
    <div className={CONTAINER}>
      <PageHeader kicker="04 · Request quotes" title="Ask verified workshops to price this exact passport.">
        Quantities by size and colour, a date and a city. Kervan shortlists workshops that can make it and sends each one the same
        structured card.
      </PageHeader>

      <div className="space-y-3">
        {unlockedChanges > 0 && (
          <p className="border-l-2 border-warn bg-sheet px-4 py-3 text-sm text-ink-2">
            This request uses locked <strong className="font-medium">v{version}</strong>. Your specification has {unlockedChanges}{' '}
            unlocked {unlockedChanges === 1 ? 'change' : 'changes'};{' '}
            <Link to="/passport" className="text-ink underline underline-offset-4">
              lock v{version + 1}
            </Link>{' '}
            to include {unlockedChanges === 1 ? 'it' : 'them'}.
          </p>
        )}
        {previousRequest && (
          <p className="border-l-2 border-accent bg-sheet px-4 py-3 text-sm text-ink-2">
            Request {previousRequest.id} for v{previousRequest.version} was sent on {formatDate(previousRequest.sentAt)}.{' '}
            <Link to="/quotes" className="text-ink underline underline-offset-4">
              See its quotes
            </Link>
            . Sending again replaces it.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-12 border-t border-rule pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] xl:gap-16">
        <form onSubmit={submit} noValidate className="min-w-0 space-y-10">
          <div ref={summary} tabIndex={-1} aria-live="assertive" className="empty:hidden focus:outline-none">
            {errorList.length > 0 && (
              <div className="border-l-2 border-error bg-sheet px-4 py-3 text-sm">
                <p className="font-medium text-error">
                  Check {errorList.length === 1 ? 'one field' : `${errorList.length} fields`} before sending:
                </p>
                <ul className="mt-1 list-disc pl-5 text-ink-2">
                  {errorList.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Quantities</legend>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p id="matrix-hint" className="text-sm text-ink-3">
                Pre-filled from your planned {snapshot.plannedQuantity} with a typical size curve. Adjust freely.
              </p>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setMatrix(distribute(snapshot.plannedQuantity, snapshot.colours, sizes))}
              >
                Reset to {snapshot.plannedQuantity}
              </Button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <SizeMatrix
                colours={snapshot.colours}
                sizes={sizes}
                matrix={matrix}
                onChange={setMatrix}
                invalid={!!errors.matrix}
                describedBy={errors.matrix ? 'matrix-error' : 'matrix-hint'}
              />
            </div>
            {errors.matrix && (
              <p id="matrix-error" className="mt-2 text-sm text-error">
                {errors.matrix}
              </p>
            )}
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextInput
              id="deadline"
              type="date"
              label="Ready by"
              value={deadline}
              min={addDays(todayIso(), MIN_DAYS)}
              onChange={(e) => setDeadline(e.target.value)}
              error={errors.deadline}
              hint={
                deadline && days >= MIN_DAYS && days < COMFORTABLE_DAYS
                  ? `Tight: ${days} days. Sample, approval and production usually take about four weeks.`
                  : 'Includes the sample, your approval and production.'
              }
            />
            <SelectInput
              id="city"
              label="Deliver to"
              value={city}
              onChange={(e) => setCity(e.target.value as DeliveryCity)}
              options={CITIES}
              error={errors.city}
              hint={
                city === 'Almaty' || city === 'Astana'
                  ? 'Inside the EAEU: no customs between Kyrgyzstan and Kazakhstan.'
                  : undefined
              }
            />
          </div>

          <TextArea
            id="note"
            label="Note to workshops"
            optional
            maxLength={NOTE_LIMIT + 40}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            error={errors.note}
            hint={`${note.length}/${NOTE_LIMIT}. Sent as written and not translated, so keep specification details in the passport.`}
          />

          <div className="border-t-2 border-ink pt-5">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink-3">Units</dt>
                <dd className="mt-0.5 text-lg font-medium tabular-nums">{total}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Kervan estimate</dt>
                <dd className="mt-0.5 text-lg font-medium tabular-nums">
                  {som(unit)} <span className="text-sm font-normal text-ink-3">som / unit</span>
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-ink-3">Shortlist needs</dt>
                <dd className="mt-0.5 leading-snug">{requiredProcesses(snapshot).join(', ')}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm text-ink-3">
                In the pilot, the Kervan team confirms 3–5 verified workshops and the bot sends them this card. Here the replies
                are simulated.
              </p>
              <Button type="submit" loading={sending}>
                {sending ? 'Sending to workshops' : 'Send request'}
                {!sending && <ArrowRight aria-hidden className="size-4" />}
              </Button>
            </div>
          </div>
        </form>

        <aside aria-labelledby="card-title" className="min-w-0">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 id="card-title" className="kicker !text-ink">
                What workshops receive
              </h2>
              <Segmented
                label="Card language"
                hideLabel
                name="card-lang"
                value={cardLang}
                onChange={setCardLang}
                options={[
                  { value: 'ru', label: 'RU', title: 'Русский' },
                  { value: 'ky', label: 'KY', title: 'Кыргызча' },
                ]}
              />
            </div>
            <div className="mt-3 border border-rule-2">
              <RequestCard
                spec={snapshot}
                passportLabel={label}
                hash={hash}
                lang={cardLang}
                matrix={matrix}
                sizes={sizes}
                total={total}
                deadline={deadline}
                city={city}
                note={note}
              />
            </div>
            <p className="mt-3 text-sm text-ink-3">
              Workshops reply in short fields: unit price, fabric included or not, sample price and days, production days, minimum
              quantity and validity. A question is tied to one passport field.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
