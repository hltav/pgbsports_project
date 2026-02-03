import { CountryKey } from '../futebol/utils/countryAliases';
import { baseNormalize, countryLookup } from '../futebol/utils/countryLookup';

export function normalizeCountry(input: string): string {
  if (!input) return '';

  const normalized = baseNormalize(input);

  return countryLookup.get(normalized) ?? normalized;
}

export function isCanonicalCountry(value: string): value is CountryKey {
  return countryLookup.has(value);
}
