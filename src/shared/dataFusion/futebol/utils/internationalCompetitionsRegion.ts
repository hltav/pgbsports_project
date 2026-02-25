// internationalCompetitionsRegion.ts

import { CountryKey } from './countryAliases';

export const MAIN_COUNTRIES = [
  'Brasil',
  'Mundo',
  'Europa',
  'América do Sul',
  'América do Norte, Central e Caribe',
  'Asia',
  'África',
  'Oceania',
  'Inglaterra',
  'Espanha',
  'Alemanha',
  'Itália',
  'França',
  'Países Baixos',
  'Portugal',
] as const;

export type MainCountry = (typeof MAIN_COUNTRIES)[number];

// Labels PT/UX para países principais
export const COUNTRY_LABEL_PT: Partial<Record<CountryKey, string>> = {
  brazil: 'Brasil',
  world: 'Mundo',
  england: 'Inglaterra',
  spain: 'Espanha',
  italy: 'Itália',
  france: 'França',
  netherlands: 'Países Baixos',
  portugal: 'Portugal',
  'south america': 'América do Sul',
  'north and central america': 'América do Norte, Central e Caribe',
  asia: 'Ásia',
  africa: 'África',
  oceania: 'Oceania',
  europe: 'Europa',
};

// ================== MAPA POR ID ==================

export const INTERNATIONAL_REGION_BY_TSDB: Record<number, MainCountry> = {
  // MUNDIAIS (ficam em Mundo)
  4429: 'Mundo',
  4565: 'Mundo',
  5416: 'Mundo',
  5642: 'Mundo',
  4503: 'Mundo',
  5696: 'Mundo',

  // UEFA → Europa
  4480: 'Europa',
  4481: 'Europa',
  5071: 'Europa',
  4490: 'Europa',
  4502: 'Europa',
  4512: 'Europa',
  4566: 'Europa',
  4889: 'Europa',
  5414: 'Europa',
  5415: 'Europa',
  5417: 'Europa',

  // CONMEBOL → América do Sul
  4499: 'América do Sul',
  4501: 'América do Sul',
  4724: 'América do Sul',
  5665: 'América do Sul',
  5704: 'América do Sul',
  5655: 'América do Sul',

  // CONCACAF → América do Norte, Central e Caribe
  4873: 'América do Norte, Central e Caribe',
  4721: 'América do Norte, Central e Caribe',
  4739: 'América do Norte, Central e Caribe',
  5280: 'América do Norte, Central e Caribe',
  5281: 'América do Norte, Central e Caribe',
  5439: 'América do Norte, Central e Caribe',

  // CAF → África
  4496: 'África',
  4720: 'África',
  5057: 'África',
  5433: 'África',

  // AFC → Asia
  4866: 'Asia',
  4719: 'Asia',
  4804: 'Asia',
  5485: 'Asia',

  // OFC → Oceania
  5628: 'Oceania',

  // OUTRAS (minha sugestão: manter em Mundo)
  4562: 'Mundo',
  4569: 'Mundo',
  4505: 'Mundo',
  4498: 'Mundo',
  5039: 'Mundo',
  5384: 'Mundo',
  5263: 'Mundo',
  5105: 'Mundo',
  5683: 'Mundo',
  5674: 'Mundo',
};

export const INTERNATIONAL_REGION_BY_APS: Record<number, MainCountry> = {
  // MUNDIAIS
  1: 'Mundo',
  8: 'Mundo',
  587: 'Mundo',
  490: 'Mundo',
  15: 'Mundo',
  1168: 'Mundo',
  1024: 'Mundo',
  10: 'Mundo',
  667: 'Mundo',
  26: 'Mundo',
  21: 'Mundo',
  480: 'Mundo',
  524: 'Mundo',
  904: 'Mundo',
  860: 'Mundo',
  1129: 'Mundo',

  // UEFA
  2: 'Europa',
  3: 'Europa',
  848: 'Europa',
  5: 'Europa',
  4: 'Europa',
  531: 'Europa',
  38: 'Europa',
  525: 'Europa',
  493: 'Europa',
  921: 'Europa',
  14: 'Europa',
  32: 'Europa',
  1191: 'Europa',
  890: 'Europa',
  893: 'Europa',
  886: 'Europa',
  850: 'Europa',
  743: 'Europa',
  1083: 'Europa',
  1040: 'Europa',
  1102: 'Europa',
  918: 'Europa',

  // CONMEBOL
  9: 'América do Sul',
  13: 'América do Sul',
  11: 'América do Sul',
  541: 'América do Sul',
  949: 'América do Sul',
  926: 'América do Sul',
  1060: 'América do Sul',
  970: 'América do Sul',
  1081: 'América do Sul',
  540: 'América do Sul',
  1206: 'América do Sul',
  1085: 'América do Sul',

  // CONCACAF
  22: 'América do Norte, Central e Caribe',
  16: 'América do Norte, Central e Caribe',
  767: 'América do Norte, Central e Caribe',
  536: 'América do Norte, Central e Caribe',
  772: 'América do Norte, Central e Caribe',
  856: 'América do Norte, Central e Caribe',
  534: 'América do Norte, Central e Caribe',
  1028: 'América do Norte, Central e Caribe',
  858: 'América do Norte, Central e Caribe',
  1046: 'América do Norte, Central e Caribe',
  1057: 'América do Norte, Central e Caribe',
  808: 'América do Norte, Central e Caribe',
  1207: 'América do Norte, Central e Caribe',
  963: 'América do Norte, Central e Caribe',
  537: 'América do Norte, Central e Caribe',
  1066: 'América do Norte, Central e Caribe',
  1136: 'América do Norte, Central e Caribe',
  912: 'América do Norte, Central e Caribe',
  1001: 'América do Norte, Central e Caribe',
  881: 'América do Norte, Central e Caribe',
  1047: 'América do Norte, Central e Caribe',
  31: 'América do Norte, Central e Caribe',
  927: 'América do Norte, Central e Caribe',
  805: 'América do Norte, Central e Caribe',

  // CAF
  6: 'África',
  12: 'África',
  20: 'África',
  922: 'África',
  973: 'África',
  533: 'África',
  1015: 'África',
  1164: 'África',
  869: 'África',
  535: 'África',
  1159: 'África',

  // AFC
  7: 'Asia',
  17: 'Asia',
  18: 'Asia',
  1132: 'Asia',
  897: 'Asia',
  894: 'Asia',
  1101: 'Asia',
  1070: 'Asia',
  807: 'Asia',
  1012: 'Asia',
  1161: 'Asia',
  965: 'Asia',
  1153: 'Asia',
  532: 'Asia',
  952: 'Asia',
  1140: 'Asia',
  1008: 'Asia',
  35: 'Asia',
  1162: 'Asia',

  // OFC
  27: 'Oceania',
  806: 'Oceania',
  1122: 'Oceania',
  1214: 'Oceania',
};
