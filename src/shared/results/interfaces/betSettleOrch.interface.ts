export interface SettlementStats {
  processed: number;
  won: number;
  lost: number;
  returned: number;
  void: number;
  errors: number;
  skipped: number;
}

interface StatsData {
  processed: number;
  won: number;
  lost: number;
  returned: number;
  void: number;
  errors: number;
  skipped: number;
}

export const createStats = (): StatsData => ({
  processed: 0,
  won: 0,
  lost: 0,
  returned: 0,
  void: 0,
  errors: 0,
  skipped: 0,
});
