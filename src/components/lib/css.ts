/** Resolve a CSS custom property token to a var() value. */
export function cssVar(token: string): string {
  return `var(${token})`
}
