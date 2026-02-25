import ptLocale from 'i18n-iso-countries/langs/pt.json';
import * as countries from 'i18n-iso-countries';

const customEntries: Record<string, string | string[]> = {
  // Regiões do UK
  EI: 'Escócia',
  EN: 'Inglaterra',
  IA: 'Irlanda do Norte',
  WA: 'País de Gales',
  // Continentes/regiões
  EU: 'Europa',
  AC: 'América do Sul',
  NB: 'América do Norte e Central',
  OC: 'Oceania',
  AN: 'África',
  AA: 'Ásia',
  WO: 'Mundo',
};

export function getMergedPtLocale(): countries.LocaleData {
  return {
    ...ptLocale,
    countries: {
      ...ptLocale.countries,
      ...customEntries,
    },
  } as unknown as countries.LocaleData;
}
