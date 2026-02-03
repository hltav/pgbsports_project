// import { SafeInfer } from '../../../types/zod';
// import z from 'zod';

// //Helpers (resilientes) — usei só onde a própria resposta já mostra variação
// export const zInt = z.number().int();
// export const zNullableInt = zInt.nullable();

// export const zStringOrNull = z.string().nullable();
// export const zNumberOrNull = z.number().nullable();

// // value do statistics pode ser number | string ("66%") | null
// export const ApiSportsStatValueSchema = z.union([
//   z.number(),
//   z.string(),
//   z.null(),
// ]);

// // Alguns campos são string numérica (ex: "13", "2.40", "88%") ou null
// export const zStrNumOrNull = z.union([z.string(), z.null()]);
// export const zBool = z.boolean();

// export const ApiSportsPagingSchema = z.object({
//   current: zInt,
//   total: zInt,
// });

// export const ApiSportsTeamLiteSchema = z.object({
//   id: zInt,
//   name: z.string(),
//   logo: z.string(),
// });

// export const ApiSportsPlayerRefSchema = z.object({
//   id: zNullableInt,
//   name: zStringOrNull,
// });

// export const ApiSportsEventTimeSchema = z.object({
//   elapsed: zNullableInt,
//   extra: zNullableInt, // no teu JSON: null
// });

// export const ApiSportsEventSchema = z.object({
//   time: ApiSportsEventTimeSchema,
//   team: ApiSportsTeamLiteSchema,
//   player: z.object({
//     id: zNullableInt,
//     name: zStringOrNull,
//   }),
//   assist: ApiSportsPlayerRefSchema,
//   type: z.string(), // "Card" | "Goal" | "subst" ... (deixa aberto)
//   detail: z.string(), // "Yellow Card" | "Normal Goal" | ...
//   comments: z.union([z.string(), z.null()]),
// });

// export type ApiSportsEventDto = SafeInfer<typeof ApiSportsEventSchema>;

// export const ApiSportsFixturePeriodsSchema = z.object({
//   first: zInt,
//   second: zInt,
// });

// export const ApiSportsVenueSchema = z.object({
//   id: zNullableInt,
//   name: z.string(),
//   city: z.string(),
// });

// export const ApiSportsStatusSchema = z.object({
//   long: z.string(), // "Match Finished"
//   short: z.string(), // "FT"
//   elapsed: zNullableInt,
//   extra: zNullableInt, // no teu JSON: 1, mas pode ser null em outros
// });

// export const ApiSportsFixtureSchema = z.object({
//   id: zInt,
//   referee: zStringOrNull.or(z.string()), // às vezes vem null — aqui veio string
//   timezone: z.string(),
//   date: z.string(), // ISO string
//   timestamp: zInt,
//   periods: ApiSportsFixturePeriodsSchema,
//   venue: ApiSportsVenueSchema,
//   status: ApiSportsStatusSchema,
// });

// export const ApiSportsLeagueSchema = z.object({
//   id: zInt,
//   name: z.string(),
//   country: z.string(),
//   logo: z.string(),
//   flag: z.string(),
//   season: zInt,
//   round: z.string(),
//   standings: zBool,
// });

// export const ApiSportsTeamWithWinnerSchema = z.object({
//   id: zInt,
//   name: z.string(),
//   logo: z.string(),
//   winner: z.union([z.boolean(), z.null()]), // pode ser null em jogos não encerrados
// });

// export const ApiSportsTeamsSchema = z.object({
//   home: ApiSportsTeamWithWinnerSchema,
//   away: ApiSportsTeamWithWinnerSchema,
// });

// export const ApiSportsGoalsSchema = z.object({
//   home: z.union([z.number(), z.null()]),
//   away: z.union([z.number(), z.null()]),
// });

// export const ApiSportsScoreSideSchema = z.object({
//   home: z.union([z.number(), z.null()]),
//   away: z.union([z.number(), z.null()]),
// });

// export const ApiSportsScoreSchema = z.object({
//   halftime: ApiSportsScoreSideSchema,
//   fulltime: ApiSportsScoreSideSchema,
//   extratime: ApiSportsScoreSideSchema,
//   penalty: ApiSportsScoreSideSchema,
// });

// /**
//  * Lineups
//  */
// export const ApiSportsKitColorsSchema = z.object({
//   primary: z.string(),
//   number: z.string(),
//   border: z.string(),
// });

// export const ApiSportsTeamColorsSchema = z.object({
//   player: ApiSportsKitColorsSchema.nullable(),
//   goalkeeper: ApiSportsKitColorsSchema.nullable(),
// });

// export const ApiSportsLineupTeamSchema = z.object({
//   id: zInt,
//   name: z.string(),
//   logo: z.string(),
//   colors: z.object({
//     player: ApiSportsKitColorsSchema.nullable(),
//     goalkeeper: ApiSportsKitColorsSchema.nullable(),
//   }),
// });

// export const ApiSportsCoachSchema = z.object({
//   id: zNullableInt,
//   name: zStringOrNull,
//   photo: zStringOrNull,
// });

// export const ApiSportsLineupPlayerSchema = z.object({
//   id: zInt,
//   name: z.string(),
//   number: zInt,
//   pos: z.string(), // "G"|"D"|"M"|"F"
//   grid: z.union([z.string(), z.null()]),
// });

// export const ApiSportsLineupXIItemSchema = z.object({
//   player: ApiSportsLineupPlayerSchema,
// });

// export const ApiSportsLineupSchema = z.object({
//   team: ApiSportsLineupTeamSchema,
//   coach: ApiSportsCoachSchema,
//   formation: z.string(),
//   startXI: z.array(ApiSportsLineupXIItemSchema),
//   substitutes: z.array(ApiSportsLineupXIItemSchema),
// });

// /**
//  * Statistics (team)
//  */
// export const ApiSportsTeamStatsItemSchema = z.object({
//   type: z.string(),
//   value: ApiSportsStatValueSchema,
// });

// export const ApiSportsTeamStatisticsSchema = z.object({
//   team: ApiSportsTeamLiteSchema,
//   statistics: z.array(ApiSportsTeamStatsItemSchema),
// });

// /**
//  * Players (per team)
//  */
// export const ApiSportsPlayerSchema = z.object({
//   id: zNullableInt,
//   name: z.string(),
//   photo: z.string(),
// });

// export const ApiSportsPlayerGamesSchema = z.object({
//   minutes: z.union([z.number(), z.null()]),
//   number: z.union([z.number(), z.null()]),
//   position: z.union([z.string(), z.null()]),
//   rating: z.union([z.string(), z.null()]),
//   captain: z.union([z.boolean(), z.null()]).optional().default(false),
//   substitute: z.union([z.boolean(), z.null()]),
// });

// export const ApiSportsPlayerShotsSchema = z.object({
//   total: z.union([z.number(), z.null()]),
//   on: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerGoalsSchema = z.object({
//   total: z.union([z.number(), z.null()]),
//   conceded: z.union([z.number(), z.null()]),
//   assists: z.union([z.number(), z.null()]),
//   saves: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerPassesSchema = z.object({
//   total: z.union([z.number(), z.null()]),
//   key: z.union([z.number(), z.null()]),
//   accuracy: z.union([z.string(), z.null()]), // "13"
// });

// export const ApiSportsPlayerTacklesSchema = z.object({
//   total: z.union([z.number(), z.null()]),
//   blocks: z.union([z.number(), z.null()]),
//   interceptions: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerDuelsSchema = z.object({
//   total: z.union([z.number(), z.null()]),
//   won: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerDribblesSchema = z.object({
//   attempts: z.union([z.number(), z.null()]),
//   success: z.union([z.number(), z.null()]),
//   past: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerFoulsSchema = z.object({
//   drawn: z.union([z.number(), z.null()]),
//   committed: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerCardsSchema = z.object({
//   yellow: z.union([z.number(), z.null()]),
//   red: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerPenaltySchema = z.object({
//   won: z.union([z.number(), z.null()]),
//   commited: z.union([z.number(), z.null()]), // sim, vem commited
//   scored: z.union([z.number(), z.null()]),
//   missed: z.union([z.number(), z.null()]),
//   saved: z.union([z.number(), z.null()]),
// });

// export const ApiSportsPlayerStatsBlockSchema = z.object({
//   games: ApiSportsPlayerGamesSchema,
//   offsides: z.union([z.number(), z.null()]),
//   shots: ApiSportsPlayerShotsSchema,
//   goals: ApiSportsPlayerGoalsSchema,
//   passes: ApiSportsPlayerPassesSchema,
//   tackles: ApiSportsPlayerTacklesSchema,
//   duels: ApiSportsPlayerDuelsSchema,
//   dribbles: ApiSportsPlayerDribblesSchema,
//   fouls: ApiSportsPlayerFoulsSchema,
//   cards: ApiSportsPlayerCardsSchema,
//   penalty: ApiSportsPlayerPenaltySchema,
// });

// export const ApiSportsTeamPlayersSchema = z.object({
//   team: z.object({
//     id: zInt,
//     name: z.string(),
//     logo: z.string(),
//     update: z.string(), // ISO
//   }),
//   players: z.array(
//     z.object({
//       player: ApiSportsPlayerSchema,
//       statistics: z.array(ApiSportsPlayerStatsBlockSchema),
//     }),
//   ),
// });

// /**
//  * Response item (1 fixture)
//  */
// export const ApiSportsFixtureResponseItemSchema = z.object({
//   fixture: ApiSportsFixtureSchema,
//   league: ApiSportsLeagueSchema,
//   teams: ApiSportsTeamsSchema,
//   goals: ApiSportsGoalsSchema,
//   score: ApiSportsScoreSchema,
//   events: z.array(ApiSportsEventSchema),
//   lineups: z.array(ApiSportsLineupSchema),
//   statistics: z.array(ApiSportsTeamStatisticsSchema),
//   players: z.array(ApiSportsTeamPlayersSchema),
// });

// /**
//  * Envelope do endpoint GET fixtures?id=...
//  */
// export const ApiSportsFixturesEndpointSchema = z.object({
//   get: z.string(), // "fixtures"
//   parameters: z.object({
//     id: z.string(),
//   }),
//   errors: z.array(z.any()), // no teu exemplo é [], mas pode vir string/obj. Se quiser 100% aqui tb, me manda um exemplo com erro.
//   results: zInt,
//   paging: ApiSportsPagingSchema,
//   response: z.array(ApiSportsFixtureResponseItemSchema),
// });

// export type ApiSportsFixturesEndpoint = SafeInfer<
//   typeof ApiSportsFixturesEndpointSchema
// >;
// export type ApiSportsFixtureResponseItem = SafeInfer<
//   typeof ApiSportsFixtureResponseItemSchema
// >;

import { SafeInfer } from '../../../types/zod';
import z from 'zod';

// Helpers
export const zInt = z.number().int();
export const zNullableInt = zInt.nullable();

export const zStringOrNull = z.string().nullable();
export const zNumberOrNull = z.number().nullable();

export const zStrNumOrNull = z.union([z.string(), z.null()]);
export const zBool = z.boolean();

// Helper: arrays de detalhes que podem vir null/undefined → normaliza pra []
export const zArrayNullish = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((v) => v ?? []);

// value do statistics pode ser number | string ("66%") | null
export const ApiSportsStatValueSchema = z.union([
  z.number(),
  z.string(),
  z.null(),
]);

export const ApiSportsPagingSchema = z.object({
  current: zInt,
  total: zInt,
});

export const ApiSportsTeamLiteSchema = z.object({
  id: zInt,
  name: z.string(),
  logo: z.string(),
});

export const ApiSportsPlayerRefSchema = z.object({
  id: zNullableInt,
  name: zStringOrNull,
});

export const ApiSportsEventTimeSchema = z.object({
  elapsed: zNullableInt,
  extra: zNullableInt,
});

export const ApiSportsEventSchema = z.object({
  time: ApiSportsEventTimeSchema,
  team: ApiSportsTeamLiteSchema,
  player: z.object({
    id: zNullableInt,
    name: zStringOrNull,
  }),
  assist: ApiSportsPlayerRefSchema,
  type: z.string(),
  detail: z.string(),
  comments: z.union([z.string(), z.null()]),
});

export type ApiSportsEventDto = SafeInfer<typeof ApiSportsEventSchema>;

export const ApiSportsFixturePeriodsSchema = z.object({
  first: zInt,
  second: zInt,
});

export const ApiSportsVenueSchema = z.object({
  id: zNullableInt,
  name: z.string(),
  city: z.string(),
});

export const ApiSportsStatusSchema = z.object({
  long: z.string(),
  short: z.string(),
  elapsed: zNullableInt,
  extra: zNullableInt,
});

export const ApiSportsFixtureSchema = z.object({
  id: zInt,
  referee: zStringOrNull.or(z.string()),
  timezone: z.string(),
  date: z.string(),
  timestamp: zInt,
  periods: ApiSportsFixturePeriodsSchema,
  venue: ApiSportsVenueSchema,
  status: ApiSportsStatusSchema,
});

export const ApiSportsLeagueSchema = z.object({
  id: zInt,
  name: z.string(),
  country: z.string(),
  logo: z.string(),
  flag: z.string(),
  season: zInt,
  round: z.string(),
  standings: zBool,
});

export const ApiSportsTeamWithWinnerSchema = z.object({
  id: zInt,
  name: z.string(),
  logo: z.string(),
  winner: z.union([z.boolean(), z.null()]),
});

export const ApiSportsTeamsSchema = z.object({
  home: ApiSportsTeamWithWinnerSchema,
  away: ApiSportsTeamWithWinnerSchema,
});

export const ApiSportsGoalsSchema = z.object({
  home: z.union([z.number(), z.null()]),
  away: z.union([z.number(), z.null()]),
});

export const ApiSportsScoreSideSchema = z.object({
  home: z.union([z.number(), z.null()]),
  away: z.union([z.number(), z.null()]),
});

export const ApiSportsScoreSchema = z.object({
  halftime: ApiSportsScoreSideSchema,
  fulltime: ApiSportsScoreSideSchema,
  extratime: ApiSportsScoreSideSchema,
  penalty: ApiSportsScoreSideSchema,
});

/**
 * Lineups (corrigido para nulls recorrentes)
 */
export const ApiSportsKitColorsSchema = z.object({
  primary: z.string(),
  number: z.string(),
  border: z.string(),
});

export const ApiSportsTeamColorsSchema = z.object({
  player: ApiSportsKitColorsSchema.nullable(),
  goalkeeper: ApiSportsKitColorsSchema.nullable(),
});

export const ApiSportsLineupTeamSchema = z.object({
  id: zInt,
  name: z.string(),
  logo: z.string(),
  colors: ApiSportsTeamColorsSchema.nullable(), // ✅ team.colors pode ser null
});

export const ApiSportsCoachSchema = z.object({
  id: zNullableInt,
  name: zStringOrNull,
  photo: zStringOrNull,
});

export const ApiSportsLineupPlayerSchema = z.object({
  id: zInt,
  name: z.string(),
  number: zInt,
  pos: z.string().nullable(), // ✅ player.pos pode ser null
  grid: z.union([z.string(), z.null()]),
});

export const ApiSportsLineupXIItemSchema = z.object({
  player: ApiSportsLineupPlayerSchema,
});

export const ApiSportsLineupSchema = z.object({
  team: ApiSportsLineupTeamSchema,
  coach: ApiSportsCoachSchema,
  formation: z.string().nullable(), // ✅ formation pode ser null
  startXI: z.array(ApiSportsLineupXIItemSchema),
  substitutes: z.array(ApiSportsLineupXIItemSchema),
});

/**
 * Statistics (team)
 */
export const ApiSportsTeamStatsItemSchema = z.object({
  type: z.string(),
  value: ApiSportsStatValueSchema,
});

export const ApiSportsTeamStatisticsSchema = z.object({
  team: ApiSportsTeamLiteSchema,
  statistics: z.array(ApiSportsTeamStatsItemSchema),
});

/**
 * Players (per team)
 */
export const ApiSportsPlayerSchema = z.object({
  id: zNullableInt,
  name: z.string(),
  photo: z.string(),
});

export const ApiSportsPlayerGamesSchema = z.object({
  minutes: z.union([z.number(), z.null()]),
  number: z.union([z.number(), z.null()]),
  position: z.union([z.string(), z.null()]),
  rating: z.union([z.string(), z.null()]),
  captain: z.union([z.boolean(), z.null()]).optional().default(false),
  substitute: z.union([z.boolean(), z.null()]),
});

export const ApiSportsPlayerShotsSchema = z.object({
  total: z.union([z.number(), z.null()]),
  on: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerGoalsSchema = z.object({
  total: z.union([z.number(), z.null()]),
  conceded: z.union([z.number(), z.null()]),
  assists: z.union([z.number(), z.null()]),
  saves: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerPassesSchema = z.object({
  total: z.union([z.number(), z.null()]),
  key: z.union([z.number(), z.null()]),
  accuracy: z.union([z.string(), z.null()]),
});

export const ApiSportsPlayerTacklesSchema = z.object({
  total: z.union([z.number(), z.null()]),
  blocks: z.union([z.number(), z.null()]),
  interceptions: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerDuelsSchema = z.object({
  total: z.union([z.number(), z.null()]),
  won: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerDribblesSchema = z.object({
  attempts: z.union([z.number(), z.null()]),
  success: z.union([z.number(), z.null()]),
  past: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerFoulsSchema = z.object({
  drawn: z.union([z.number(), z.null()]),
  committed: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerCardsSchema = z.object({
  yellow: z.union([z.number(), z.null()]),
  red: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerPenaltySchema = z.object({
  won: z.union([z.number(), z.null()]),
  commited: z.union([z.number(), z.null()]),
  scored: z.union([z.number(), z.null()]),
  missed: z.union([z.number(), z.null()]),
  saved: z.union([z.number(), z.null()]),
});

export const ApiSportsPlayerStatsBlockSchema = z.object({
  games: ApiSportsPlayerGamesSchema,
  offsides: z.union([z.number(), z.null()]),
  shots: ApiSportsPlayerShotsSchema,
  goals: ApiSportsPlayerGoalsSchema,
  passes: ApiSportsPlayerPassesSchema,
  tackles: ApiSportsPlayerTacklesSchema,
  duels: ApiSportsPlayerDuelsSchema,
  dribbles: ApiSportsPlayerDribblesSchema,
  fouls: ApiSportsPlayerFoulsSchema,
  cards: ApiSportsPlayerCardsSchema,
  penalty: ApiSportsPlayerPenaltySchema,
});

export const ApiSportsTeamPlayersSchema = z.object({
  team: z.object({
    id: zInt,
    name: z.string(),
    logo: z.string(),
    update: z.string(),
  }),
  players: z.array(
    z.object({
      player: ApiSportsPlayerSchema,
      statistics: z.array(ApiSportsPlayerStatsBlockSchema),
    }),
  ),
});

/**
 * Response item (1 fixture)
 * Arrays de detalhes: null/undefined → []
 */
export const ApiSportsFixtureResponseItemSchema = z.object({
  fixture: ApiSportsFixtureSchema,
  league: ApiSportsLeagueSchema,
  teams: ApiSportsTeamsSchema,
  goals: ApiSportsGoalsSchema,
  score: ApiSportsScoreSchema,

  events: zArrayNullish(ApiSportsEventSchema),
  lineups: zArrayNullish(ApiSportsLineupSchema),
  statistics: zArrayNullish(ApiSportsTeamStatisticsSchema),
  players: zArrayNullish(ApiSportsTeamPlayersSchema),
});

/**
 * Envelope do endpoint GET fixtures?id=...
 */
export const ApiSportsFixturesEndpointSchema = z.object({
  get: z.string(),
  parameters: z.object({
    id: z.string(),
  }),
  errors: z.array(z.any()),
  results: zInt,
  paging: ApiSportsPagingSchema,
  response: z.array(ApiSportsFixtureResponseItemSchema),
});

export type ApiSportsFixturesEndpoint = SafeInfer<
  typeof ApiSportsFixturesEndpointSchema
>;
export type ApiSportsFixtureResponseItem = SafeInfer<
  typeof ApiSportsFixtureResponseItemSchema
>;
