import { ChoiceList, Switch } from '../../components/ui/choices'
import { CORDS, FINISHES, HOOD_PANELS, POCKETS, SEAMS } from '../../data/catalog'
import { FieldGroup, OptionMeta, type StepProps } from './shared'

export function ConstructionStep({ spec, update }: StepProps) {
  const hoodie = spec.garment === 'GAR-HOODIE'
  return (
    <FieldGroup>
      {hoodie && (
        <div className="space-y-4">
          <ChoiceList
            legend="Hood"
            name="hood-panels"
            value={spec.hood.panels}
            onChange={(panels) => update((s) => ({ ...s, hood: { ...s.hood, panels } }))}
            options={HOOD_PANELS.map((o) => ({
              value: o.code,
              title: o.name,
              description: o.description,
              meta: (
                <OptionMeta
                  spec={spec}
                  next={{ ...spec, hood: { ...spec.hood, panels: o.code } }}
                  code={o.code}
                  selected={spec.hood.panels === o.code}
                />
              ),
            }))}
          />
          <Switch
            id="hood-lined"
            label="Lined hood"
            description="A second layer of body fabric inside the hood; warmer and it holds its shape."
            checked={spec.hood.lined}
            onChange={(lined) => update((s) => ({ ...s, hood: { ...s.hood, lined } }))}
          />
        </div>
      )}

      <ChoiceList
        legend="Pocket"
        name="pocket"
        value={spec.pocket}
        onChange={(pocket) => update((s) => ({ ...s, pocket }))}
        options={POCKETS.map((o) => ({
          value: o.code,
          title: o.name,
          description: o.description,
          meta: <OptionMeta spec={spec} next={{ ...spec, pocket: o.code }} code={o.code} selected={spec.pocket === o.code} />,
        }))}
      />

      <ChoiceList
        legend="Cuffs and hem"
        name="finish"
        value={spec.finish}
        onChange={(finish) => update((s) => ({ ...s, finish }))}
        options={FINISHES.map((o) => ({
          value: o.code,
          title: o.name,
          description: o.description,
          meta: <OptionMeta spec={spec} next={{ ...spec, finish: o.code }} code={o.code} selected={spec.finish === o.code} />,
        }))}
      />

      {hoodie && (
        <ChoiceList
          legend="Drawcord"
          name="drawcord"
          value={spec.drawcord}
          onChange={(drawcord) => update((s) => ({ ...s, drawcord }))}
          options={CORDS.map((o) => ({
            value: o.code,
            title: o.name,
            description: o.description,
            meta: (
              <OptionMeta spec={spec} next={{ ...spec, drawcord: o.code }} code={o.code} selected={spec.drawcord === o.code} />
            ),
          }))}
        />
      )}

      <ChoiceList
        legend="Seams"
        name="seams"
        value={spec.seams}
        onChange={(seams) => update((s) => ({ ...s, seams }))}
        options={SEAMS.map((o) => ({
          value: o.code,
          title: o.name,
          description: o.description,
          meta: <OptionMeta spec={spec} next={{ ...spec, seams: o.code }} code={o.code} selected={spec.seams === o.code} />,
        }))}
      />
    </FieldGroup>
  )
}
