import { ChoiceList } from '../../components/ui/choices'
import { COLOURS, FABRICS, findFabric } from '../../data/catalog'
import type { ColourCode } from '../../types/spec'
import { FieldGroup, OptionMeta, type StepProps } from './shared'

const MAX_COLOURS = 3

export function FabricStep({ spec, update }: StepProps) {
  const fabric = findFabric(spec.fabric)
  const toggle = (code: ColourCode) =>
    update((s) => ({
      ...s,
      colours: s.colours.includes(code) ? s.colours.filter((c) => c !== code) : [...s.colours, code],
    }))

  return (
    <FieldGroup>
      <ChoiceList
        legend="Fabric"
        name="fabric"
        value={spec.fabric}
        onChange={(code) => update((s) => ({ ...s, fabric: code }))}
        options={FABRICS.map((f) => ({
          value: f.code,
          title: (
            <>
              {f.name} <span className="font-mono text-sm font-normal text-ink-2">{f.gsm} g/m²</span>
            </>
          ),
          description: `${f.cotton}% cotton${f.polyester ? `, ${f.polyester}% polyester` : ''}. ${f.note}`,
          meta: <OptionMeta spec={spec} next={{ ...spec, fabric: f.code }} code={f.code} selected={spec.fabric === f.code} />,
        }))}
      />

      <fieldset>
        <legend className="mb-1 flex w-full items-baseline justify-between text-sm font-medium text-ink">
          <span>Colours</span>
        </legend>
        <p className="mb-3 text-sm text-ink-3">
          Up to {MAX_COLOURS} colourways per style. {spec.colours.length} of {MAX_COLOURS} chosen.
        </p>
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-6">
          {Object.values(COLOURS).map((c) => {
            const stocked = fabric.colours.includes(c.code)
            const checked = spec.colours.includes(c.code)
            const full = !checked && spec.colours.length >= MAX_COLOURS
            return (
              <label
                key={c.code}
                className={`group flex flex-col gap-1.5 ${!checked && (!stocked || full) ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && (!stocked || full)}
                  onChange={() => toggle(c.code)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="relative block aspect-square w-full border border-ink/15 ring-offset-2 ring-offset-paper peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-sm leading-tight">{c.name}</span>
                <span className="font-mono text-[11px] text-ink-3">{stocked ? c.code : 'Not stocked'}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </FieldGroup>
  )
}
