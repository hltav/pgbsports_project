/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  COUNTRY_ADJECTIVES_MAP,
  specialCases,
} from '../futebol/utils/countryAdjectivesMap';
import { LEAGUE_NAME_ALIASES } from '../futebol/utils/leagueAliases';
import { TEAM_ALIASES } from '../futebol/utils/teamAliases.util';

export function normalizeTeamName(name: string): string {
  if (!name) return '';

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|sc|ac|sd|clube|club)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '') // ✅ Mantém espaços (\s)
    .replace(/\s+/g, ' ') // ✅ Normaliza múltiplos espaços para um só
    .trim();
}

export function getCleanLeagueName(leagueName: string): string {
  if (!leagueName) return '';

  // 1. Normalização básica (remover acentos e lixo)
  let name = leagueName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '') // Mantém espaços por enquanto para o split
    .trim();

  // 2. Tenta remover o prefixo (Ex: "Belgian Pro League" -> "Pro League")
  const words = name.split(/\s+/);
  const firstWord = words[0];

  if (COUNTRY_ADJECTIVES_MAP[firstWord] || specialCases[firstWord]) {
    name = words.slice(1).join('');
  } else {
    name = name.replace(/\s+/g, ''); // Remove todos os espaços
  }

  // 3. Aplica o Alias (Ex: "jupilerproleague" -> "proleague")
  if (LEAGUE_NAME_ALIASES[name]) {
    return LEAGUE_NAME_ALIASES[name];
  }

  return name;
}

export function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate()
  );
}

export function areTeamsEquivalent(team1: string, team2: string): boolean {
  const normalized1 = normalizeTeamName(team1);
  const normalized2 = normalizeTeamName(team2);
  // 1. Match exato
  if (normalized1 === normalized2) {
    return true;
  }
  // 2. Verifica se um é substring do outro
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  // 3. Verifica aliases
  for (const [baseName, aliases] of Object.entries(TEAM_ALIASES)) {
    const hasTeam1 = aliases.some(
      (alias) => normalizeTeamName(alias) === normalized1,
    );
    const hasTeam2 = aliases.some(
      (alias) => normalizeTeamName(alias) === normalized2,
    );

    if (hasTeam1 && hasTeam2) {
      return true;
    }
  }

  return false;
}

export function areSeasonsEquivalent(
  seasonA: string,
  seasonB: string,
): boolean {
  // normaliza para só números
  const normA = seasonA.replace(/\D/g, '');
  const normB = seasonB.replace(/\D/g, '');

  if (normA === normB) return true;

  // se seasonB for range, verifica se inclui seasonA
  if (seasonB.includes(normA)) return true;

  return false;
}

export function normalizeKey(name: string, country: string) {
  return `${normalizeTeamName(name)}|${normalizeTeamName(country)}`;
}
