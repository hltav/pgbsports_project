// import { EventType } from '@prisma/client';

// export function mapStrToEventType(strType: string): EventType {
//   if (!strType) return EventType.CARD; // fallback seguro

//   const t = strType.trim().toUpperCase();
//   console.debug(`[mapStrToEventType] raw=${strType}, normalized=${t}`);

//   // 1. GOALS
//   if (
//     t === 'GOAL' ||
//     t === 'NORMAL GOAL' ||
//     (t.includes('GOAL') && !t.includes('OWN'))
//   ) {
//     return EventType.GOAL;
//   }

//   // 2. OWN GOAL
//   if (t === 'OWN GOAL' || t.includes('OWN GOAL') || t.includes('OWNGOAL')) {
//     return EventType.OWN_GOAL;
//   }

//   // 3. PENALTY
//   if (t === 'PENALTY' || t.includes('PENALTY') || t === 'PEN') {
//     return EventType.PENALTY;
//   }

//   // 4. CARDS
//   if (
//     t === 'CARD' ||
//     t === 'YELLOW CARD' ||
//     t === 'RED CARD' ||
//     t.includes('CARD')
//   ) {
//     return EventType.CARD;
//   }

//   // 5. SUBSTITUTION
//   if (t === 'SUBST' || t === 'SUBSTITUTION' || t.includes('SUBSTITUTION')) {
//     return EventType.SUBSTITUTION;
//   }

//   // 6. VAR
//   if (t === 'VAR' || t.includes('VAR')) {
//     return EventType.VAR;
//   }

//   // Fallback: se não reconhecer, considera como CARD (o mais neutro)
//   console.warn(
//     `[mapStrToEventType] Unrecognized event type: ${strType}, defaulting to CARD`,
//   );
//   return EventType.CARD;
// }

import { EventType } from '@prisma/client';

export function mapApiSportsEventType(
  typeRaw: string,
  detailRaw?: string | null,
): EventType {
  const type = (typeRaw ?? '').trim().toUpperCase();
  const detail = (detailRaw ?? '').trim().toUpperCase();

  // API-Sports: type="Goal", detail="Penalty" | "Normal Goal" | "Own Goal" etc
  if (type === 'GOAL') {
    if (detail.includes('OWN')) return EventType.OWN_GOAL;
    if (detail.includes('PENALTY')) return EventType.PENALTY;
    return EventType.GOAL;
  }

  if (type.includes('SUBST')) return EventType.SUBSTITUTION;
  if (type.includes('CARD')) return EventType.CARD;
  if (type.includes('VAR')) return EventType.VAR;

  return EventType.CARD;
}
