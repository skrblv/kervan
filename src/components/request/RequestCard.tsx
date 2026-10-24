import { FileText } from 'lucide-react'
import { CARD_TEXT, GLOSSARY } from '../../data/glossary'
import { formatDate } from '../../lib/dates'
import { shortHash } from '../../lib/passport'
import type { DeliveryCity, QuantityMatrix } from '../../types/quote'
import type { ColourCode, SizeCode, Spec } from '../../types/spec'

interface RequestCardProps {
  spec: Spec
  passportLabel: string
  hash: string
  lang: 'ru' | 'ky'
  matrix: QuantityMatrix
  sizes: SizeCode[]
  total: number
  deadline: string
  city: DeliveryCity | ''
  note: string
}

/**
 * The structured card a workshop receives from the Kervan bot. Coded fields come from the
 * glossary in the workshop's language; the founder's note is passed on as written.
 */
export function RequestCard({ spec, passportLabel, hash, lang, matrix, sizes, total, deadline, city, note }: RequestCardProps) {
  const t = CARD_TEXT[lang]
  const locale = lang === 'ru' ? 'ru-RU' : 'ky-KG'
  const colourLine = (c: ColourCode) =>
    sizes
      .map((s) => [s, matrix[c]?.[s] ?? 0] as const)
      .filter(([, n]) => n > 0)
      .map(([s, n]) => `${s} ${n}`)
      .join(' · ')

  return (
    <div lang={lang} className="bg-[#e5e1d6] p-4 sm:p-5">
      <div className="max-w-[23rem] rounded-[12px] rounded-tl-[3px] bg-white px-4 pt-3 pb-2 text-[14px] leading-snug text-ink shadow-[0_1px_1px_rgba(0,0,0,0.08)]">
        <p className="text-[13px] font-medium text-accent">Kervan</p>
        <p className="mt-1 font-semibold">
          {t.title} · {spec.styleName || '—'}
        </p>
        <p className="mt-2">
          {GLOSSARY[spec.garment][lang]}, {GLOSSARY[spec.fit][lang].toLowerCase()}
        </p>
        <p>{GLOSSARY[spec.fabric][lang]}</p>
        <div className="mt-2 space-y-0.5">
          {spec.colours.map((c) => (
            <p key={c}>
              <span className="font-medium">{GLOSSARY[c][lang]}:</span> {colourLine(c) || '—'}
            </p>
          ))}
        </div>
        <p className="mt-2">
          <span className="font-medium">{t.quantity(total)}</span>
          {deadline && <> · {t.deadline(formatDate(deadline, locale, false))}</>}
        </p>
        {city && (
          <p>
            {t.delivery}: {t.cities[city]}
          </p>
        )}
        {note.trim() && (
          <p className="mt-2 border-l-2 border-rule-2 pl-2 text-ink-2">
            <span className="block text-[12px] text-ink-3">{t.note}</span>
            <span lang="">{note.trim()}</span>
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 rounded-[8px] bg-paper/70 px-3 py-2">
          <FileText aria-hidden className="size-6 shrink-0 text-accent-strong" />
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {t.passport} {passportLabel}.pdf
            </span>
            <span className="block font-mono text-[11px] text-ink-3">sha256 {shortHash(hash)}</span>
          </span>
        </div>
        <p className="mt-1 text-right text-[11px] text-ink-3">{new Date().toTimeString().slice(0, 5)}</p>
      </div>
      <div aria-hidden className="mt-1 grid max-w-[23rem] grid-cols-3 gap-1">
        {[t.quote, t.ask, t.decline].map((label) => (
          <span key={label} className="rounded-[8px] bg-white/60 px-2 py-2 text-center text-[13px] text-accent-strong">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
