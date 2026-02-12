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

  // ✅ Tradução “strict”: só aplica se for forte; senão devolve original
  getTranslation(originalName: string): LeagueTranslation {
    const dbg = translateLeagueWithDebug(originalName);

    const isStrong =
      dbg.confidence === 'high' &&
      (dbg.method === 'direct_exact' ||
        dbg.method === 'via_alias' ||
        dbg.method === 'normalized_direct');

    if (!isStrong) {
      return { name: originalName };
    }

    return dbg.translation;
  }

  translateLeagueName(originalName: string): string {
    return this.getTranslation(originalName).name;
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
  getLeagueLogo(originalName: string, fallbackLogo?: string): string | null {
    const translation = this.getTranslation(originalName);
    return pickAsset(translation.logo, fallbackLogo);
  }

  /**
   * ✅ Flag: só usa o da tradução se existir e não for vazio.
   * Caso contrário, mantém o fallback (API).
   */
  getLeagueFlag(originalName: string, fallbackFlag?: string): string | null {
    const translation = this.getTranslation(originalName);
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
