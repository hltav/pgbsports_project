import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { EventLiveScoreDTO } from './../../../../../shared/thesportsdb-api/schemas/live/eventLiveScore.schema';

@Injectable()
export class ValidateEventService {
  private readonly logger = new Logger(ValidateEventService.name);

  constructor() {}

  //Valida se os dados do evento estão completos
  public validateEventData(eventData: EventLiveScoreDTO): {
    isValid: boolean;
    reason?: string;
  } {
    // Verificar se tem placares
    if (
      eventData.intHomeScore === undefined ||
      eventData.intAwayScore === undefined
    ) {
      return { isValid: false, reason: 'Missing final scores' };
    }
    // Verificar se está finalizado e tem placares HT
    const status = eventData.strStatus as MatchStatus;
    if (
      status === MatchStatus.FINISHED &&
      (eventData.homeScoreHT === undefined ||
        eventData.awayScoreHT === undefined)
    ) {
      // Definir placares HT como 0-0 se não tiver (fallback)
      eventData.homeScoreHT = 0;
      eventData.awayScoreHT = 0;
      this.logger.warn(
        `Missing HT scores for finished match, using 0-0 as fallback`,
      );
    }

    return { isValid: true };
  }
}
