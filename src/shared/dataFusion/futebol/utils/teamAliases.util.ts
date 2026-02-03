export const TEAM_ALIASES: Record<string, string[]> = {
  wolves: ['wolverhampton', 'wolverhampton wanderers', 'wolves'],

  // Times brasileiros
  'atletico-mg': [
    'atletico-mg',
    'atletico mineiro',
    'atletico mg',
    'atlético mineiro',
  ],
  chapecoense: ['chapecoense-sc', 'chapecoense'],
  bragantino: ['rb bragantino', 'bragantino'],
  gremio: ['gremio', 'grêmio'],
  'athletico-paranaense': ['athletico paranaense', 'atletico paranaense'],
  vasco: ['vasco da gama', 'vasco'],
  'sao-paulo': ['sao paulo', 'são paulo'],
  vitoria: ['vitoria', 'vitória'],
  remo: ['remo'],

  // ... outros
};

export function checkSpecificAliases(name1: string, name2: string): boolean {
  const aliasGroups = [
    ['wolverhampton wanderers', 'wolves'],
    ['tottenham hotspur', 'tottenham'],
    ['west ham united', 'west ham'],
    ['brighton and hove albion', 'brighton'],
    ['newcastle united', 'newcastle'],
    ['manchester united', 'man utd'],
    ['manchester city', 'man city'],
    ['Bayern Munich', 'Bayern München'],

    // Brasileirão - Times com variações de nome
    ['atletico-mg', 'atletico mineiro'],
    ['chapecoense-sc', 'chapecoense'],
    ['rb bragantino', 'bragantino'],
    ['gremio', 'grêmio'],
    ['athletico paranaense', 'atletico paranaense'],
    ['vasco da gama', 'vasco'],
    ['sao paulo', 'são paulo'],
    ['vitoria', 'vitória'],
  ];

  return aliasGroups.some(
    (group) => group.includes(name1) && group.includes(name2),
  );
}
