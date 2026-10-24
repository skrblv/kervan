import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { BLANK_SPEC, EXAMPLE_SPEC } from '../data/specs'
import { checkSpec } from '../lib/rules'
import { passportState, type PassportState } from '../lib/passport'
import type { Order, QuoteRequest } from '../types/quote'
import type { Clarification, Issue, PassportVersion, Spec } from '../types/spec'

export interface AppState {
  spec: Spec
  versions: PassportVersion[]
  request: QuoteRequest | null
  /** True once the simulated workshop replies have all arrived, so they are not replayed. */
  repliesArrived: boolean
  order: Order | null
}

type Action =
  | { type: 'spec/update'; update: (spec: Spec) => Spec }
  | { type: 'spec/load-example' }
  | { type: 'passport/lock'; version: PassportVersion }
  | { type: 'request/send'; request: QuoteRequest }
  | { type: 'replies/arrived' }
  | { type: 'question/answer'; clarification: Clarification }
  | { type: 'order/create'; order: Order }
  | { type: 'demo/reset' }

const INITIAL: AppState = { spec: BLANK_SPEC, versions: [], request: null, repliesArrived: false, order: null }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'spec/update':
      return { ...state, spec: action.update(state.spec) }
    case 'spec/load-example':
      return { ...INITIAL, spec: EXAMPLE_SPEC }
    case 'passport/lock':
      return { ...state, versions: [...state.versions, action.version] }
    case 'request/send':
      return { ...state, request: action.request, repliesArrived: false, order: null }
    case 'replies/arrived':
      return { ...state, repliesArrived: true }
    case 'question/answer':
      return {
        ...state,
        spec: { ...state.spec, clarifications: [...state.spec.clarifications, action.clarification] },
      }
    case 'order/create':
      return { ...state, order: action.order }
    case 'demo/reset':
      return INITIAL
  }
}

// ---- Persistence ------------------------------------------------------------
// The demo survives a page refresh. Storage can be unavailable (private mode,
// blocked site data), so every access is guarded and the app works without it.

const STORAGE_KEY = 'kervan.prototype.v1'

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (!parsed.spec || !Array.isArray(parsed.versions)) return INITIAL
    return {
      ...INITIAL,
      ...parsed,
      spec: { ...BLANK_SPEC, ...parsed.spec },
    }
  } catch {
    return INITIAL
  }
}

function save(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Not fatal: the demo just won't survive a refresh.
  }
}

// ---- Context ------------------------------------------------------------------

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    save(state)
  }, [state])
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState(): AppState {
  const state = useContext(StateContext)
  if (!state) throw new Error('useAppState must be used inside AppStateProvider')
  return state
}

export function useDispatch(): Dispatch<Action> {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useDispatch must be used inside AppStateProvider')
  return dispatch
}

/** The spec plus what is derived from it everywhere: rule results and passport status. */
export function useSpec(): {
  spec: Spec
  issues: Issue[]
  errors: Issue[]
  passport: PassportState
  update: (update: (spec: Spec) => Spec) => void
} {
  const { spec, versions } = useAppState()
  const dispatch = useDispatch()
  return useMemo(() => {
    const issues = checkSpec(spec)
    return {
      spec,
      issues,
      errors: issues.filter((i) => i.severity === 'error'),
      passport: passportState(spec, versions),
      update: (update) => dispatch({ type: 'spec/update', update }),
    }
  }, [spec, versions, dispatch])
}
