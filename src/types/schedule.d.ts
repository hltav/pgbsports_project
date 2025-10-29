declare module '@nestjs/schedule' {
  export enum CronExpression {
    EVERY_SECOND = '* * * * * *',
    EVERY_5_SECONDS = '*/5 * * * * *',
    EVERY_10_SECONDS = '*/10 * * * * *',
    EVERY_30_SECONDS = '*/30 * * * * *',
    EVERY_MINUTE = '*/1 * * * *',
    EVERY_5_MINUTES = '0 */5 * * * *',
    EVERY_10_MINUTES = '0 */10 * * * *',
    EVERY_30_MINUTES = '0 */30 * * * *',
    EVERY_HOUR = '0 * * * *',
    EVERY_DAY_AT_MIDNIGHT = '0 0 * * *',
    EVERY_DAY_AT_NOON = '0 12 * * *',
    EVERY_WEEK = '0 0 * * 0',
    EVERY_MONTH = '0 0 1 * *',
    EVERY_YEAR = '0 0 1 1 *',
  }

  export interface CronOptions {
    name?: string;
    timeZone?: string;
    utcOffset?: number;
    disabled?: boolean;
  }

  export function Cron(
    cronTime: string | Date,
    options?: CronOptions,
  ): MethodDecorator;

  export function Interval(ms: number): MethodDecorator;
  export function Timeout(ms: number): MethodDecorator;
}
