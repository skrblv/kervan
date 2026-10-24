import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { DemoMenu } from './DemoMenu'
import { Logo } from './Logo'
import { RouteNav } from './RouteNav'

export const CONTAINER = 'mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a href="#main" className="sr-only-focusable fixed top-2 left-2 z-50 bg-ink px-3 py-2 text-sm text-paper">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper print:hidden">
        <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-x-4`}>
          <div className="flex h-14 items-center sm:h-16">
            <Logo />
          </div>
          {/* On phones the route gets its own row under the logo. */}
          <div className="order-last -mx-4 w-[calc(100%+2rem)] border-t border-rule px-4 sm:order-none sm:mx-0 sm:w-auto sm:border-0 sm:px-0">
            <RouteNav />
          </div>
          <DemoMenu />
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="mt-20 border-t border-rule print:hidden">
        <div
          className={`${CONTAINER} flex flex-col gap-2 py-7 text-sm text-ink-3 md:flex-row md:items-baseline md:justify-between`}
        >
          <p>
            <span className="font-display text-base text-ink">Kervan</span> · Spec-to-Quote prototype for small garment runs ·
            Bishkek, 2026
          </p>
          <p>Demo data throughout. No payments, accounts or live Telegram connection.</p>
        </div>
      </footer>
    </div>
  )
}

interface PageHeaderProps {
  kicker: string
  title: ReactNode
  children?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ kicker, title, children, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 pt-10 pb-8 md:flex-row md:items-end md:justify-between md:pt-14">
      <div className="max-w-3xl">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-3 font-display text-[34px] leading-[1.08] tracking-[-0.015em] sm:text-[42px]">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-[16px] text-ink-2">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3 print:hidden">{actions}</div>}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  children: ReactNode
  action: ReactNode
}

/** Shown when a step's prerequisite is missing; always offers the way forward. */
export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="mx-auto my-10 max-w-xl border-t-2 border-ink py-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-2 text-ink-2">{children}</div>
      <div className="mt-6">{action}</div>
    </div>
  )
}
