import { MatchStatus, Result } from '@prisma/client';
import { EventMarketAnalysis, noUpdate, voidResult } from '../base.analysis';

export function analyzeVencedor2oTempo(
  eventDetails: string,
  homeScoreHT: number | null,
  awayScoreHT: number | null,
  homeScoreFT: number | null,
  awayScoreFT: number | null,
  status: MatchStatus,
): EventMarketAnalysis {
  const d = eventDetails.toLowerCase().trim();

  const isHome = d.includes('casa') || d.includes('home') || d === '1';
  const isAway = d.includes('fora') || d.includes('away') || d === '2';
  const isDraw = d.includes('empate') || d.includes('draw') || d === 'x';

  // Mercado inválido (seleção não reconhecida)
  if (!isHome && !isAway && !isDraw) {
    return voidResult();
  }

  // Só decide no FINISHED
  if (status !== MatchStatus.FINISHED) {
    return noUpdate();
  }

  // Se terminou mas faltam dados, aí sim é problema de dados → void (ou você pode optar por noUpdate)
  if (
    homeScoreHT == null ||
    awayScoreHT == null ||
    homeScoreFT == null ||
    awayScoreFT == null
  ) {
    return voidResult();
  }

  const home2H = homeScoreFT - homeScoreHT;
  const away2H = awayScoreFT - awayScoreHT;

  let won = false;
  if (isHome) won = home2H > away2H;
  if (isAway) won = away2H > home2H;
  if (isDraw) won = home2H === away2H;

  return {
    result: won ? Result.win : Result.lose,
    shouldUpdate: true,
    isFinalizableEarly: false,
  };
}
