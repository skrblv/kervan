import { Link } from 'react-router'

export function LogoMark({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 2.6 21.4 12 12 21.4 2.6 12Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8.7 15.3 12 12 15.3 8.7 12Z" className="fill-accent" />
    </svg>
  )
}

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 text-ink" aria-label="Kervan, home">
      <LogoMark />
      <span className="font-display text-[22px] leading-none font-medium tracking-[-0.01em]">Kervan</span>
    </Link>
  )
}
