import { z } from 'zod';

// Schema para BatchStats
export const BatchStatsSchema = z.object({
  totalProcessed: z.number(),
  totalSkipped: z.number(),
  totalCreated: z.number(),
  totalNoData: z.number(),
  totalErrors: z.number(),
});

// Schema para o Logger (assumindo uma interface básica de log)
const LoggerSchema = z
  .object({
    log: z.function().args(z.string()).returns(z.void()), // Adicione o .log aqui
    debug: z.function().args(z.string()).returns(z.void()),
    warn: z.function().args(z.string()).returns(z.void()),
    info: z.function().args(z.string(), z.any()).returns(z.void()),
    error: z.function().args(z.string(), z.any()).returns(z.void()),
  })
  .passthrough();

// Schema para BatchProcessorOptions
// Nota: Como TResult é um genérico, o schema abaixo o trata como 'unknown'
// a menos que você defina um schema específico para o resultado.
export const BatchProcessorOptionsSchema = z.object({
  batchSize: z.number().positive(),
  maxIterations: z.number().nonnegative(),

  // Funções e Promises
  fetchExisting: z.function().returns(z.promise(z.instanceof(Set))),

  fetchBankrolls: z
    .function()
    .args(z.number(), z.number()) // skip, take
    .returns(z.promise(z.array(z.object({ id: z.number() })))),

  processBatch: z
    .function()
    .args(z.array(z.number()))
    .returns(z.promise(z.unknown())), // TResult aqui é tratado como unknown

  onBatchResult: z
    .function()
    .args(z.unknown(), BatchStatsSchema) // result, stats
    .returns(z.void()),

  logger: LoggerSchema,
});

// Para extrair os tipos do Zod e manter a sincronia com o TypeScript:
export type BatchStats = z.infer<typeof BatchStatsSchema>;
export type BatchProcessorOptions<TResult = unknown> = z.infer<
  typeof BatchProcessorOptionsSchema
> & {
  processBatch: (bankrollIds: number[]) => Promise<TResult>;
  onBatchResult: (result: TResult, stats: BatchStats) => void;
};
