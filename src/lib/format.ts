const SOM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const USD = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const PERCENT = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })

/** Whole som with a thin-space thousands separator: 1 462. */
export function som(value: number): string {
  return SOM.format(Math.round(value)).replace(/,/g, ' ')
}

export function usd(value: number): string {
  return `$${USD.format(value)}`
}

export function percent(value: number): string {
  return PERCENT.format(value)
}

export function signedPercent(value: number): string {
  const rounded = Math.round(value * 100)
  if (rounded === 0) return '±0%'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`
}

export function cm(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

/** "+35", "−20" or "±0": a unit-cost difference in som. */
export function somDelta(value: number): string {
  const rounded = Math.round(value)
  if (rounded === 0) return '±0'
  return `${rounded > 0 ? '+' : '−'}${som(Math.abs(rounded))}`
}
