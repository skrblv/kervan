import { NavLink } from 'react-router'
import { useAppState, useSpec } from '../../state/store'

export const STATIONS = [
  { to: '/spec', n: '01', label: 'Specify' },
  { to: '/estimate', n: '02', label: 'Estimate' },
  { to: '/passport', n: '03', label: 'Passport' },
  { to: '/request', n: '04', label: 'Request' },
  { to: '/quotes', n: '05', label: 'Compare' },
] as const

type StationState = 'done' | 'open'

export function Diamond({ state, active }: { state: StationState; active: boolean }) {
  const fill = active ? 'bg-accent border-accent' : state === 'done' ? 'bg-ink border-ink' : 'bg-paper border-rule-2'
  return (
    <span aria-hidden className="relative grid size-3.5 place-items-center">
      {active && <span className="absolute inset-[-3px] rotate-45 border border-accent/40" />}
      <span className={`size-2.5 rotate-45 border ${fill}`} />
    </span>
  )
}

/** The five stations of the flow, joined by a stitch line. */
export function RouteNav() {
  const { versions, request, order } = useAppState()
  const { errors } = useSpec()
  const done: Record<(typeof STATIONS)[number]['to'], boolean> = {
    '/spec': errors.length === 0,
    '/estimate': versions.length > 0,
    '/passport': versions.length > 0,
    '/request': request !== null,
    '/quotes': order !== null,
  }

  return (
    <nav aria-label="Spec-to-Quote steps" className="min-w-0">
      <ol className="flex items-center">
        {STATIONS.map((s, i) => (
          <li key={s.to} className="flex items-center">
            {i > 0 && <span aria-hidden className="stitch mx-1.5 h-2 w-5 text-rule-2 sm:w-6 xl:mx-2 xl:w-9" />}
            <NavLink
              to={s.to}
              className="group flex items-center gap-2 rounded-[2px] py-1.5 text-sm text-ink-2 hover:text-ink aria-[current=page]:text-ink"
            >
              {({ isActive }) => (
                <>
                  <Diamond state={done[s.to] ? 'done' : 'open'} active={isActive} />
                  <span className={`hidden font-mono text-[11px] text-ink-3 xl:inline`}>{s.n}</span>
                  <span className={isActive ? 'font-medium' : 'hidden lg:inline'}>{s.label}</span>
                  {done[s.to] && !isActive && <span className="sr-only">(done)</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  )
}
