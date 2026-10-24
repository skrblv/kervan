import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, type ComponentType } from 'react'
import { useSearchParams } from 'react-router'
import { CONTAINER } from '../../components/layout/AppShell'
import { Button, ButtonLink } from '../../components/ui/Button'
import { passportId } from '../../lib/passport'
import { useSpec } from '../../state/store'
import type { BuilderStepId, Issue } from '../../types/spec'
import { ChecksPanel, DrawingPanel, EstimateMini } from './BuilderAside'
import { ConstructionStep } from './ConstructionStep'
import { DecorationStep } from './DecorationStep'
import { FabricStep } from './FabricStep'
import { GarmentStep } from './GarmentStep'
import { LabelsStep } from './LabelsStep'
import { STEPS, StepIssues, type StepProps } from './shared'
import { SizesStep } from './SizesStep'

const STEP_COMPONENTS: Record<BuilderStepId, ComponentType<StepProps>> = {
  garment: GarmentStep,
  fabric: FabricStep,
  construction: ConstructionStep,
  sizes: SizesStep,
  decoration: DecorationStep,
  labels: LabelsStep,
}

function isStep(value: string | null): value is BuilderStepId {
  return STEPS.some((s) => s.id === value)
}

export function BuilderPage() {
  const { spec, issues, passport, update } = useSpec()
  const [params, setParams] = useSearchParams()
  const raw = params.get('step')
  const stepId: BuilderStepId = isStep(raw) ? raw : 'garment'
  const index = STEPS.findIndex((s) => s.id === stepId)
  const step = STEPS[index]!
  const StepFields = STEP_COMPONENTS[stepId]

  const heading = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    // Move focus to the new step for keyboard and screen-reader users, and bring it into view.
    heading.current?.focus({ preventScroll: true })
    const top = heading.current?.getBoundingClientRect().top ?? 0
    if (top < 80) window.scrollTo({ top: window.scrollY + top - 120 })
  }, [stepId])

  const goto = (id: BuilderStepId) => setParams({ step: id })
  const prev = STEPS[index - 1]
  const next = STEPS[index + 1]
  const status =
    passport.kind === 'locked'
      ? `Matches locked v${passport.current.version}`
      : `Draft${passport.kind === 'draft' ? ` v${passport.version}` : ''}`

  return (
    <div className={CONTAINER}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-rule pt-8 pb-5 md:pt-10">
        <div>
          <p className="kicker">01 · Specify</p>
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.01em] sm:text-[36px]">
            {spec.styleName.trim() || <span className="text-ink-3">Untitled style</span>}
          </h1>
        </div>
        <p className="font-mono text-xs text-ink-3">
          {passportId(spec)} · {status}
        </p>
      </div>

      <div className="grid gap-8 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:grid-cols-[11.5rem_minmax(0,1fr)_minmax(0,22rem)] lg:gap-10 xl:grid-cols-[12.5rem_minmax(0,1fr)_minmax(0,27rem)] xl:gap-12">
        <StepNav current={stepId} issues={issues} onSelect={goto} />

        <div className="mx-auto w-full max-w-md md:hidden">
          <DrawingPanel spec={spec} />
        </div>

        <section aria-labelledby="step-title" className="min-w-0">
          <p className="kicker">
            Step {index + 1} of {STEPS.length}
          </p>
          <h2
            id="step-title"
            ref={heading}
            tabIndex={-1}
            className="mt-2 font-display text-[28px] leading-tight focus:outline-none"
          >
            {step.title}
          </h2>
          <p className="mt-1.5 text-ink-2">{step.description}</p>

          <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
            <StepFields spec={spec} update={update} />
            <StepIssues issues={issues.filter((i) => i.step === stepId)} />
          </form>

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-rule pt-6">
            {prev ? (
              <Button variant="secondary" onClick={() => goto(prev.id)}>
                <ArrowLeft aria-hidden className="size-4" />
                <span className="hidden sm:inline">{prev.label}</span>
                <span className="sm:hidden">Back</span>
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button onClick={() => goto(next.id)}>
                Next: {next.label}
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            ) : (
              <ButtonLink to="/estimate">
                Review the estimate
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            )}
          </div>
        </section>

        <aside aria-label="Drawing, checks and estimate" className="min-w-0">
          <div className="space-y-6 md:sticky md:top-24">
            <div className="hidden md:block">
              <DrawingPanel spec={spec} />
            </div>
            <ChecksPanel issues={issues} onGoto={goto} />
            <EstimateMini spec={spec} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function StepNav({
  current,
  issues,
  onSelect,
}: {
  current: BuilderStepId
  issues: Issue[]
  onSelect: (id: BuilderStepId) => void
}) {
  const nav = useRef<HTMLElement>(null)
  // On phones the steps scroll sideways; keep the current one visible.
  useEffect(() => {
    const active = nav.current?.querySelector<HTMLElement>('[aria-current="step"]')
    if (nav.current && active) nav.current.scrollLeft = active.offsetLeft - 16
  }, [current])
  return (
    <nav
      ref={nav}
      aria-label="Specification steps"
      className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 md:col-span-2 lg:col-span-1"
    >
      <ol className="flex min-w-max gap-1 border-b border-rule lg:min-w-0 lg:flex-col lg:gap-0 lg:border-t lg:border-b-0">
        {STEPS.map((s, i) => {
          const own = issues.filter((x) => x.step === s.id)
          const errors = own.filter((x) => x.severity === 'error').length
          const active = s.id === current
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={active ? 'step' : undefined}
                className={`relative flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm whitespace-nowrap lg:border-b lg:border-rule lg:px-0 lg:pl-3 ${
                  active ? 'font-medium text-ink' : 'text-ink-2 hover:text-ink'
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-accent lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-0.5"
                  />
                )}
                <span className="font-mono text-[11px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{s.label}</span>
                {own.length > 0 && (
                  <>
                    <span aria-hidden className={`size-2 rotate-45 ${errors ? 'bg-error' : 'border border-warn bg-warn-tint'}`} />
                    <span className="sr-only">
                      ({errors ? `${errors} error${errors > 1 ? 's' : ''}` : `${own.length} warning${own.length > 1 ? 's' : ''}`})
                    </span>
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
