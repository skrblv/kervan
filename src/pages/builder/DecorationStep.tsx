import { ChoiceList } from '../../components/ui/choices'
import { NumberInput } from '../../components/ui/fields'
import { DECORATION_METHODS, PLACEMENTS } from '../../data/catalog'
import type { Decoration } from '../../types/spec'
import { FieldGroup, OptionMeta, type StepProps } from './shared'

/** Sensible artwork defaults per placement, applied when the placement changes. */
const PLACEMENT_DEFAULTS: Record<Decoration['placement'], Pick<Decoration, 'widthCm' | 'heightCm' | 'offsetCm'>> = {
  'POS-FRONT-CENTER': { widthCm: 28, heightCm: 20, offsetCm: 8 },
  'POS-LEFT-CHEST': { widthCm: 9, heightCm: 9, offsetCm: 10 },
  'POS-BACK-CENTER': { widthCm: 30, heightCm: 36, offsetCm: 10 },
}

export function DecorationStep({ spec, update }: StepProps) {
  const d = spec.decoration
  const set = (patch: Partial<Decoration>) => update((s) => ({ ...s, decoration: { ...s.decoration, ...patch } }))

  return (
    <FieldGroup>
      <ChoiceList
        legend="Method"
        name="decoration-method"
        value={d.method}
        onChange={(method) => set({ method })}
        options={DECORATION_METHODS.map((o) => ({
          value: o.code,
          title: o.name,
          description: o.description,
          meta: (
            <OptionMeta
              spec={spec}
              next={{ ...spec, decoration: { ...d, method: o.code } }}
              code={o.code}
              selected={d.method === o.code}
            />
          ),
        }))}
      />

      {d.method !== 'DEC-NONE' && (
        <>
          <ChoiceList
            legend="Placement"
            name="decoration-placement"
            value={d.placement}
            onChange={(placement) => set({ placement, ...PLACEMENT_DEFAULTS[placement] })}
            options={PLACEMENTS.map((o) => ({ value: o.code, title: o.name, description: o.description, meta: o.code }))}
          />

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-ink">Artwork size and position</legend>
            <p className="mb-3 text-sm text-ink-3">
              The drawing shows the artwork to scale on size {spec.sizes.base}; the dashed lines mark the widest artwork size{' '}
              {spec.sizes.from} allows.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberInput
                id="art-width"
                label="Width"
                unit="cm"
                value={d.widthCm}
                min={2}
                max={50}
                onChange={(widthCm) => set({ widthCm })}
              />
              <NumberInput
                id="art-height"
                label="Height"
                unit="cm"
                value={d.heightCm}
                min={2}
                max={50}
                onChange={(heightCm) => set({ heightCm })}
              />
              <NumberInput
                id="art-offset"
                label="Below neckline"
                unit="cm"
                value={d.offsetCm}
                min={0}
                max={30}
                onChange={(offsetCm) => set({ offsetCm })}
              />
            </div>
          </fieldset>

          {d.method === 'DEC-SCREEN' && (
            <NumberInput
              id="ink-colours"
              label="Ink colours"
              value={d.inkColours}
              min={1}
              max={6}
              onChange={(inkColours) => set({ inkColours })}
              hint="Each colour needs its own screen."
              className="max-w-xs"
            />
          )}

          <p className="text-sm text-ink-3">
            Artwork files are not uploaded here. In the pilot they travel with the request card to the workshops.
          </p>
        </>
      )}
    </FieldGroup>
  )
}
