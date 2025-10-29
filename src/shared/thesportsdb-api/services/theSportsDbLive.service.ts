import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  LiveScoreEvent,
  LiveScoreEventSchema,
} from '../schemas/live/liveScore.schema';
import { z } from 'zod';

const LiveScoreApiResponseSchema = z.object({
  events: z.array(LiveScoreEventSchema).optional(),
});

@Injectable()
export class TheSportsDbLiveApiService {
  private readonly logger = new Logger(TheSportsDbLiveApiService.name);
  private readonly baseUrl =
    'https://www.thesportsdb.com/api/v2/json/livescore';

  constructor(private readonly httpService: HttpService) {}

  async getLiveScores(sport: string): Promise<LiveScoreEvent[]> {
    try {
      const url = `${this.baseUrl}/${sport}`;
      const response = await firstValueFrom(this.httpService.get(url));

      const parsedResponse = LiveScoreApiResponseSchema.parse(response.data);
      return parsedResponse.events ?? [];
    } catch (error) {
      this.logger.error(`Error fetching live scores for ${sport}`, error);
      return [];
    }
  }

  async getEventById(
    sport: string,
    eventId: string,
  ): Promise<LiveScoreEvent | null> {
    const liveScores = await this.getLiveScores(sport);
    return liveScores.find((event) => event.idEvent === eventId) ?? null;
  }

  isEventFinished(event: LiveScoreEvent): boolean {
    // FT = Full Time, AET = After Extra Time, PEN = Penalties
    return ['FT', 'AET', 'PEN'].includes(event.strStatus);
  }
}
