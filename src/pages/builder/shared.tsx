import type { ReactNode } from 'react'
import { IssueList } from '../../components/checks/IssueList'
import { costDelta } from '../../lib/estimate'
import { somDelta } from '../../lib/format'
import type { BuilderStepId, Issue, Spec } from '../../types/spec'

export interface StepProps {
  spec: Spec
  update: (update: (spec: Spec) => Spec) => void
}

export const STEPS: { id: BuilderStepId; label: string; title: string; description: string }[] = [
  {
    id: 'garment',
    label: 'Garment',
    title: 'What are you making?',
    description: 'One garment family per passport. The pilot covers hoodies and sweatshirts.',
  },
  {
    id: 'fabric',
    label: 'Fabric & colour',
    title: 'Fabric and colours',
    description: 'Only fabrics the pilot workshops keep in stock, so quotes don’t wait on custom orders.',
  },
  {
    id: 'construction',
    label: 'Construction',
    title: 'Construction',
    description: 'The details a workshop needs to price the sewing.',
  },
  {
    id: 'sizes',
    label: 'Sizes',
    title: 'Size range',
    description: 'Measurements are graded from the base size, and the sample is sewn in it.',
  },
  {
    id: 'decoration',
    label: 'Decoration',
    title: 'Print or embroidery',
    description: 'Placement is checked against the smallest size in your range.',
  },
  {
    id: 'labels',
    label: 'Labels & packing',
    title: 'Labels and packing',
    description: 'What goes inside the neck, on the care label and around each piece.',
  },
]

/** Right-hand detail of an option row: its glossary code and what choosing it would do to the unit cost. */
export function OptionMeta({ spec, next, code, selected }: { spec: Spec; next: Spec; code: string; selected: boolean }) {
  const delta = selected ? null : costDelta(spec, next)
  return (
    <>
      <span className="block">{code}</span>
      {delta !== null && (
        <span className={`mt-0.5 block ${Math.round(delta) < 0 ? 'text-accent-strong' : ''}`}>{somDelta(delta)} som</span>
      )}
    </>
  )
}

/** On small screens the checks rail is far away, so issues also appear under the step they belong to. */
export function StepIssues({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null
  const blocking = issues.some((i) => i.severity === 'error')
  return (
    <div role="status" className={`border-l-2 bg-sheet px-4 md:hidden ${blocking ? 'border-error' : 'border-warn'}`}>
      <IssueList issues={issues} />
    </div>
  )
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="space-y-8">{children}</div>
}
