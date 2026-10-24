import { Minus, Plus } from 'lucide-react'
import {
  useEffect,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

const control =
  'w-full rounded-[3px] border border-field bg-sheet px-3 text-[15px] text-ink placeholder:text-ink-3/80 hover:border-ink-2 aria-[invalid=true]:border-error'

interface ShellProps {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  optional?: boolean
  children: ReactNode
  className?: string
}

/** Label, control, hint and error, wired together by id. */
export function Field({ id, label, hint, error, optional, children, className = '' }: ShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-ink-3">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-3">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function describedBy(id: string, hint?: ReactNode, error?: string | null): string | undefined {
  if (error) return `${id}-error`
  return hint ? `${id}-hint` : undefined
}

type TextInputProps = Omit<ShellProps, 'children'> & InputHTMLAttributes<HTMLInputElement>

export function TextInput({ id, label, hint, error, optional, className, ...input }: TextInputProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input
        id={id}
        className={`${control} h-11`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </Field>
  )
}

type TextAreaProps = Omit<ShellProps, 'children'> & TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ id, label, hint, error, optional, className, ...input }: TextAreaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        className={`${control} min-h-24 py-2.5 leading-snug`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </Field>
  )
}

type SelectInputProps = Omit<ShellProps, 'children'> &
  SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }

export function SelectInput({ id, label, hint, error, options, className, ...select }: SelectInputProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select id={id} className={`${control} h-11 pr-8`} aria-describedby={describedBy(id, hint, error)} {...select}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

interface NumberInputProps extends Omit<ShellProps, 'children'> {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

/**
 * Number field with step buttons. Typing is kept as a draft string so the field can be
 * cleared and retyped; the value is committed when it parses, and clamped on blur.
 */
export function NumberInput({ id, label, hint, error, value, onChange, min, max, step = 1, unit, className }: NumberInputProps) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = (next: number) => onChange(Math.min(max, Math.max(min, next)))

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className="flex h-11 items-stretch">
        <button
          type="button"
          onClick={() => commit(value - step)}
          disabled={value <= min}
          aria-label={`Decrease ${typeof label === 'string' ? label.toLowerCase() : ''}`.trim()}
          className="grid w-10 place-items-center rounded-l-[3px] border border-r-0 border-field bg-sheet text-ink-2 hover:bg-paper disabled:text-rule-2"
        >
          <Minus aria-hidden className="size-4" />
        </button>
        <div className="relative flex-1">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              const parsed = Number(e.target.value)
              if (e.target.value !== '' && Number.isFinite(parsed)) onChange(parsed)
            }}
            onBlur={() => {
              const parsed = Number(draft)
              if (draft === '' || !Number.isFinite(parsed)) setDraft(String(value))
              else commit(parsed)
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className={`${control} h-full rounded-none text-center font-mono tabular-nums ${unit ? 'pr-10' : ''}`}
          />
          {unit && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-ink-3"
            >
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => commit(value + step)}
          disabled={value >= max}
          aria-label={`Increase ${typeof label === 'string' ? label.toLowerCase() : ''}`.trim()}
          className="grid w-10 place-items-center rounded-r-[3px] border border-l-0 border-field bg-sheet text-ink-2 hover:bg-paper disabled:text-rule-2"
        >
          <Plus aria-hidden className="size-4" />
        </button>
      </div>
    </Field>
  )
}
