import { normalizeCountry } from '../../helpers/normalizeCountryName.helper';

/**
 * Mapa de adjetivos gentílicos para nomes de países
 * Ex: "French" → "france", "English" → "england"
 */
export const COUNTRY_ADJECTIVES_MAP: Record<string, string> = {
  // Europa
  albanian: 'albania',
  andorran: 'andorra',
  armenian: 'armenia',
  austrian: 'austria',
  azerbaijani: 'azerbaijan',
  belarusian: 'belarus',
  belgian: 'belgium',
  bosnian: 'bosnia',
  bulgarian: 'bulgaria',
  croatian: 'croatia',
  cypriot: 'cyprus',
  czech: 'czechrepublic',
  danish: 'denmark',
  dutch: 'netherlands',
  english: 'england',
  estonian: 'estonia',
  faroe: 'faroeislands',
  finnish: 'finland',
  french: 'france',
  georgian: 'georgia',
  german: 'germany',
  gibraltarian: 'gibraltar',
  greek: 'greece',
  hungarian: 'hungary',
  icelandic: 'iceland',
  irish: 'ireland',
  israeli: 'israel',
  italian: 'italy',
  kosovan: 'kosovo',
  latvian: 'latvia',
  lithuanian: 'lithuania',
  luxembourgish: 'luxembourg',
  macedonian: 'macedonia',
  maltese: 'malta',
  moldovan: 'moldova',
  montenegrin: 'montenegro',
  norwegian: 'norway',
  polish: 'poland',
  portuguese: 'portugal',
  romanian: 'romania',
  russian: 'russia',
  scottish: 'scotland',
  serbian: 'serbia',
  slovakian: 'slovakia',
  slovenian: 'slovenia',
  spanish: 'spain',
  swedish: 'sweden',
  swiss: 'switzerland',
  turkish: 'turkey',
  ukrainian: 'ukraine',
  welsh: 'wales',

  // Américas
  american: 'usa',
  argentinian: 'argentina',
  bolivian: 'bolivia',
  brazilian: 'brazil',
  canadian: 'canada',
  chilean: 'chile',
  colombian: 'colombia',
  ecuadorian: 'ecuador',
  guatemalan: 'guatemala',
  honduran: 'honduras',
  jamaican: 'jamaica',
  mexican: 'mexico',
  nicaraguan: 'nicaragua',
  panamanian: 'panama',
  paraguayan: 'paraguay',
  peruvian: 'peru',
  uruguayan: 'uruguay',
  venezuelan: 'venezuela',

  // Ásia
  bahraini: 'bahrain',
  bangladeshi: 'bangladesh',
  cambodian: 'cambodia',
  chinese: 'china',
  indian: 'india',
  indonesian: 'indonesia',
  iranian: 'iran',
  iraqi: 'iraq',
  japanese: 'japan',
  jordanian: 'jordan',
  kuwaiti: 'kuwait',
  kyrgyz: 'kyrgyzstan',
  laotian: 'laos',
  lebanese: 'lebanon',
  malaysian: 'malaysia',
  maldivian: 'maldives',
  mongolian: 'mongolia',
  myanmar: 'myanmar',
  nepalese: 'nepal',
  omani: 'oman',
  pakistani: 'pakistan',
  palestinian: 'palestine',
  philippine: 'philippines',
  qatari: 'qatar',
  saudi: 'saudiarabia',
  singaporean: 'singapore',
  syrian: 'syria',
  taiwanese: 'taiwan',
  tajikistani: 'tajikistan',
  thai: 'thailand',
  turkmen: 'turkmenistan',
  uzbekistani: 'uzbekistan',
  vietnamese: 'vietnam',

  // África
  algerian: 'algeria',
  angolan: 'angola',
  beninese: 'benin',
  botswanan: 'botswana',
  burkinabe: 'burkinafaso',
  burundian: 'burundi',
  congolese: 'drcongo',
  egyptian: 'egypt',
  ethiopian: 'ethiopia',
  fijian: 'fiji',
  gambian: 'gambia',
  ghanaian: 'ghana',
  guinean: 'guinea',
  kenyan: 'kenya',
  liberian: 'liberia',
  libyan: 'libya',
  mauritanian: 'mauritania',
  moroccan: 'morocco',
  nigerian: 'nigeria',
  rwandan: 'rwanda',
  senegalese: 'senegal',
  somali: 'somalia',
  sudanese: 'sudan',
  tanzanian: 'tanzania',
  tunisian: 'tunisia',
  ugandan: 'uganda',
  zambian: 'zambia',
  zimbabwean: 'zimbabwe',

  // Oceania
  australian: 'australia',
};

export const specialCases: Record<string, string> = {
  england: 'england',
  scotland: 'scotland',
  wales: 'wales',
  usa: 'usa',
  brazil: 'brazil',
  france: 'france',
  germany: 'germany',
  italy: 'italy',
  spain: 'spain',
  portugal: 'portugal',
  argentina: 'argentina',
  mexico: 'mexico',
  chile: 'chile',
  uruguay: 'uruguay',
  colombia: 'colombia',
  peru: 'peru',
  venezuela: 'venezuela',
  bolivia: 'bolivia',
  ecuador: 'ecuador',
  paraguay: 'paraguay',
  australia: 'australia',
  japan: 'japan',
  china: 'china',
  india: 'india',
  russia: 'russia',
  turkey: 'turkey',
  israel: 'israel',
  qatar: 'qatar',
  egypt: 'egypt',
  morocco: 'morocco',
  tunisia: 'tunisia',
  algeria: 'algeria',
  nigeria: 'nigeria',
  ghana: 'ghana',
  kenya: 'kenya',
};

/**
 * Extrai o país do nome de uma liga do TSDB
 * Ex: "French Ligue 1" → "france"
 * Ex: "Brazilian Serie A" → "brazil"
 */
export function extractCountryFromLeagueName(
  leagueName: string,
): string | null {
  if (!leagueName) return null;

  const normalized = leagueName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 1️⃣ Tenta extrair o adjetivo gentílico no início
  const firstWord = normalized.split(/[\s-]/)[0];

  if (COUNTRY_ADJECTIVES_MAP[firstWord]) {
    const country = COUNTRY_ADJECTIVES_MAP[firstWord];
    return normalizeCountry(country);
  }

  // 2️⃣ Casos especiais com nome completo
  // Ex: "England Premier League", "Scotland Premier League"

  for (const [key, country] of Object.entries(specialCases)) {
    if (normalized.includes(key)) {
      return normalizeCountry(country);
    }
  }

  // 3️⃣ Casos especiais por palavra-chave
  if (normalized.includes('uefa') || normalized.includes('european')) {
    return 'world'; // Competições continentais
  }

  if (normalized.includes('fifa') || normalized.includes('world cup')) {
    return 'world';
  }

  if (normalized.includes('concacaf')) {
    return 'world';
  }

  if (
    normalized.includes('conmebol') ||
    normalized.includes('copa america') ||
    normalized.includes('libertadores') ||
    normalized.includes('sudamericana')
  ) {
    return 'world';
  }

  if (normalized.includes('afc') || normalized.includes('asian')) {
    return 'world';
  }

  if (normalized.includes('caf') || normalized.includes('african')) {
    return 'world';
  }

  if (normalized.includes('ofc')) {
    return 'world';
  }

  // ❌ Não conseguiu identificar
  return null;
}

/**
 * Versão que loga para debug
 */
export function extractCountryFromLeagueNameWithLog(
  leagueName: string,
): string | null {
  const result = extractCountryFromLeagueName(leagueName);

  if (!result) {
    console.log(`⚠️ Could not extract country from: "${leagueName}"`);
  }

  return result;
}
