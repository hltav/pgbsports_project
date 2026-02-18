import { LEAGUE_NAME_ALIASES } from './leagueAliases';
import { leagueTranslations } from './translateLeagueNames';

export interface LeagueTranslation {
  name: string;
  expectedCountry?: string;
  flag?: string;
  logo?: string;
}

class LeagueTranslator {
  private translationIndex: Map<string, string>;
  private aliasIndex: Map<string, string>;

  constructor() {
    this.translationIndex = new Map();
    this.aliasIndex = new Map();
    this.buildIndices();
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  private buildIndices(): void {
    Object.keys(leagueTranslations).forEach((key) => {
      this.translationIndex.set(this.normalize(key), key);
    });

    Object.entries(LEAGUE_NAME_ALIASES).forEach(([key, value]) => {
      this.aliasIndex.set(this.normalize(key), this.normalize(value));
    });

    // ⚠️ Evite logar em produção (fica melhor num logger do Nest, ver abaixo)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📊 Índices criados: ${this.translationIndex.size} traduções | ${this.aliasIndex.size} aliases`,
      );
    }
  }

  translate(leagueName: string): LeagueTranslation {
    if (!leagueName) return { name: leagueName || 'Unknown League' };

    const normalized = this.normalize(leagueName);

    // 1) exato
    if (leagueTranslations[leagueName]) return leagueTranslations[leagueName];

    // 2) alias
    const aliasValue = this.aliasIndex.get(normalized);
    if (aliasValue) {
      const translationKey = this.translationIndex.get(aliasValue);
      if (translationKey) return leagueTranslations[translationKey];

      const partialMatch = this.findPartialMatch(aliasValue);
      if (partialMatch) return leagueTranslations[partialMatch];
    }

    // 3) normalizado direto
    const directMatch = this.translationIndex.get(normalized);
    if (directMatch) return leagueTranslations[directMatch];

    // 4) keywords
    const keywordMatch = this.findByKeywords(leagueName);
    if (keywordMatch) return leagueTranslations[keywordMatch];

    return { name: leagueName };
  }

  private findPartialMatch(normalizedAlias: string): string | null {
    for (const [normalized, originalKey] of this.translationIndex.entries()) {
      if (
        normalized.includes(normalizedAlias) ||
        normalizedAlias.includes(normalized)
      ) {
        // (sua validação extra aqui, se quiser)
        return originalKey;
      }
    }
    return null;
  }

  private findByKeywords(leagueName: string): string | null {
    const keywords = leagueName
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (!keywords.length) return null;

    let bestMatch: string | null = null;
    let maxScore = 0;

    for (const originalKey of Object.keys(leagueTranslations)) {
      const keyKeywords = originalKey
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const common = keywords.filter((kw) =>
        keyKeywords.some((kkw) => kkw.includes(kw) || kw.includes(kkw)),
      );
      const score = common.length;

      if (score > maxScore && score >= 1) {
        maxScore = score;
        bestMatch = originalKey;
      }
    }
    return bestMatch;
  }

  translateWithDebug(leagueName: string, country?: string) {
    const normalized = this.normalize(leagueName);

    const buildResult = (
      translation: LeagueTranslation,
      method: string,
      confidence: 'high' | 'medium' | 'low',
    ) => {
      if (!this.validateCountry(translation, country)) {
        return {
          translation: { name: leagueName },
          method: `${method}_country_mismatch`,
          confidence: 'none' as const,
        };
      }

      return {
        translation,
        method,
        confidence,
      };
    };

    // 1️⃣ exato
    if (leagueTranslations[leagueName]) {
      return buildResult(
        leagueTranslations[leagueName],
        'direct_exact',
        'high',
      );
    }

    // 2️⃣ alias
    const aliasValue = this.aliasIndex.get(normalized);
    if (aliasValue) {
      const translationKey = this.translationIndex.get(aliasValue);

      if (translationKey) {
        return buildResult(
          leagueTranslations[translationKey],
          'via_alias',
          'high',
        );
      }

      const partialMatch = this.findPartialMatch(aliasValue);
      if (partialMatch) {
        return buildResult(
          leagueTranslations[partialMatch],
          'alias_partial_match',
          'medium',
        );
      }
    }

    // 3️⃣ normalizado direto
    const directMatch = this.translationIndex.get(normalized);
    if (directMatch) {
      return buildResult(
        leagueTranslations[directMatch],
        'normalized_direct',
        'high',
      );
    }

    // 4️⃣ keywords
    const keywordMatch = this.findByKeywords(leagueName);
    if (keywordMatch) {
      return buildResult(
        leagueTranslations[keywordMatch],
        'keyword_match',
        'low',
      );
    }

    return {
      translation: { name: leagueName },
      method: 'fallback',
      confidence: 'none' as const,
    };
  }

  private validateCountry(
    translation: LeagueTranslation,
    country?: string,
  ): boolean {
    if (!translation.expectedCountry || !country) return true;

    const normalizedInput = this.normalize(country);
    const normalizedExpected = this.normalize(translation.expectedCountry);

    return normalizedInput === normalizedExpected;
  }
}

const translator = new LeagueTranslator();

export const translateLeague = (league: string): LeagueTranslation =>
  translator.translate(league);
export const translateLeagueWithDebug = (league: string, country?: string) =>
  translator.translateWithDebug(league, country);
