export function parseScore(
  value: string | number | null | undefined,
): number | null {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return isNaN(parsed) ? null : parsed;
}
