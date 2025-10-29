import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@prisma/client';
import { PrismaService } from '../../../libs/database/prisma';
import { TheSportsDbLiveApiService } from './theSportsDbLive.service';
import {
  LiveScoreEvent,
  parseLiveScores,
} from '../schemas/live/liveScore.schema';
import { EventLiveScoreDTO } from '../schemas/live/eventLiveScore.schema';

interface EventMarketAnalysis {
  result: Result;
  shouldUpdate: boolean;
}

@Injectable()
export class ResultUpdaterService {
  private readonly logger = new Logger(ResultUpdaterService.name);

  constructor(
    private prisma: PrismaService,
    private theSportsDbLiveApi: TheSportsDbLiveApiService,
  ) {}

  async updateAllPendingEvents(): Promise<void> {
    const pendingEvents = await this.prisma.event.findMany({
      where: { result: 'pending' },
    });

    this.logger.log(`Found ${pendingEvents.length} pending events to update`);

    for (const event of pendingEvents) {
      await this.updateEventResult(event.id);
    }
  }

  async updateEventResult(eventId: number): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.result !== 'pending') return;

    try {
      const sport = this.mapModalityToSport(event.modality);

      const liveScoresRaw = await this.theSportsDbLiveApi.getLiveScores(sport);
      const liveScores: LiveScoreEvent[] = parseLiveScores(liveScoresRaw);

      const liveEvent = this.findMatchingEvent(liveScores, event);
      if (!liveEvent) {
        this.logger.warn(`Live event not found for event ID ${eventId}`);
        return;
      }

      if (!this.theSportsDbLiveApi.isEventFinished(liveEvent)) {
        this.logger.log(`Event ${eventId} is still in progress`);
        return;
      }

      const analysis = this.analyzeEventResult(event, liveEvent);

      if (analysis.shouldUpdate) {
        await this.prisma.event.update({
          where: { id: eventId },
          data: { result: analysis.result },
        });

        this.logger.log(`Event ${eventId} updated to ${analysis.result}`);
      }
    } catch (error) {
      this.logger.error(`Error updating event ${eventId}`, error);
    }
  }

  private mapModalityToSport(modality: string): string {
    const mapping: Record<string, string> = {
      Futebol: 'soccer',
      Basquete: 'basketball',
      Tênis: 'tennis',
      Vôlei: 'volleyball',
    };
    return mapping[modality] || modality.toLowerCase();
  }

  // private findMatchingEvent(
  //   liveScores: LiveScoreEvent[],
  //   event: EventLiveScoreDTO,
  // ): LiveScoreEvent | null {
  //   return (
  //     liveScores.find((live) => {
  //       if (!live.dateEvent || !event.createdAt) return false;

  //       const apiDate = new Date(live.dateEvent).toISOString().split('T')[0];
  //       const eventDate = new Date(event.createdAt).toISOString().split('T')[0];

  //       const leagueMatch = live.strLeague === event.league;

  //       const [homeTeam, awayTeam] = event.event.split('-');

  //       const homeTeamMatch = homeTeam && live.strHomeTeam === homeTeam.trim();
  //       const awayTeamMatch = awayTeam && live.strAwayTeam === awayTeam.trim();

  //       return (
  //         apiDate === eventDate && leagueMatch && homeTeamMatch && awayTeamMatch
  //       );
  //     }) || null
  //   );
  // }
  private findMatchingEvent(
    liveScores: LiveScoreEvent[],
    event: EventLiveScoreDTO,
  ): LiveScoreEvent | null {
    return liveScores.find((live) => live.idEvent === event.apiEventId) || null;
  }

  private analyzeEventResult(
    event: EventLiveScoreDTO,
    liveEvent: LiveScoreEvent,
  ): EventMarketAnalysis {
    const homeScore = parseInt(liveEvent.intHomeScore || '0', 10);
    const awayScore = parseInt(liveEvent.intAwayScore || '0', 10);

    const market = event.market;
    const eventDetails = event.event;

    if (market.includes('Resultado Final')) {
      return this.analyzeResultadoFinal(eventDetails, homeScore, awayScore);
    }

    if (market.includes('Total de Gols')) {
      return this.analyzeTotalGols(eventDetails, homeScore, awayScore);
    }

    if (market.includes('Ambas')) {
      return this.analyzeAmbasMarcam(eventDetails, homeScore, awayScore);
    }

    if (market.includes('Placar Exato')) {
      return this.analyzePlacarExato(eventDetails, homeScore, awayScore);
    }

    if (market.includes('Dupla Chance')) {
      return this.analyzeDuplaChance(eventDetails, homeScore, awayScore);
    }

    return { result: Result.void, shouldUpdate: true };
  }

  private analyzeResultadoFinal(
    eventDetails: string,
    homeScore: number,
    awayScore: number,
  ): EventMarketAnalysis {
    let won = false;
    if (eventDetails.includes('Casa') && homeScore > awayScore) won = true;
    if (eventDetails.includes('Empate') && homeScore === awayScore) won = true;
    if (eventDetails.includes('Fora') && awayScore > homeScore) won = true;

    return { result: won ? Result.win : Result.lose, shouldUpdate: true };
  }

  private analyzeTotalGols(
    eventDetails: string,
    homeScore: number,
    awayScore: number,
  ): EventMarketAnalysis {
    const totalGols = homeScore + awayScore;
    const isMais = eventDetails.includes('Mais');
    const threshold = parseFloat(eventDetails.match(/\d+\.?\d*/)?.[0] || '0');

    let won = false;
    if (isMais && totalGols > threshold) won = true;
    if (!isMais && totalGols < threshold) won = true;

    return { result: won ? Result.win : Result.lose, shouldUpdate: true };
  }

  private analyzeAmbasMarcam(
    eventDetails: string,
    homeScore: number,
    awayScore: number,
  ): EventMarketAnalysis {
    const ambasMarcaram = homeScore > 0 && awayScore > 0;
    const totalGols = homeScore + awayScore;

    if (eventDetails.includes('Ambos marcam - Sim')) {
      return {
        result: ambasMarcaram ? Result.win : Result.lose,
        shouldUpdate: true,
      };
    }
    if (eventDetails.includes('Ambos marcam - Não')) {
      return {
        result: !ambasMarcaram ? Result.win : Result.lose,
        shouldUpdate: true,
      };
    }
    if (eventDetails.includes('Ambos marcam e + 2.5 gols')) {
      const won = ambasMarcaram && totalGols > 2.5;
      return { result: won ? Result.win : Result.lose, shouldUpdate: true };
    }
    if (eventDetails.includes('Ambos marcam ou + 2.5 gols')) {
      const won = ambasMarcaram || totalGols > 2.5;
      return { result: won ? Result.win : Result.lose, shouldUpdate: true };
    }

    return { result: Result.void, shouldUpdate: true };
  }

  private analyzePlacarExato(
    eventDetails: string,
    homeScore: number,
    awayScore: number,
  ): EventMarketAnalysis {
    const [expectedHome, expectedAway] = eventDetails.split('-').map(Number);
    const won = homeScore === expectedHome && awayScore === expectedAway;

    return { result: won ? Result.win : Result.lose, shouldUpdate: true };
  }

  private analyzeDuplaChance(
    eventDetails: string,
    homeScore: number,
    awayScore: number,
  ): EventMarketAnalysis {
    let won = false;

    if (eventDetails.includes('Casa ou Empate')) won = homeScore >= awayScore;
    else if (eventDetails.includes('Fora ou Empate'))
      won = awayScore >= homeScore;
    else if (eventDetails.includes('Casa ou Fora'))
      won = homeScore !== awayScore;

    return { result: won ? Result.win : Result.lose, shouldUpdate: true };
  }
}
