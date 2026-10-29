/** Aceita só caminhos internos. Bloqueia open redirect (`//`, `://`, `\`). */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return '/dashboard';
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/dashboard';
  }
  if (value.includes('://') || value.includes('\\') || value.includes('\0')) {
    return '/dashboard';
  }
  return value;
}
