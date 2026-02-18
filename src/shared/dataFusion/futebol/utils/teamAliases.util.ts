// export const TEAM_ALIASES: Record<string, string[]> = {
//   wolves: ['wolverhampton', 'wolverhampton wanderers', 'wolves'],

//   // Times brasileiros
//   'atletico-mg': [
//     'atletico-mg',
//     'atletico mineiro',
//     'atletico mg',
//     'atlético mineiro',
//   ],
//   chapecoense: ['chapecoense-sc', 'chapecoense'],
//   bragantino: ['rb bragantino', 'bragantino'],
//   gremio: ['gremio', 'grêmio'],
//   'athletico-paranaense': ['athletico paranaense', 'atletico paranaense'],
//   vasco: ['vasco da gama', 'vasco'],
//   'sao-paulo': ['sao paulo', 'são paulo'],
//   vitoria: ['vitoria', 'vitória'],
//   remo: ['Remo'],

//   // ... outros
// };

// export function checkSpecificAliases(name1: string, name2: string): boolean {
//   const aliasGroups = [
//     ['wolverhampton wanderers', 'wolves'],
//     ['tottenham hotspur', 'tottenham'],
//     ['west ham united', 'west ham'],
//     ['brighton and hove albion', 'brighton'],
//     ['newcastle united', 'newcastle'],
//     ['manchester united', 'man utd'],
//     ['manchester city', 'man city'],
//     ['Bayern Munich', 'Bayern München'],

//     // Brasileirão - Times com variações de nome
//     ['atletico-mg', 'atletico mineiro'],
//     ['chapecoense-sc', 'chapecoense'],
//     ['rb bragantino', 'bragantino'],
//     ['gremio', 'grêmio'],
//     ['athletico paranaense', 'atletico paranaense'],
//     ['vasco da gama', 'vasco'],
//     ['sao paulo', 'são paulo'],
//     ['vitoria', 'vitória'],
//   ];

//   return aliasGroups.some(
//     (group) => group.includes(name1) && group.includes(name2),
//   );
// }

export const TEAM_ALIASES: Record<
  string,
  { display: string; aliases: string[] }
> = {
  // Times ingleses
  wolves: {
    display: 'Wolverhampton',
    aliases: ['wolverhampton', 'wolverhampton wanderers', 'wolves'],
  },
  tottenham: {
    display: 'Tottenham',
    aliases: ['tottenham hotspur', 'tottenham'],
  },
  'west ham': {
    display: 'West Ham ',
    aliases: ['west ham united', 'west ham'],
  },
  brighton: {
    display: 'Brighton',
    aliases: ['brighton and hove albion', 'brighton'],
  },
  newcastle: {
    display: 'Newcastle United',
    aliases: ['newcastle united', 'newcastle'],
  },
  'man utd': {
    display: 'Manchester United',
    aliases: ['manchester united', 'man utd'],
  },
  'man city': {
    display: 'Manchester City',
    aliases: ['manchester city', 'man city'],
  },

  //Times alemães
  bayern: {
    display: 'Bayern Munich',
    aliases: ['bayern munich', 'bayern münchen', 'bayern'],
  },

  // Times brasileiros
  'atletico-mg': {
    display: 'Atlético Mineiro',
    aliases: [
      'atletico-mg',
      'atletico mineiro',
      'atletico mg',
      'atlético mineiro',
    ],
  },

  chapecoense: {
    display: 'Chapecoense',
    aliases: ['chapecoense-sc', 'chapecoense'],
  },

  bragantino: {
    display: 'RB Bragantino',
    aliases: ['rb bragantino', 'bragantino'],
  },

  gremio: {
    display: 'Grêmio',
    aliases: ['gremio', 'grêmio'],
  },

  'athletico-paranaense': {
    display: 'Athletico Paranaense',
    aliases: ['athletico paranaense', 'atletico paranaense'],
  },

  vasco: {
    display: 'Vasco da Gama',
    aliases: ['vasco da gama', 'vasco'],
  },

  'sao-paulo': {
    display: 'São Paulo',
    aliases: ['sao paulo', 'são paulo'],
  },

  vitoria: {
    display: 'Vitória',
    aliases: ['vitoria', 'vitória'],
  },

  remo: {
    display: 'Remo',
    aliases: ['remo'],
  },
};
