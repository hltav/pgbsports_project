import { Injectable, Logger } from '@nestjs/common';
import {
  ShouldAnalyzeResult,
  EarlyWinnerResult,
} from '../interfaces/earlyWinner.interface';

// // 🔥 Type guard para validar se é um evento válido
// function isValidEvent(event: unknown): event is ApiSportsEventDto {
//   if (!event || typeof event !== 'object') return false;

//   const e = event as Record<string, unknown>;

//   return (
//     typeof e.type === 'string' &&
//     e.team !== null &&
//     typeof e.team === 'object' &&
//     e.time !== null &&
//     typeof e.time === 'object'
//   );
// }

// // 🔥 Type guard para validar estrutura de time
// function hasValidTeam(event: ApiSportsEventDto): boolean {
//   return (
//     event.team !== null &&
//     typeof event.team === 'object' &&
//     typeof event.team.id === 'number'
//   );
// }

// // 🔥 Type guard para validar estrutura de tempo
// function hasValidTime(event: ApiSportsEventDto): boolean {
//   return (
//     event.time !== null &&
//     typeof event.time === 'object' &&
//     typeof event.time.elapsed === 'number'
//   );
// }

// @Injectable()
// export class EarlyWinnerEventsAnalyzerService {
//   private readonly logger = new Logger(EarlyWinnerEventsAnalyzerService.name);

//   /**
//    * 🔥 PRÉ-FILTRO: Determina se deve analisar eventos baseado no resultado final
//    */
//   shouldAnalyzeEvents(
//     selection: string,
//     homeScoreFT: number,
//     awayScoreFT: number,
//   ): ShouldAnalyzeResult {
//     const normalizedSelection = selection.toLowerCase().trim();

//     let selectedTeam: 'home' | 'away' | null = null;

//     if (
//       normalizedSelection.includes('casa') ||
//       normalizedSelection.includes('home') ||
//       normalizedSelection === '1' ||
//       normalizedSelection.includes('mandante')
//     ) {
//       selectedTeam = 'home';
//     } else if (
//       normalizedSelection.includes('fora') ||
//       normalizedSelection.includes('away') ||
//       normalizedSelection === '2' ||
//       normalizedSelection.includes('visitante')
//     ) {
//       selectedTeam = 'away';
//     }

//     if (!selectedTeam) {
//       return {
//         shouldAnalyze: false,
//         reason: `Invalid selection: ${selection}`,
//         immediateResult: null,
//       };
//     }

//     const selectedScore = selectedTeam === 'home' ? homeScoreFT : awayScoreFT;
//     const opponentScore = selectedTeam === 'home' ? awayScoreFT : homeScoreFT;

//     // 🔥 REGRA 1: Se o time selecionado fez menos de 2 gols, IMPOSSÍVEL ter tido 2 de vantagem
//     if (selectedScore < 2) {
//       return {
//         shouldAnalyze: false,
//         reason: `${selectedTeam} scored only ${selectedScore} goal(s), impossible to have 2+ advantage`,
//         immediateResult: 'lose',
//       };
//     }

//     // 🔥 REGRA 2: Se o time selecionado VENCEU o jogo, já ganhou normalmente
//     if (selectedScore > opponentScore) {
//       return {
//         shouldAnalyze: false,
//         reason: `${selectedTeam} won the match normally (${homeScoreFT}-${awayScoreFT})`,
//         immediateResult: 'win',
//       };
//     }

//     // 🔥 REGRA 3: Se empatou ou perdeu MAS fez 2+ gols, DEVE analisar eventos
//     return {
//       shouldAnalyze: true,
//       reason: `${selectedTeam} scored ${selectedScore} but didn't win (${homeScoreFT}-${awayScoreFT}). Checking if had 2+ advantage during match`,
//       immediateResult: null,
//     };
//   }

//   /**
//    * Analisa eventos do jogo para determinar se houve vencedor antecipado (2+ gols de vantagem)
//    */
//   analyzeEarlyWinner(
//     events: unknown,
//     homeTeamId: number,
//     awayTeamId: number,
//   ): EarlyWinnerResult {
//     // Converter unknown para array tipado
//     const eventsArray = this.extractEventsFromDetails(events);

//     if (eventsArray.length === 0) {
//       this.logger.debug('No events to analyze');
//       return {
//         hadEarlyWinner: false,
//         winningTeam: null,
//         minuteReached: null,
//         scoreWhenReached: null,
//         finalScore: { home: 0, away: 0 },
//         timeline: [],
//       };
//     }

//     // Filtrar apenas gols válidos
//     const goals = eventsArray
//       .filter((event): event is ApiSportsEventDto => {
//         if (!isValidEvent(event)) return false;
//         const isGoal = event.type === 'Goal';
//         const hasTeam = hasValidTeam(event);
//         const hasTime = hasValidTime(event);
//         return isGoal && hasTeam && hasTime;
//       })
//       .sort((a, b) => {
//         const timeA = (a.time?.elapsed ?? 0) + (a.time?.extra ?? 0);
//         const timeB = (b.time?.elapsed ?? 0) + (b.time?.extra ?? 0);
//         return timeA - timeB;
//       });

//     this.logger.debug(`Found ${goals.length} goals in events`);

//     let homeScore = 0;
//     let awayScore = 0;
//     let hadEarlyWinner = false;
//     let winningTeam: 'home' | 'away' | null = null;
//     let minuteReached: number | null = null;
//     let scoreWhenReached: { home: number; away: number } | null = null;

//     const timeline: EarlyWinnerResult['timeline'] = [];

//     for (const goal of goals) {
//       const minute = (goal.time?.elapsed ?? 0) + (goal.time?.extra ?? 0);
//       const goalTeamId = goal.team?.id;

//       if (!goalTeamId) {
//         this.logger.warn(`Goal at ${minute}' has no team ID, skipping`);
//         continue;
//       }

//       const isHomeGoal = goalTeamId === homeTeamId;
//       const isAwayGoal = goalTeamId === awayTeamId;

//       // 🔥 Validação de segurança: o gol deve ser de um dos dois times
//       if (!isHomeGoal && !isAwayGoal) {
//         this.logger.warn(
//           `Goal at ${minute}' is from unknown team (ID: ${goalTeamId}), expected ${homeTeamId} or ${awayTeamId}`,
//         );
//         continue;
//       }
//       const scoringTeam = isHomeGoal ? 'home' : 'away';

//       if (isHomeGoal) {
//         homeScore++;
//       } else {
//         awayScore++;
//       }

//       const advantage = Math.abs(homeScore - awayScore);
//       const eventType = goal.type ?? 'Goal';
//       const detail = goal.detail ?? '';

//       timeline.push({
//         minute,
//         homeScore,
//         awayScore,
//         advantage,
//         scoringTeam,
//         eventType,
//         detail,
//       });

//       this.logger.debug(
//         `⚽ Goal at ${minute}' by ${scoringTeam} (${goal.team?.name ?? 'Unknown'}) | ` +
//           `Score: ${homeScore}-${awayScore} | Advantage: ${advantage}`,
//       );

//       // 🔥 Verificar se atingiu 2+ gols de vantagem pela primeira vez
//       if (!hadEarlyWinner && advantage >= 2) {
//         hadEarlyWinner = true;
//         winningTeam = homeScore > awayScore ? 'home' : 'away';
//         minuteReached = minute;
//         scoreWhenReached = { home: homeScore, away: awayScore };

//         this.logger.log(
//           `⚡ EARLY WINNER DETECTED at ${minute}' | ` +
//             `Score: ${homeScore}-${awayScore} | ` +
//             `Winner: ${winningTeam} (${goal.team?.name ?? 'Unknown'})`,
//         );
//       }
//     }

//     return {
//       hadEarlyWinner,
//       winningTeam,
//       minuteReached,
//       scoreWhenReached,
//       finalScore: { home: homeScore, away: awayScore },
//       timeline,
//     };
//   }

//   /**
//    * Verifica se uma aposta específica seria vencedora antecipada
//    */
//   checkBetEarlyWinner(
//     selection: string,
//     analysis: EarlyWinnerResult,
//   ): {
//     isWinner: boolean;
//     reason: string;
//   } {
//     if (!analysis.hadEarlyWinner) {
//       return {
//         isWinner: false,
//         reason: 'No team reached 2+ goals advantage during the match',
//       };
//     }

//     const normalizedSelection = selection.toLowerCase().trim();

//     let expectedWinner: 'home' | 'away' | null = null;

//     if (
//       normalizedSelection.includes('casa') ||
//       normalizedSelection.includes('home') ||
//       normalizedSelection === '1' ||
//       normalizedSelection.includes('mandante')
//     ) {
//       expectedWinner = 'home';
//     } else if (
//       normalizedSelection.includes('fora') ||
//       normalizedSelection.includes('away') ||
//       normalizedSelection === '2' ||
//       normalizedSelection.includes('visitante')
//     ) {
//       expectedWinner = 'away';
//     }

//     if (!expectedWinner) {
//       this.logger.warn(`Invalid selection format: "${selection}"`);
//       return {
//         isWinner: false,
//         reason: `Invalid selection format: ${selection}`,
//       };
//     }

//     const isWinner = analysis.winningTeam === expectedWinner;

//     return {
//       isWinner,
//       reason: isWinner
//         ? `${expectedWinner.toUpperCase()} reached 2+ goals advantage at minute ${analysis.minuteReached} (Score: ${analysis.scoreWhenReached!.home}-${analysis.scoreWhenReached!.away})`
//         : `${analysis.winningTeam?.toUpperCase() ?? 'UNKNOWN'} reached 2+ goals advantage at minute ${analysis.minuteReached}, but bet was on ${expectedWinner.toUpperCase()}`,
//     };
//   }

//   /**
//    * Helper para extrair e validar eventos do JSON do Prisma
//    */
//   extractEventsFromDetails(detailsEvents: unknown): ApiSportsEventDto[] {
//     // Retorna array vazio se for null/undefined
//     if (!detailsEvents) {
//       return [];
//     }

//     // Se já é array, valida e retorna
//     if (Array.isArray(detailsEvents)) {
//       return detailsEvents.filter(isValidEvent);
//     }

//     // Se está em algum wrapper, tenta extrair
//     if (typeof detailsEvents === 'object') {
//       const wrapped = detailsEvents as Record<string, unknown>;
//       if (wrapped.events && Array.isArray(wrapped.events)) {
//         return wrapped.events.filter(isValidEvent);
//       }
//     }

//     return [];
//   }
// }

type UnknownRecord = Record<string, unknown>;

// Tipo mínimo que você REALMENTE precisa para a regra
type GoalEvent = {
  type: 'Goal';
  team: { id: number; name?: string | null };
  time: { elapsed: number; extra?: number | null };
  detail?: string | null;
};

// helpers seguros
function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isGoalEvent(value: unknown): value is GoalEvent {
  if (!isRecord(value)) return false;

  // type
  if (value.type !== 'Goal') return false;

  // team
  if (!isRecord(value.team)) return false;
  if (typeof value.team.id !== 'number') return false;
  if (
    'name' in value.team &&
    value.team.name != null &&
    typeof value.team.name !== 'string'
  ) {
    return false;
  }

  // time
  if (!isRecord(value.time)) return false;
  if (typeof value.time.elapsed !== 'number') return false;
  if (
    'extra' in value.time &&
    value.time.extra != null &&
    typeof value.time.extra !== 'number'
  ) {
    return false;
  }

  // detail (opcional)
  if (
    'detail' in value &&
    value.detail != null &&
    typeof value.detail !== 'string'
  ) {
    return false;
  }

  return true;
}

function getMinute(time: GoalEvent['time']): number {
  return time.elapsed + (time.extra ?? 0);
}

@Injectable()
export class EarlyWinnerEventsAnalyzerService {
  private readonly logger = new Logger(EarlyWinnerEventsAnalyzerService.name);

  shouldAnalyzeEvents(
    selection: string,
    homeScoreFT: number,
    awayScoreFT: number,
  ): ShouldAnalyzeResult {
    const normalizedSelection = selection.toLowerCase().trim();

    let selectedTeam: 'home' | 'away' | null = null;

    if (
      normalizedSelection.includes('casa') ||
      normalizedSelection.includes('home') ||
      normalizedSelection === '1' ||
      normalizedSelection.includes('mandante')
    ) {
      selectedTeam = 'home';
    } else if (
      normalizedSelection.includes('fora') ||
      normalizedSelection.includes('away') ||
      normalizedSelection === '2' ||
      normalizedSelection.includes('visitante')
    ) {
      selectedTeam = 'away';
    }

    if (!selectedTeam) {
      return {
        shouldAnalyze: false,
        reason: `Invalid selection: ${selection}`,
        immediateResult: null,
      };
    }

    const selectedScore = selectedTeam === 'home' ? homeScoreFT : awayScoreFT;
    const opponentScore = selectedTeam === 'home' ? awayScoreFT : homeScoreFT;

    if (selectedScore < 2) {
      return {
        shouldAnalyze: false,
        reason: `${selectedTeam} scored only ${selectedScore} goal(s), impossible to have 2+ advantage`,
        immediateResult: 'lose',
      };
    }

    if (selectedScore > opponentScore) {
      return {
        shouldAnalyze: false,
        reason: `${selectedTeam} won the match normally (${homeScoreFT}-${awayScoreFT})`,
        immediateResult: 'win',
      };
    }

    return {
      shouldAnalyze: true,
      reason: `${selectedTeam} scored ${selectedScore} but didn't win (${homeScoreFT}-${awayScoreFT}). Checking if had 2+ advantage during match`,
      immediateResult: null,
    };
  }

  analyzeEarlyWinner(
    events: unknown,
    homeTeamId: number,
    awayTeamId: number,
  ): EarlyWinnerResult {
    const eventsArray = this.extractEventsFromDetails(events);

    if (eventsArray.length === 0) {
      this.logger.debug('No events to analyze');
      return {
        hadEarlyWinner: false,
        winningTeam: null,
        minuteReached: null,
        scoreWhenReached: null,
        finalScore: { home: 0, away: 0 },
        timeline: [],
      };
    }

    // ✅ A partir daqui, só GoalEvent (seguro)
    const goals = eventsArray
      .filter(isGoalEvent)
      .sort((a, b) => getMinute(a.time) - getMinute(b.time));

    this.logger.debug(`Found ${goals.length} goals in events`);

    let homeScore = 0;
    let awayScore = 0;
    let hadEarlyWinner = false;
    let winningTeam: 'home' | 'away' | null = null;
    let minuteReached: number | null = null;
    let scoreWhenReached: { home: number; away: number } | null = null;

    const timeline: EarlyWinnerResult['timeline'] = [];

    for (const goal of goals) {
      const minute = getMinute(goal.time);
      const goalTeamId = goal.team.id;

      const isHomeGoal = goalTeamId === homeTeamId;
      const isAwayGoal = goalTeamId === awayTeamId;

      if (!isHomeGoal && !isAwayGoal) {
        this.logger.warn(
          `Goal at ${minute}' is from unknown team (ID: ${goalTeamId}), expected ${homeTeamId} or ${awayTeamId}`,
        );
        continue;
      }

      const scoringTeam = isHomeGoal ? 'home' : 'away';

      if (isHomeGoal) homeScore++;
      else awayScore++;

      const advantage = Math.abs(homeScore - awayScore);

      timeline.push({
        minute,
        homeScore,
        awayScore,
        advantage,
        scoringTeam,
        eventType: goal.type,
        detail: goal.detail ?? '',
      });

      this.logger.debug(
        `⚽ Goal at ${minute}' by ${scoringTeam} (${goal.team.name ?? 'Unknown'}) | ` +
          `Score: ${homeScore}-${awayScore} | Advantage: ${advantage}`,
      );

      if (!hadEarlyWinner && advantage >= 2) {
        hadEarlyWinner = true;
        winningTeam = homeScore > awayScore ? 'home' : 'away';
        minuteReached = minute;
        scoreWhenReached = { home: homeScore, away: awayScore };

        this.logger.log(
          `⚡ EARLY WINNER DETECTED at ${minute}' | ` +
            `Score: ${homeScore}-${awayScore} | ` +
            `Winner: ${winningTeam} (${goal.team.name ?? 'Unknown'})`,
        );
      }
    }

    return {
      hadEarlyWinner,
      winningTeam,
      minuteReached,
      scoreWhenReached,
      finalScore: { home: homeScore, away: awayScore },
      timeline,
    };
  }

  checkBetEarlyWinner(
    selection: string,
    analysis: EarlyWinnerResult,
  ): { isWinner: boolean; reason: string } {
    if (!analysis.hadEarlyWinner) {
      return {
        isWinner: false,
        reason: 'No team reached 2+ goals advantage during the match',
      };
    }

    const normalizedSelection = selection.toLowerCase().trim();

    let expectedWinner: 'home' | 'away' | null = null;

    if (
      normalizedSelection.includes('casa') ||
      normalizedSelection.includes('home') ||
      normalizedSelection === '1' ||
      normalizedSelection.includes('mandante')
    ) {
      expectedWinner = 'home';
    } else if (
      normalizedSelection.includes('fora') ||
      normalizedSelection.includes('away') ||
      normalizedSelection === '2' ||
      normalizedSelection.includes('visitante')
    ) {
      expectedWinner = 'away';
    }

    if (!expectedWinner) {
      this.logger.warn(`Invalid selection format: "${selection}"`);
      return {
        isWinner: false,
        reason: `Invalid selection format: ${selection}`,
      };
    }

    const isWinner = analysis.winningTeam === expectedWinner;

    return {
      isWinner,
      reason: isWinner
        ? `${expectedWinner.toUpperCase()} reached 2+ goals advantage at minute ${analysis.minuteReached} (Score: ${analysis.scoreWhenReached!.home}-${analysis.scoreWhenReached!.away})`
        : `${analysis.winningTeam?.toUpperCase() ?? 'UNKNOWN'} reached 2+ goals advantage at minute ${analysis.minuteReached}, but bet was on ${expectedWinner.toUpperCase()}`,
    };
  }

  extractEventsFromDetails(detailsEvents: unknown): unknown[] {
    if (!detailsEvents) return [];

    if (Array.isArray(detailsEvents)) return detailsEvents;

    if (isRecord(detailsEvents) && Array.isArray(detailsEvents.events)) {
      return detailsEvents.events;
    }

    return [];
  }
}
