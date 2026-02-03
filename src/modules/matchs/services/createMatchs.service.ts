import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from './../../../libs/database';
import { CreateMatchDTO, GetMatchDTO } from '../dto';
import { MatchStatus } from '@prisma/client';

@Injectable()
export class CreateMatchService {
  private readonly logger = new Logger(CreateMatchService.name);

  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateMatchDTO): Promise<GetMatchDTO> {
    this.logger.log(`Creating external match: ${data.apiSportsEventId}`);

    // Verificar se já existe
    const existing = await this.prisma.externalMatch.findUnique({
      where: { apiSportsEventId: data.apiSportsEventId },
    });

    if (existing) {
      throw new ConflictException(
        `Match with apiSportsEventId ${data.apiSportsEventId} already exists`,
      );
    }
    try {
      const { status, ...rest } = data;
      const match = await this.prisma.externalMatch.create({
        data: {
          ...rest,
          status: (status || 'SCHEDULED') as MatchStatus,
          tsdbEventId: data.tsdbEventId || data.apiSportsEventId,
          lastSyncAt: new Date(),
          syncAttempts: 0,
        },
      });
      this.logger.log(`Match created successfully: ${match.id}`);
      return match;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating match: ${error.message}`,
          error.stack,
        );
        throw error;
      }
      // Caso seja um erro desconhecido, registre como JSON
      this.logger.error(
        `Unknown error creating match: ${JSON.stringify(error)}`,
      );
      throw new Error('Unknown error during match creation');
    }
  }
}
