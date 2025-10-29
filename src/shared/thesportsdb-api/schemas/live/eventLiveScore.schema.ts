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
});

export type EventLiveScoreDTO = SafeInfer<typeof EventLiveScoreSchema>;
