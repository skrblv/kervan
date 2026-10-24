import { CheckChips, ChoiceList } from '../../components/ui/choices'
import { NECK_LABELS, PACKING } from '../../data/catalog'
import { LANGUAGES } from '../../data/glossary'
import { FieldGroup, OptionMeta, type StepProps } from './shared'

export function LabelsStep({ spec, update }: StepProps) {
  return (
    <FieldGroup>
      <ChoiceList
        legend="Neck label"
        name="neck-label"
        value={spec.labels.neck}
        onChange={(neck) => update((s) => ({ ...s, labels: { ...s.labels, neck } }))}
        options={NECK_LABELS.map((o) => ({
          value: o.code,
          title: o.name,
          description: o.description,
          meta: (
            <OptionMeta
              spec={spec}
              next={{ ...spec, labels: { ...spec.labels, neck: o.code } }}
              code={o.code}
              selected={spec.labels.neck === o.code}
            />
          ),
        }))}
      />

      <CheckChips
        legend="Care label languages"
        hint="Composition and care instructions. EAEU rules require Russian; add the language of each country you sell in."
        options={LANGUAGES.map((l) => ({
          value: l.code,
          label: (
            <>
              <span className="font-mono text-xs text-ink-3 uppercase">{l.code}</span> <span lang={l.code}>{l.label}</span>
            </>
          ),
        }))}
        values={spec.labels.careLangs}
        onChange={(careLangs) => update((s) => ({ ...s, labels: { ...s.labels, careLangs } }))}
      />

      <ChoiceList
        legend="Packing"
        name="packing"
        value={spec.packing}
        onChange={(packing) => update((s) => ({ ...s, packing }))}
        options={PACKING.map((o) => ({
          value: o.code,
          title: o.name,
          description: o.description,
          meta: <OptionMeta spec={spec} next={{ ...spec, packing: o.code }} code={o.code} selected={spec.packing === o.code} />,
        }))}
      />
    </FieldGroup>
  )
}
