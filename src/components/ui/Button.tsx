import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variant = 'primary' | 'secondary' | 'quiet'
type Size = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-medium transition-colors disabled:cursor-not-allowed'
const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[15px]',
  sm: 'h-9 px-3.5 text-sm',
}
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-2 disabled:bg-rule-2 disabled:text-sheet',
  secondary: 'border border-ink/70 text-ink hover:bg-sheet hover:border-ink disabled:border-rule-2 disabled:text-ink-3',
  quiet: 'text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink disabled:text-ink-3 !h-auto !px-0',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant,
  size,
  loading = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
}

export function ButtonLink({ variant, size, className = '', ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />
}
