import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/libs/database';
import { FindMatchService } from './findMatchs.service';
import { MatchStatus } from '@prisma/client';
import { GetMatchDTO } from '../dto';

@Injectable()
export class SyncMatchSService {
  private readonly logger = new Logger(SyncMatchSService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly findMatchs: FindMatchService,
  ) {}

  // RECORD SYNC ERROR
  async recordSyncError(
    apiSportsEventId: string,
    error: string,
  ): Promise<void> {
    this.logger.warn(`Recording sync error for match: ${apiSportsEventId}`);

    const match =
      await this.findMatchs.findByApiSportsEventId(apiSportsEventId);

    if (!match) {
      this.logger.warn(`Match not found to record error: ${apiSportsEventId}`);
      return;
    }

    await this.prisma.externalMatch.update({
      where: { apiSportsEventId },
      data: {
        syncAttempts: { increment: 1 },
        syncError: error,
        lastSyncAt: new Date(),
      },
    });

    // Se muitas tentativas falharam, marcar como erro
    if (match.syncAttempts >= 5) {
      this.logger.error(
        `Match ${apiSportsEventId} failed 5+ times, marking as error`,
      );
      await this.prisma.externalMatch.update({
        where: { apiSportsEventId },
        data: { status: MatchStatus.CANCELLED },
      });
    }
  }

  // FIND MATCHES NEEDING SYNC
  async findMatchesNeedingSync(limit = 50): Promise<GetMatchDTO[]> {
    this.logger.log(`Finding matches needing sync (limit: ${limit})`);

    return this.prisma.externalMatch.findMany({
      where: {
        status: {
          in: [
            MatchStatus.SCHEDULED,
            MatchStatus.NOT_STARTED,
            MatchStatus.LIVE,
            MatchStatus.FIRST_HALF,
            MatchStatus.SECOND_HALF,
            MatchStatus.HALF_TIME,
          ],
        },
        syncAttempts: { lt: 5 }, // Não tentar mais que 5 vezes
      },
      orderBy: { eventDate: 'asc' },
      take: limit,
    });
  }
}
