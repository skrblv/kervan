import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { CONTAINER } from '../components/layout/AppShell'
import { GarmentFlat } from '../components/garment/GarmentFlat'
import { Button, ButtonLink } from '../components/ui/Button'
import { GLOSSARY, GLOSSARY_META, LANGUAGES } from '../data/glossary'
import { BLANK_SPEC, EXAMPLE_SPEC } from '../data/specs'
import { costAt, unitParams } from '../lib/estimate'
import { som } from '../lib/format'
import { inspectionSample } from '../lib/inspection'
import { canonicalJson, passportId, shortHash, specHash } from '../lib/passport'
import { useAppState, useDispatch } from '../state/store'

const example = {
  id: passportId(EXAMPLE_SPEC),
  hash: shortHash(specHash(EXAMPLE_SPEC)),
  unit: costAt(unitParams(EXAMPLE_SPEC), EXAMPLE_SPEC.plannedQuantity).total,
  inspection: inspectionSample(EXAMPLE_SPEC.plannedQuantity),
}

const ROUTE = [
  {
    n: '01',
    title: 'Specify',
    text: 'Guided options for one garment family. Rules flag what cannot be made as specified, such as a print too wide for size S.',
    detail: 'Errors block · warnings advise',
  },
  {
    n: '02',
    title: 'Estimate',
    text: 'Unit cost at 30, 50, 100 and 200 units, with a breakdown, the quotes it rests on and its measured error.',
    detail: 'c(q) = m·p + r + d + k + s(q) + F/q',
  },
  {
    n: '03',
    title: 'Passport',
    text: 'A versioned, hashed specification in the reader’s language. Every field is a glossary code, so nothing is lost in translation.',
    detail: 'RU · KY · KK · TR · EN',
  },
  {
    n: '04',
    title: 'Quote',
    text: 'Verified Bishkek workshops answer a structured card in Telegram. Quotes are normalised so you compare like with like.',
    detail: 'Fabric · delivery · lead time',
  },
]

const GLOSSARY_ROWS = ['RIB-1X1', 'HOOD-3P', 'PKT-KANGAROO', 'POS-LEFT-CHEST'] as const

const PRINCIPLES = [
  {
    title: 'Holds no money.',
    text: 'Founders pay workshops directly, starting with the sample fee. Kervan records the agreed milestones and both sides’ confirmations.',
  },
  {
    title: 'Runs no pre-sales.',
    text: 'Founders testing demand take reservations on their own channels, using Kervan’s estimate and passport.',
  },
  {
    title: 'Starts narrow.',
    text: 'Hoodies and sweatshirts, Bishkek workshops, brands in Kyrgyzstan and Kazakhstan inside the EAEU. New categories open only behind measured gates.',
  },
]

export function HomePage() {
  const { spec } = useAppState()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const inProgress = canonicalJson(spec) !== canonicalJson(BLANK_SPEC)

  return (
    <>
      <section
        className={`${CONTAINER} grid gap-12 pt-12 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16 lg:pt-20 lg:pb-24`}
      >
        <div className="flex flex-col justify-center">
          <p className="kicker">Spec-to-Quote · pilot with Bishkek knitwear workshops</p>
          <h1 className="mt-5 font-display text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[58px] xl:text-[68px]">
            Specify once.
            <br />
            Compare real quotes.
            <br />
            <em className="text-accent-strong">Produce near the buyer.</em>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-2">
            Kervan turns a hoodie or sweatshirt idea into a Production Passport that small workshops can price and sew. You see a
            cost estimate before contacting anyone, then comparable quotes from verified workshops.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink to="/spec">
              {inProgress ? 'Continue your specification' : 'Start a specification'}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <Button
              variant="quiet"
              onClick={() => {
                dispatch({ type: 'spec/load-example' })
                navigate('/spec')
              }}
            >
              Open the worked example: 80 black hoodies
            </Button>
          </div>
          <p className="mt-5 text-sm text-ink-3">No account. Runs in your browser on demo data.</p>
        </div>

        <figure className="self-center border border-rule-2 bg-sheet">
          <div className="flex items-center justify-between gap-4 border-b border-rule px-4 py-2.5 font-mono text-xs text-ink-2">
            <span>
              {example.id} · v1 · {EXAMPLE_SPEC.styleName}
            </span>
            <span className="hidden text-ink-3 sm:inline">sha256 {example.hash}</span>
          </div>
          <div className="px-3 py-4">
            <GarmentFlat
              spec={EXAMPLE_SPEC}
              view="front"
              dimensions
              grid
              label="Technical drawing of the worked example: a black hoodie with a front print, lettered points of measure and print dimensions."
              className="mx-auto w-full max-w-md"
            />
          </div>
          <dl className="grid grid-cols-3 divide-x divide-rule border-t border-rule">
            <div className="px-4 py-3">
              <dt className="kicker">Fabric</dt>
              <dd className="mt-1 font-mono text-[13px]">{EXAMPLE_SPEC.fabric}</dd>
            </div>
            <div className="px-4 py-3">
              <dt className="kicker">At {EXAMPLE_SPEC.plannedQuantity} units</dt>
              <dd className="mt-1 font-mono text-[13px]">{som(example.unit)} som</dd>
            </div>
            <div className="px-4 py-3">
              <dt className="kicker">Inspection</dt>
              <dd className="mt-1 font-mono text-[13px]">
                {example.inspection.sample} of {EXAMPLE_SPEC.plannedQuantity}
              </dd>
            </div>
          </dl>
          <figcaption className="sr-only">An excerpt of a Production Passport for the worked example.</figcaption>
        </figure>
      </section>

      <section aria-labelledby="route-title" className="border-y border-rule bg-sheet">
        <div className={`${CONTAINER} py-16 lg:py-20`}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="route-title" className="max-w-xl font-display text-3xl leading-tight tracking-[-0.01em] sm:text-4xl">
              One guided route from an idea to comparable quotes.
            </h2>
            <p className="max-w-sm text-ink-2">
              Small runs fail on briefs sent as photos and prices known only after long chats, not on quantity.
            </p>
          </div>

          <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
            <span aria-hidden className="stitch absolute top-[7px] right-0 left-0 hidden h-2 text-rule-2 md:block" />
            {ROUTE.map((step) => (
              <li key={step.n} className="relative pl-7 md:pl-0">
                <span
                  aria-hidden
                  className="absolute top-1 left-0 grid size-3.5 place-items-center bg-sheet md:static md:mb-6 md:w-6 md:justify-start"
                >
                  <span className="size-2.5 rotate-45 border border-ink bg-ink" />
                </span>
                <p className="font-mono text-xs text-ink-3">{step.n}</p>
                <h3 className="mt-1 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-ink-2">{step.text}</p>
                <p className="mt-4 font-mono text-xs text-accent-strong">{step.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 max-w-3xl border-t border-rule pt-6 text-ink-2">
            Then the approved sample locks the passport version, and the Kervan team inspects the finished batch in person, with
            ISO 2859-1 sample sizes.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="coded-title"
        className={`${CONTAINER} grid gap-10 py-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16 lg:py-20`}
      >
        <div>
          <h2 id="coded-title" className="font-display text-3xl leading-tight tracking-[-0.01em] sm:text-4xl">
            Coded, not translated.
          </h2>
          <p className="mt-4 text-ink-2">
            A workshop in Bishkek and a brand in Almaty read the same passport, each in their own language. Every field is a code
            from a shared glossary, so the meaning cannot drift. Designs travel as data while production stays near the buyer.
          </p>
          <p className="mt-4 text-sm text-ink-3">
            The glossary keeps the words workshops already use: Russian took <i>рибана</i> and <i>кашкорсе</i> from Turkish{' '}
            <i>ribana</i> and <i>kaşkorse</i>. {GLOSSARY_META.reviewNote}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">Four glossary codes rendered in five languages</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="py-2 pr-4 font-mono text-xs font-normal text-ink-3">
                  Code
                </th>
                {LANGUAGES.map((l) => (
                  <th key={l.code} scope="col" className="py-2 pr-4 font-mono text-xs font-normal text-ink-3 uppercase">
                    {l.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GLOSSARY_ROWS.map((code) => (
                <tr key={code} className="border-b border-rule align-top">
                  <th scope="row" className="py-3 pr-4 font-mono text-xs font-medium whitespace-nowrap text-accent-strong">
                    {code}
                  </th>
                  {LANGUAGES.map((l) => (
                    <td key={l.code} lang={l.code} className="py-3 pr-4 leading-snug text-ink">
                      {GLOSSARY[code][l.code]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="plain-title" className={`${CONTAINER} pb-4`}>
        <h2 id="plain-title" className="kicker">
          Stated plainly
        </h2>
        <div className="mt-4 grid border-t-2 border-ink md:grid-cols-3 md:divide-x md:divide-rule">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="border-b border-rule py-6 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
              <h3 className="font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-ink-2">{p.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-ink-3">
          Status: prototype. The workshops, quotes and estimate errors shown here are demo data. In the pilot they are replaced by
          real quotes, and the estimate is published with its measured error.
        </p>
      </section>
    </>
  )
}
