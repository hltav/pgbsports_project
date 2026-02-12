// import * as countries from 'i18n-iso-countries';
// import ptLocale from 'i18n-iso-countries/langs/pt.json';
// import { COUNTRY_CANONICAL_MAP, CountryKey } from './countryAliases';

// // Registrar o idioma com casting seguro
// countries.registerLocale(ptLocale as countries.LocaleData);

// export function translateCountry(
//   countryName: string | null | undefined,
// ): string {
//   if (!countryName) return 'Internacional';

//   const search = countryName.trim().toLowerCase();

//   // 1. PRIORIDADE: Busca no seu Mapa Canônico
//   // Tipamos as entradas para evitar o erro de 'any'
//   const entries = Object.entries(COUNTRY_CANONICAL_MAP) as [
//     CountryKey,
//     (typeof COUNTRY_CANONICAL_MAP)['brazil'],
//   ][];

//   for (const [canonical, data] of entries) {
//     const apiFootball = data.apiFootball?.toLowerCase();
//     const theSportsDB = data.theSportsDB?.toLowerCase();

//     const isMatch =
//       canonical === search ||
//       apiFootball === search ||
//       theSportsDB === search ||
//       data.aliases.some((alias) => alias.toLowerCase() === search);

//     if (isMatch) {
//       // Usamos 'in' para checagem de propriedade segura sem casting para any
//       if ('portuguese' in data) {
//         return (data as { portuguese: string }).portuguese;
//       }

//       const isoAlias = data.aliases.find((a) => a.length === 2)?.toUpperCase();
//       if (isoAlias) {
//         const translated = countries.getName(isoAlias, 'pt');
//         if (translated) return translated;
//       }
//       return canonical.charAt(0).toUpperCase() + canonical.slice(1);
//     }
//   }

//   // 2. FALLBACK: Biblioteca ISO
//   const codeFromEnglish = countries.getAlpha2Code(countryName, 'en');
//   if (codeFromEnglish) {
//     const translated = countries.getName(codeFromEnglish, 'pt');
//     if (translated) return translated;
//   }

//   return countryName.trim();
// }

import * as countries from 'i18n-iso-countries';
import ptLocale from 'i18n-iso-countries/langs/pt.json';
import { COUNTRY_CANONICAL_MAP } from './countryAliases';
import { baseNormalize } from './countryLookup'; // ou onde estiver seu baseNormalize

countries.registerLocale(ptLocale as unknown as countries.LocaleData);

function toTitleCase(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function pickAlpha2(aliases: readonly string[]): string | null {
  // alpha2: exatamente 2 letras
  const a2 = aliases.find((a) => /^[a-z]{2}$/i.test(a));
  return a2 ? a2.toUpperCase() : null;
}

export function translateCountry(
  countryName: string | null | undefined,
): string {
  if (!countryName?.trim()) return 'Internacional';

  const searchNorm = baseNormalize(countryName);

  for (const [canonical, data] of Object.entries(COUNTRY_CANONICAL_MAP)) {
    const canonicalNorm = baseNormalize(canonical);
    const apiNorm = data.apiFootball ? baseNormalize(data.apiFootball) : '';
    const tsdbNorm = data.theSportsDB ? baseNormalize(data.theSportsDB) : '';

    const aliasMatch = (data.aliases ?? []).some(
      (a) => baseNormalize(a) === searchNorm,
    );

    const isMatch =
      canonicalNorm === searchNorm ||
      apiNorm === searchNorm ||
      tsdbNorm === searchNorm ||
      aliasMatch;

    if (!isMatch) continue;

    const alpha2 = pickAlpha2(data.aliases ?? []);
    if (alpha2) {
      const translated = countries.getName(alpha2, 'pt');
      if (translated) return translated;
    }

    return data.theSportsDB || data.apiFootball || toTitleCase(canonical);
  }

  const alpha2FromEnglish = countries.getAlpha2Code(countryName, 'en');
  if (alpha2FromEnglish) {
    const translated = countries.getName(alpha2FromEnglish, 'pt');
    if (translated) return translated;
  }

  return countryName.trim();
}
