import { Result } from '@prisma/client';
import { EventMarketAnalysis } from '../base.analysis';

export function analyzeEquipeMarca(
  eventDetails: string,
  homeScore: number,
  awayScore: number,
): EventMarketAnalysis {
  const normalized = eventDetails.toLowerCase().trim();

  // Casa: Sim | Casa: Não | Fora: Sim | Fora: Não
  const isCasa = normalized.includes('casa');
  const isFora = normalized.includes('fora');
  const isSim = normalized.includes('sim') || normalized.includes('yes');
  const isNao = normalized.includes('não') || normalized.includes('no');

  let won = false;

  if (isCasa && isSim) {
    won = homeScore > 0;
  } else if (isCasa && isNao) {
    won = homeScore === 0;
  } else if (isFora && isSim) {
    won = awayScore > 0;
  } else if (isFora && isNao) {
    won = awayScore === 0;
  }

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
  };
}
