import { DateTime } from 'luxon';
import { COUNTRY_TIMEZONES } from './countryTimezones.utils';

/**
 * Converte timestamp UTC para horário de Brasília
 */
export function convertToSaoPauloTime(utcTimestamp: string): Date {
  return DateTime.fromISO(utcTimestamp, { zone: 'utc' })
    .setZone('America/Sao_Paulo')
    .toJSDate();
}

/**
 * Formata data para exibição no horário de Brasília
 */
export function formatSaoPauloTime(
  utcTimestamp: string,
  formatString: string = "dd/MM/yyyy HH:mm 'BRT'",
): string {
  return DateTime.fromISO(utcTimestamp, { zone: 'utc' })
    .setZone('America/Sao_Paulo')
    .toFormat(formatString);
}

/**
 * Retorna informações completas de timezone
 */
export function getTimezoneInfo(utcTimestamp: string) {
  const utcDate = DateTime.fromISO(utcTimestamp, { zone: 'utc' });
  const saoPauloDate = utcDate.setZone('America/Sao_Paulo');

  return {
    utc: utcDate.toJSDate(),
    saoPaulo: saoPauloDate.toJSDate(),
    formatted: {
      utc: utcDate.toFormat("dd/MM/yyyy HH:mm 'UTC'"),
      saoPaulo: saoPauloDate.toFormat("dd/MM/yyyy HH:mm 'BRT'"),
      iso: {
        utc: utcDate.toISO(),
        saoPaulo: saoPauloDate.toISO(),
      },
    },
    offset: saoPauloDate.toFormat('ZZ'),
    offsetMinutes: saoPauloDate.offset,
  };
}

/**
 * Converte timestamp UTC para qualquer timezone
 */
export function convertToTimezone(
  utcTimestamp: string,
  timezone: string,
): Date {
  return DateTime.fromISO(utcTimestamp, { zone: 'utc' })
    .setZone(timezone)
    .toJSDate();
}

/**
 * Formata data em qualquer timezone
 */
export function formatInTimezone(
  utcTimestamp: string,
  timezone: string,
  formatString: string = 'dd/MM/yyyy HH:mm',
): string {
  return DateTime.fromISO(utcTimestamp, { zone: 'utc' })
    .setZone(timezone)
    .toFormat(formatString);
}

export function getTimezoneByCountry(country: string): string | null {
  return COUNTRY_TIMEZONES[country] || null;
}

/**
 * Valida se uma string de timezone é válida
 */
export function isValidTimezone(timezone: string): boolean {
  return DateTime.local().setZone(timezone).isValid;
}

/**
 * Retorna a diferença de horas entre dois timezones
 */
export function getTimezoneOffset(
  timezone1: string,
  timezone2: string,
  date?: Date,
): number {
  const dt = date ? DateTime.fromJSDate(date) : DateTime.now();
  const offset1 = dt.setZone(timezone1).offset;
  const offset2 = dt.setZone(timezone2).offset;
  return (offset1 - offset2) / 60;
}
