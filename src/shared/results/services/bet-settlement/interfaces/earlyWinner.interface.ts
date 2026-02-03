export interface EarlyWinnerResult {
  hadEarlyWinner: boolean;
  winningTeam: 'home' | 'away' | null;
  minuteReached: number | null;
  scoreWhenReached: { home: number; away: number } | null;
  finalScore: { home: number; away: number };
  timeline: Array<{
    minute: number;
    homeScore: number;
    awayScore: number;
    advantage: number;
    scoringTeam: 'home' | 'away';
    eventType: string;
    detail: string;
  }>;
}

export interface ShouldAnalyzeResult {
  shouldAnalyze: boolean;
  reason: string;
  immediateResult?: 'win' | 'lose' | null;
}
