import { Injectable, Logger } from '@nestjs/common';
import {
  LeagueTranslation,
  translateLeagueWithDebug,
} from '../utils/leagueTranslateRobust';
import { pickAsset } from '../utils/pickAsset';
import { translateCountry } from '../utils/translateCountryNames';

@Injectable()
export class LeagueTranslationService {
  private readonly logger = new Logger(LeagueTranslationService.name);

  getTranslation(
    originalName: string,
    currentCountry: string,
  ): LeagueTranslation {
    const dbg = translateLeagueWithDebug(originalName, currentCountry);

    // 1. Se não for um match forte, retorna o original imediatamente
    if (dbg.confidence !== 'high') {
      return { name: originalName };
    }

    const translation = dbg.translation as LeagueTranslation & {
      expectedCountry?: string;
    };

    if (translation.expectedCountry && currentCountry) {
      const normalizedCurrent = this.translateCountryName(currentCountry);

      if (translation.expectedCountry !== normalizedCurrent) {
        this.logger.warn(
          `Falso positivo evitado: Tradução "${translation.name}" ignorada para liga de "${normalizedCurrent}"`,
        );
        return { name: originalName };
      }
    }

    return translation;
  }

  translateLeagueName(originalName: string, country: string): string {
    return this.getTranslation(originalName, country).name;
  }

  hasTranslation(originalName: string): boolean {
    const dbg = translateLeagueWithDebug(originalName);

    return (
      dbg.confidence === 'high' &&
      (dbg.method === 'direct_exact' ||
        dbg.method === 'via_alias' ||
        dbg.method === 'normalized_direct')
    );
  }

  translateCountryName(originalCountry: string | null | undefined): string {
    return translateCountry(originalCountry);
  }

  /**
   * ✅ Logo: só usa o da tradução se existir e não for vazio.
   * Caso contrário, mantém o fallback (API).
   */
  getLeagueLogo(
    originalName: string,
    country: string,
    fallbackLogo?: string,
  ): string | null {
    const translation = this.getTranslation(originalName, country);
    return pickAsset(translation.logo, fallbackLogo);
  }

  /**
   * ✅ Flag: só usa o da tradução se existir e não for vazio.
   * Caso contrário, mantém o fallback (API).
   */
  getLeagueFlag(
    originalName: string,
    country: string,
    fallbackFlag?: string,
  ): string | null {
    const translation = this.getTranslation(originalName, country);
    return pickAsset(translation.flag, fallbackFlag);
  }

  // (Opcional) Debug útil em dev
  debug(originalName: string) {
    const dbg = translateLeagueWithDebug(originalName);

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `League="${originalName}" method=${dbg.method} confidence=${dbg.confidence} -> "${dbg.translation.name}"`,
      );
    }

    return dbg;
  }
}
