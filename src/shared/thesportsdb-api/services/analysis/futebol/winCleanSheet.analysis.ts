import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeVenceSemSofrerGol(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Opções: "Sim" ou "Não"
  const isSim = normalized.includes('sim') || normalized.includes('yes');

  let won = false;

  if (isSim) {
    // Vencer sem sofrer gol = vencer E não levar gol
    // Pode ser Casa ou Fora vencendo
    if (homeScore > awayScore && awayScore === 0) {
      won = true;
    } else if (awayScore > homeScore && homeScore === 0) {
      won = true;
    }
  } else {
    // Não vencer sem sofrer gol
    if (homeScore <= awayScore || awayScore > 0) {
      won = true;
    } else if (awayScore <= homeScore || homeScore > 0) {
      won = true;
    }
    // Simplificando: se NÃO é vitória sem sofrer gol
    won =
      !(homeScore > awayScore && awayScore === 0) &&
      !(awayScore > homeScore && homeScore === 0);
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
  };
}
