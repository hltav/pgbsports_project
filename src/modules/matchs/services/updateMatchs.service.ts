import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../libs/database';
import { UpdateMatchDTO, GetMatchDTO } from '../dto';
import { mapStrStatusToMatchStatus } from '../../../shared/thesportsdb-api/helpers/mapStatusToEvent.helper';
import { FindMatchService } from './findMatchs.service';
import { SyncMatchDetailsService } from './syncMatchDetails.service';
import { ApiSportsFixtureResponseItem } from '../dto/matchDetails.dto';

@Injectable()
export class UpdateMatchService {
  private readonly logger = new Logger(UpdateMatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly findMatchs: FindMatchService,
    private readonly syncMatchDetails: SyncMatchDetailsService,
  ) {}

  async update(id: number, data: UpdateMatchDTO): Promise<GetMatchDTO> {
    this.logger.log(`Updating match: ${id}`);

    await this.findMatchs.findOne(id);
    const { status, ...rest } = data;

    try {
      const match = await this.prisma.externalMatch.update({
        where: { id },
        data: {
          ...rest,
          // Converte a string para o Enum que o Prisma exige
          status: status ? mapStrStatusToMatchStatus(status) : undefined,
          lastSyncAt: new Date(),
        },
      });

      this.logger.log(`Match updated successfully: ${id}`);
      return match;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating match: ${error.message}`,
          error.stack,
        );
        throw error;
      }
      this.logger.error(
        `Unknown error updating match: ${JSON.stringify(error)}`,
      );
      throw new Error('Unknown error during match update');
    }
  }

  async updateScores(
    apiSportsEventId: string,
    scores: Partial<UpdateMatchDTO>,
    apiResponse?: ApiSportsFixtureResponseItem,
  ): Promise<GetMatchDTO> {
    this.logger.log(`Updating scores | apiSportsEventId=${apiSportsEventId}`);
    this.logger.debug(`updateScores received status=${scores.status}`);

    const statusEnum: MatchStatus | undefined = scores.status
      ? mapStrStatusToMatchStatus(scores.status)
      : undefined;

    this.logger.debug(`Mapped statusEnum=${statusEnum}`);

    // 1️⃣ Busca pelo apiSportsEventId
    const match = await this.prisma.externalMatch.findUnique({
      where: { apiSportsEventId },
    });

    // 2️⃣ Valida se existe
    if (!match) {
      throw new NotFoundException(
        `Match not found for apiSportsEventId=${apiSportsEventId}`,
      );
    }

    // 3️⃣ Prepara dados de atualização
    const updateData: Prisma.ExternalMatchUpdateInput = {
      homeScoreHT: scores.homeScoreHT,
      awayScoreHT: scores.awayScoreHT,
      homeScoreFT: scores.homeScoreFT,
      awayScoreFT: scores.awayScoreFT,
      status: statusEnum,
      lastSyncAt: new Date(),
      syncAttempts: 0,
      syncError: null,
    };

    // ✅ Se está finalizando pela API-Sports, marca a fonte
    if (
      statusEnum === MatchStatus.FINISHED &&
      scores.homeScoreFT !== undefined
    ) {
      updateData.apiSource = 'api-sports';
      this.logger.log(`🔒 Finalizing match by API-Sports (locking source)`);
    }

    // Campos opcionais: preenche apenas se estiverem null no banco
    if (scores.leagueId !== undefined && match.leagueId === null) {
      updateData.leagueId = scores.leagueId;
    }
    if (scores.season !== undefined && match.season === null) {
      updateData.season = scores.season;
    }
    if (scores.round !== undefined && match.round === null) {
      updateData.round = scores.round;
    }
    if (scores.country !== undefined && match.country === null) {
      updateData.country = scores.country;
    }
    if (scores.eventDateLocal !== undefined && match.eventDateLocal === null) {
      updateData.eventDateLocal = scores.eventDateLocal;
    }
    if (scores.timezone !== undefined && match.timezone === null) {
      updateData.timezone = scores.timezone;
    }
    if (scores.thumbnail !== undefined && match.thumbnail === null) {
      updateData.thumbnail = scores.thumbnail;
    }
    if (scores.venue !== undefined && match.venue === null) {
      updateData.venue = scores.venue;
    }

    // 4️⃣ Atualiza no banco
    const updated = await this.prisma.externalMatch.update({
      where: { id: match.id },
      data: updateData,
    });

    // DEBUG: Verifique se os requisitos para o sync detalhado são atendidos
    this.logger.debug(
      `Checking sync conditions: apiResponse=${!!apiResponse}, status=${statusEnum}`,
    );

    // Só entra aqui se o objeto da API vier junto E o jogo estiver finalizado
    // NOTA: Se quiser sincronizar eventos DURANTE o jogo, remova a condição do FINISHED
    if (apiResponse && statusEnum === MatchStatus.FINISHED) {
      try {
        this.logger.log(`Initiating detailed sync for match ${updated.id}...`);

        await this.syncMatchDetails.syncMatchDetails(updated.id, apiResponse);

        this.logger.log(
          `✓ Details synced | matchId=${updated.id} apiSportsEventId=${apiSportsEventId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync details | matchId=${updated.id}: ${error}`,
        );
      }
    }

    this.logger.log(
      `✓ Match updated: ${updated.id} | ${updated.homeTeam} ${updated.homeScoreFT ?? 0}-${updated.awayScoreFT ?? 0} ${updated.awayTeam} | Status: ${updated.status} | Source: ${updated.apiSource}`,
    );

    return updated;
  }
}
