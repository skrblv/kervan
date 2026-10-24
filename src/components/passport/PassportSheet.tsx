import type { ReactNode } from 'react'
import { COLOURS, findFabric } from '../../data/catalog'
import { GLOSSARY, GLOSSARY_META, LANGUAGE_NAMES, LANGUAGES, PASSPORT_TEXT, POM_TERMS } from '../../data/glossary'
import { formatDate } from '../../lib/dates'
import { measurementTable } from '../../lib/grading'
import { inspectionSample } from '../../lib/inspection'
import { fieldLabel, passportId } from '../../lib/passport'
import type { Lang, Spec } from '../../types/spec'
import { GarmentFlat } from '../garment/GarmentFlat'
import { LogoMark } from '../layout/Logo'
import { MeasurementTable } from './MeasurementTable'

interface PassportSheetProps {
  spec: Spec
  lang: Lang
  version: number
  status: 'draft' | 'locked'
  hash: string | null
  issued: string
}

/** The Production Passport as a document. Every coded value is rendered from the glossary. */
export function PassportSheet({ spec, lang, version, status, hash, issued }: PassportSheetProps) {
  const t = PASSPORT_TEXT[lang]
  const term = (code: keyof typeof GLOSSARY) => GLOSSARY[code][lang]
  const locale = LANGUAGES.find((l) => l.code === lang)?.locale ?? 'en-GB'
  const hoodie = spec.garment === 'GAR-HOODIE'
  const fabric = findFabric(spec.fabric)
  const rib = spec.finish !== 'HEM-SELF-CS'
  const d = spec.decoration
  const lot = spec.plannedQuantity
  const sample = inspectionSample(lot)
  const id = passportId(spec)

  const titleBlock: [string, ReactNode][] = [
    ['ID', id],
    [t.version, `v${version}`],
    [t.status, status === 'locked' ? t.locked : t.draft],
    [t.template, `${hoodie ? 'hoodie' : 'sweatshirt'}@1`],
    [t.issued, formatDate(issued, locale)],
    [t.sizes, `${spec.sizes.from}–${spec.sizes.to}`],
  ]

  return (
    <article lang={lang} aria-label={`${t.title}, ${id} v${version}`} className="border border-rule-2 bg-sheet print:border-0">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] border-b-2 border-ink">
        <div className="p-5 sm:p-6">
          <p className="kicker">{t.title}</p>
          <h2 className="mt-2 font-display text-[30px] leading-tight">{spec.styleName || '—'}</h2>
          <p className="mt-1 text-ink-2">
            {term(spec.garment)} · {term(spec.fit)}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between p-5 text-right sm:p-6">
          <span className="flex items-center gap-1.5 font-display text-lg">
            <LogoMark className="size-5" />
            Kervan
          </span>
          <span className="font-mono text-xs text-ink-3">{id}</span>
        </div>
      </header>

      <dl className="grid grid-cols-2 border-b border-rule sm:grid-cols-3 lg:grid-cols-6">
        {titleBlock.map(([label, value]) => (
          <div key={label} className="border-r border-b border-rule px-4 py-2.5 lg:border-b-0">
            <dt className="kicker">{label}</dt>
            <dd className={`mt-0.5 font-mono text-[13px] ${label === t.status && status === 'draft' ? 'text-warn' : ''}`}>
              {value}
            </dd>
          </div>
        ))}
        <div className="col-span-full border-t border-rule px-4 py-2.5">
          <dt className="kicker">SHA-256</dt>
          <dd className="mt-0.5 font-mono text-xs break-all text-ink-2">{hash ?? '—'}</dd>
        </div>
      </dl>

      <Section n="01" title={t.drawing}>
        <div className="grid gap-4 sm:grid-cols-2">
          {(['front', 'back'] as const).map((view) => (
            <figure key={view} className="border border-rule">
              <GarmentFlat
                spec={spec}
                view={view}
                dimensions
                grid
                label={`${view === 'front' ? t.front : t.back}, ${spec.sizes.base}`}
                className="block w-full"
              />
              <figcaption className="flex justify-between border-t border-rule px-3 py-1.5 font-mono text-[11px] text-ink-3">
                <span>{view === 'front' ? t.front : t.back}</span>
                <span>{spec.sizes.base} · ⊞ 5 cm</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section n="02" title={t.materials}>
        <CodeRows
          rows={[
            [spec.fabric, `${t.bodyFabric}: ${term(spec.fabric)}`, t.compositionOf(fabric.cotton, fabric.polyester)],
            ...(rib ? [[spec.finish, term(spec.finish), null] as Row] : []),
            ...(hoodie && spec.drawcord === 'CORD-FLAT-EYE'
              ? [[spec.drawcord, `${t.trims}: ${term(spec.drawcord)}`, null] as Row]
              : []),
          ]}
        />
        <p className="mt-4 text-sm text-ink-3">{t.colours}</p>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {spec.colours.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm">
              <span aria-hidden className="size-4 border border-ink/20" style={{ backgroundColor: COLOURS[c].hex }} />
              <span className="font-mono text-xs text-accent-strong">{c}</span>
              {term(c)}
            </li>
          ))}
        </ul>
      </Section>

      <Section n="03" title={t.construction}>
        <CodeRows
          rows={[
            ...(hoodie
              ? [
                  [
                    spec.hood.panels,
                    `${term(spec.hood.panels)}, ${term(spec.hood.lined ? 'HOOD-LINED' : 'HOOD-UNLINED')}`,
                    null,
                  ] as Row,
                ]
              : [['NECK-CREW-RIB', term('NECK-CREW-RIB'), null] as Row]),
            [spec.pocket, term(spec.pocket), null],
            [spec.finish, term(spec.finish), null],
            ...(hoodie ? [[spec.drawcord, term(spec.drawcord), null] as Row] : []),
            [spec.seams, term(spec.seams), null],
          ]}
        />
      </Section>

      <Section n="04" title={t.measurements}>
        <div className="overflow-x-auto">
          <MeasurementTable
            rows={measurementTable(spec)}
            base={spec.sizes.base}
            caption={t.measurements}
            pomLabel={(pom) => POM_TERMS[pom][lang]}
            headers={{ pom: t.pom, tolerance: t.tolerance }}
          />
        </div>
        <p className="mt-2 text-sm text-ink-3">
          {t.baseSize}: <span className="font-mono text-ink">{spec.sizes.base}</span>
        </p>
      </Section>

      <Section n="05" title={t.decoration}>
        {d.method === 'DEC-NONE' ? (
          <CodeRows rows={[[d.method, term(d.method), null]]} />
        ) : (
          <CodeRows
            rows={[
              [d.method, `${t.method}: ${term(d.method)}`, d.method === 'DEC-SCREEN' ? t.inks(d.inkColours) : null],
              [d.placement, `${t.placement}: ${term(d.placement)}`, t.offset(d.offsetCm)],
              ['ART-SIZE', `${t.artworkSize}: ${d.widthCm} × ${d.heightCm} cm`, null],
            ]}
          />
        )}
      </Section>

      <Section n="06" title={t.labelsPacking}>
        <CodeRows
          rows={[
            [spec.labels.neck, term(spec.labels.neck), null],
            ['LBL-CARE', t.careLabel(spec.labels.careLangs.map((l) => LANGUAGE_NAMES[l][lang]).join(', ')), null],
            [spec.packing, term(spec.packing), null],
          ]}
        />
      </Section>

      <Section n="07" title={t.inspection}>
        <ul className="space-y-1.5 text-[15px]">
          <li>{t.sampleLine(sample.sample, lot, sample.letter)}</li>
          <li>{t.critical}</li>
          <li>{t.measureCheck}</li>
          <li>{t.reference(spec.sizes.base)}</li>
        </ul>
      </Section>

      {spec.clarifications.length > 0 && (
        <Section n="08" title={t.clarifications}>
          <ul className="space-y-4">
            {spec.clarifications.map((c) => (
              <li key={`${c.workshopId}-${c.fieldPath}`} className="text-sm">
                <p className="font-mono text-xs text-accent-strong">
                  {c.fieldPath} · {c.workshopId}
                </p>
                <p lang="en" className="mt-1 text-ink-2">
                  {fieldLabel(c.fieldPath)}: {c.question}
                </p>
                <p className="mt-1 border-l-2 border-accent pl-3">
                  <span className="block text-xs text-ink-3">{t.founderAnswer}</span>
                  <span lang="">{c.answer}</span>
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <footer className="flex flex-col gap-1 px-5 py-4 text-xs text-ink-3 sm:flex-row sm:justify-between sm:px-6">
        <span>{t.footer(GLOSSARY_META.version)}</span>
        <span className="font-mono">
          {id} · v{version}
        </span>
      </footer>
    </article>
  )
}

type Row = [code: string, text: string, detail: string | null]

function CodeRows({ rows }: { rows: Row[] }) {
  return (
    <dl className="divide-y divide-rule border-y border-rule">
      {rows.map(([code, text, detail]) => (
        <div key={code + text} className="grid gap-x-4 gap-y-0.5 py-2 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
          <dt className="font-mono text-xs leading-6 text-accent-strong">{code}</dt>
          <dd className="leading-6">
            {text}
            {detail && <span className="text-ink-2"> · {detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid border-b border-rule break-inside-avoid md:grid-cols-[11rem_minmax(0,1fr)]">
      <h3 className="px-5 pt-5 text-sm font-medium sm:px-6 md:py-5">
        <span className="mr-2 font-mono text-xs text-ink-3">{n}</span>
        {title}
      </h3>
      <div className="min-w-0 px-5 pt-3 pb-5 sm:px-6 md:pt-5">{children}</div>
    </section>
  )
}
