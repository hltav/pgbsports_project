export interface LeagueTranslation {
  name: string;
  flag?: string;
  logo?: string;
}

export const leagueTranslations: Record<string, LeagueTranslation> = {
  //Competições Continentais
  'World Cup': {
    name: 'Copa do Mundo 2026',
    logo: `/badges_leagues/world_cup_2026.png`,
  },

  'UEFA Champions League': {
    name: 'UEFA Champions League',
    logo: `/badges_leagues/uefa_champions_league.png`,
  },
  'UEFA Europa League': {
    name: 'UEFA Europa League',
    logo: `/badges_leagues/uefa_europa_league.png`,
  },
  'UEFA Conference League': {
    name: 'UEFA Conference League',
    logo: `/badges_leagues/uefa_conference_league.png`,
  },
  'Copa Libertadores': {
    name: 'Conmebol Libertadores',
    logo: `/badges_leagues/conmebol_libertadores.png`,
  },
  'Copa Sudamericana': {
    name: 'Conmebol Sul-Americana',
    logo: `/badges_leagues/conmebol_sudamericana.png`,
  },

  // Ligas Principais
  'Brazilian Serie A': {
    name: 'Brasileirão Betano',
    logo: `/badges_leagues/brasileirao_betano_serie_a.png`,
  },
  'English Premier League': {
    name: 'Premier League',
    logo: `/badges_leagues/england_premier_league.png`,
  },
  'German Bundesliga': {
    name: 'Bundesliga',
    logo: `/badges_leagues/german_bundesliga.png`,
  },
  'Italian Serie A': {
    name: 'Série A',
    logo: `/badges_leagues/italy_seriea.png`,
  },
  'French Ligue 1': {
    name: 'Ligue 1',
    logo: `/badges_leagues/french_ligue1.png`,
  },
  'Spanish La Liga': {
    name: 'La Liga',
    logo: `/badges_leagues/spain_la_liga.png`,
  },
  'Portuguese Primeira Liga': {
    name: 'Liga Betclic',
    logo: `/badges_leagues/liga_portugal_betclick.png`,
  },
  'Dutch Eredivisie': {
    name: 'Eredivisie',
    logo: `/badges_leagues/dutch_eredivisie.png`,
  },
  'Argentinian Primera Division': {
    name: 'Primeira Divisão ',
    logo: `/badges_leagues/liga_profissional_argentina.png`,
  },
  'Uruguayan Primera Division': {
    name: 'Liga AUF ',
    logo: `/badges_leagues/liga_uruguaia.png`,
  },

  //Ligas de Segundo Escalão
  'Greek Superleague Greece': {
    name: 'Superliga',
    logo: `/badges_leagues/greece_superleague.png`,
  },
  'Scottish Premier League': {
    name: 'Premiership',
    logo: `/badges_leagues/scottish_premiership.png`,
  },
  'Belgian Pro League': {
    name: 'Jupiler Pro League ',
    logo: `/badges_leagues/belgium_pro_league.png`,
  },
  'Turkish Super Lig': {
    name: 'Super Lig',
    logo: `/badges_leagues/turkey_super_lig.png`,
  },
  'Danish Superliga': {
    name: 'SuperLiga',
    logo: `/badges_leagues/danish_superliga.png`,
  },
  'American Major League Soccer': {
    name: 'Major League Soccer MLS',
    logo: `/badges_leagues/major_league_soccer.png`,
  },
  'Swedish Allsvenskan': {
    name: 'Allsvenskan ',
    logo: `/badges_leagues/allsvenskan.png`,
  },
  'Ukrainian Premier League': {
    name: 'Premier League',
    logo: `/badges_leagues/ucrania_premier_league.png`,
  },
  'Colombia Categoría Primera A': {
    name: 'Liga BetPlay DIMAYOR',
    logo: `/badges_leagues/liga_betplay_colombia.png`,
  },
  'Australian A-League': {
    name: 'A-League ',
    logo: `/badges_leagues/a_league_australia.png`,
  },
  'Norwegian Eliteserien': {
    name: 'Eliteserien',
    logo: `/badges_leagues/eliteserien_noruega.png`,
  },
  'Bolivian Primera División': {
    name: 'Liga Profissional',
    logo: `/badges_leagues/bolivia_copa_tigo.png`,
  },
  'Ecuadorian Serie A': {
    name: 'LigaPro Ecuabet',
    logo: `/badges_leagues/liga_pro_ecuador.png`,
  },
  'Paraguayan Primera Division': {
    name: 'Primera Divisão',
    logo: `/badges_leagues/copa_de_primera_paraguay.png`,
  },
  'Peruvian Primera Division': {
    name: 'Liga 1 Betsson',
    logo: `/badges_leagues/liga1_peru.png`,
  },
  'Chinese Super League': {
    name: 'Superliga Chinesa',
    logo: `/badges_leagues/chinese_super_league.png`,
  },
  'Russian Football Premier League': {
    name: 'Premier League',
    logo: `/badges_leagues/russian_premier_league.png`,
  },

  // Copas Nacionais
  'FA Cup': { name: 'Copa da Inglaterra', logo: `/badges_leagues/fa_cup.png` },
  'Copa del Rey': {
    name: 'Copa do Rei',
    logo: `/badges_leagues/copa_del_rey.png`,
  },
  'Coupe de France': {
    name: 'Copa da França',
    logo: `/badges_leagues/coupe_de_france.png`,
  },
  'DFB-Pokal': {
    name: 'Copa da Alemanha',
    logo: `/badges_leagues/dfb_pokal.png`,
  },
  'Copa do Brasil': {
    name: 'Copa do Brasil',
    logo: `/badges_leagues/copa_do_brasil.png`,
  },
  'Coppa Italia': {
    name: 'Coppa Italia',
    logo: `/badges_leagues/coppa_italia.png`,
  },
  'Dutch KNVB Cup': {
    name: 'KNVB Copa da Holanda',
    logo: `/badges_leagues/knvb_beker_holanda.png`,
  },
  'Copa Argentina': {
    name: 'Copa Argentina',
    logo: `/badges_leagues/copa_argentina.png`,
  },
  'Taca de Liga': {
    name: 'Copa da Liga Portuguesa',
    logo: `/badges_leagues/taca_da_liga_portugal.png`,
  },
  'Taca de Portugal': {
    name: 'Copa de Portugal',
    logo: `/badges_leagues/taca_de_portugal.png`,
  },
  'Coupe de la Ligue': {
    name: 'Copa da Liga Francesa',
    logo: `/badges_leagues/coupe_de_la_ligue_france.png`,
  },
  'EFL Cup': {
    name: 'Copa da Liga Inglesa',
    logo: `/badges_leagues/efl_carabao_cup.png`,
  },
  'FA Community Shield': {
    name: 'Supercopa da Inglaterra',
    logo: `/badges_leagues/fa_community_shield.png`,
  },

  // Segundas Divisões
  'Brazilian Serie B': {
    name: 'Brasileirão Série B',
    logo: `/badges_leagues/brasileirao_superbet_serie_b.png`,
  },
  'English League Championship': {
    name: 'Championship',
    logo: `/badges_leagues/england_championship.png`,
  },
  'Italian Serie B': { name: 'Série B ' },
  'Scottish Championship': {
    name: 'Championship',
  },
  'English League 1': {
    name: 'League One ',
  },
  'English League 2': {
    name: 'League Two ',
  },
  'Italian Serie C Girone C': { name: 'Série C Girone C' },
  'German 2. Bundesliga': { name: '2. Bundesliga' },
  'Segunda División': { name: 'La Liga 2' },
  'French Ligue 2': { name: 'Ligue 2' },
  'Swedish Superettan': { name: 'Superettan ' },
  'Polish Ekstraklasa': { name: 'Ekstraklasa ' },

  // 🌍🏆 Competições Internacionais

  'American NASL': { name: 'NASL - EUA' },
  'Norwegian 1. Divisjon': { name: '1. Divisjon ' },
  'Welsh Premier League': {
    name: 'Premier League Galesa',
  },
  'UEFA Nations League': {
    name: 'UEFA Nations League',
    logo: `/badges_leagues/uefa-nations-league.png`,
  },
  'African Cup of Nations': {
    name: 'Copa das Nações Africanas',
    logo: `/badges_leagues/caf.svg`,
  },
  'Confederations Cup': {
    name: 'Copa das Confederações',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Copa America': {
    name: 'Copa América',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'UEFA European Championships': {
    name: 'Campeonato Europeu',
  },
  'FIFA Club World Cup': {
    name: 'Mundial de Clubes',
    logo: `/badges_leagues/fifa_club_world_cup.png`,
  },
  'International Champions Cup': {
    name: 'International Champions Cup',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Supercoppa Italiana': {
    name: 'Supercopa Italiana',
    logo: `/badges_leagues/italia_super_cup.png`,
  },
  'Supercopa de Espana': {
    name: 'Supercopa da Espanha',
    logo: `/badges_leagues/supercopa_de_espana.png`,
  },
  'UEFA Super Cup': {
    name: 'Supercopa da UEFA',
    logo: `/badges_leagues/uefa_super_cup.png`,
  },
  'Venezuela Primera Division': {
    name: 'Venezuela Liga FutVE',
    logo: `/badges_leagues/liga_fut_venezuela.png`,
  },

  //Brasil - Ligas Regionais
  'Brazilian Serie C': { name: 'Brasileirão Série C' },
  'Brazilian Copa do Nordeste': { name: 'Copa do Nordeste' },
  'Brazilian Copa Verde': { name: 'Copa Verde' },

  // BRASIL - Estaduais
  'Brazilian Campeonato Acreano': { name: 'Campeonato Acreano' },
  'Brazilian Campeonato Alagoano': { name: 'Campeonato Alagoano' },
  'Brazilian Campeonato Amapaense': {
    name: 'Campeonato Amapaense',
  },
  'Brazilian Campeonato Amazonense': {
    name: 'Campeonato Amazonense',
  },
  'Brazilian Campeonato Baiano': { name: 'Campeonato Baiano' },
  'Brazilian Campeonato Brasiliense': {
    name: 'Campeonato Brasiliense',
  },
  'Brazilian Campeonato Capixaba': { name: 'Campeonato Capixaba' },
  'Brazilian Campeonato Catarinense': {
    name: 'Campeonato Catarinense',
  },
  'Brazilian Campeonato Carioca': { name: 'Campeonato Carioca' },
  'Brazilian Campeonato Cearense': { name: 'Campeonato Cearense' },
  'Brazilian Campeonato Gaucho': { name: 'Campeonato Gaúcho' },
  'Brazilian Campeonato Goiano': { name: 'Campeonato Goiano' },
  'Brazilian Campeonato Maranhense': { name: 'Campeonato Maranhense' },
  'Brazilian Campeonato MatoGrossense': { name: 'Campeonato Mato-Grossense' },
  'Brazilian Campeonato SulMatoGrossense': {
    name: 'Campeonato Sul Mato-Grossense',
  },
  'Brazilian Campeonato Mineiro': { name: 'Campeonato Mineiro' },
  'Brazilian Campeonato Paraense': { name: 'Campeonato Paraense' },
  'Brazilian Campeonato Paraibano': { name: 'Campeonato Paraibano' },
  'Brazilian Campeonato Paranaense': { name: 'Campeonato Paranaense' },
  'Brazilian Campeonato Pernambucano': { name: 'Campeonato Pernambucano' },
  'Brazilian Campeonato Piauiense': { name: 'Campeonato Piauiense' },
  'Brazilian Campeonato Potiguar': { name: 'Campeonato Potiguar' },
  'Brazilian Campeonato Rondoniense': { name: 'Campeonato Rondoniense' },
  'Brazilian Campeonato Roraimense': { name: 'Campeonato Roraimense' },
  'Brazilian Campeonato Paulista': { name: 'Campeonato Paulista' },
  'Paulista-A2': { name: 'Campeonato Paulista Série A2' },
  'Paulista-A3': { name: 'Campeonato Paulista Série A3' },
  'Paulista-A4': { name: 'Campeonato Paulista Série A4' },
  'Brazilian Campeonato Sergipano': { name: 'Campeonato Sergipano' },
  'Brazilian Campeonato Tocantinense': { name: 'Campeonato Tocantinense' },
  'Brazilian Copa FGF': { name: 'Copa Federação Gaúcha' },

  //Outras Ligas Brasil
  'Copa Paulista': { name: 'Copa Paulista' },

  // Ligas Específicas

  'Moroccan Championship': { name: 'Campeonato Marroquino' },
  'American NWSL': { name: 'NWSL' },
  'European Cup': {
    name: 'Copa Europeia',
  },
  'UEFA Cup': { name: 'Copa da UEFA', logo: `/badges_leagues/UEFA_Logo.png` },
  'Football League First Division': {
    name: 'Primeira Divisão Inglesa Histórica',
  },
  'Football League Super Cup': {
    name: 'Supercopa Inglesa',
  },
  Friendlies: {
    name: 'Amistosos - Seleções',
  },
  'FIFA Womens World Cup': {
    name: 'Copa do Mundo Feminina',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'UEFA European Under-21 Championship': {
    name: 'Euro Sub-21',
  },
  'Friendlies Clubs ': {
    name: 'Amistosos - Clubes',
    logo: `/badges_leagues/amistoso.png`,
  },
  'English National League': {
    name: 'National League Inglesa',
  },
  'Argentinian Primera B Nacional': {
    name: 'Primeira B Nacional Argentina',
  },
  'Albanian Superliga': { name: 'Superliga ' },
  'Andorran 1a Divisió': { name: 'Primeira Divisão ' },
  'Armenian Premier League': { name: 'Premier League' },
  'Australia ACT NPL': { name: 'NPL ACT Australiana' },
  'Austrian Bundesliga': { name: 'Bundesliga Austríaca' },
  'Belarus Vyscha Liga': { name: 'Vyscha Liga' },
  'Belgian First Division B': { name: 'Primeira Divisão B Belga' },
  'Bosnian Premier Liga': { name: 'Premier Liga Bósnia' },
  'Bulgarian First League': { name: 'Primeira Liga' },
  'Chile Primera Division': { name: 'Primeira División' },
  'China League One': { name: 'China League One' },
  'Croatian First Football League': {
    name: 'Primeira Liga Croata',
  },
  'Cypriot First Division': { name: 'Primeira Divisão' },
  'Czech First League': { name: 'Primeira Liga Tcheca' },
  'Danish 2nd Division': { name: 'Segunda Divisão' },
  'Japanese J1 League': { name: 'J1 League' },
  'Estonian Meistriliiga': { name: 'Meistriliiga' },
  'Faroe Islands Premier League': {
    name: 'Premier League ',
  },
  'Finnish Veikkausliiga': { name: 'Veikkausliiga' },
  'French Championnat National': {
    name: 'Championnat National Francês',
  },
  'Georgian Erovnuli Liga': { name: 'Liga Erovnuli' },
  'Germany Liga 3': { name: '3. Liga' },
  'Greek Super League 2': { name: 'Super League 2' },
  'Dutch Eerste Divisie': { name: 'Eerste Divisie' },
  'Icelandic Úrvalsdeild karla': { name: 'Úrvalsdeild' },
  'Irish Premier Division': { name: 'Premier Division' },
  'Israeli Premier League': { name: 'Premier League' },
  'Italy Serie D Girone D': { name: 'Série D Girone D' },
  'English Northern Premier League Premier Division': {
    name: 'Northern Premier League Inglaterra',
  },
  'English Isthmian League Premier Division': {
    name: 'Isthmian League Inglaterra',
  },
  'English Southern Premier League South Division': {
    name: 'Southern Premier League Inglaterra',
  },
  'Kazakhstan Premier League': { name: 'Premier League' },
  'Latvian Higher League': { name: 'Liga Letônia' },
  'Lithuanian A Lyga': { name: 'A Lyga' },
  'Macedonian First League': { name: 'Primeira Liga' },
  'Maltese Premier League': { name: 'Premier League ' },
  'Mexican Liga de Expansión MX': { name: 'Liga de Expansión MX' },
  'Moldovan National Division': {
    name: 'Divisão Nacional',
  },
  'Montenegrin First League': {
    name: 'Primeira Liga',
  },
  'Moroccan Botola 2': { name: 'Botola 2' },
  'Northern Irish Premiership': {
    name: 'Premiership',
  },
  'Polish I liga': { name: 'I Liga' },
  'Portuguese LigaPro': { name: 'LigaPro' },
  'Qatar Stars League': { name: 'Qatar Liga das Estrelas' },
  'Romanian Liga II': { name: 'Liga II' },
  'Russian Football National League': {
    name: 'Liga Nacional',
  },
  'San-Marino Campionato': { name: 'Campeonato Sanmarinense' },
  'Pro League': { name: 'Liga Profissional Saudita' },
  'Scottish League 1': {
    name: 'League One Escocia',
  },
  'Scottish League 2': {
    name: 'League Two Escocia',
  },
  'Serbian Super Liga': { name: 'Super Liga' },
  'Slovak First Football League': {
    name: 'Primeira Liga Eslovaca',
  },
  'Primera División RFEF Group 1': { name: 'Primera RFEF Grupo 1' },
  'Swedish Division 1 North': { name: 'Division 1 Norte Sueca' },
  'Swiss Super League': { name: 'Super Liga' },
  'Turkish 1 Lig': { name: '1. Lig' },
  'Ukrainian First League': { name: 'Primeira Liga Ucraniana' },
  'UAE Pro League': { name: 'Liga dos Emirados Árabes' },
  'Turkish 2 Lig': { name: '2. Lig' },
  'English National League North': {
    name: 'National League Norte',
  },
  'English National League South': {
    name: 'National League Sul',
  },
  'Danish 1st Division': { name: 'Primeira Divisão' },
  'American USL Championship': { name: 'USL Championship' },
  'South Korean K League 1': { name: 'K League 1' },
  'Hungarian NB I': { name: 'NB I' },
  'Romanian Liga I': { name: 'Liga I' },
  'Slovenian 1. SNL': { name: '1. SNL Eslovena' },
  'Azerbaijani Premier League': {
    name: 'Premier League',
  },
  'Luxembourg National Division': {
    name: 'Divisão Nacional',
  },
  'German Regionalliga Nord': { name: 'Regionalliga Norte' },
  'Swiss Challenge League': { name: 'Challenge League' },
  'AFC Champions League Elite': {
    name: 'Liga dos Campeões da AFC',
    logo: `/badges_leagues/afc.svg`,
  },
  'CAF Champions League': {
    name: 'Liga dos Campeões da CAF',
    logo: `/badges_leagues/caf.svg`,
  },
  'CONCACAF Champions Cup': {
    name: 'Copa dos Campeões da CONCACAF',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Scottish FA Cup': {
    name: 'Copa da Escócia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'CONCACAF Central American Cup': {
    name: 'Copa da América Central',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Iranian Azadegan League': { name: 'Liga Azadegan' },
  'Iranian Persian Gulf Pro League': {
    name: 'Liga do Golfo Pérsico',
  },
  'Thai Premier League': { name: 'Liga Tailandesa' },
  'Thai League 2': { name: 'Liga 2 Tailandesa' },
  'Kenyan Premier League': { name: 'Premier League' },

  'Italy Serie D Girone B': { name: 'Série D Italiana Girone B' },
  'Italy Serie D Girone C': { name: 'Série D Italiana Girone C' },
  'Italy Serie D Girone E': { name: 'Série D Italiana Girone E' },
  'Italy Serie D Girone F': { name: 'Série D Italiana Girone F' },
  'Italy Serie D Girone G': { name: 'Série D Italiana Girone G' },
  'Italy Serie D Girone H': { name: 'Série D Italiana Girone H' },
  'Italy Serie D Girone I': { name: 'Série D Italiana Girone I' },
  'Italy Serie D Girone A': { name: 'Série D Italiana Girone A' },

  'FA Trophy': { name: 'FA Trophy' },
  'Malaysian Premier League': { name: 'Liga Premier' },
  'Indonesian Super League': { name: 'Liga Super Indonésia' },
  'Indian Super League': { name: 'Superliga Indiana' },
  'Malaysian Super League': { name: 'Superliga' },
  'Cambodia C-League': { name: 'C-League' },
  'Uzbekistan Super League': { name: 'Superliga' },
  'Singapore Premier League': {
    name: 'Premier League',
  },
  'Austrian Erste Liga': { name: 'Erste Liga' },
  'Indian I-League': { name: 'I-League' },
  'South African Premier Soccer League': {
    name: 'Premier Soccer League',
  },
  'Vietnamese V.League 1': { name: 'V.League 1' },
  'AFC Champions League Two': {
    name: 'Liga dos Campeões da AFC 2',
    logo: `/badges_leagues/afc.svg`,
  },
  'Australian A-League Women': {
    name: 'A-League Feminina',
  },
  'Nicaragua Primera Division': {
    name: 'Primera División',
  },

  'Swedish Division 1 South': { name: 'Division 1 Sul' },
  'EFL Trophy': { name: 'EFL Trophy' },
  'English Womens Super League': {
    name: 'Superliga Feminina',
  },
  'UEFA Womens Euro': {
    name: 'Euro Feminino',
    logo: `/badges_leagues/UEFA_Logo.png`,
  },
  'AFC Asian Cup': { name: 'Copa da Ásia', logo: `/badges_leagues/afc.svg` },
  'OFC Nations Cup': {
    name: 'Copa das Nações da OFC',
    logo: `/badges_leagues/ofc.svg`,
  },
  'CONCACAF Gold Cup': {
    name: 'Copa Ouro da CONCACAF',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },

  'Mexican Primera League': { name: 'Liga MX' },
  'Chile Primera B': { name: 'Primera B ' },
  'Bolivian Nacional B Copa Simón Bolívar': {
    name: 'Nacional B ',
  },
  'Colombian Categoría Primera B': { name: 'Primera B Colombiana' },
  'Paraguayan División Intermedia': {
    name: 'División Intermedia ',
  },
  'Peruvian Segunda División': { name: 'Segunda Divisão Peruana' },
  'Uruguayan Segunda División': {
    name: 'Segunda Divisão',
  },
  'Venezuelan Segunda Division': {
    name: 'Segunda Divisão ',
  },
  'Jamaican Premier League': { name: 'Premier League ' },
  'Costa-Rica Liga FPD': { name: 'Liga FPD' },
  'El Salvador Primera Division': {
    name: 'Primera División',
  },
  'Guatemala Liga Nacional': { name: 'Liga Nacional ' },
  'Honduras Liga Nacional de Futbol': {
    name: 'Liga Nacional',
  },
  'Panama Liga Panamena de Futbol': { name: 'Liga Panamenha' },
  'Canadian Premier League': { name: 'Premier League ' },
  'American USL League One': { name: 'USL League One' },
  'USL League Two': { name: 'USL League Two' },
  'MLS Next Pro': { name: 'MLS Next Pro' },
  'American USL Super League': { name: 'USL Super League' },
  'American NWSL Challenge Cup': { name: 'NWSL Challenge Cup' },

  // EUROPA

  'German Regionalliga West': { name: 'Regionalliga Oeste' },
  'German Regionalliga SudWest': {
    name: 'Regionalliga Sudoeste',
  },
  'German Regionalliga Bayern': { name: 'Regionalliga Bayern' },
  'German Regionalliga Nordost': {
    name: 'Regionalliga Nordeste ',
  },
  'Primera División RFEF Group 2': { name: 'Primera RFEF Grupo 2' },

  'Italian Serie C Girone A': { name: 'Série C Girone A' },
  'Italian Serie C Girone B': { name: 'Série C Girone B' },
  'Scottish Highland League': {
    name: 'Highland League Escocia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'Scottish Lowland League': {
    name: 'Lowland League Escocia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'Northern Irish Premier Intermediate League': {
    name: 'Premier Intermediate League',
    logo: `/badges_leagues/Flag_of_Northern_Ireland.svg`,
  },
  'Northern Irish Championship': {
    name: 'Championship da Irlanda do Norte',
    logo: `/badges_leagues/Flag_of_Northern_Ireland.svg`,
  },
  'Welsh Cymru North-South': {
    name: 'Cymru North-South Galesa',
    logo: `/badges_leagues/Flag_of_Wales.png`,
  },
  'Welsh League Cup': {
    name: 'Copa da Liga Galesa',
    logo: `/badges_leagues/Flag_of_Wales.png`,
  },
  'Dutch Tweede Divisie': { name: 'Tweede Divisie' },

  'Croatian Druga HNL': { name: 'Druga HNL Croata' },
  'Cypriot Second Division': { name: 'Segunda Divisão' },
  'Czech National Football League': {
    name: 'Liga Nacional',
  },
  'Estonian Esiliiga': { name: 'Esiliiga' },
  'Faroe Islands 1. deild': { name: '1. Deild' },
  'Finnish Ykkönen': { name: 'Ykkönen' },
  'Finnish Ykkösliiga': { name: 'Ykkösliiga' },
  'French National 2 Group A': {
    name: 'National 2 Grupo A',
  },
  'French National 2 Group B': {
    name: 'National 2 Grupo B',
  },
  'French National 2 Group C': {
    name: 'National 2 Grupo C',
  },
  'French National 2 Group D': {
    name: 'National 2 Grupo D',
  },
  'French Trophée des Champions': { name: 'Supercopa da França' },
  'Georgian Erovnuli Liga 2': { name: 'Erovnuli Liga 2' },
  'Gibraltarian National League': {
    name: 'Liga Nacional',
  },
  'Hungarian NB II': { name: 'NB II Húngara' },
  'Icelandic 1 deild karla': { name: '1. Deild' },
  'Israeli Liga Leumit': { name: 'Liga Leumit' },
  'Kosovan Superleague': { name: 'Superliga' },
  'Latvian First League': { name: 'Primeira Liga' },
  'Lithuanian I Lyga': { name: 'I Lyga' },
  'Montenegrin Second League': {
    name: 'Segunda Liga',
  },
  'Polish II liga': { name: 'II Liga ' },
  'Portuguese Liga 3': { name: 'Liga 3 ' },
  'Russian FNL 2 Group 1': { name: 'FNL 2 Grupo 1' },
  'Russian FNL 2 Group 2': { name: 'FNL 2 Grupo 2' },
  'Russian FNL 2 Group 3': { name: 'FNL 2 Grupo 3' },
  'Russian FNL 2 Group 4': { name: 'FNL 2 Grupo 4' },
  'Russian FNL 2 Division A Gold Group': {
    name: 'FNL 2 Divisão A Gold',
  },
  'Russian FNL 2 Division A Silver Group': {
    name: 'FNL 2 Divisão A Silver',
  },
  'Serbian Prva Liga': { name: 'Prva Liga' },
  'Slovenian 2 SNL': { name: '2. SNL ' },
  'Slovakian 2 Liga': { name: '2. Liga a' },
  'Swiss Promotion League': { name: 'Promotion League' },
  'Swiss Cup': { name: 'Copa da Suíça' },
  'Turkish Cup': { name: 'Copa da Turquia' },
  'Ukrainian Second League': { name: 'Segunda Liga' },
  'German Super Cup': { name: 'Supercopa da Alemanha' },
  'Andorran Segona Divisió': { name: 'Segunda Divisão' },
  'Andorran Cup': { name: 'Copa de Andorra' },
  'Albanian Kategoria e Parë': { name: 'Segunda Divisão' },
  'Armenian First League': { name: 'Primeira Liga ' },
  'Armenian Cup': { name: 'Copa da Armênia' },
  'Azerbaijan First Division': {
    name: 'Primeira Divisão',
  },
  'Azerbaijan Cup': { name: 'Copa do Azerbaijão' },
  'Bosnian First League': { name: 'Primeira Liga' },
  'Bosnian First League of Srpska': {
    name: 'Primeira Liga da Srpska',
  },
  'Bulgarian Second League': { name: 'Segunda Liga' },
  'Belarusian First League': { name: 'Primeira Liga' },
  'Belarus Coppa': { name: 'Copa da Bielorrússia' },
  'Denmark DBU Pokalen': { name: 'Copa da Dinamarca' },
  'Denmark 3 Division': { name: '3ª Divisão' },
  'Denmark Series Group 1': { name: 'Denmark Series Grupo 1' },
  'Denmark Series Group 2': { name: 'Denmark Series Grupo 2' },
  'Denmark Series Group 3': { name: 'Denmark Series Grupo 3' },
  'Denmark Series Group 4': { name: 'Denmark Series Grupo 4' },
  'Austrian Regionalliga West': {
    name: 'Regionalliga Oeste ',
  },
  'Austrian Regionalliga Ost': {
    name: 'Regionalliga Leste ',
  },
  'Austrian Regionalliga Mitte': {
    name: 'Regionalliga Centro ',
  },

  // INGLATERRA - Ligas Regionais
  'English Northern Premier League Division One East': {
    name: 'Northern Premier Div One Leste',
  },
  'English Northern Premier League Division One Midlands': {
    name: 'Northern Premier Div One Midlands',
  },
  'English Northern Premier League Division One West': {
    name: 'Northern Premier Div One Oeste',
  },
  'English Southern Premier League Central Division': {
    name: 'Southern Premier Central',
  },
  'English Southern Premier League Central Division One': {
    name: 'Southern Premier Central Div One',
  },

  'England Non League Div One Isthmian North': {
    name: 'Non League Isthmian Norte',
  },
  'England Non League Div One Isthmian South': {
    name: 'Non League Isthmian Sul',
  },
  'England Non League Div One Southern SW': {
    name: 'Non League Southern Sudoeste',
  },
  'England Non League Div One Southern Central': {
    name: 'Non League Southern Central',
  },
  'English Womens Super League 2': {
    name: 'Super League 2 Feminina',
  },

  // ESPANHA - Ligas Regionais
  'Spanish Primera RFEF Group 1': { name: 'Primera RFEF Grupo 1' },
  'Spanish Primera RFEF Group 2': { name: 'Primera RFEF Grupo 2' },
  'Spanish Segunda RFEF Group 1': { name: 'Segunda RFEF Grupo 1' },
  'Spanish Segunda RFEF Group 2': { name: 'Segunda RFEF Grupo 2' },
  'Spanish Segunda RFEF Group 3': { name: 'Segunda RFEF Grupo 3' },
  'Spanish Segunda RFEF Group 4': { name: 'Segunda RFEF Grupo 4' },
  'Spanish Segunda RFEF Group 5': { name: 'Segunda RFEF Grupo 5' },

  'Spanish Tercera Federación Group 1': {
    name: 'Tercera Federación Grupo 1',
  },
  'Spanish Tercera Federación Group 2': {
    name: 'Tercera Federación Grupo 2',
  },
  'Spanish Tercera Federación Group 3': {
    name: 'Tercera Federación Grupo 3',
  },
  'Spanish Tercera Federación Group 4': {
    name: 'Tercera Federação Grupo 4',
  },
  'Spanish Tercera Federación Group 5': {
    name: 'Tercera Federación Grupo 5',
  },
  'Spanish Tercera Federación Group 6': {
    name: 'Tercera Federación Grupo 6',
  },
  'Spanish Tercera Federación Group 7': {
    name: 'Tercera Federación Grupo 7',
  },
  'Spanish Tercera Federación Group 8': {
    name: 'Tercera Federación Grupo 8',
  },
  'Spanish Tercera Federación Group 9': {
    name: 'Tercera Federación Grupo 9',
  },
  'Spanish Tercera Federación Group 10': {
    name: 'Tercera Federación Grupo 10',
  },
  'Spanish Tercera Federación Group 11': {
    name: 'Tercera Federación Grupo 11',
  },
  'Spanish Tercera Federación Group 12': {
    name: 'Tercera Federación Grupo 12',
  },
  'Spanish Tercera Federación Group 13': {
    name: 'Tercera Federación Grupo 13',
  },
  'Spanish Tercera Federación Group 14': {
    name: 'Tercera Federación Grupo 14',
  },
  'Spanish Tercera Federación Group 15': {
    name: 'Tercera Federación Grupo 15',
  },
  'Spanish Tercera Federación Group 16': {
    name: 'Tercera Federación Grupo 16',
  },
  'Spanish Tercera Federación Group 17': {
    name: 'Tercera Federación Grupo 17',
  },
  'Spanish Tercera Federación Group 18': {
    name: 'Tercera Federación Grupo 18',
  },
  'Spanish Liga F': { name: 'Liga F' },
  'Spanish Copa Federacion': { name: 'Copa Federação Espanhola' },
  'Supercopa de Espana Femenina': {
    name: 'Supercopa Feminina',
  },

  // HOLANDA - Ligas Regionais
  'Netherlands Derde Divisie Saturday': {
    name: 'Derde Divisie Sábado',
  },
  'Netherlands Derde Divisie Sunday': {
    name: 'Derde Divisie Domingo',
  },
  'Netherlands Eredivisie Women': { name: 'Eredivisie Feminina' },

  // ÁSIA
  'Japanese J2 League': { name: 'J2 League ' },
  'Japanese J3 League': { name: 'J3 League' },
  'Japan Football League': { name: 'Japan Football League' },
  'Japan Emperors Cup': { name: 'Copa do Imperador' },
  'Japanese JLeague Cup': { name: 'Copa J.League' },
  'South Korean K League 2': { name: 'K League 2' },
  'Korean K3 League': { name: 'K3 League' },
  'Korea Cup': { name: 'Copa da Coreia' },
  'China league Two': { name: 'League Two' },
  'China FA Cup': { name: 'Copa da China' },
  'Hong-Kong Premier League': {
    name: 'Premier League',
  },
  'Taiwan Football Premier League': {
    name: 'Liga Premier',
  },
  'Taiwan Mulan Football League': { name: 'Mulan Football League' },
  'Macau Liga de Elite': { name: 'Liga de Elite' },
  'Indian I-League 2nd Division': {
    name: 'I-League Segunda Divisão',
  },
  'Bangladesh Premier League': {
    name: 'Premier League',
  },
  'Myanmar National League': { name: 'Liga Nacional' },
  'Vietnam V.League 2': { name: 'V.League 2' },
  'Vietnamese Cup': { name: 'Copa do Vietnã' },
  'Philippines Football League': { name: 'Liga Filipina' },
  'Kyrgyz Premier League': {
    name: 'Premier League',
  },
  'Lao Premier League': { name: 'Premier League' },
  'Nepalese A Division': { name: 'Divisão A' },
  'Pakistan Premier League': {
    name: 'Premier League',
  },
  'Palestinian West Bank Premier League': {
    name: 'Premier League',
  },
  'Maldives Dhivehi Premier League': {
    name: 'Premier League',
  },
  'Bahrain Premier League': { name: 'Premier League' },
  'Kuwait Premier League': { name: 'Premier League' },
  'Kuwait Division 1': { name: 'Divisão 1' },
  'Kuwait Crown Prince Cup': {
    name: 'Copa do Príncipe Herdeiro Kuwait',
  },
  'Kuwait Emir Cup': { name: 'Copa do Emir Kuwait' },
  'Emir of Qatar Cup': { name: 'Copa do Emir do Qatar' },
  'Qatar QSL Cup': { name: 'QSL Cup do Qatar' },
  'Oman Professional League': { name: 'Liga Profissional de Omã' },
  'UAE League Cup': { name: 'Copa da Liga' },
  'Saudi First Division League': {
    name: 'Primeira Divisão',
  },
  'Saudi King Cup': { name: 'Copa do Rei Saudita' },
  'Saudi Super Cup': { name: 'Supercopa Saudita' },
  'Jordanian Pro League': { name: 'Liga Profissional' },
  'Iraqi Premier League': { name: 'Premier League' },
  'Lebanese Premier League': { name: 'Premier League' },
  'Syrian Premier League': { name: 'Premier League' },
  'Tajikistan Vysshaya Liga': {
    name: 'Vysshaya Liga',
  },
  'Kazakhstan First League': {
    name: 'Primeira Liga',
  },
  'Kazakhstan Cup': { name: 'Copa do Cazaquistão' },
  'Turkmenistan Yokary Liga': {
    name: 'Yokary Liga',
  },
  'Mongolian Premier League': {
    name: 'Premier League',
  },
  'ASEAN Club Championship': {
    name: 'Campeonato de Clubes da ASEAN',
    logo: `/badges_leagues/afc.svg`,
  },
  'AFC Challenge League': {
    name: 'Liga Challenge da AFC',
    logo: `/badges_leagues/afc.svg`,
  },
  'AFC Womens Champions League': {
    name: 'Liga dos Campeões Feminina da AFC',
    logo: `/badges_leagues/afc.svg`,
  },
  'Asian Cup Women': {
    name: 'Copa da Ásia Feminina',
    logo: `/badges_leagues/afc.svg`,
  },

  // ÁFRICA
  'Egyptian Premier League': { name: 'Premier League' },
  'Egypt League Cup': { name: 'Copa da Liga' },
  'Tunisian Ligue 1': { name: 'Ligue 1' },
  'Algerian Ligue 1': { name: 'Ligue 1 ' },
  'Nigerian NPFL': { name: 'NPFL' },
  'Ghanaian Premier League': { name: 'Premier League' },
  'Senegal Ligue 1': { name: 'Ligue 1' },
  'DR Congo Ligue 1': { name: 'Ligue 1 ' },
  'Angolan Girabola': { name: 'Girabola ' },
  'Zambia Super League': { name: 'Super Liga ' },
  'Zimbabwean Premier Soccer League': {
    name: 'Premier League',
  },
  'Ethiopian Premier League': { name: 'Premier League' },
  'Ugandan Premier League': { name: 'Premier League' },
  'Rwandan National Soccer League': {
    name: 'Liga Nacional ',
  },
  'Burundi Ligue A': { name: 'Ligue A' },
  'Somali Premier League': { name: 'Premier League' },
  'Sudani Premier League': { name: 'Premier League' },
  'Libyan Premier League': { name: 'Premier League' },
  'Mauritania Premier League': {
    name: 'Premier League',
  },
  'Gambia GFA League': { name: 'GFA League' },
  'Guinea Ligue 1': { name: 'Ligue 1' },
  'Ivory Coast Ligue 1': { name: 'Ligue 1' },
  'Burkina Faso 1ere Division': {
    name: 'Primeira Divisão',
  },
  'Benin Championnat National': {
    name: 'Campeonato Nacional',
  },
  'Liberian LFA First Division': {
    name: 'Primeira Divisão',
  },
  'Botswana Premier League': { name: 'Premier League' },
  'Eswatini Premier League': { name: 'Premier League' },
  'CAF Confederation Cup': {
    name: 'Copa das Confederações da CAF',
    logo: `/badges_leagues/caf.svg`,
  },
  'CECAFA Club Cup': {
    name: 'Copa de Clubes CECAFA',
    logo: `/badges_leagues/caf.svg`,
  },
  'COSAFA Cup': { name: 'Copa COSAFA', logo: `/badges_leagues/caf.svg` },
  'South-Africa 8 Cup': { name: 'Copa Sul-Africana' },
  'Africa Cup of Nations Women': {
    name: 'Copa Africana de Nações Feminina',
    logo: `/badges_leagues/caf.svg`,
  },
  'CAF Womens Olympic Qualifying Tournament': {
    name: 'Qualificatória Olímpica CAF Feminina',
    logo: `/badges_leagues/caf.svg`,
  },

  // OCEANIA
  'New-Zealand Football Championship': {
    name: 'Campeonato Neozelandês',
  },
  'New Zealand National League Championship': {
    name: 'Liga Nacional',
  },
  'New Zealand Northern League': {
    name: 'Liga Norte',
  },
  'New Zealand Central League': {
    name: 'Liga Central',
  },
  'New Zealand Southern League': {
    name: 'Liga Sul',
  },
  'Australia FFA Cup': { name: 'FFA Cup' },
  'Australian Championship': { name: 'Campeonato Australiano' },
  'Australia Northern NSW NPL': { name: 'NPL Norte NSW' },
  'Australia New South Wales NPL': { name: 'NPL NSW' },
  'Australia Victoria NPL': { name: 'NPL Victoria' },
  'Australia Brisbane Premier League': {
    name: 'Premier League Brisbane',
  },
  'Australia Queensland NPL': { name: 'NPL Queensland' },
  'Australia Western Australia NPL': {
    name: 'NPL Austrália Ocidental',
  },
  'Australia South Australia NPL': { name: 'NPL Sul da Austrália' },
  'Australia Northern Territory Premier League': {
    name: 'Premier League Território Norte',
  },
  'Australia Tasmania NPL': { name: 'NPL Tasmânia' },
  'Fijian Premier League': { name: 'Premier League de Fiji' },
  'OFC Mens Champions League': {
    name: 'Liga dos Campeões da OFC',
    logo: `/badges_leagues/ofc.svg`,
  },

  'Spanish Segunda División B Group 3': {
    name: 'Segunda Divisão B da Espanha - Grupo 3',
  },
  'Spanish Segunda División B Group 4': {
    name: 'Segunda Divisão B da Espanha - Grupo 4',
  },
  'Spanish Segunda División B Group 5': {
    name: 'Segunda Divisão B da Espanha - Grupo 5',
  },
  'Svenska Cupen': { name: 'Copa da Suécia' },
  'Irish First Division': { name: 'Primeira Divisão da Irlanda' },
  'FA Womens League Cup': {
    name: 'Copa da Liga Feminina da Inglaterra',
  },
  'Scottish League Cup': {
    name: 'Copa da Liga Escocia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'UEFA Womens Champions League': {
    name: 'Liga dos Campeões Feminina da UEFA',
    logo: `/badges_leagues/UEFA_Logo.png`,
  },
  'Dominican LDF': { name: 'Liga Dominicana de Futebol' },
  'Ecuadorian Serie B': { name: 'Série B do Equador' },
  'Liechtenstein Cup': { name: 'Copa do Liechtenstein' },
  'Olympics Soccer': {
    name: 'Futebol Olímpico',
    logo: `/badges_leagues/olympic-games.svg`,
  },
  'Brazil Serie D': { name: 'Série D do Brasil' },
  'FIFA Arab Cup': {
    name: 'Copa Árabe FIFA',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Copa Colombia': { name: 'Copa Colômbia' },
  'Finnish Cup': { name: 'Copa da Finlândia' },
  'Italy Coppa Italia Serie C': { name: 'Coppa Italia Série C' },
  'Malaysia Cup': { name: 'Copa da Malásia' },
  'Russia Cup': { name: 'Copa da Rússia' },
  'SAFF Championship': {
    name: 'Campeonato SAFF',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'San Marino Coppa Titano': { name: 'Coppa Titano de San Marino' },
  'Slovenia Cup': { name: 'Copa da Eslovênia' },
  'US Open Cup': { name: 'Copa dos EUA' },
  'Brazil Brasileiro Women': { name: 'Brasileirão Feminino' },
  'Denmark Elitedivisionen': {
    name: 'Elitedivisionen da Dinamarca',
  },
  'France Première Ligue': {
    name: 'Primeira Liga Feminina da França',
  },
  'Germany Women Bundesliga': {
    name: 'Bundesliga Feminina da Alemanha',
  },
  'Italy Serie A Women': { name: 'Série A Feminina da Itália' },
  'Mexico Liga MX Femenil': { name: 'Liga MX Feminil do México' },
  'Norway Toppserien': { name: 'Toppserien' },
  'Sweden Damallsvenskan': { name: 'Damallsvenskan' },
  'Argentina Primera B Metropolitana': {
    name: 'Primera B Metropolitana da Argentina',
  },
  'Portugal Liga 3': { name: 'Liga 3 de Portugal' },
  'Russia FNL 2 Group 1': { name: 'FNL 2 da Rússia - Grupo 1' },
  'Russia FNL 2 Group 2': { name: 'FNL 2 da Rússia - Grupo 2' },
  'Russia FNL 2 Group 3': { name: 'FNL 2 da Rússia - Grupo 3' },
  'Russia FNL 2 Group 4': { name: 'FNL 2 da Rússia - Grupo 4' },
  'USA NISA': { name: 'NISA - EUA' },
  'Aruban Division di Honor': { name: 'Divisão de Honra de Aruba' },
  'Bermuda Premier League': { name: 'Premier League das Bermudas' },
  'Guadeloupe Division dHonneur': {
    name: 'Divisão de Honra da Guadalupe',
  },
  'Lebanon Premier League': { name: 'Premier League' },
  'Zimbabwe Premier Soccer League': {
    name: 'Premier Soccer League do Zimbábue',
  },
  'SheBelieves Cup': {
    name: 'SheBelieves Cup',
  },
  'CONCACAF Nations League': {
    name: 'Liga das Nações CONCACAF',
  },
  'Leagues Cup': {
    name: 'Copa das Ligas',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Copa Chile': { name: 'Copa do Chile' },
  'Olympics Soccer Women': {
    name: 'Futebol Olímpico Feminino',
  },
  'Friendlies Women': {
    name: 'Amistosos Internacionais Femininos',
  },
  'DFB-Pokal Frauen': { name: 'Copa da Alemanha Feminina' },
  'Campeonato Nacional Feminino': {
    name: 'Campeonato Nacional Feminino',
  },
  'UEFA Womens Nations League': {
    name: 'Liga das Nações Feminina UEFA',
  },
  'UEFA European Under-19 Championship': {
    name: 'Campeonato Europeu Sub-19 UEFA',
  },
  'UEFA European Under-17 Championship': {
    name: 'Campeonato Europeu Sub-17 UEFA',
  },
  'FIFA U-17 World Cup': {
    name: 'Copa do Mundo Sub-17 FIFA',
  },
  'UEFA Youth League': {
    name: 'UEFA Youth League',
  },
  'Argentinian Copa de la Liga Profesional': {
    name: 'Copa da Liga Profissional Argentina',
  },
  'CONMEBOL Pre-Olympic Tournament': {
    name: 'Torneio Pré-Olímpico CONMEBOL',
  },
  'CONCACAF W Gold Cup': {
    name: 'Copa Ouro Feminina CONCACAF',
  },
  'FA Womens Challenge Cup': { name: 'Copa Feminina Challenge FA' },
  'Chile Segunda División': { name: 'Segunda Divisão do Chile' },
  'Russia FNL 2 Division A Gold Group': {
    name: 'FNL 2 Rússia - Grupo Ouro',
  },
  'Russia FNL 2 Division A Silver Group': {
    name: 'FNL 2 Rússia - Grupo Prata',
  },
  'USL Super League': { name: 'USL Super League' },
  'Copa Paraguay': { name: 'Copa do Paraguai' },
  'Asian Games Soccer': {
    name: 'Futebol nos Jogos Asiáticos',
    logo: `/badges_leagues/afc.svg`,
  },
  'Pan American Games Soccer': {
    name: 'Futebol nos Jogos Pan-Americanos',
    logo: `/badges_leagues/panamericana.svg`,
  },
  'Pacific Games Soccer': {
    name: 'Futebol nos Jogos do Pacífico',
    logo: `/badges_leagues/afc.svg`,
  },
  'World Cup Qualifying AFC': {
    name: 'Eliminatórias Copa do Mundo AFC',
    logo: `/badges_leagues/afc.svg`,
  },
  'World Cup Qualifying CAF': {
    name: 'Eliminatórias Copa do Mundo CAF',
    logo: `/badges_leagues/caf.svg`,
  },
  'World Cup Qualifying CONMEBOL': {
    name: 'Eliminatórias Copa do Mundo CONMEBOL',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'World Cup Qualifying CONCACAF': {
    name: 'Eliminatórias Copa do Mundo CONCACAF',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'World Cup Qualifying OFC': {
    name: 'Eliminatórias Copa do Mundo OFC',
    logo: `/badges_leagues/ofc.svg`,
  },
  'World Cup Qualifying UEFA': {
    name: 'Eliminatórias Copa do Mundo UEFA',
  },
  'UEFA European Championships Qualifying': {
    name: 'Eliminatórias do Campeonato Europeu UEFA',
  },
  'African Cup of Nations Qualifying': {
    name: 'Eliminatórias Copa Africana de Nações',
    logo: `/badges_leagues/caf.svg`,
  },
  'AFC Asian Cup Qualifying': {
    name: 'Eliminatórias Copa Asiática AFC',
    logo: `/badges_leagues/afc.svg`,
  },
  'CONCACAF Gold Cup Qualifying': {
    name: 'Eliminatórias Copa Ouro CONCACAF',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Argentina Torneo Federal A': {
    name: 'Torneio Federal A da Argentina',
  },
  'Argentinian Primera C': { name: 'Primera C Argentina' },
  'Copa AUF Uruguay': { name: 'Copa AUF Uruguai' },
  'Canadian Northern Super League': {
    name: 'Canadian Northern Super League',
  },
  'Coppa Italia Women': { name: 'Coppa Itália Feminina' },
  'Norwegian Cupen': { name: 'Copa da Noruega' },
  'Copa Ecuador': { name: 'Copa do Equador' },
  'Irish FAI Cup': { name: 'Copa FAI da Irlanda' },
  'CONCACAF W Champions Cup': {
    name: 'Copa das Campeãs Feminina CONCACAF',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'FIFA U20 World Cup': {
    name: 'Copa do Mundo Sub-20 FIFA',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'English Premier League Summer Series': {
    name: 'Série de Verão da Premier League Inglesa',
  },
  'Emirates Cup': { name: 'Copa Emirates' },
  'USL Cup': { name: 'USL Cup' },
  'Copa America Femenina': {
    name: 'Copa América Feminina',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'Lithuanian Football Cup': { name: 'Copa da Lituânia' },
  'Lithuanian Supercup': { name: 'Supercopa da Lituânia' },
  'Copa Venezuela': { name: 'Copa da Venezuela' },
  'Supercopa de Venezuela': { name: 'Supercopa da Venezuela' },
  'Mexican Campeon de Campeones': {
    name: 'Copa dos Campeões do México',
  },
  'Argentinian Supercopa Internacional': {
    name: 'Supercopa Internacional Argentina',
  },
  'Argentinian Trofeo de Campeones': {
    name: 'Troféu de Campeões Argentina',
  },
  'Recopa Sudamericana': {
    name: 'Recopa Sul-Americana',
    logo: `/badges_leagues/Conmebol_Recopa.png`,
  },

  'CAFA Nations Cup': {
    name: 'Copa das Nações CAFA',
    logo: `/badges_leagues/afc.svg`,
  },

  'FIFA Intercontinental Cup': {
    name: 'Copa Intercontinental FIFA',
    logo: `/badges_leagues/FIFA_Intercontinental_Cup.png`,
  },
  'Supercopa de Chile': { name: 'Supercopa do Chile' },
  'UEFA Womens Europa Cup': {
    name: 'Liga Europa Feminina UEFA',
  },
  'CONCACAF Caribbean Cup': {
    name: 'Copa do Caribe CONCACAF',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Copa Libertadores Femenina': {
    name: 'Copa Libertadores Feminina',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'Latvian Cup': { name: 'Copa da Letônia' },
  'FIFA Womens U17 World Cup': {
    name: 'Copa do Mundo Sub-17 Feminina FIFA',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
};

export const translateLeague = (league: string): LeagueTranslation => {
  return leagueTranslations[league] || { name: league };
};
