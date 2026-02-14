import { LogoSource } from '@prisma/client';
import { z } from 'zod';

const LeagueSourceSchema = z.enum(['THESPORTSDB', 'APIFOOTBALL', 'INTERNAL']);

export const FavoriteLeagueKeySchema = z.object({
  sport: z.string().trim().min(1).max(50),
  source: LeagueSourceSchema,
  externalId: z.string().trim().min(1).max(50),
});

// export const CreateFavoriteLeagueDtoSchema = FavoriteLeagueKeySchema.extend({
//   leagueName: z.string().trim().min(1).max(100),
//   country: z.string().trim().min(1).max(100),
//   leagueLogo: z.string().max(255).optional().nullable(),
//   leagueLogoSource: z.nativeEnum(LogoSource).optional().nullable(),
// });
export const CreateFavoriteLeagueDtoSchema = FavoriteLeagueKeySchema.extend({
  leagueName: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  leagueLogo: z.string().max(255).optional().nullable(),
  leagueLogoSource: z.nativeEnum(LogoSource).optional().nullable(),
}).superRefine((data, ctx) => {
  // Se enviou logo, precisa enviar source
  if (data.leagueLogo && !data.leagueLogoSource) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'leagueLogoSource é obrigatório quando leagueLogo é enviado',
      path: ['leagueLogoSource'],
    });
    return;
  }

  // Se enviou source mas não enviou logo
  if (data.leagueLogoSource && !data.leagueLogo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'leagueLogo é obrigatório quando leagueLogoSource é enviado',
      path: ['leagueLogo'],
    });
    return;
  }

  if (!data.leagueLogo) return;

  // Validação por tipo
  if (data.leagueLogoSource === 'LOCAL') {
    const isValidLocal = /^\/[a-zA-Z0-9_/-]+\.(png|jpg|jpeg|svg)$/.test(
      data.leagueLogo,
    );

    if (!isValidLocal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Path local inválido',
        path: ['leagueLogo'],
      });
    }
  }

  if (data.leagueLogoSource === 'EXTERNAL') {
    try {
      const url = new URL(data.leagueLogo);

      if (url.protocol !== 'https:') {
        throw new Error();
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL externa inválida (somente HTTPS permitido)',
        path: ['leagueLogo'],
      });
    }
  }
});

export const ListFavoriteLeaguesQuerySchema = z.object({
  sport: z.string().trim().min(1).max(50).optional(),
  source: LeagueSourceSchema.optional(),
});

export type CreateFavoriteLeagueDto = z.infer<
  typeof CreateFavoriteLeagueDtoSchema
>;
export type FavoriteLeagueKeyDto = z.infer<typeof FavoriteLeagueKeySchema>;
export type ListFavoriteLeaguesQuery = z.infer<
  typeof ListFavoriteLeaguesQuerySchema
>;
