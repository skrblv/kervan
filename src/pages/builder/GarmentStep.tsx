import { useState } from 'react'
import { GarmentFlat } from '../../components/garment/GarmentFlat'
import { ChoiceList } from '../../components/ui/choices'
import { NumberInput, TextInput } from '../../components/ui/fields'
import { FITS, GARMENTS } from '../../data/catalog'
import { FieldGroup, OptionMeta, type StepProps } from './shared'

export function GarmentStep({ spec, update }: StepProps) {
  const [nameTouched, setNameTouched] = useState(false)
  const nameMissing = spec.styleName.trim() === ''
  return (
    <FieldGroup>
      <TextInput
        id="style-name"
        label="Style name"
        placeholder="e.g. Core Hoodie FW26"
        value={spec.styleName}
        maxLength={60}
        required
        autoComplete="off"
        onChange={(e) => update((s) => ({ ...s, styleName: e.target.value }))}
        onBlur={() => setNameTouched(true)}
        hint="Workshops see it on the request card."
        error={nameTouched && nameMissing ? 'Give the style a name to generate a passport.' : null}
      />

      <fieldset>
        <legend className="mb-2.5 text-sm font-medium text-ink">Garment</legend>
        <div className="grid grid-cols-2 gap-3">
          {GARMENTS.map((g) => {
            const preview = { ...spec, garment: g.code, decoration: { ...spec.decoration, method: 'DEC-NONE' as const } }
            return (
              <label
                key={g.code}
                className="relative flex cursor-pointer flex-col border border-rule bg-sheet/60 p-3 hover:border-ink-2 has-checked:border-ink has-checked:bg-sheet has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-accent"
              >
                <input
                  type="radio"
                  name="garment"
                  value={g.code}
                  checked={spec.garment === g.code}
                  onChange={() => update((s) => ({ ...s, garment: g.code }))}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="absolute top-3 right-3 size-2.5 rotate-45 border border-field peer-checked:border-accent peer-checked:bg-accent"
                />
                <GarmentFlat spec={preview} view="front" label="" className="mx-auto h-28 w-auto sm:h-32" />
                <span className="mt-2 font-medium">{g.name}</span>
                <span className="text-sm leading-snug text-ink-3">{g.description}</span>
                <span className="mt-2 font-mono text-xs text-ink-3">{g.code}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <ChoiceList
        legend="Fit"
        name="fit"
        value={spec.fit}
        onChange={(fit) => update((s) => ({ ...s, fit }))}
        options={FITS.map((f) => ({
          value: f.code,
          title: f.name,
          description: f.description,
          meta: <OptionMeta spec={spec} next={{ ...spec, fit: f.code }} code={f.code} selected={spec.fit === f.code} />,
        }))}
      />

      <NumberInput
        id="planned-quantity"
        label="Planned quantity"
        value={spec.plannedQuantity}
        onChange={(plannedQuantity) => update((s) => ({ ...s, plannedQuantity }))}
        min={10}
        max={1000}
        step={10}
        unit="pcs"
        hint="A rough figure for the estimate and the rules. You set exact sizes and colours in the quote request."
        className="max-w-xs"
      />
    </FieldGroup>
  )
}
