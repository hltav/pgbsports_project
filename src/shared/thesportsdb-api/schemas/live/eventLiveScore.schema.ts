import { SafeInfer } from './../../../../types/zod';
import { GetEventSchema } from './../../../../modules/events/dto/get-event.dto';
import { z } from 'zod';

export const EventLiveScoreSchema = GetEventSchema.extend({
  apiEventId: z.string().nullish(),
  homeTeam: z.string().nullish(),
  awayTeam: z.string().nullish(),
  eventDate: z
    .string()
    .datetime()
    .nullish()
    .transform((val) => (val ? new Date(val) : null)),
  createdAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  updatedAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  intHomeScore: z.string().default('0'),
  intAwayScore: z.string().default('0'),
  homeScoreHT: z.number().nullish().default(0),
  awayScoreHT: z.number().nullish().default(0),
  homeScoreFT: z.number().nullish().default(0),
  awayScoreFT: z.number().nullish().default(0),
  strStatus: z.string().default('Not Started'),
});

export type EventLiveScoreDTO = SafeInfer<typeof EventLiveScoreSchema>;
