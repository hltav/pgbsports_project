import { z } from 'zod';

export const DiscoverLeagueSchema = z.object({
  // Identificador único com padrão específico
  previewId: z.string().describe('ex: aps:39 | tsdb:4328 | fused:39:4328'),
  // IDs de fontes externas (opcionais)
  apiSportsLeagueId: z.number().int().optional(),
  tsdbLeagueId: z.string().optional(),
  // Informações básicas
  name: z.string().min(1, 'O nome é obrigatório'),
  country: z.string().min(1, 'O país é obrigatório'),
  // Mídia/Assets
  logo: z.string().url().optional().or(z.literal('')),
  flag: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .describe('URL da bandeira do país'),
  badge: z.string().url().optional().or(z.literal('')),
  banner: z.string().url().optional().or(z.literal('')),
  // Temporada
  season: z.number().int().optional(),
  isCurrent: z.boolean().optional(),
  seasonRange: z
    .string()
    .regex(/^\d{4}-\d{4}$/, 'Formato inválido (ex: 2025-2026)')
    .optional(),
  // Flags de recursos
  hasFixtures: z.boolean(),
  hasStandings: z.boolean(),
  hasOdds: z.boolean(),
  // Objeto de fontes
  highlighted: z.boolean(),
  sources: z.object({
    apiSports: z.boolean(),
    theSportsDb: z.boolean(),
  }),
  // Metadados de prioridade e confiança
  confidence: z.number().min(0).max(1), // Garante o range 0..1
  sourcePriority: z.enum(['API_SPORTS', 'TSDB', 'BOTH']),
});

// Inferência do tipo para uso em TypeScript
export type DiscoverLeague = z.infer<typeof DiscoverLeagueSchema>;
