export function pickAsset(
  preferred?: string | null,
  fallback?: string | null,
): string | null {
  const clean = (v?: string | null) => {
    const s = (v ?? '').trim();
    if (!s) return null;

    // ✅ aceita URL http(s)
    if (/^https?:\/\//i.test(s)) return s;

    // ✅ aceita path relativo do frontend
    // ex: /badges_leagues/uefa_champions_league.png
    if (s.startsWith('/')) return s;

    // (opcional) aceita também path sem /, tipo "badges_leagues/x.png"
    // if (!s.includes('://')) return s;

    return null;
  };

  return clean(preferred) ?? clean(fallback) ?? null;
}
