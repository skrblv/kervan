import { ArrowRight, Check, Copy, Lock, Printer } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { IssueList } from '../components/checks/IssueList'
import { CONTAINER, PageHeader } from '../components/layout/AppShell'
import { PassportSheet } from '../components/passport/PassportSheet'
import { Button, ButtonLink } from '../components/ui/Button'
import { Segmented } from '../components/ui/choices'
import { LANGUAGES } from '../data/glossary'
import { formatDate, formatTime, todayIso } from '../lib/dates'
import { fieldLabel, shortHash, specHash } from '../lib/passport'
import { useAppState, useDispatch, useSpec } from '../state/store'
import type { Lang } from '../types/spec'

function isLang(value: string | null): value is Lang {
  return LANGUAGES.some((l) => l.code === value)
}

export function PassportPage() {
  const { spec, errors, passport } = useSpec()
  const { versions } = useAppState()
  const dispatch = useDispatch()
  const [params, setParams] = useSearchParams()
  const raw = params.get('lang')
  const lang: Lang = isLang(raw) ? raw : 'ru'

  const locked = passport.kind === 'locked' ? passport.current : null
  const draftVersion = passport.kind === 'draft' ? passport.version : (locked?.version ?? 1)

  const lock = () => {
    dispatch({
      type: 'passport/lock',
      version: { version: draftVersion, hash: specHash(spec), lockedAt: new Date().toISOString(), snapshot: spec },
    })
  }

  return (
    <div className={CONTAINER}>
      <div className="print:hidden">
        <PageHeader kicker="03 · Production Passport" title="One specification, read in every workshop’s language.">
          Each field is a glossary code, so switching language re-renders the passport without translating anything. Locking fixes
          the content and gives it a hash that quotes, the sample and the inspection will all refer to.
        </PageHeader>
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="mb-8 print:hidden grid gap-4 border-l-2 border-error bg-sheet px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
        >
          <div>
            <h2 className="font-medium">This draft can’t be locked yet</h2>
            <IssueList issues={errors} compact />
          </div>
          <ButtonLink to={`/spec?step=${errors[0]!.step}`} variant="secondary" size="sm">
            Fix in the specification
          </ButtonLink>
        </div>
      )}

      <div className="z-20 -mx-4 mb-6 sm:sticky sm:top-16 flex flex-wrap items-center justify-between gap-3 border-y border-rule bg-paper px-4 py-3 sm:mx-0 sm:px-0 print:hidden">
        <Segmented
          label="Passport language"
          name="passport-lang"
          value={lang}
          onChange={(code) => setParams({ lang: code }, { replace: true })}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.code.toUpperCase(), title: l.label }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer aria-hidden className="size-4" />
            Print or save PDF
          </Button>
          {locked ? (
            <ButtonLink to="/request" size="sm">
              Request quotes
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          ) : (
            <Button size="sm" onClick={lock} disabled={errors.length > 0}>
              <Lock aria-hidden className="size-4" />
              Lock v{draftVersion}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] xl:gap-14">
        <PassportSheet
          spec={spec}
          lang={lang}
          version={locked?.version ?? draftVersion}
          status={locked ? 'locked' : 'draft'}
          hash={locked?.hash ?? null}
          issued={locked?.lockedAt ?? todayIso()}
        />

        <aside aria-labelledby="record-title" className="space-y-8 print:hidden">
          <section>
            <h2 id="record-title" className="kicker !text-ink">
              Version record
            </h2>
            <div aria-live="polite" className="mt-3 border-t-2 border-ink pt-3 text-sm">
              {locked ? (
                <LockedNote hash={locked.hash} version={locked.version} />
              ) : (
                <>
                  <p className="font-medium">Draft v{draftVersion}</p>
                  {passport.kind === 'draft' && passport.previous ? (
                    <>
                      <p className="mt-1 text-ink-2">Changed since v{passport.previous.version}:</p>
                      <ul className="mt-1.5 space-y-0.5">
                        {passport.changes.map((path) => (
                          <li key={path} className="flex gap-2">
                            <span aria-hidden className="text-ink-3">
                              –
                            </span>
                            {fieldLabel(path)}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-1 text-ink-2">Not locked yet. Lock it to send quote requests against this exact content.</p>
                  )}
                </>
              )}
            </div>
          </section>

          {versions.length > 0 && (
            <section aria-label="Locked versions">
              <ol className="divide-y divide-rule border-y border-rule text-sm">
                {[...versions].reverse().map((v) => (
                  <li key={v.version} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span>
                      <span className="font-medium">v{v.version}</span>{' '}
                      <span className="text-ink-3">
                        {formatDate(v.lockedAt, 'en-GB', false)}, {formatTime(v.lockedAt)}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-ink-3">{shortHash(v.hash)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="text-sm text-ink-3">
            <p>
              After the founder approves the workshop’s sample, that version becomes the production reference. Later changes start
              a new version and need a new sample.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function LockedNote({ hash, version }: { hash: string; version: number }) {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied('done')
    } catch {
      setCopied('failed')
    }
  }
  return (
    <>
      <p className="flex items-center gap-2 font-medium">
        <Check aria-hidden className="size-4 text-accent" />
        Locked v{version}
      </p>
      <p className="mt-2 font-mono text-xs leading-relaxed break-all text-ink-2">{hash}</p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink"
      >
        <Copy aria-hidden className="size-3.5" />
        {copied === 'done' ? 'Copied' : copied === 'failed' ? 'Copy not available here' : 'Copy hash'}
      </button>
    </>
  )
}
