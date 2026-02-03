import crypto from 'node:crypto';
import { ApiSportsEventDto } from '../dto/matchDetails.dto';

export function buildEventHash(externalMatchId: number, e: ApiSportsEventDto) {
  const base = [
    externalMatchId,
    e.team.id,
    e.time.elapsed,
    e.time.extra ?? '',
    e.type,
    e.detail,
    e.player?.id ?? '',
    e.assist?.id ?? '',
  ].join('|');

  return crypto.createHash('sha256').update(base).digest('hex'); // 64 chars
}
