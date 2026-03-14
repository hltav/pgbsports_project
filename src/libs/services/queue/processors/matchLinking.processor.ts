import { MatchLinkingService } from './../../../../modules/match-linking/services/matchLinking.service';
import { IMatchLinkingProcessor } from '../workers/linkingJobs.worker';

export class MatchLinkingProcessor implements IMatchLinkingProcessor {
  constructor(private readonly service: MatchLinkingService) {}

  async linkBetToMatchById(betId: number): Promise<void> {
    return this.service.linkBetToMatchById(betId);
  }
}
