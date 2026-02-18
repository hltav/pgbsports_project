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
