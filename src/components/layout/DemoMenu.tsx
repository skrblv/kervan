import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch } from '../../state/store'

/** Demo controls: load the worked example or start over. State lives in this browser only. */
export function DemoMenu() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const details = useRef<HTMLDetailsElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 4000)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  const close = () => details.current?.removeAttribute('open')

  return (
    <details ref={details} className="group relative shrink-0">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-[3px] border border-rule-2 px-3 text-[13px] text-ink-2 hover:border-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
        Demo<span className="hidden sm:inline"> data</span>
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-72 border border-rule-2 bg-sheet p-4 text-sm shadow-[0_8px_24px_-12px_rgba(22,24,27,0.35)]">
        <p className="text-ink-2">
          Workshops, quotes and figures are invented for this prototype. Your work is kept in this browser only.
        </p>
        <div className="mt-4 flex flex-col items-start gap-2.5">
          <button
            type="button"
            className="text-left font-medium text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
            onClick={() => {
              dispatch({ type: 'spec/load-example' })
              close()
              navigate('/spec')
            }}
          >
            Load the worked example (80 hoodies)
          </button>
          <button
            type="button"
            className={`text-left underline underline-offset-4 ${confirmReset ? 'font-medium text-error decoration-error' : 'text-ink-2 decoration-rule-2 hover:decoration-ink'}`}
            onClick={() => {
              if (!confirmReset) return setConfirmReset(true)
              dispatch({ type: 'demo/reset' })
              setConfirmReset(false)
              close()
              navigate('/')
            }}
          >
            {confirmReset ? 'Press again to clear everything' : 'Start over'}
          </button>
        </div>
      </div>
    </details>
  )
}
