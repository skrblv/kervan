import type { ReactNode } from 'react'

export interface Choice<T extends string> {
  value: T
  title: ReactNode
  description?: ReactNode
  /** Right-aligned detail, e.g. a glossary code or a cost difference. */
  meta?: ReactNode
  disabled?: boolean
  visual?: ReactNode
}

interface ChoiceListProps<T extends string> {
  legend: ReactNode
  hint?: ReactNode
  name: string
  options: Choice<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** A radio group drawn as a ledger: rows separated by rules, the choice marked by a diamond. */
export function ChoiceList<T extends string>({
  legend,
  hint,
  name,
  options,
  value,
  onChange,
  className = '',
}: ChoiceListProps<T>) {
  return (
    <fieldset className={className}>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      {hint && <p className="mb-2.5 text-sm text-ink-3">{hint}</p>}
      <div className={`border-y border-rule ${hint ? '' : 'mt-2.5'}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className="group relative flex cursor-pointer items-start gap-3.5 border-b border-rule py-3 pr-3 pl-4 last:border-b-0 hover:bg-sheet/70 has-checked:bg-sheet has-disabled:cursor-not-allowed has-disabled:opacity-50 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px] bg-accent opacity-0 transition-opacity peer-checked:opacity-100"
            />
            <span
              aria-hidden
              className="mt-[0.4rem] size-2.5 shrink-0 rotate-45 border border-field transition-colors peer-checked:border-accent peer-checked:bg-accent"
            />
            {o.visual}
            <span className="min-w-0 flex-1">
              <span className="block font-medium leading-snug text-ink">{o.title}</span>
              {o.description && <span className="mt-0.5 block text-sm leading-snug text-ink-3">{o.description}</span>}
            </span>
            {o.meta && <span className="shrink-0 pt-0.5 text-right font-mono text-xs text-ink-3">{o.meta}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  /** Visually hide the label (it is still announced). */
  hideLabel?: boolean
  name: string
  options: { value: T; label: ReactNode; title?: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Compact single choice: view toggles, languages. */
export function Segmented<T extends string>({
  label,
  hideLabel,
  name,
  options,
  value,
  onChange,
  className = '',
}: SegmentedProps<T>) {
  return (
    <fieldset className={`flex items-center gap-3 ${className}`}>
      <legend className={hideLabel ? 'sr-only' : 'float-left mr-3 text-sm text-ink-3'}>{label}</legend>
      <div className="inline-flex rounded-[3px] border border-field bg-sheet p-0.5">
        {options.map((o) => (
          <label
            key={o.value}
            title={o.title}
            className="relative cursor-pointer rounded-[2px] px-2.5 py-1 text-[13px] font-medium text-ink-2 hover:text-ink has-checked:bg-ink has-checked:text-paper has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-1 has-[input:focus-visible]:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface CheckChipsProps<T extends string> {
  legend: ReactNode
  hint?: ReactNode
  options: { value: T; label: ReactNode; disabled?: boolean }[]
  values: T[]
  onChange: (values: T[]) => void
}

export function CheckChips<T extends string>({ legend, hint, options, values, onChange }: CheckChipsProps<T>) {
  const toggle = (v: T) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      {hint && <p className="mb-2.5 text-sm text-ink-3">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 rounded-[3px] border border-field bg-sheet px-3 py-2 text-sm text-ink-2 hover:border-ink-2 has-checked:border-ink has-checked:text-ink has-disabled:cursor-not-allowed has-disabled:opacity-50 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-accent"
          >
            <input
              type="checkbox"
              checked={values.includes(o.value)}
              disabled={o.disabled}
              onChange={() => toggle(o.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="grid size-3.5 place-items-center border border-field peer-checked:border-accent peer-checked:bg-accent"
            >
              <svg viewBox="0 0 10 10" className="size-2.5 text-sheet">
                <path d="M2 5.2 4.1 7.2 8 2.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

interface SwitchProps {
  id: string
  label: ReactNode
  description?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Switch({ id, label, description, checked, onChange, disabled }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-y border-rule py-3 pl-4 pr-3">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-3">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full border border-field bg-paper transition-colors aria-checked:border-accent aria-checked:bg-accent disabled:opacity-50"
      >
        <span
          aria-hidden
          className={`absolute top-0.5 left-0.5 size-[1.125rem] rounded-full bg-sheet shadow-sm ring-1 ring-ink/15 transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  )
}
