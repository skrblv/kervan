import { COLOURS } from '../../data/catalog'
import type { QuantityMatrix } from '../../types/quote'
import type { ColourCode, SizeCode } from '../../types/spec'

interface SizeMatrixProps {
  colours: ColourCode[]
  sizes: SizeCode[]
  matrix: QuantityMatrix
  onChange: (matrix: QuantityMatrix) => void
  invalid?: boolean
  describedBy?: string
}

export function matrixTotal(matrix: QuantityMatrix): number {
  return Object.values(matrix).reduce((sum, row) => sum + Object.values(row ?? {}).reduce((a, b) => a + (b ?? 0), 0), 0)
}

/** A typical size curve for small brand runs, normalised over the sizes in range. */
const SIZE_SHARE: Record<SizeCode, number> = { XS: 0.08, S: 0.15, M: 0.3, L: 0.25, XL: 0.1, '2XL': 0.05, '3XL': 0.02 }

export function distribute(total: number, colours: ColourCode[], sizes: SizeCode[]): QuantityMatrix {
  const perColour = Math.floor(total / colours.length)
  const weight = sizes.reduce((sum, s) => sum + SIZE_SHARE[s], 0)
  const matrix: QuantityMatrix = {}
  colours.forEach((colour, i) => {
    const target = i === 0 ? total - perColour * (colours.length - 1) : perColour
    const row: Partial<Record<SizeCode, number>> = {}
    let assigned = 0
    sizes.forEach((s) => {
      row[s] = Math.round((target * SIZE_SHARE[s]) / weight)
      assigned += row[s]!
    })
    // Put any rounding remainder on the biggest size so each row adds up exactly.
    const biggest = sizes.reduce((a, b) => (SIZE_SHARE[b] > SIZE_SHARE[a] ? b : a))
    row[biggest] = Math.max(0, row[biggest]! + target - assigned)
    matrix[colour] = row
  })
  return matrix
}

export function SizeMatrix({ colours, sizes, matrix, onChange, invalid, describedBy }: SizeMatrixProps) {
  const set = (colour: ColourCode, size: SizeCode, raw: string) => {
    const value = raw === '' ? 0 : Math.max(0, Math.min(999, Math.floor(Number(raw)) || 0))
    onChange({ ...matrix, [colour]: { ...matrix[colour], [size]: value } })
  }
  const sizeTotal = (size: SizeCode) => colours.reduce((sum, c) => sum + (matrix[c]?.[size] ?? 0), 0)
  const rowTotal = (colour: ColourCode) => sizes.reduce((sum, s) => sum + (matrix[colour]?.[s] ?? 0), 0)

  return (
    <table className="w-full min-w-[480px] border-collapse text-sm" aria-describedby={describedBy}>
      <caption className="sr-only">Quantities by colour and size</caption>
      <thead>
        <tr className="border-b border-ink">
          <th scope="col" className="py-2 pr-3 text-left text-xs font-normal text-ink-3">
            Colour
          </th>
          {sizes.map((s) => (
            <th key={s} scope="col" className="px-1 py-2 text-center font-mono text-xs font-normal text-ink-3">
              {s}
            </th>
          ))}
          <th scope="col" className="py-2 pl-3 text-right text-xs font-normal text-ink-3">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {colours.map((c) => (
          <tr key={c} className="border-b border-rule">
            <th scope="row" className="py-2 pr-3 text-left font-normal">
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-4 shrink-0 border border-ink/20" style={{ backgroundColor: COLOURS[c].hex }} />
                <span className="leading-tight">
                  {COLOURS[c].name}
                  <span className="block font-mono text-[11px] text-ink-3">{c}</span>
                </span>
              </span>
            </th>
            {sizes.map((s) => (
              <td key={s} className="px-1 py-2 text-center">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999}
                  value={matrix[c]?.[s] ?? 0}
                  onChange={(e) => set(c, s, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`${COLOURS[c].name}, size ${s}`}
                  aria-invalid={invalid || undefined}
                  className="h-10 w-full max-w-16 rounded-[3px] border border-field bg-sheet text-center font-mono tabular-nums hover:border-ink-2 aria-[invalid=true]:border-error"
                />
              </td>
            ))}
            <td className="py-2 pl-3 text-right font-mono tabular-nums">{rowTotal(c)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="py-2.5 pr-3 text-left text-xs font-normal text-ink-3">
            All colours
          </th>
          {sizes.map((s) => (
            <td key={s} className="px-1 py-2.5 text-center font-mono text-xs text-ink-3 tabular-nums">
              {sizeTotal(s)}
            </td>
          ))}
          <td className="py-2.5 pl-3 text-right font-mono font-medium tabular-nums">{matrixTotal(matrix)}</td>
        </tr>
      </tfoot>
    </table>
  )
}
