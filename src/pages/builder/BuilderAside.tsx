import { ArrowRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { IssueList, issueSummary } from '../../components/checks/IssueList'
import { GarmentFlat } from '../../components/garment/GarmentFlat'
import type { View } from '../../components/garment/geometry'
import { Segmented } from '../../components/ui/choices'
import { COLOURS } from '../../data/catalog'
import { basisFor, estimateAt } from '../../lib/estimate'
import { som } from '../../lib/format'
import type { BuilderStepId, ColourCode, Issue, Spec } from '../../types/spec'

export function DrawingPanel({ spec }: { spec: Spec }) {
  const artOnBack = spec.decoration.method !== 'DEC-NONE' && spec.decoration.placement === 'POS-BACK-CENTER'
  const [view, setView] = useState<View>(artOnBack ? 'back' : 'front')
  const [colour, setColour] = useState<ColourCode | undefined>(spec.colours[0])

  // Follow the artwork: show the side it is printed on when the placement changes.
  useEffect(() => {
    setView(artOnBack ? 'back' : 'front')
  }, [artOnBack])

  const shown = colour && spec.colours.includes(colour) ? colour : spec.colours[0]
  const centred = spec.decoration.method !== 'DEC-NONE' && spec.decoration.placement !== 'POS-LEFT-CHEST'

  return (
    <section aria-label="Technical drawing" className="border border-rule-2 bg-sheet">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-3 py-2">
        <Segmented
          label="Drawing side"
          hideLabel
          name="drawing-view"
          value={view}
          onChange={setView}
          options={[
            { value: 'front', label: 'Front' },
            { value: 'back', label: 'Back' },
          ]}
        />
        {spec.colours.length > 1 ? (
          <fieldset className="flex items-center gap-1.5">
            <legend className="sr-only">Colour shown</legend>
            {spec.colours.map((c) => (
              <label key={c} title={COLOURS[c].name} className="cursor-pointer">
                <input
                  type="radio"
                  name="drawing-colour"
                  className="peer sr-only"
                  checked={shown === c}
                  onChange={() => setColour(c)}
                />
                <span className="sr-only">{COLOURS[c].name}</span>
                <span
                  aria-hidden
                  className="block size-5 border border-ink/20 ring-offset-1 ring-offset-sheet peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-accent"
                  style={{ backgroundColor: COLOURS[c].hex }}
                />
              </label>
            ))}
          </fieldset>
        ) : (
          <span className="text-sm text-ink-3">{shown ? COLOURS[shown].name : 'No colour'}</span>
        )}
      </div>
      <GarmentFlat
        spec={spec}
        view={view}
        colour={shown}
        guides
        grid
        label={`${view === 'front' ? 'Front' : 'Back'} view of the ${spec.garment === 'GAR-HOODIE' ? 'hoodie' : 'sweatshirt'} in size ${spec.sizes.base}`}
        className="block w-full"
      />
      <p className="border-t border-rule px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-3">
        Size {spec.sizes.base} to scale · grid 5 cm{centred ? ` · dashed: widest artwork on size ${spec.sizes.from}` : ''}
      </p>
    </section>
  )
}

export function ChecksPanel({ issues, onGoto }: { issues: Issue[]; onGoto: (step: BuilderStepId) => void }) {
  return (
    <section aria-labelledby="checks-title" className="border-t-2 border-ink pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="checks-title" className="kicker !text-ink">
          Checks
        </h2>
        <p className="text-xs text-ink-3">{issueSummary(issues)}</p>
      </div>
      <div aria-live="polite">
        {issues.length > 0 ? (
          <IssueList issues={issues} onGoto={onGoto} />
        ) : (
          <p className="flex items-start gap-2 py-3 text-sm text-ink-2">
            <Check aria-hidden className="mt-0.5 size-4 text-accent" />
            Every rule passes. The passport can be generated.
          </p>
        )}
      </div>
    </section>
  )
}

export function EstimateMini({ spec }: { spec: Spec }) {
  const q = spec.plannedQuantity
  const valid = Number.isFinite(q) && q >= 10 && q <= 1000
  const { provisional } = basisFor(spec)
  const e = valid ? estimateAt(spec, q) : null

  return (
    <section aria-labelledby="mini-estimate" className="border-t border-rule pt-3">
      <h2 id="mini-estimate" className="kicker">
        Estimate at {valid ? q : '—'} units
      </h2>
      {e ? (
        <>
          <p className="mt-1.5 text-[28px] leading-none font-medium tracking-[-0.01em]">
            {e.point !== null ? (
              <>
                {som(e.point)} <span className="text-sm font-normal text-ink-3">som / unit</span>
              </>
            ) : (
              <>
                {som(e.low)}–{som(e.high)} <span className="text-sm font-normal text-ink-3">som</span>
              </>
            )}
          </p>
          <p className="mt-1.5 font-mono text-xs text-ink-3">
            {e.point !== null ? `Range ${som(e.low)}–${som(e.high)}` : 'Provisional: range only'}
            {provisional ? ' · few quotes yet' : ''}
          </p>
        </>
      ) : (
        <p className="mt-1.5 text-sm text-ink-3">Set a planned quantity between 10 and 1,000 to see an estimate.</p>
      )}
      <Link
        to="/estimate"
        className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
      >
        Batch curve and breakdown <ArrowRight aria-hidden className="size-3.5" />
      </Link>
    </section>
  )
}
