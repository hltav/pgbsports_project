import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeAmbasMarcamPrimeiroTempo(
  details: string,
  homeScoreHT: number,
  awayScoreHT: number,
  isFinalized: boolean = false, // novo parâmetro
): EventMarketAnalysis {
  const ambasMarcam = homeScoreHT > 0 && awayScoreHT > 0;
  const apostouSim =
    details.toLowerCase().includes('sim') ||
    details.toLowerCase().includes('yes');

  // 🟦 Caso: SIM (apostou que ambas marcam)
  if (apostouSim) {
    return {
      result: ambasMarcam ? Result.win : Result.lose,
      shouldUpdate: true,
      // Early só se ambas já marcaram (aposta garantida)
      // OU se jogo finalizou e não marcaram ambas (aposta perdeu)
      isFinalizableEarly: ambasMarcam || isFinalized,
    };
  }

  // 🟥 Caso: NÃO (apostou que não ambas marcam)
  const perdeu = ambasMarcam; // perde se marcaram ambas

  return {
    result: perdeu ? Result.lose : Result.win,
    shouldUpdate: true,
    // Early se:
    // 1. Ambas marcaram (perdeu garantido)
    // 2. Jogo finalizou e não marcaram ambas (ganhou garantido)
    isFinalizableEarly: perdeu || isFinalized,
  };
}
