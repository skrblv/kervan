function channels(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number]
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.18
}

/** Linear mix of two hex colours; t = 0 returns `a`, t = 1 returns `b`. */
export function mix(a: string, b: string, t: number): string {
  const ca = channels(a)
  const cb = channels(b)
  return `#${ca
    .map((c, i) =>
      Math.round(c + (cb[i]! - c) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}
