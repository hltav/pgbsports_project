import * as countries from 'i18n-iso-countries';
import ptLocale from 'i18n-iso-countries/langs/pt.json';
import { COUNTRY_CANONICAL_MAP, CountryKey } from './countryAliases';

// Registrar o idioma com casting seguro
countries.registerLocale(ptLocale as countries.LocaleData);

export function translateCountry(
  countryName: string | null | undefined,
): string {
  if (!countryName) return 'Internacional';

  const search = countryName.trim().toLowerCase();

  // 1. PRIORIDADE: Busca no seu Mapa Canônico
  // Tipamos as entradas para evitar o erro de 'any'
  const entries = Object.entries(COUNTRY_CANONICAL_MAP) as [
    CountryKey,
    (typeof COUNTRY_CANONICAL_MAP)['brazil'],
  ][];

  for (const [canonical, data] of entries) {
    const apiFootball = data.apiFootball?.toLowerCase();
    const theSportsDB = data.theSportsDB?.toLowerCase();

    const isMatch =
      canonical === search ||
      apiFootball === search ||
      theSportsDB === search ||
      data.aliases.some((alias) => alias.toLowerCase() === search);

    if (isMatch) {
      // Usamos 'in' para checagem de propriedade segura sem casting para any
      if ('portuguese' in data) {
        return (data as { portuguese: string }).portuguese;
      }

      const isoAlias = data.aliases.find((a) => a.length === 2)?.toUpperCase();
      if (isoAlias) {
        const translated = countries.getName(isoAlias, 'pt');
        if (translated) return translated;
      }
      return canonical.charAt(0).toUpperCase() + canonical.slice(1);
    }
  }

  // 2. FALLBACK: Biblioteca ISO
  const codeFromEnglish = countries.getAlpha2Code(countryName, 'en');
  if (codeFromEnglish) {
    const translated = countries.getName(codeFromEnglish, 'pt');
    if (translated) return translated;
  }

  return countryName.trim();
}
