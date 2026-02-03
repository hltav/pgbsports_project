import { COUNTRY_CANONICAL_MAP, CountryKey } from './countryAliases';

function baseNormalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '')
    .trim();
}

const countryLookup = new Map<string, CountryKey>();

for (const [key, data] of Object.entries(COUNTRY_CANONICAL_MAP)) {
  const countryKey = key as CountryKey;

  if (data.apiFootball) {
    countryLookup.set(baseNormalize(data.apiFootball), countryKey);
  }

  if (data.theSportsDB) {
    countryLookup.set(baseNormalize(data.theSportsDB), countryKey);
  }

  for (const alias of data.aliases ?? []) {
    countryLookup.set(baseNormalize(alias), countryKey);
  }
}

export { countryLookup, baseNormalize };
