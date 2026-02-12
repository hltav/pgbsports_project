import { LEAGUE_NAME_ALIASES } from './leagueAliases';
import { leagueTranslations } from './translateLeagueNames';

export interface LeagueTranslation {
  name: string;
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

  translateWithDebug(leagueName: string) {
    const normalized = this.normalize(leagueName);

    if (leagueTranslations[leagueName]) {
      return {
        translation: leagueTranslations[leagueName],
        method: 'direct_exact',
        confidence: 'high' as const,
      };
    }

    const aliasValue = this.aliasIndex.get(normalized);
    if (aliasValue) {
      const translationKey = this.translationIndex.get(aliasValue);
      if (translationKey) {
        return {
          translation: leagueTranslations[translationKey],
          method: 'via_alias',
          confidence: 'high' as const,
        };
      }
      const partialMatch = this.findPartialMatch(aliasValue);
      if (partialMatch) {
        return {
          translation: leagueTranslations[partialMatch],
          method: 'alias_partial_match',
          confidence: 'medium' as const,
        };
      }
    }

    const directMatch = this.translationIndex.get(normalized);
    if (directMatch) {
      return {
        translation: leagueTranslations[directMatch],
        method: 'normalized_direct',
        confidence: 'high' as const,
      };
    }

    const keywordMatch = this.findByKeywords(leagueName);
    if (keywordMatch) {
      return {
        translation: leagueTranslations[keywordMatch],
        method: 'keyword_match',
        confidence: 'low' as const,
      };
    }

    return {
      translation: { name: leagueName },
      method: 'fallback',
      confidence: 'none' as const,
    };
  }
}

const translator = new LeagueTranslator();

export const translateLeague = (league: string): LeagueTranslation =>
  translator.translate(league);
export const translateLeagueWithDebug = (league: string) =>
  translator.translateWithDebug(league);
