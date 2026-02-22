import { z } from 'zod';

export const DatabaseMetricsResponseSchema = z
  .object({
    status: z.enum(['connected', 'error']),
    latencyMs: z.number().int().nonnegative().optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
    activeConnections: z.number().int().nonnegative().optional(),
    timestamp: z.union([z.date(), z.string().datetime()]),
  })
  .superRefine((data, ctx) => {
    // Se está conectado, esperamos os campos numéricos presentes
    if (data.status === 'connected') {
      if (data.latencyMs == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['latencyMs'],
          message: 'latencyMs is required when status is connected',
        });
      }
      if (data.sizeBytes == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sizeBytes'],
          message: 'sizeBytes is required when status is connected',
        });
      }
      if (data.activeConnections == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['activeConnections'],
          message: 'activeConnections is required when status is connected',
        });
      }
    }
  });

export type DatabaseMetricsResponseDto = z.infer<
  typeof DatabaseMetricsResponseSchema
>;
