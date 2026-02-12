// export function pickAsset(
//   preferred?: string,
//   fallback?: string,
// ): string | null {
//   const p = (preferred ?? '').trim();
//   if (p.length > 0) return p;

//   const f = (fallback ?? '').trim();
//   if (f.length > 0) return f;

//   return null;
// }

// export function pickAsset(
//   preferred?: string | null,
//   fallback?: string | null,
// ): string | null {
//   const clean = (v?: string | null) => {
//     const s = (v ?? '').trim();
//     // aceita só URL “real” (ou ajuste se seus assets aceitam outros formatos)
//     if (!s) return null;
//     if (!/^https?:\/\//i.test(s)) return null;
//     return s;
//   };

//   return clean(preferred) ?? clean(fallback) ?? null;
// }

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
