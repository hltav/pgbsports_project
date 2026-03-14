import {
  BatchProcessorOptions,
  BatchStats,
} from '../schemas/batchProcessor.schema';

export async function runBatchProcessor<TResult>(
  options: BatchProcessorOptions<TResult>,
): Promise<BatchStats> {
  const {
    batchSize,
    maxIterations,
    fetchExisting,
    fetchBankrolls,
    processBatch,
    onBatchResult,
    logger,
  } = options;

  const existingIds = await fetchExisting();
  logger.log(`📋 ${existingIds.size} snapshots já existem`);

  const stats: BatchStats = {
    totalProcessed: 0,
    totalSkipped: 0,
    totalCreated: 0,
    totalNoData: 0,
    totalErrors: 0,
  };

  let skip = 0;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const bankrolls = await fetchBankrolls(skip, batchSize);

    if (bankrolls.length === 0) {
      logger.log('✅ Todos os bankrolls foram processados');
      break;
    }

    const bankrollIds = bankrolls
      .map((b) => b.id)
      .filter((id) => !existingIds.has(id));

    stats.totalProcessed += bankrolls.length;

    if (bankrollIds.length === 0) {
      stats.totalSkipped += bankrolls.length;
      skip += batchSize;
      logger.debug(
        `⏭️  Batch ${iterations}: ${bankrolls.length} já processados`,
      );
      continue;
    }

    logger.debug(
      `🔄 Batch ${iterations}: processando ${bankrollIds.length} bankrolls`,
    );

    try {
      const result = await processBatch(bankrollIds);
      onBatchResult(result, stats);
    } catch (error) {
      logger.error(`❌ Erro no batch ${iterations}:`, error);
      stats.totalErrors += bankrollIds.length;
    }

    skip += batchSize;
  }

  if (iterations >= maxIterations) {
    logger.warn(`⚠️  Limite de ${maxIterations} iterações atingido`);
  }

  return stats;
}
