import type { BuilderStepId, Issue } from '../../types/spec'

const STEP_LABELS: Record<BuilderStepId, string> = {
  garment: 'Garment',
  fabric: 'Fabric',
  construction: 'Construction',
  sizes: 'Sizes',
  decoration: 'Decoration',
  labels: 'Labels',
}

export function SeverityMark({ severity }: { severity: Issue['severity'] }) {
  return severity === 'error' ? (
    <span aria-hidden className="mt-[0.45rem] block size-2 shrink-0 rotate-45 bg-error" />
  ) : (
    <span aria-hidden className="mt-[0.45rem] block size-2 shrink-0 rotate-45 border border-warn bg-warn-tint" />
  )
}

interface IssueListProps {
  issues: Issue[]
  /** When given, each issue links to the step that fixes it. */
  onGoto?: (step: BuilderStepId) => void
  compact?: boolean
}

export function IssueList({ issues, onGoto, compact = false }: IssueListProps) {
  const sorted = [...issues].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1))
  return (
    <ul className="divide-y divide-rule">
      {sorted.map((issue) => (
        <li key={issue.id} className={`flex gap-3 ${compact ? 'py-2.5' : 'py-3'}`}>
          <SeverityMark severity={issue.severity} />
          <div className="min-w-0 flex-1 text-sm">
            <p className="leading-snug text-ink">
              <span
                className={`mr-1.5 font-mono text-[11px] tracking-wide uppercase ${issue.severity === 'error' ? 'text-error' : 'text-warn'}`}
              >
                {issue.severity === 'error' ? 'Blocks' : 'Advice'}
              </span>
              {issue.message}
            </p>
            {issue.hint && !compact && <p className="mt-1 leading-snug text-ink-3">{issue.hint}</p>}
            {onGoto && (
              <button
                type="button"
                onClick={() => onGoto(issue.step)}
                className="mt-1 text-[13px] text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink hover:decoration-ink"
              >
                Go to {STEP_LABELS[issue.step]}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function issueSummary(issues: Issue[]): string {
  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.length - errors
  if (issues.length === 0) return 'All checks pass'
  const parts = []
  if (errors) parts.push(`${errors} ${errors === 1 ? 'error' : 'errors'}`)
  if (warnings) parts.push(`${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`)
  return parts.join(', ')
}
