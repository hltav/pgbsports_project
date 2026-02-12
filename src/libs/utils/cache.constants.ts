// Unidades base de tempo em milissegundos
const SEC = 1;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY; // Definindo uma base para meses
const YEAR = 365 * DAY;

/**
 * Cache TTL Configuration
 * Usamos 'as const' para que o TS entenda que esses valores são literais e imutáveis.
 */
export const CACHE_TTL = Object.freeze({
  // --- Tempos Úteis (Acesso rápido) ---
  //SEC
  TEN_SECONDS: 10 * SEC,

  //MIN
  THIRTY_SECONDS: 30 * SEC,
  ONE_MINUTE: 1 * MIN,
  FIVE_MINUTES: 5 * MIN,
  THIRTY_MINUTES: 30 * MIN,

  //HOUR
  ONE_HOUR: 1 * HOUR,
  SIX_HOURS: 6 * HOUR,

  //DAY
  ONE_DAY: 1 * DAY,
  ONE_WEEK: 7 * DAY,

  //MONTH
  ONE_MONTH: 1 * MONTH,
  TWO_MONTH: 2 * MONTH,
  THREE_MONTHS: 3 * MONTH,
  SIX_MONTHS: 6 * MONTH,
  NINE_MONTHS: 9 * MONTH,

  //YEAR
  ONE_YEAR: 1 * YEAR,

  // --- Mapeamento para Regras de Negócio ---
  API_SHORT: 1 * DAY,
  API_LONG: 30 * DAY,
  DISCOVERY_1_DAY: 1 * DAY,
  DISCOVERY_2_DAY: 2 * DAY,
  DISCOVERY_1_MONTH: 30 * DAY,
  DISCOVERY_2_MONTH: 60 * DAY,
  DISCOVERY_FAST_1_HOUR: 1 * HOUR,
  DISCOVERY_FAST_6_HOUR: 6 * HOUR,
  DISCOVERY_FAST_12_HOUR: 12 * HOUR,
} as const);

// Criamos um tipo baseado no objeto para uso em outras partes do sistema (opcional)
export type CacheTTL = typeof CACHE_TTL;
