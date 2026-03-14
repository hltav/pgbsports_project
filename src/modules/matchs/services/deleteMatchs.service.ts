import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../libs/database';
import { FindMatchService } from './findMatchs.service';

@Injectable()
export class DeleteMatchService {
  private readonly logger = new Logger(DeleteMatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly findMatchs: FindMatchService,
  ) {}

  // DELETE
  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting match: ${id}`);
    // Verificar se existe
    await this.findMatchs.findOne(id);
    // Verificar se tem apostas associadas
    const betsCount = await this.prisma.bets.count({
      where: { externalMatchId: id },
    });

    if (betsCount > 0) {
      throw new ConflictException(
        `Cannot delete match with ${betsCount} associated bets. Set externalMatchId to null first.`,
      );
    }

    await this.prisma.externalMatch.delete({
      where: { id },
    });

    this.logger.log(`Match deleted successfully: ${id}`);
  }
}
