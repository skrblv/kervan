import { SelectInput } from '../../components/ui/fields'
import { MeasurementTable } from '../../components/passport/MeasurementTable'
import { POM_TERMS } from '../../data/glossary'
import { measurementTable, sizeIndex, sizesInRange } from '../../lib/grading'
import { SIZES, type SizeCode } from '../../types/spec'
import { FieldGroup, type StepProps } from './shared'

const sizeOptions = SIZES.map((s) => ({ value: s, label: s }))

export function SizesStep({ spec, update }: StepProps) {
  const { from, to, base } = spec.sizes
  const ordered = sizeIndex(from) <= sizeIndex(to)
  const inRange = ordered ? sizesInRange(spec.sizes) : []

  const setRange = (next: Partial<typeof spec.sizes>) =>
    update((s) => {
      const sizes = { ...s.sizes, ...next }
      // Keep the base size inside the range when the range moves past it.
      if (sizeIndex(sizes.from) <= sizeIndex(sizes.to)) {
        if (sizeIndex(sizes.base) < sizeIndex(sizes.from)) sizes.base = sizes.from
        if (sizeIndex(sizes.base) > sizeIndex(sizes.to)) sizes.base = sizes.to
      }
      return { ...s, sizes }
    })

  return (
    <FieldGroup>
      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <SelectInput
          id="size-from"
          label="From"
          value={from}
          options={sizeOptions}
          onChange={(e) => setRange({ from: e.target.value as SizeCode })}
          error={ordered ? null : 'Before “To”'}
        />
        <SelectInput
          id="size-to"
          label="To"
          value={to}
          options={sizeOptions}
          onChange={(e) => setRange({ to: e.target.value as SizeCode })}
        />
        <SelectInput
          id="size-base"
          label="Base size"
          value={base}
          options={(inRange.length ? inRange : SIZES).map((s) => ({ value: s, label: s }))}
          onChange={(e) => setRange({ base: e.target.value as SizeCode })}
        />
      </div>

      <div aria-hidden className="flex max-w-md">
        {SIZES.map((size) => {
          const active = inRange.includes(size)
          return (
            <div key={size} className="flex-1">
              <div className={`h-2 ${active ? 'bg-ink' : 'bg-rule'} ${size === from ? 'ml-px' : ''}`} />
              <div
                className={`mt-1.5 flex items-center justify-center gap-1 font-mono text-xs ${active ? 'text-ink' : 'text-ink-3'}`}
              >
                {size === base && <span className="size-1.5 rotate-45 bg-accent" />}
                {size}
              </div>
            </div>
          )
        })}
      </div>

      {inRange.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-medium">Graded measurements, cm</h3>
          <p className="mb-3 text-sm text-ink-3">
            Generated from size {base}. Workshops check the sample against these figures and tolerances.
          </p>
          <div className="overflow-x-auto">
            <MeasurementTable
              rows={measurementTable(spec)}
              base={base}
              caption={`Graded measurements in centimetres for sizes ${from} to ${to}`}
              pomLabel={(pom) => POM_TERMS[pom].en}
              headers={{ pom: 'Point of measure', tolerance: 'Tol. ±' }}
              dense
            />
          </div>
        </div>
      )}
    </FieldGroup>
  )
}
