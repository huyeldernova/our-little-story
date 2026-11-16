/** Fills "{name}"-style slots in a story text: fill('Đang chờ {name}…', { name: 'A' }). */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m))
}

/** Splits a "|"-separated story text into its parts (e.g. weekday or slot labels). */
export function parts(text: string): string[] {
  return text.split('|').map((x) => x.trim())
}
