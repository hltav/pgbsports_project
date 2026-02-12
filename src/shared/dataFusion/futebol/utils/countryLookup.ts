import { COUNTRY_CANONICAL_MAP } from './countryAliases';

export type CountryKey = keyof typeof COUNTRY_CANONICAL_MAP;

export function baseNormalize(input: string): string {
  return (
    (input ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // ✅ mantém letras e números (pra w1, s2, etc)
      .replace(/[^a-z0-9]/g, '')
      .trim()
  );
}

export const countryLookup = new Map<string, CountryKey>();

function safeSet(key: string, value: CountryKey) {
  if (!key) return;

  // ✅ evita sobrescrever colisão
  if (!countryLookup.has(key)) {
    countryLookup.set(key, value);
    return;
  }

  // (opcional) debug em dev se colidir
  const existing = countryLookup.get(key);
  if (existing !== value && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️ countryLookup collision: "${key}" -> ${existing} (kept) vs ${value} (ignored)`,
    );
  }
}

for (const [key, data] of Object.entries(COUNTRY_CANONICAL_MAP)) {
  // O 'key' aqui é inferido como string, o que é compatível com CountryKey
  const countryKey = key;

  safeSet(baseNormalize(countryKey), countryKey);

  // Sem erro de 'never' aqui, pois data agora é CountryData
  if (data.apiFootball) {
    safeSet(baseNormalize(data.apiFootball), countryKey);
  }

  if (data.theSportsDB) {
    safeSet(baseNormalize(data.theSportsDB), countryKey);
  }

  // O operador ?? [] agora é seguro e reconhecido
  for (const alias of data.aliases) {
    safeSet(baseNormalize(alias), countryKey);
  }
}
