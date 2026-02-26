import { Injectable, Logger } from '@nestjs/common';
import { UpdateMatchDTO } from '../dto';
import { SoccerService } from './../../../shared/api-sports/api/soccer/services/soccer.service';
import { UpdateMatchService } from './updateMatchs.service';
import { ApiSportsFixtureResponseItem } from '../dto/matchDetails.dto';
import { mapStrStatusToMatchStatus } from './../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';
import { MatchStatus } from '@prisma/client';

@Injectable()
export class ApiSportsSyncService {
  private readonly logger = new Logger(ApiSportsSyncService.name);

  constructor(
    private readonly soccerService: SoccerService,
    private readonly updateMatchService: UpdateMatchService,
  ) {}

  /**
   * Sincroniza uma partida específica da API-Sports
   * @param apiSportsEventId - ID da fixture na API-Sports (fixture.id)
   * @returns TRUE se a partida foi finalizada e salva, FALSE caso contrário
   */
  async syncFixtureById(apiSportsEventId: string): Promise<boolean> {
    try {
      this.logger.log(`🔍 Checking fixture status: ${apiSportsEventId}`);

      // 1️⃣ Busca dados da partida
      const fixtureResponse =
        await this.soccerService.getFixtureById(apiSportsEventId);

      if (!fixtureResponse.response || fixtureResponse.response.length === 0) {
        this.logger.warn(
          `❌ Fixture ${apiSportsEventId} not found in API-Sports`,
        );
        return false;
      }

      const fixture = fixtureResponse.response[0];

      // 2️⃣ Verifica se está finalizada
      const canonicalStatus = mapStrStatusToMatchStatus(
        fixture.fixture.status.short,
      );

      // const isFinished = fixture.fixture.status.short === 'FT';

      const isFinished = canonicalStatus === MatchStatus.FINISHED;

      this.logger.debug(
        `Fixture raw status: short=${fixture.fixture.status.short}, long=${fixture.fixture.status.long}`,
      );

      if (!isFinished) {
        this.logger.debug(
          `⏳ Fixture ${apiSportsEventId} not finished yet (${fixture.fixture.status.short}), skipping save`,
        );
        return false;
      }

      // 3️⃣ Extrai placares
      const homeScoreFT = fixture.score.fulltime.home ?? 0;
      const awayScoreFT = fixture.score.fulltime.away ?? 0;
      const homeScoreHT = fixture.score.halftime.home ?? 0;
      const awayScoreHT = fixture.score.halftime.away ?? 0;

      // 4️⃣ Monta dados para atualizar
      const scores: Partial<UpdateMatchDTO> = {
        homeScoreHT,
        awayScoreHT,
        homeScoreFT,
        awayScoreFT,
        status: fixture.fixture.status.short,

        // Campos opcionais (preenchidos apenas se null no banco)
        leagueId: fixture.league.id ? String(fixture.league.id) : undefined,
        season: fixture.league.season
          ? String(fixture.league.season)
          : undefined,
        round: fixture.league.round ? fixture.league.round : undefined,
        country: fixture.league.country || undefined,
        venue: fixture.fixture.venue?.name || undefined,
        thumbnail: fixture.league.logo || undefined,
        eventDateLocal: fixture.fixture.date
          ? new Date(fixture.fixture.date)
          : undefined,
        timezone: fixture.fixture.timezone || undefined,
      };

      this.logger.debug(
        `Scores being sent to updateScores: ${JSON.stringify(scores)}`,
      );

      // 5️⃣ Atualiza no banco (agora com apenas 3 parâmetros)
      await this.updateMatchService.updateScores(
        String(fixture.fixture.id),
        scores,
        fixture as unknown as ApiSportsFixtureResponseItem,
      );

      this.logger.log(
        `✅ Fixture ${apiSportsEventId} FINISHED and saved: ` +
          `${fixture.teams.home.name} ${homeScoreFT}-${awayScoreFT} ${fixture.teams.away.name}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `❌ Error syncing fixture ${apiSportsEventId}:`,
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  /**
   * Sincroniza múltiplas partidas de uma vez
   * Útil para processar várias apostas pendentes
   */
  async syncMultipleFixtures(apiSportsEventIds: string[]): Promise<{
    finished: number;
    pending: number;
    errors: number;
  }> {
    const stats = { finished: 0, pending: 0, errors: 0 };

    this.logger.log(
      `📊 Starting batch sync for ${apiSportsEventIds.length} fixtures`,
    );

    for (const eventId of apiSportsEventIds) {
      try {
        const isFinished = await this.syncFixtureById(eventId);
        if (isFinished) {
          stats.finished++;
        } else {
          stats.pending++;
        }
      } catch (error) {
        stats.errors++;
        this.logger.error(`Failed to sync ${eventId}:`, error);
      }

      // Evita rate limiting (API-Sports tem limite de requisições)
      await this.sleep(100); // 100ms entre requests
    }

    this.logger.log(
      `✅ Batch sync completed: ${stats.finished} finished | ` +
        `${stats.pending} pending | ${stats.errors} errors`,
    );

    return stats;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
