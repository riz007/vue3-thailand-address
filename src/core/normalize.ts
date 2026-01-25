export function normalizeText(value: string): string {
  if (value == null) {
    return "";
  }

  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}
