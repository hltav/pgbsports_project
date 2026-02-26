export interface LeagueTranslation {
  name: string;
  expectedCountry?: string;
  flag?: string;
  logo?: string;
}

export const leagueTranslations: Record<string, LeagueTranslation> = {
  //Competições Continentais
  'World Cup': {
    name: 'Copa do Mundo 2026',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/world_cup_2026.png`,
  },

  'UEFA Champions League': {
    name: 'UEFA Champions League',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/uefa_champions_league.png`,
  },
  'UEFA Europa League': {
    name: 'UEFA Europa League',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/uefa_europa_league.png`,
  },
  'UEFA Conference League': {
    name: 'UEFA Conference League',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/UEFA_Europa_Conference_League_2021.svg`,
  },
  'Copa Libertadores': {
    name: 'Conmebol Libertadores',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/conmebol_libertadores.png`,
  },
  'Copa Sudamericana': {
    name: 'Conmebol Sul-Americana',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/conmebol_sudamericana.png`,
  },

  // Ligas Principais
  'Brazilian Serie A': {
    name: 'Brasileirão Betano',
    expectedCountry: 'Brasil',
    logo: `/badges_leagues/brasileirao_betano_serie_a.png`,
  },
  'English Premier League': {
    name: 'Premier League',
    expectedCountry: 'Inglaterra',
    logo: `/badges_leagues/england_premier_league.png`,
  },
  'German Bundesliga': {
    name: 'Bundesliga',
    expectedCountry: 'Alemanha',
    logo: `/badges_leagues/german_bundesliga.png`,
  },
  'Italian Serie A': {
    name: 'Série A',
    expectedCountry: 'Itália',
    logo: `/badges_leagues/italy_seriea.png`,
  },
  'French Ligue 1': {
    name: 'Ligue 1',
    expectedCountry: 'França',
    logo: `/badges_leagues/french_ligue1.png`,
  },
  'Spanish La Liga': {
    name: 'La Liga',
    expectedCountry: 'Espanha',
    logo: `/badges_leagues/spain_la_liga.png`,
  },
  'Portuguese Primeira Liga': {
    name: 'Liga Betclic',
    expectedCountry: 'Portugal',
    logo: `/badges_leagues/liga_portugal_betclick.png`,
  },
  'Dutch Eredivisie': {
    name: 'Eredivisie',
    expectedCountry: 'Países Baixos',
    logo: `/badges_leagues/dutch_eredivisie.png`,
  },
  'Argentinian Primera Division': {
    name: 'Liga Profissional Argentina ',
    expectedCountry: 'Argentina',
    logo: `/badges_leagues/liga_profissional_argentina.png`,
  },
  'Uruguayan Primera Division': {
    name: 'Liga AUF ',
    expectedCountry: 'Uruguai',
    logo: `/badges_leagues/liga_uruguaia.png`,
  },

  //Ligas de Segundo Escalão
  'Greek Superleague Greece': {
    name: 'Superliga',
    expectedCountry: 'Grécia',
    logo: `/badges_leagues/greece_superleague.png`,
  },
  'Scottish Premier League': {
    name: 'Premiership',
    expectedCountry: 'Escócia',
    logo: `/badges_leagues/scottish_premiership.png`,
  },
  'Belgian Pro League': {
    name: 'Jupiler Pro League ',
    expectedCountry: 'Bélgica',
    logo: `/badges_leagues/belgium_pro_league.png`,
  },
  'Turkish Super Lig': {
    name: 'Super Lig',
    expectedCountry: 'Turquia',
    logo: `/badges_leagues/turkey_super_lig.png`,
  },
  'Danish Superliga': {
    name: 'SuperLiga',
    expectedCountry: 'Dinamarca',
    logo: `/badges_leagues/danish_superliga.png`,
  },
  'American Major League Soccer': {
    name: 'Major League Soccer MLS',
    expectedCountry: 'Estados Unidos',
    logo: `/badges_leagues/major_league_soccer.png`,
  },
  'Swedish Allsvenskan': {
    name: 'Allsvenskan ',
    expectedCountry: 'Suécia',
    logo: `/badges_leagues/allsvenskan.png`,
  },
  'Ukrainian Premier League': {
    name: 'Premier League',
    expectedCountry: 'Ucrânia',
    logo: `/badges_leagues/ucrania_premier_league.png`,
  },
  'Colombia Categoría Primera A': {
    name: 'Liga BetPlay DIMAYOR',
    expectedCountry: 'Colômbia',
    logo: `/badges_leagues/liga_betplay_colombia.png`,
  },
  'Australian A-League': {
    name: 'A-League ',
    expectedCountry: 'Austrália',
    logo: `/badges_leagues/a_league_australia.png`,
  },
  'Norwegian Eliteserien': {
    name: 'Eliteserien',
    expectedCountry: 'Noruega',
    logo: `/badges_leagues/eliteserien_noruega.png`,
  },
  'Bolivian Primera División': {
    name: 'Liga Profissional',
    expectedCountry: 'Bolívia',
    logo: `/badges_leagues/bolivia_copa_tigo.png`,
  },
  'Ecuadorian Serie A': {
    name: 'LigaPro Ecuabet',
    expectedCountry: 'Equador',
    logo: `/badges_leagues/liga_pro_ecuador.png`,
  },
  'Paraguayan Primera Division': {
    name: 'Primera Divisão',
    expectedCountry: 'Paraguai',
    logo: `/badges_leagues/copa_de_primera_paraguay.png`,
  },
  'Peruvian Primera Division': {
    name: 'Liga 1 Betsson',
    expectedCountry: 'Peru',
    logo: `/badges_leagues/liga1_peru.png`,
  },
  'Chinese Super League': {
    name: 'Superliga Chinesa',
    expectedCountry: 'China',
    logo: `/badges_leagues/chinese_super_league.png`,
  },
  'Russian Football Premier League': {
    name: 'Premier League',
    expectedCountry: 'Rússia',
    logo: `/badges_leagues/russian_premier_league.png`,
  },

  // Copas Nacionais
  'FA Cup': {
    name: 'Copa da Inglaterra',
    expectedCountry: 'Inglaterra',
    logo: `/badges_leagues/fa_cup.png`,
  },
  'Copa del Rey': {
    name: 'Copa do Rei',
    expectedCountry: 'Espanha',
    logo: `/badges_leagues/copa_del_rey.png`,
  },
  'Coupe de France': {
    name: 'Copa da França',
    expectedCountry: 'França',
    logo: `/badges_leagues/coupe_de_france.png`,
  },
  'DFB-Pokal': {
    name: 'Copa da Alemanha',
    expectedCountry: 'Alemanha',
    logo: `/badges_leagues/dfb_pokal.png`,
  },
  'Copa do Brasil': {
    name: 'Copa do Brasil',
    expectedCountry: 'Brasil',
    logo: `/badges_leagues/copa_do_brasil.png`,
  },
  'Coppa Italia': {
    name: 'Coppa Italia',
    expectedCountry: 'Itália',
    logo: `/badges_leagues/coppa_italia.png`,
  },
  'KNVB Beker': {
    name: 'Copa da Holanda',
    expectedCountry: 'Países Baixos',
    logo: `/badges_leagues/knvb_beker_holanda.png`,
  },
  'Copa Argentina': {
    name: 'Copa da Argentina',
    expectedCountry: 'Argentina',
    logo: `/badges_leagues/copa_argentina.png`,
  },
  'Taca de Liga': {
    name: 'Copa da Liga Portuguesa',
    expectedCountry: 'Portugal',
    logo: `/badges_leagues/taca_da_liga_portugal.png`,
  },
  'Taca de Portugal': {
    name: 'Copa de Portugal',
    expectedCountry: 'Portugal',
    logo: `/badges_leagues/taca_de_portugal.png`,
  },
  'Coupe de la Ligue': {
    name: 'Copa da Liga Francesa',
    expectedCountry: 'França',
    logo: `/badges_leagues/coupe_de_la_ligue_france.png`,
  },
  'EFL Cup': {
    name: 'Copa da Liga Inglesa',
    expectedCountry: 'Inglaterra',
  },
  'FA Community Shield': {
    name: 'Supercopa da Inglaterra',
    expectedCountry: 'Inglaterra',
    logo: `/badges_leagues/fa_community_shield.png`,
  },

  // Segundas Divisões
  'Brazilian Serie B': {
    name: 'Brasileirão Série B',
    expectedCountry: 'Brasil',
    logo: `/badges_leagues/brasileirao_superbet_serie_b.png`,
  },
  'English League Championship': {
    name: 'Championship',
    expectedCountry: 'Inglaterra',
    logo: `/badges_leagues/england_championship.png`,
  },
  'Italian Serie B': { name: 'Série B ' },
  'Scottish Championship': {
    name: 'Championship',
    expectedCountry: 'Escócia',
  },
  'English League 1': {
    name: 'League One ',
    expectedCountry: 'Inglaterra',
  },
  'English League 2': {
    name: 'League Two ',
    expectedCountry: 'Inglaterra',
  },
  'Italian Serie C Girone C': {
    name: 'Série C Girone C',
    expectedCountry: 'Itália',
  },
  'German 2. Bundesliga': {
    name: '2. Bundesliga',
    expectedCountry: 'Alemanha',
  },
  'Segunda División': { name: 'La Liga 2', expectedCountry: 'Espanha' },
  'French Ligue 2': { name: 'Ligue 2', expectedCountry: 'França' },
  'Swedish Superettan': { name: 'Superettan ', expectedCountry: 'Suécia' },
  'Polish Ekstraklasa': { name: 'Ekstraklasa ', expectedCountry: 'Polônia' },

  // 🌍🏆 Competições Internacionais

  'American NASL': { name: 'NASL - EUA' },
  'Norwegian 1. Divisjon': { name: '1. Divisjon ', expectedCountry: 'Noruega' },
  'Welsh Premier League': {
    name: 'Premier League Galesa',
    expectedCountry: 'Gales',
  },
  'UEFA Nations League': {
    name: 'UEFA Nations League',
    expectedCountry: 'Mundo',
  },
  'African Cup of Nations': {
    name: 'Copa das Nações Africanas',
    expectedCountry: 'Mundo',
  },
  'Confederations Cup': {
    name: 'Copa das Confederações',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Copa America': {
    name: 'Copa América',
    expectedCountry: 'Mundo',
  },
  'UEFA European Championships': {
    name: 'Campeonato Europeu',
    expectedCountry: 'Mundo',
  },
  'FIFA Club World Cup': {
    name: 'Mundial de Clubes',
    expectedCountry: 'Mundo',
  },
  'International Champions Cup': {
    name: 'International Champions Cup',
    expectedCountry: 'Mundo',
  },
  'Supercoppa Italiana': {
    name: 'Supercopa Italiana',
    expectedCountry: 'Itália',
    logo: `/badges_leagues/italia_super_cup.png`,
  },
  'Supercopa de Espana': {
    name: 'Supercopa da Espanha',
    expectedCountry: 'Espanha',
    logo: `/badges_leagues/supercopa_de_espana.png`,
  },
  'UEFA Super Cup': {
    name: 'Supercopa da UEFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/uefa_super_cup.png`,
  },
  'Venezuela Primera Division': {
    name: 'Venezuela Liga FutVE',
    expectedCountry: 'Venezuela',
    logo: `/badges_leagues/liga_fut_venezuela.png`,
  },

  //Brasil - Ligas Regionais
  'Brazilian Serie C': {
    name: 'Brasileirão Série C',
    expectedCountry: 'Brasil',
  },
  'Brazil Serie D': { name: 'Brasileirão Série D', expectedCountry: 'Brasil' },
  'Brazilian Copa do Nordeste': {
    name: 'Copa do Nordeste',
    expectedCountry: 'Brasil',
  },
  'Brazilian Copa Verde': { name: 'Copa Verde', expectedCountry: 'Brasil' },

  // BRASIL - Estaduais
  'Brazilian Campeonato Acreano': {
    name: 'Campeonato Acreano',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Alagoano': {
    name: 'Campeonato Alagoano',
    expectedCountry: 'Brasil',
  },
  'Alagoano - 2': {
    name: 'Campeonato Alagoano 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Amapaense': {
    name: 'Campeonato Amapaense',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Amazonense': {
    name: 'Campeonato Amazonense',
    expectedCountry: 'Brasil',
  },
  'Amazonense - 2': {
    name: 'Campeonato Amazonense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Baiano': {
    name: 'Campeonato Baiano',
    expectedCountry: 'Brasil',
  },
  'Baiano - 2': {
    name: 'Campeonato Baiano 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Brasiliense': {
    name: 'Campeonato Brasiliense',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Capixaba': {
    name: 'Campeonato Capixaba',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Catarinense': {
    name: 'Campeonato Catarinense',
    expectedCountry: 'Brasil',
  },
  'Catarinense - 2': {
    name: 'Campeonato Catarinense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Catarinense - 3': {
    name: 'Campeonato Catarinense 3ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Carioca': {
    name: 'Campeonato Carioca',
    expectedCountry: 'Brasil',
  },
  'Carioca - 2': {
    name: 'Campeonato Carioca 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Cearense': {
    name: 'Campeonato Cearense',
    expectedCountry: 'Brasil',
  },
  'Cearense - 2': {
    name: 'Campeonato Cearense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Gaucho': {
    name: 'Campeonato Gaúcho',
    expectedCountry: 'Brasil',
  },
  'Gaucho - 2': {
    name: 'Campeonato Gaúcho 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Gaucho - 3': {
    name: 'Campeonato Gaúcho 3ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Goiano': {
    name: 'Campeonato Goiano',
    expectedCountry: 'Brasil',
  },
  'Goiano - 2': {
    name: 'Campeonato Goiano 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Maranhense': {
    name: 'Campeonato Maranhense',
    expectedCountry: 'Brasil',
  },
  'Maranhense - 2': {
    name: 'Campeonato Maranhense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato MatoGrossense': {
    name: 'Campeonato Mato-Grossense',
    expectedCountry: 'Brasil',
  },
  'MatoGrossense 2': {
    name: 'Campeonato Mato-Grossense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato SulMatoGrossense': {
    name: 'Campeonato Sul Mato-Grossense',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Mineiro': {
    name: 'Campeonato Mineiro',
    expectedCountry: 'Brasil',
  },
  'Mineiro - 2': {
    name: 'Campeonato Mineiro 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Mineiro - 3': {
    name: 'Campeonato Mineiro 3ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Paraense': {
    name: 'Campeonato Paraense',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Paraibano': {
    name: 'Campeonato Paraibano',
    expectedCountry: 'Brasil',
  },
  'Paraibano 2': {
    name: 'Campeonato Paraibano 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Paranaense': {
    name: 'Campeonato Paranaense',
    expectedCountry: 'Brasil',
  },
  'Paranaense - 2': {
    name: 'Campeonato Paranaense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Paranaense - 3': {
    name: 'Campeonato Paranaense 3ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Pernambucano': {
    name: 'Campeonato Pernambucano',
    expectedCountry: 'Brasil',
  },
  'Pernambucano - 2': {
    name: 'Campeonato Pernambucano 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Pernambucano - 3': {
    name: 'Campeonato Pernambucano 3ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Piauiense': {
    name: 'Campeonato Piauiense',
    expectedCountry: 'Brasil',
  },
  'Piauiense - 2': {
    name: 'Campeonato Piauiense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Potiguar': {
    name: 'Campeonato Potiguar',
    expectedCountry: 'Brasil',
  },
  'Potiguar - 2': {
    name: 'Campeonato Potiguar 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Rondoniense': {
    name: 'Campeonato Rondoniense',
    expectedCountry: 'Brasil',
  },
  'Rondoniense - 2': {
    name: 'Campeonato Rondoniense 2ª Divisão',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Roraimense': {
    name: 'Campeonato Roraimense',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Paulista': {
    name: 'Campeonato Paulista',
    expectedCountry: 'Brasil',
  },
  'Paulista-A2': {
    name: 'Campeonato Paulista Série A2',
    expectedCountry: 'Brasil',
  },
  'Paulista-A3': {
    name: 'Campeonato Paulista Série A3',
    expectedCountry: 'Brasil',
  },
  'Paulista-A4': {
    name: 'Campeonato Paulista Série A4',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Sergipano': {
    name: 'Campeonato Sergipano',
    expectedCountry: 'Brasil',
  },
  'Brazilian Campeonato Tocantinense': {
    name: 'Campeonato Tocantinense',
    expectedCountry: 'Brasil',
  },

  //Outras Ligas Brasil
  'Brazilian Supercopa Rei': {
    name: 'Supercopa Rei',
    expectedCountry: 'Brasil',
  },
  'Brasileiro U20 A': {
    name: 'Brasileirão Sub-20',
    expectedCountry: 'Brasil',
  },
  'Copa Paulista': { name: 'Copa Paulista', expectedCountry: 'Brasil' },
  'São Paulo Youth Cup': {
    name: 'Copa São Paulo de Futebol Júnior',
    expectedCountry: 'Brasil',
  },
  'Brazilian Copa FGF': {
    name: 'Copa Federação Gaúcha',
    expectedCountry: 'Brasil',
  },

  // Ligas Específicas
  'Moroccan Championship': {
    name: 'Campeonato Marroquino',
    expectedCountry: 'Marrocos',
  },
  'American NWSL': { name: 'NWSL', expectedCountry: 'Estados Unidos' },
  'European Cup': {
    name: 'Copa Europeia',
    expectedCountry: 'Mundo',
  },
  'UEFA Cup': {
    name: 'Copa da UEFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/UEFA_Logo.png`,
  },
  'Football League First Division': {
    name: 'Primeira Divisão Inglesa Histórica',
    expectedCountry: 'Inglaterra',
  },
  'Football League Super Cup': {
    name: 'Supercopa Inglesa',
    expectedCountry: 'Inglaterra',
  },
  Friendlies: {
    name: 'Amistosos - Seleções',
    expectedCountry: 'Mundo',
  },
  'FIFA Womens World Cup': {
    name: 'Copa do Mundo Feminina',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'UEFA European Under-21 Championship': {
    name: 'Euro Sub-21',
    expectedCountry: 'Mundo',
  },
  'Friendlies Clubs ': {
    name: 'Amistosos - Clubes',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/amistoso.png`,
  },
  'English National League': {
    name: 'National League Inglesa',
    expectedCountry: 'Inglaterra',
  },
  'Argentinian Primera B Nacional': {
    name: 'Primeira B Nacional Argentina',
    expectedCountry: 'Argentina',
  },
  'Albanian Superliga': { name: 'Superliga ', expectedCountry: 'Albânia' },
  'Andorran 1a Divisió': {
    name: 'Primeira Divisão ',
    expectedCountry: 'Andorra',
  },
  'Armenian Premier League': {
    name: 'Premier League',
    expectedCountry: 'Armênia',
  },
  'Australia ACT NPL': {
    name: 'NPL ACT Australiana',
    expectedCountry: 'Austrália',
  },
  'Austrian Bundesliga': {
    name: 'Bundesliga Austríaca',
    expectedCountry: 'Áustria',
  },
  'Belarus Vyscha Liga': {
    name: 'Vyscha Liga',
    expectedCountry: 'Bielorrússia',
  },
  'Belgian First Division B': {
    name: 'Primeira Divisão B Belga',
    expectedCountry: 'Bélgica',
  },
  'Bosnian Premier Liga': {
    name: 'Premier Liga Bósnia',
    expectedCountry: 'Bósnia e Herzegovina',
  },
  'Bulgarian First League': {
    name: 'Primeira Liga',
    expectedCountry: 'Bulgária',
  },
  'Chile Primera Division': {
    name: 'Primeira División',
    expectedCountry: 'Chile',
  },
  'China League One': { name: 'China League One', expectedCountry: 'China' },
  'Croatian First Football League': {
    name: 'Primeira Liga Croata',
    expectedCountry: 'Croácia',
  },
  'Cypriot First Division': {
    name: 'Primeira Divisão',
    expectedCountry: 'Chipre',
  },
  'Czech First League': {
    name: 'Primeira Liga Tcheca',
    expectedCountry: 'Tchéquia',
  },
  'Danish 2nd Division': {
    name: 'Segunda Divisão',
    expectedCountry: 'Dinamarca',
  },
  'Japanese J1 League': { name: 'J1 League', expectedCountry: 'Japão' },
  'Estonian Meistriliiga': { name: 'Meistriliiga', expectedCountry: 'Estônia' },
  'Faroe Islands Premier League': {
    name: 'Premier League ',
    expectedCountry: 'Ilhas Faroé',
  },
  'Finnish Veikkausliiga': {
    name: 'Veikkausliiga',
    expectedCountry: 'Finlândia',
  },
  'French Championnat National': {
    name: 'Championnat National Francês',
    expectedCountry: 'França',
  },
  'Georgian Erovnuli Liga': {
    name: 'Liga Erovnuli',
    expectedCountry: 'Geórgia',
  },
  'Germany Liga 3': { name: '3. Liga', expectedCountry: 'Alemanha' },
  'Greek Super League 2': { name: 'Super League 2', expectedCountry: 'Grécia' },
  'Dutch Eerste Divisie': {
    name: 'Eerste Divisie',
    expectedCountry: 'Países Baixos',
  },
  'Icelandic Úrvalsdeild karla': {
    name: 'Úrvalsdeild',
    expectedCountry: 'Islândia',
  },
  'Irish Premier Division': {
    name: 'Premier Division',
    expectedCountry: 'Irlanda',
  },
  'Israeli Premier League': {
    name: 'Premier League',
    expectedCountry: 'Israel',
  },
  'Italy Serie D Girone D': {
    name: 'Série D Girone D',
    expectedCountry: 'Itália',
  },
  'English Northern Premier League Premier Division': {
    name: 'Northern Premier League Inglaterra',
    expectedCountry: 'Inglaterra',
  },
  'English Isthmian League Premier Division': {
    name: 'Isthmian League Inglaterra',
    expectedCountry: 'Inglaterra',
  },
  'English Southern Premier League South Division': {
    name: 'Southern Premier League Inglaterra',
    expectedCountry: 'Inglaterra',
  },
  'Kazakhstan Premier League': {
    name: 'Premier League',
    expectedCountry: 'Cazaquistão',
  },
  'Latvian Higher League': { name: 'Liga Letônia', expectedCountry: 'Letônia' },
  'Lithuanian A Lyga': { name: 'A Lyga', expectedCountry: 'Lituânia' },
  'Macedonian First League': {
    name: 'Primeira Liga',
    expectedCountry: 'Macedônia',
  },
  'Maltese Premier League': {
    name: 'Premier League ',
    expectedCountry: 'Malta',
  },
  'Mexican Liga de Expansión MX': {
    name: 'Liga de Expansión MX',
    expectedCountry: 'México',
  },
  'Moldovan National Division': {
    name: 'Divisão Nacional',
    expectedCountry: 'Moldávia',
  },
  'Montenegrin First League': {
    name: 'Primeira Liga',
    expectedCountry: 'Montenegro',
  },
  'Moroccan Botola 2': { name: 'Botola 2', expectedCountry: 'Marrocos' },
  'Northern Irish Premiership': {
    name: 'Premiership',
    expectedCountry: 'Irlanda do Norte',
  },
  'Polish I liga': { name: 'I Liga', expectedCountry: 'Polônia' },
  'Portuguese LigaPro': { name: 'LigaPro', expectedCountry: 'Portugal' },
  'Qatar Stars League': {
    name: 'Qatar Liga das Estrelas',
    expectedCountry: 'Catar',
  },
  'Romanian Liga II': { name: 'Liga II', expectedCountry: 'Romênia' },
  'Russian Football National League': {
    name: 'Liga Nacional',
    expectedCountry: 'Rússia',
  },
  'San-Marino Campionato': {
    name: 'Campeonato Sanmarinense',
    expectedCountry: 'San Marino',
  },
  'Pro League': {
    name: 'Liga Profissional Saudita',
    expectedCountry: 'Arábia Saudita',
  },
  'Scottish League 1': {
    name: 'League One Escocia',
    expectedCountry: 'Escócia',
  },
  'Scottish League 2': {
    name: 'League Two Escocia',
    expectedCountry: 'Escócia',
  },
  'Serbian Super Liga': { name: 'Super Liga', expectedCountry: 'Sérvia' },
  'Slovak First Football League': {
    name: 'Primeira Liga Eslovaca',
    expectedCountry: 'Eslováquia',
  },
  'Primera División RFEF Group 1': {
    name: 'Primera RFEF Grupo 1',
    expectedCountry: 'Espanha',
  },
  'Swedish Division 1 North': {
    name: 'Division 1 Norte Sueca',
    expectedCountry: 'Suécia',
  },
  'Swiss Super League': { name: 'Super Liga', expectedCountry: 'Suíça' },
  'Turkish 1 Lig': { name: '1. Lig', expectedCountry: 'Turquia' },
  'Ukrainian First League': {
    name: 'Primeira Liga Ucraniana',
    expectedCountry: 'Ucrânia',
  },
  'UAE Pro League': {
    name: 'Liga dos Emirados Árabes',
    expectedCountry: 'Emirados Árabes Unidos',
  },
  'Turkish 2 Lig': { name: '2. Lig', expectedCountry: 'Turquia' },
  'English National League North': {
    name: 'National League Norte',
    expectedCountry: 'Inglaterra',
  },
  'English National League South': {
    name: 'National League Sul',
    expectedCountry: 'Inglaterra',
  },
  'Danish 1st Division': {
    name: 'Primeira Divisão',
    expectedCountry: 'Dinamarca',
  },
  'American USL Championship': {
    name: 'USL Championship',
    expectedCountry: 'Estados Unidos',
  },
  'South Korean K League 1': {
    name: 'K League 1',
    expectedCountry: 'Coreia do Sul',
  },
  'Hungarian NB I': { name: 'NB I', expectedCountry: 'Hungria' },
  'Romanian Liga I': { name: 'Liga I', expectedCountry: 'Romênia' },
  'Slovenian 1. SNL': { name: '1. SNL Eslovena', expectedCountry: 'Eslovênia' },
  'Azerbaijani Premier League': {
    name: 'Premier League',
    expectedCountry: 'Azerbaijão',
  },
  'Luxembourg National Division': {
    name: 'Divisão Nacional',
    expectedCountry: 'Luxemburgo',
  },
  'German Regionalliga Nord': {
    name: 'Regionalliga Norte',
    expectedCountry: 'Alemanha',
  },
  'Swiss Challenge League': {
    name: 'Challenge League',
    expectedCountry: 'Suíça',
  },
  'AFC Champions League Elite': {
    name: 'Liga dos Campeões da AFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'CAF Champions League': {
    name: 'Liga dos Campeões da CAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'CONCACAF Champions Cup': {
    name: 'Copa dos Campeões da CONCACAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Scottish FA Cup': {
    name: 'Copa da Escócia',
    expectedCountry: 'Escócia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'CONCACAF Central American Cup': {
    name: 'Copa da América Central',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Iranian Azadegan League': { name: 'Liga Azadegan', expectedCountry: 'Irã' },
  'Iranian Persian Gulf Pro League': {
    name: 'Liga do Golfo Pérsico',
    expectedCountry: 'Irã',
  },
  'Thai Premier League': {
    name: 'Liga Tailandesa',
    expectedCountry: 'Tailândia',
  },
  'Thai League 2': { name: 'Liga 2 Tailandesa', expectedCountry: 'Tailândia' },
  'Thai FA Cup': {
    name: 'Copa da Liga Tailandesa',
    expectedCountry: 'Tailândia',
  },
  'Kenyan Premier League': {
    name: 'Premier League',
    expectedCountry: 'Quênia',
  },

  'Italy Serie D Girone B': {
    name: 'Série D Italiana Girone B',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone C': {
    name: 'Série D Italiana Girone C',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone E': {
    name: 'Série D Italiana Girone E',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone F': {
    name: 'Série D Italiana Girone F',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone G': {
    name: 'Série D Italiana Girone G',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone H': {
    name: 'Série D Italiana Girone H',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone I': {
    name: 'Série D Italiana Girone I',
    expectedCountry: 'Itália',
  },
  'Italy Serie D Girone A': {
    name: 'Série D Italiana Girone A',
    expectedCountry: 'Itália',
  },

  'FA Trophy': { name: 'FA Trophy' },
  'Malaysian Premier League': {
    name: 'Liga Premier',
    expectedCountry: 'Malásia',
  },
  'Indonesian Super League': {
    name: 'Liga Super Indonésia',
    expectedCountry: 'Indonésia',
  },
  'Indian Super League': {
    name: 'Superliga Indiana',
    expectedCountry: 'Índia',
  },
  'Malaysian Super League': { name: 'Superliga', expectedCountry: 'Malásia' },
  'Cambodia C-League': { name: 'C-League', expectedCountry: 'Camboja' },
  'Uzbekistan Super League': {
    name: 'Superliga',
    expectedCountry: 'Uzbequistão',
  },
  'Singapore Premier League': {
    name: 'Premier League',
    expectedCountry: 'Cingapura',
  },
  'Austrian Erste Liga': { name: 'Erste Liga', expectedCountry: 'Áustria' },
  'Indian I-League': { name: 'I-League', expectedCountry: 'Índia' },
  'South African Premier Soccer League': {
    name: 'Premiership',
    expectedCountry: 'África do Sul',
  },
  'Vietnamese V.League 1': { name: 'V.League 1', expectedCountry: 'Vietnã' },
  'AFC Champions League Two': {
    name: 'Liga dos Campeões da AFC 2',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'Australian A-League Women': {
    name: 'A-League Feminina',
    expectedCountry: 'Austrália',
  },
  'Nicaragua Primera Division': {
    name: 'Primera División',
    expectedCountry: 'Nicarágua',
  },

  'Swedish Division 1 South': {
    name: 'Division 1 Sul',
    expectedCountry: 'Suécia',
  },
  'EFL Trophy': { name: 'EFL Trophy', expectedCountry: 'Inglaterra' },
  'English Womens Super League': {
    name: 'Superliga Feminina',
    expectedCountry: 'Inglaterra',
  },
  'UEFA Womens Euro': {
    name: 'Euro Feminino',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/UEFA_Logo.png`,
  },
  'AFC Asian Cup': {
    name: 'Copa da Ásia',
    expectedCountry: 'Ásia',
    logo: `/badges_leagues/afc.svg`,
  },
  'OFC Nations Cup': {
    name: 'Copa das Nações da OFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/ofc.svg`,
  },
  'CONCACAF Gold Cup': {
    name: 'Copa Ouro da CONCACAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },

  'Mexican Primera League': { name: 'Liga MX', expectedCountry: 'México' },
  'Chile Primera B': { name: 'Primera B ', expectedCountry: 'Chile' },
  'Bolivian Nacional B Copa Simón Bolívar': {
    name: 'Nacional B ',
    expectedCountry: 'Bolívia',
  },
  'Colombian Categoría Primera B': {
    name: 'Primera B Colombiana',
    expectedCountry: 'Colômbia',
  },
  'Paraguayan División Intermedia': {
    name: 'División Intermedia ',
    expectedCountry: 'Paraguai',
  },
  'Peruvian Segunda División': {
    name: 'Segunda Divisão Peruana',
    expectedCountry: 'Peru',
  },
  'Uruguayan Segunda División': {
    name: 'Segunda Divisão',
    expectedCountry: 'Uruguai',
  },
  'Venezuelan Segunda Division': {
    name: 'Segunda Divisão ',
    expectedCountry: 'Venezuela',
  },
  'Jamaican Premier League': {
    name: 'Premier League ',
    expectedCountry: 'Jamaica',
  },
  'Costa-Rica Liga FPD': { name: 'Liga FPD', expectedCountry: 'Costa Rica' },
  'El Salvador Primera Division': {
    name: 'Primera División',
    expectedCountry: 'El Salvador',
  },
  'Guatemala Liga Nacional': {
    name: 'Liga Nacional ',
    expectedCountry: 'Guatemala',
  },
  'Honduras Liga Nacional de Futbol': {
    name: 'Liga Nacional',
    expectedCountry: 'Honduras',
  },
  'Panama Liga Panamena de Futbol': {
    name: 'Liga Panamenha',
    expectedCountry: 'Panamá',
  },
  'Canadian Premier League': {
    name: 'Premier League ',
    expectedCountry: 'Canadá',
  },
  'American USL League One': {
    name: 'USL League One',
    expectedCountry: 'Estados Unidos',
  },
  'USL League Two': {
    name: 'USL League Two',
    expectedCountry: 'Estados Unidos',
  },
  'MLS Next Pro': { name: 'MLS Next Pro', expectedCountry: 'Estados Unidos' },
  'American USL Super League': {
    name: 'USL Super League',
    expectedCountry: 'Estados Unidos',
  },
  'American NWSL Challenge Cup': {
    name: 'NWSL Challenge Cup',
    expectedCountry: 'Estados Unidos',
  },

  // EUROPA

  'German Regionalliga West': {
    name: 'Regionalliga Oeste',
    expectedCountry: 'Alemanha',
  },
  'German Regionalliga SudWest': {
    name: 'Regionalliga Sudoeste',
    expectedCountry: 'Alemanha',
  },
  'German Regionalliga Bayern': {
    name: 'Regionalliga Bayern',
    expectedCountry: 'Alemanha',
  },
  'German Regionalliga Nordost': {
    name: 'Regionalliga Nordeste ',
    expectedCountry: 'Alemanha',
  },
  'Primera División RFEF Group 2': {
    name: 'Primera RFEF Grupo 2',
    expectedCountry: 'Espanha',
  },

  'Italian Serie C Girone A': {
    name: 'Série C Girone A',
    expectedCountry: 'Itália',
  },
  'Italian Serie C Girone B': {
    name: 'Série C Girone B',
    expectedCountry: 'Itália',
  },
  'Scottish Highland League': {
    name: 'Highland League Escocia',
    expectedCountry: 'Escócia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'Scottish Lowland League': {
    name: 'Lowland League Escocia',
    expectedCountry: 'Escócia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'Northern Irish Premier Intermediate League': {
    name: 'Premier Intermediate League',
    expectedCountry: 'Irlanda do Norte',
    logo: `/badges_leagues/Flag_of_Northern_Ireland.svg`,
  },
  'Northern Irish Championship': {
    name: 'Championship da Irlanda do Norte',
    expectedCountry: 'Irlanda do Norte',
    logo: `/badges_leagues/Flag_of_Northern_Ireland.svg`,
  },
  'Welsh Cymru North-South': {
    name: 'Cymru North-South Galesa',
    expectedCountry: 'Gales',
    logo: `/badges_leagues/Flag_of_Wales.png`,
  },
  'Welsh League Cup': {
    name: 'Copa da Liga Galesa',
    expectedCountry: 'Gales',
    logo: `/badges_leagues/Flag_of_Wales.png`,
  },
  'Dutch Tweede Divisie': {
    name: 'Tweede Divisie',
    expectedCountry: 'Países Baixos',
  },
  'Croatian Druga HNL': {
    name: 'Druga HNL Croata',
    expectedCountry: 'Croácia',
  },
  'Cypriot Second Division': {
    name: 'Segunda Divisão',
    expectedCountry: 'Chipre',
  },
  'Czech National Football League': {
    name: 'Liga Nacional',
    expectedCountry: 'República Tcheca',
  },
  'Estonian Esiliiga': { name: 'Esiliiga', expectedCountry: 'Estônia' },
  'Faroe Islands 1. deild': {
    name: '1. Deild',
    expectedCountry: 'Ilhas Faroé',
  },
  'Finnish Ykkönen': { name: 'Ykkönen', expectedCountry: 'Finlândia' },
  'Finnish Ykkösliiga': { name: 'Ykkösliiga', expectedCountry: 'Finlândia' },
  'French National 2 Group A': {
    name: 'National 2 Grupo A',
    expectedCountry: 'França',
  },
  'French National 2 Group B': {
    name: 'National 2 Grupo B',
    expectedCountry: 'França',
  },
  'French National 2 Group C': {
    name: 'National 2 Grupo C',
    expectedCountry: 'França',
  },
  'French National 2 Group D': {
    name: 'National 2 Grupo D',
    expectedCountry: 'França',
  },
  'French Trophée des Champions': {
    name: 'Supercopa da França',
    expectedCountry: 'França',
  },
  'Georgian Erovnuli Liga 2': {
    name: 'Erovnuli Liga 2',
    expectedCountry: 'Geórgia',
  },
  'Gibraltarian National League': {
    name: 'Liga Nacional',
    expectedCountry: 'Gibraltar',
  },
  'Hungarian NB II': { name: 'NB II Húngara', expectedCountry: 'Hungria' },
  'Icelandic 1 deild karla': { name: '1. Deild', expectedCountry: 'Islândia' },
  'Israeli Liga Leumit': { name: 'Liga Leumit', expectedCountry: 'Israel' },
  'Kosovan Superleague': { name: 'Superliga', expectedCountry: 'Kosovo' },
  'Latvian First League': { name: 'Primeira Liga', expectedCountry: 'Letónia' },
  'Lithuanian I Lyga': { name: 'I Lyga', expectedCountry: 'Lituânia' },
  'Montenegrin Second League': {
    name: 'Segunda Liga',
    expectedCountry: 'Montenegro',
  },
  'Polish II liga': { name: 'II Liga ', expectedCountry: 'Polônia' },
  'Portuguese Liga 3': { name: 'Liga 3 ', expectedCountry: 'Portugal' },
  'Russian FNL 2 Group 1': { name: 'FNL 2 Grupo 1', expectedCountry: 'Rússia' },
  'Russian FNL 2 Group 2': { name: 'FNL 2 Grupo 2', expectedCountry: 'Rússia' },
  'Russian FNL 2 Group 3': { name: 'FNL 2 Grupo 3', expectedCountry: 'Rússia' },
  'Russian FNL 2 Group 4': { name: 'FNL 2 Grupo 4', expectedCountry: 'Rússia' },
  'Russian FNL 2 Division A Gold Group': {
    name: 'FNL 2 Divisão A Gold',
    expectedCountry: 'Rússia',
  },
  'Russian FNL 2 Division A Silver Group': {
    name: 'FNL 2 Divisão A Silver',
    expectedCountry: 'Rússia',
  },
  'Serbian Prva Liga': { name: 'Prva Liga', expectedCountry: 'Sérvia' },
  'Slovenian 2 SNL': { name: '2. SNL ', expectedCountry: 'Eslovénia' },
  'Slovakian 2 Liga': { name: '2. Liga a', expectedCountry: 'Eslováquia' },
  'Swiss Promotion League': {
    name: 'Promotion League',
    expectedCountry: 'Suíça',
  },
  'Swiss Cup': { name: 'Copa da Suíça', expectedCountry: 'Suíça' },
  'Turkish Cup': { name: 'Copa da Turquia', expectedCountry: 'Turquia' },
  'Ukrainian Second League': {
    name: 'Segunda Liga',
    expectedCountry: 'Ucrânia',
  },
  'German Super Cup': {
    name: 'Supercopa da Alemanha',
    expectedCountry: 'Alemanha',
  },
  'Andorran Segona Divisió': {
    name: 'Segunda Divisão',
    expectedCountry: 'Andorra',
  },
  'Andorran Cup': { name: 'Copa de Andorra', expectedCountry: 'Andorra' },
  'Albanian Kategoria e Parë': {
    name: 'Kategoria e Parë',
    expectedCountry: 'Albânia',
  },
  'Armenian First League': {
    name: 'Primeira Liga ',
    expectedCountry: 'Armênia',
  },
  'Armenian Cup': { name: 'Copa da Armênia', expectedCountry: 'Armênia' },
  'Azerbaijan First Division': {
    name: 'Primeira Divisão',
    expectedCountry: 'Azerbaijão',
  },
  'Azerbaijan Cup': {
    name: 'Copa do Azerbaijão',
    expectedCountry: 'Azerbaijão',
  },
  'Bosnian First League': {
    name: 'Primeira Liga',
    expectedCountry: 'Bósnia e Herzegovina',
  },
  'Bosnian First League of Srpska': {
    name: 'Primeira Liga da Srpska',
    expectedCountry: 'Bósnia e Herzegovina',
  },
  'Bulgarian Second League': {
    name: 'Segunda Liga',
    expectedCountry: 'Bulgária',
  },
  'Belarusian First League': {
    name: 'Primeira Liga',
    expectedCountry: 'Bielorrússia',
  },
  'Belarus Coppa': {
    name: 'Copa da Bielorrússia',
    expectedCountry: 'Bielorrússia',
  },
  'Denmark DBU Pokalen': {
    name: 'Copa da Dinamarca',
    expectedCountry: 'Dinamarca',
  },
  'Denmark 3 Division': { name: '3ª Divisão', expectedCountry: 'Dinamarca' },
  'Denmark Series Group 1': {
    name: 'Denmark Series Grupo 1',
    expectedCountry: 'Dinamarca',
  },
  'Denmark Series Group 2': {
    name: 'Denmark Series Grupo 2',
    expectedCountry: 'Dinamarca',
  },
  'Denmark Series Group 3': {
    name: 'Denmark Series Grupo 3',
    expectedCountry: 'Dinamarca',
  },
  'Denmark Series Group 4': {
    name: 'Denmark Series Grupo 4',
    expectedCountry: 'Dinamarca',
  },
  'Austrian Regionalliga West': {
    name: 'Regionalliga Oeste ',
    expectedCountry: 'Áustria',
  },
  'Austrian Regionalliga Ost': {
    name: 'Regionalliga Leste ',
    expectedCountry: 'Áustria',
  },
  'Austrian Regionalliga Mitte': {
    name: 'Regionalliga Centro ',
    expectedCountry: 'Áustria',
  },

  // INGLATERRA - Ligas Regionais
  'English Northern Premier League Division One East': {
    name: 'Northern Premier Div One Leste',
    expectedCountry: 'Inglaterra',
  },
  'English Northern Premier League Division One Midlands': {
    name: 'Northern Premier Div One Midlands',
    expectedCountry: 'Inglaterra',
  },
  'English Northern Premier League Division One West': {
    name: 'Northern Premier Div One Oeste',
    expectedCountry: 'Inglaterra',
  },
  'English Southern Premier League Central Division': {
    name: 'Southern Premier Central',
    expectedCountry: 'Inglaterra',
  },
  'English Southern Premier League Central Division One': {
    name: 'Southern Premier Central Div One',
    expectedCountry: 'Inglaterra',
  },
  'England Non League Div One Isthmian North': {
    name: 'Non League Isthmian Norte',
    expectedCountry: 'Inglaterra',
  },
  'England Non League Div One Isthmian South': {
    name: 'Non League Isthmian Sul',
    expectedCountry: 'Inglaterra',
  },
  'England Non League Div One Southern SW': {
    name: 'Non League Southern Sudoeste',
    expectedCountry: 'Inglaterra',
  },
  'England Non League Div One Southern Central': {
    name: 'Non League Southern Central',
    expectedCountry: 'Inglaterra',
  },
  'English Womens Super League 2': {
    name: 'Super League 2 Feminina',
    expectedCountry: 'Inglaterra',
  },

  // ESPANHA - Ligas Regionais
  'Spanish Primera RFEF Group 1': {
    name: 'Primera RFEF Grupo 1',
    expectedCountry: 'Espanha',
  },
  'Spanish Primera RFEF Group 2': {
    name: 'Primera RFEF Grupo 2',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda RFEF Group 1': {
    name: 'Segunda RFEF Grupo 1',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda RFEF Group 2': {
    name: 'Segunda RFEF Grupo 2',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda RFEF Group 3': {
    name: 'Segunda RFEF Grupo 3',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda RFEF Group 4': {
    name: 'Segunda RFEF Grupo 4',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda RFEF Group 5': {
    name: 'Segunda RFEF Grupo 5',
    expectedCountry: 'Espanha',
  },

  'Spanish Tercera Federación Group 1': {
    name: 'Tercera Federación Grupo 1',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 2': {
    name: 'Tercera Federación Grupo 2',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 3': {
    name: 'Tercera Federación Grupo 3',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 4': {
    name: 'Tercera Federación Grupo 4',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 5': {
    name: 'Tercera Federación Grupo 5',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 6': {
    name: 'Tercera Federación Grupo 6',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 7': {
    name: 'Tercera Federación Grupo 7',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 8': {
    name: 'Tercera Federación Grupo 8',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 9': {
    name: 'Tercera Federación Grupo 9',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 10': {
    name: 'Tercera Federación Grupo 10',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 11': {
    name: 'Tercera Federación Grupo 11',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 12': {
    name: 'Tercera Federación Grupo 12',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 13': {
    name: 'Tercera Federación Grupo 13',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 14': {
    name: 'Tercera Federación Grupo 14',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 15': {
    name: 'Tercera Federación Grupo 15',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 16': {
    name: 'Tercera Federación Grupo 16',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 17': {
    name: 'Tercera Federación Grupo 17',
    expectedCountry: 'Espanha',
  },
  'Spanish Tercera Federación Group 18': {
    name: 'Tercera Federación Grupo 18',
    expectedCountry: 'Espanha',
  },
  'Spanish Liga F': { name: 'Liga F', expectedCountry: 'Espanha' },
  'Spanish Copa Federacion': {
    name: 'Copa Federação Espanhola',
    expectedCountry: 'Espanha',
  },
  'Supercopa de Espana Femenina': {
    name: 'Supercopa Feminina',
    expectedCountry: 'Espanha',
  },

  // Países Baixos - Ligas Regionais
  'Netherlands Derde Divisie Saturday': {
    name: 'Derde Divisie Sábado',
    expectedCountry: 'Países Baixos',
  },
  'Netherlands Derde Divisie Sunday': {
    name: 'Derde Divisie Domingo',
    expectedCountry: 'Países Baixos',
  },
  'Netherlands Eredivisie Women': {
    name: 'Eredivisie Feminina',
    expectedCountry: 'Países Baixos',
  },

  // ÁSIA
  'Japanese J2 League': { name: 'J2 League ', expectedCountry: 'Japão' },
  'Japanese J3 League': { name: 'J3 League', expectedCountry: 'Japão' },
  'Japan Football League': {
    name: 'Japan Football League',
    expectedCountry: 'Japão',
  },
  'Japan Emperors Cup': { name: 'Copa do Imperador', expectedCountry: 'Japão' },
  'Japanese JLeague Cup': { name: 'Copa J.League', expectedCountry: 'Japão' },
  'South Korean K League 2': {
    name: 'K League 2',
    expectedCountry: 'Coreia do Sul',
  },
  'Korean K3 League': { name: 'K3 League', expectedCountry: 'Coreia do Sul' },
  'Korea FA Cup': { name: 'Copa da Coreia', expectedCountry: 'Coreia do Sul' },
  'China league Two': { name: 'League Two', expectedCountry: 'China' },
  'China FA Cup': { name: 'Copa da China', expectedCountry: 'China' },
  'Hong-Kong Premier League': {
    name: 'Premier League',
    expectedCountry: 'Hong Kong',
  },
  'Hong-Kong FA Cup': {
    name: 'Copa da Liga de Hong Kong',
    expectedCountry: 'Hong Kong',
  },
  'Taiwan Football Premier League': {
    name: 'Liga Premier',
    expectedCountry: 'Taiwan',
  },
  'Taiwan Mulan Football League': {
    name: 'Mulan Football League',
    expectedCountry: 'Taiwan',
  },
  'Macau Liga de Elite': { name: 'Liga de Elite', expectedCountry: 'Macau' },
  'Indian I-League 2nd Division': {
    name: 'I-League Segunda Divisão',
    expectedCountry: 'Índia',
  },
  'Bangladesh Premier League': {
    name: 'Premier League',
    expectedCountry: 'Bangladesh',
  },
  'Myanmar National League': {
    name: 'Liga Nacional',
    expectedCountry: 'Myanmar',
  },
  'Vietnam V.League 2': { name: 'V.League 2', expectedCountry: 'Vietnã' },
  'Vietnamese Cup': { name: 'Copa do Vietnã', expectedCountry: 'Vietnã' },
  'Philippines Football League': {
    name: 'Liga Filipina',
    expectedCountry: 'Filipinas',
  },
  'Kyrgyz Premier League': {
    name: 'Premier League',
    expectedCountry: 'Quirguistão',
  },
  'Lao Premier League': { name: 'Premier League', expectedCountry: 'Laos' },
  'Nepalese A Division': { name: 'Divisão A', expectedCountry: 'Nepal' },
  'Pakistan Premier League': {
    name: 'Premier League',
    expectedCountry: 'Paquistão',
  },
  'Palestinian West Bank Premier League': {
    name: 'Premier League',
    expectedCountry: 'Palestina',
  },
  'Maldives Dhivehi Premier League': {
    name: 'Premier League',
    expectedCountry: 'Maldivas',
  },
  'Bahrain Premier League': {
    name: 'Premier League',
    expectedCountry: 'Bahrein',
  },
  'Kuwait Premier League': {
    name: 'Premier League',
    expectedCountry: 'Kuwait',
  },
  'Kuwait Division 1': { name: 'Divisão 1', expectedCountry: 'Kuwait' },
  'Kuwait Crown Prince Cup': {
    name: 'Copa do Príncipe Herdeiro Kuwait',
    expectedCountry: 'Kuwait',
  },
  'Kuwait Emir Cup': { name: 'Copa do Emir Kuwait', expectedCountry: 'Kuwait' },
  'Emir of Qatar Cup': {
    name: 'Copa do Emir do Qatar',
    expectedCountry: 'Catar',
  },
  'Qatar QSL Cup': { name: 'QSL Cup do Qatar', expectedCountry: 'Catar' },
  'Oman Professional League': {
    name: 'Liga Profissional de Omã',
    expectedCountry: 'Omã',
  },
  'UAE League Cup': {
    name: 'Copa da Liga',
    expectedCountry: 'Emirados Árabes Unidos',
  },
  'Saudi First Division League': {
    name: 'Primeira Divisão',
    expectedCountry: 'Arábia Saudita',
  },
  'Saudi King Cup': {
    name: 'Copa do Rei Saudita',
    expectedCountry: 'Arábia Saudita',
  },
  'Saudi Super Cup': {
    name: 'Supercopa Saudita',
    expectedCountry: 'Arábia Saudita',
  },
  'Jordanian Pro League': {
    name: 'Liga Profissional',
    expectedCountry: 'Jordânia',
  },
  'Iraqi Premier League': { name: 'Premier League', expectedCountry: 'Iraque' },
  'Lebanese Premier League': {
    name: 'Premier League',
    expectedCountry: 'Líbano',
  },
  'Syrian Premier League': { name: 'Premier League', expectedCountry: 'Síria' },
  'Tajikistan Vysshaya Liga': {
    name: 'Vysshaya Liga',
    expectedCountry: 'Tajiquistão',
  },
  'Kazakhstan First League': {
    name: 'Primeira Liga',
    expectedCountry: 'Cazaquistão',
  },
  'Kazakhstan Cup': {
    name: 'Copa do Cazaquistão',
    expectedCountry: 'Cazaquistão',
  },
  'Turkmenistan Yokary Liga': {
    name: 'Yokary Liga',
    expectedCountry: 'Turcomenistão',
  },
  'Mongolian Premier League': {
    name: 'Premier League',
    expectedCountry: 'Mongólia',
  },
  'ASEAN Club Championship': {
    name: 'Campeonato de Clubes da ASEAN',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'AFC Challenge League': {
    name: 'Liga Challenge da AFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'AFC Womens Champions League': {
    name: 'Liga dos Campeões Feminina da AFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'Asian Cup Women': {
    name: 'Copa da Ásia Feminina',
    expectedCountry: 'Ásia',
    logo: `/badges_leagues/afc.svg`,
  },

  // ÁFRICA
  'Egyptian Premier League': {
    name: 'Premier League',
    expectedCountry: 'Egito',
  },
  'Egypt League Cup': { name: 'Copa da Liga', expectedCountry: 'Egito' },
  'Tunisian Ligue 1': { name: 'Ligue 1', expectedCountry: 'Tunísia' },
  'Algerian Ligue 1': { name: 'Ligue 1 ', expectedCountry: 'Argélia' },
  'Algerian Coupe de la Ligue': {
    name: 'Copa da Liga Argelina',
    expectedCountry: 'Argélia',
  },
  'Nigerian NPFL': { name: 'NPFL', expectedCountry: 'Nigéria' },
  'Ghanaian Premier League': {
    name: 'Premier League',
    expectedCountry: 'Gana',
  },
  'Senegal Ligue 1': { name: 'Ligue 1', expectedCountry: 'Senegal' },
  'DR Congo Ligue 1': {
    name: 'Ligue 1 ',
    expectedCountry: 'República Democrática do Congo',
  },
  'Angolan Girabola': { name: 'Girabola ', expectedCountry: 'Angola' },
  'Zambia Super League': { name: 'Super Liga ', expectedCountry: 'Zâmbia' },
  'Zimbabwean Premier Soccer League': {
    name: 'Premier League',
    expectedCountry: 'Zimbabwe',
  },
  'Ethiopian Premier League': {
    name: 'Premier League',
    expectedCountry: 'Etiópia',
  },
  'Ugandan Premier League': {
    name: 'Premier League',
    expectedCountry: 'Uganda',
  },
  'Rwandan National Soccer League': {
    name: 'Liga Nacional ',
    expectedCountry: 'Ruanda',
  },
  'Burundi Ligue A': { name: 'Ligue A', expectedCountry: 'Burundi' },
  'Somali Premier League': {
    name: 'Premier League',
    expectedCountry: 'Somália',
  },
  'Sudani Premier League': { name: 'Premier League', expectedCountry: 'Sudão' },
  'Libyan Premier League': { name: 'Premier League', expectedCountry: 'Líbia' },
  'Mauritania Premier League': {
    name: 'Premier League',
    expectedCountry: 'Mauritânia',
  },
  'Gambia GFA League': { name: 'GFA League', expectedCountry: 'Gâmbia' },
  'Guinea Ligue 1': { name: 'Ligue 1', expectedCountry: 'Guiné' },
  'Ivory Coast Ligue 1': {
    name: 'Ligue 1',
    expectedCountry: 'Costa do Marfim',
  },
  'Burkina Faso 1ere Division': {
    name: 'Primeira Divisão',
    expectedCountry: 'Burkina Faso',
  },
  'Benin Championnat National': {
    name: 'Campeonato Nacional',
    expectedCountry: 'Benin',
  },
  'Liberian LFA First Division': {
    name: 'Primeira Divisão',
    expectedCountry: 'Libéria',
  },
  'Botswana Premier League': {
    name: 'Premier League',
    expectedCountry: 'Botsuana',
  },
  'Eswatini Premier League': {
    name: 'Premier League',
    expectedCountry: 'Eswatini',
  },
  'CAF Confederation Cup': {
    name: 'Copa das Confederações da CAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'CECAFA Club Cup': {
    name: 'Copa de Clubes CECAFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'COSAFA Cup': {
    name: 'Copa COSAFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'South-Africa 8 Cup': {
    name: 'Copa Sul-Africana',
    expectedCountry: 'África do Sul',
  },
  'Africa Cup of Nations Women': {
    name: 'Copa Africana de Nações Feminina',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'CAF Womens Olympic Qualifying Tournament': {
    name: 'Qualificatória Olímpica CAF Feminina',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },

  // OCEANIA
  'New-Zealand Football Championship': {
    name: 'Campeonato Neozelandês',
    expectedCountry: 'Nova Zelândia',
  },
  'New Zealand National League Championship': {
    name: 'Liga Nacional',
    expectedCountry: 'Nova Zelândia',
  },
  'New Zealand Northern League': {
    name: 'Liga Norte',
    expectedCountry: 'Nova Zelândia',
  },
  'New Zealand Central League': {
    name: 'Liga Central',
    expectedCountry: 'Nova Zelândia',
  },
  'New Zealand Southern League': {
    name: 'Liga Sul',
    expectedCountry: 'Nova Zelândia',
  },
  'Australia FFA Cup': { name: 'FFA Cup', expectedCountry: 'Austrália' },
  'Australian Championship': {
    name: 'Campeonato Australiano',
    expectedCountry: 'Austrália',
  },
  'Australia Northern NSW NPL': {
    name: 'NPL Norte NSW',
    expectedCountry: 'Austrália',
  },
  'Australia New South Wales NPL': {
    name: 'NPL NSW',
    expectedCountry: 'Austrália',
  },
  'Australia Victoria NPL': {
    name: 'NPL Victoria',
    expectedCountry: 'Austrália',
  },
  'Australia Brisbane Premier League': {
    name: 'Premier League Brisbane',
    expectedCountry: 'Austrália',
  },
  'Australia Queensland NPL': {
    name: 'NPL Queensland',
    expectedCountry: 'Austrália',
  },
  'Australia Western Australia NPL': {
    name: 'NPL Austrália Ocidental',
    expectedCountry: 'Austrália',
  },
  'Australia South Australia NPL': {
    name: 'NPL Sul da Austrália',
    expectedCountry: 'Austrália',
  },
  'Australia Northern Territory Premier League': {
    name: 'Premier League Território Norte',
    expectedCountry: 'Austrália',
  },
  'Australia Tasmania NPL': {
    name: 'NPL Tasmânia',
    expectedCountry: 'Austrália',
  },
  'Fijian Premier League': {
    name: 'Premier League de Fiji',
    expectedCountry: 'Fiji',
  },
  'OFC Mens Champions League': {
    name: 'Liga dos Campeões da OFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/ofc.svg`,
  },

  'Spanish Segunda División B Group 3': {
    name: 'Segunda Divisão B da Espanha - Grupo 3',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda División B Group 4': {
    name: 'Segunda Divisão B da Espanha - Grupo 4',
    expectedCountry: 'Espanha',
  },
  'Spanish Segunda División B Group 5': {
    name: 'Segunda Divisão B da Espanha - Grupo 5',
    expectedCountry: 'Espanha',
  },
  'Svenska Cupen': { name: 'Copa da Suécia', expectedCountry: 'Suécia' },
  'Irish First Division': {
    name: 'Primeira Divisão da Irlanda',
    expectedCountry: 'Irlanda',
  },
  'FA Womens League Cup': {
    name: 'Copa da Liga Feminina da Inglaterra',
    expectedCountry: 'Inglaterra',
  },
  'Scottish League Cup': {
    name: 'Copa da Liga Escocia',
    expectedCountry: 'Escócia',
    logo: `/badges_leagues/Flag_of_Scotland.svg`,
  },
  'UEFA Womens Champions League': {
    name: 'Liga dos Campeões Feminina da UEFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/UEFA_Logo.png`,
  },
  'Dominican LDF': {
    name: 'Liga Dominicana de Futebol',
    expectedCountry: 'República Dominicana',
  },
  'Ecuadorian Serie B': {
    name: 'Série B do Equador',
    expectedCountry: 'Equador',
  },
  'Liechtenstein Cup': {
    name: 'Copa do Liechtenstein',
    expectedCountry: 'Liechtenstein',
  },
  'Olympics Soccer': {
    name: 'Futebol Olímpico',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/olympic-games.svg`,
  },
  'FIFA Arab Cup': {
    name: 'Copa Árabe FIFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Copa Colombia': { name: 'Copa Colômbia', expectedCountry: 'Colômbia' },
  'Finnish Cup': { name: 'Copa da Finlândia', expectedCountry: 'Finlândia' },
  'Italy Coppa Italia Serie C': {
    name: 'Coppa Italia Série C',
    expectedCountry: 'Itália',
  },
  'Malaysia Cup': { name: 'Copa da Malásia', expectedCountry: 'Malásia' },
  'Russia Cup': { name: 'Copa da Rússia', expectedCountry: 'Rússia' },
  'SAFF Championship': {
    name: 'Campeonato SAFF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'San Marino Coppa Titano': {
    name: 'Coppa Titano de San Marino',
    expectedCountry: 'San Marino',
  },
  'Slovenia Cup': { name: 'Copa da Eslovênia', expectedCountry: 'Eslovênia' },
  'US Open Cup': { name: 'Copa dos EUA', expectedCountry: 'EUA' },
  'Brazil Brasileiro Women': {
    name: 'Brasileirão Feminino',
    expectedCountry: 'Brasil',
  },
  'Denmark Elitedivisionen': {
    name: 'Elitedivisionen da Dinamarca',
    expectedCountry: 'Dinamarca',
  },
  'France Première Ligue': {
    name: 'Primeira Liga Feminina da França',
    expectedCountry: 'França',
  },
  'Germany Women Bundesliga': {
    name: 'Frauen Bundesliga',
    expectedCountry: 'Alemanha',
  },
  'Italy Serie A Women': {
    name: 'Série A Feminina da Itália',
    expectedCountry: 'Itália',
  },
  'Mexico Liga MX Femenil': {
    name: 'Liga MX Feminil do México',
    expectedCountry: 'México',
  },
  'Norway Toppserien': { name: 'Toppserien', expectedCountry: 'Noruega' },
  'Sweden Damallsvenskan': {
    name: 'Damallsvenskan',
    expectedCountry: 'Suécia',
  },
  'Argentina Primera B Metropolitana': {
    name: 'Primera B Metropolitana da Argentina',
    expectedCountry: 'Argentina',
  },
  'Portugal Liga 3': {
    name: 'Liga 3 de Portugal',
    expectedCountry: 'Portugal',
  },
  'Russia FNL 2 Group 1': {
    name: 'FNL 2 da Rússia - Grupo 1',
    expectedCountry: 'Rússia',
  },
  'Russia FNL 2 Group 2': {
    name: 'FNL 2 da Rússia - Grupo 2',
    expectedCountry: 'Rússia',
  },
  'Russia FNL 2 Group 3': {
    name: 'FNL 2 da Rússia - Grupo 3',
    expectedCountry: 'Rússia',
  },
  'Russia FNL 2 Group 4': {
    name: 'FNL 2 da Rússia - Grupo 4',
    expectedCountry: 'Rússia',
  },
  'USA NISA': { name: 'NISA - EUA', expectedCountry: 'EUA' },
  'Aruban Division di Honor': {
    name: 'Divisão de Honra de Aruba',
    expectedCountry: 'Aruba',
  },
  'Bermuda Premier League': {
    name: 'Premier League das Bermudas',
    expectedCountry: 'Bermudas',
  },
  'Guadeloupe Division dHonneur': {
    name: 'Divisão de Honra da Guadalupe',
    expectedCountry: 'Guadalupe',
  },
  'Lebanon Premier League': {
    name: 'Premier League',
    expectedCountry: 'Líbano',
  },
  'Zimbabwe Premier Soccer League': {
    name: 'Premier Soccer League do Zimbábue',
    expectedCountry: 'Zimbábue',
  },
  'SheBelieves Cup': {
    name: 'SheBelieves Cup',
    expectedCountry: 'Mundo',
  },
  'CONCACAF Nations League': {
    name: 'Liga das Nações CONCACAF',
    expectedCountry: 'Mundo',
  },
  'Leagues Cup': {
    name: 'Copa das Ligas',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'Copa Chile': { name: 'Copa do Chile', expectedCountry: 'Chile' },
  'Olympics Soccer Women': {
    name: 'Futebol Olímpico Feminino',
    expectedCountry: 'Mundo',
  },
  'Friendlies Women': {
    name: 'Amistosos Internacionais Femininos',
    expectedCountry: 'Mundo',
  },
  'DFB-Pokal Frauen': {
    name: 'Copa da Alemanha Feminina',
    expectedCountry: 'Alemanha',
  },
  'Campeonato Nacional Feminino': {
    name: 'Campeonato Nacional Feminino',
    expectedCountry: 'Portugal',
  },
  'UEFA Womens Nations League': {
    name: 'Liga das Nações Feminina UEFA',
    expectedCountry: 'Mundo',
  },
  'UEFA European Under-19 Championship': {
    name: 'Campeonato Europeu Sub-19 UEFA',
    expectedCountry: 'Mundo',
  },
  'UEFA European Under-17 Championship': {
    name: 'Campeonato Europeu Sub-17 UEFA',
    expectedCountry: 'Mundo',
  },
  'FIFA U-17 World Cup': {
    name: 'Copa do Mundo Sub-17 FIFA',
    expectedCountry: 'Mundo',
  },
  'UEFA Youth League': {
    name: 'UEFA Youth League',
    expectedCountry: 'Mundo',
  },
  'Argentinian Copa de la Liga Profesional': {
    name: 'Copa de La Liga Argentina',
    expectedCountry: 'Argentina',
  },
  'CONMEBOL Pre-Olympic Tournament': {
    name: 'Torneio Pré-Olímpico CONMEBOL',
    expectedCountry: 'Mundo',
  },
  'CONCACAF W Gold Cup': {
    name: 'Copa Ouro Feminina CONCACAF',
    expectedCountry: 'Mundo',
  },
  'FA Womens Challenge Cup': {
    name: 'Copa Feminina Challenge FA',
    expectedCountry: 'Inglaterra',
  },
  'Chile Segunda División': {
    name: 'Segunda Divisão do Chile',
    expectedCountry: 'Chile',
  },
  'Russia FNL 2 Division A Gold Group': {
    name: 'FNL 2 Rússia - Grupo Ouro',
    expectedCountry: 'Rússia',
  },
  'Russia FNL 2 Division A Silver Group': {
    name: 'FNL 2 Rússia - Grupo Prata',
    expectedCountry: 'Rússia',
  },
  'USL Super League': { name: 'USL Super League', expectedCountry: 'EUA' },
  'Copa Paraguay': { name: 'Copa do Paraguai', expectedCountry: 'Paraguai' },
  'Asian Games Soccer': {
    name: 'Futebol nos Jogos Asiáticos',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'Pan American Games Soccer': {
    name: 'Futebol nos Jogos Pan-Americanos',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/panamericana.svg`,
  },
  'Pacific Games Soccer': {
    name: 'Futebol nos Jogos do Pacífico',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'World Cup Qualifying AFC': {
    name: 'Eliminatórias Copa do Mundo AFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'World Cup Qualifying CAF': {
    name: 'Eliminatórias Copa do Mundo CAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'World Cup Qualifying CONMEBOL': {
    name: 'Eliminatórias Copa do Mundo CONMEBOL',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'World Cup Qualifying CONCACAF': {
    name: 'Eliminatórias Copa do Mundo CONCACAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'World Cup Qualifying OFC': {
    name: 'Eliminatórias Copa do Mundo OFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/ofc.svg`,
  },
  'World Cup Qualifying UEFA': {
    name: 'Eliminatórias Copa do Mundo UEFA',
    expectedCountry: 'Mundo',
  },
  'UEFA European Championships Qualifying': {
    name: 'Eliminatórias do Campeonato Europeu UEFA',
    expectedCountry: 'Mundo',
  },
  'African Cup of Nations Qualifying': {
    name: 'Eliminatórias Copa Africana de Nações',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/caf.svg`,
  },
  'AFC Asian Cup Qualifying': {
    name: 'Eliminatórias Copa Asiática AFC',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },
  'CONCACAF Gold Cup Qualifying': {
    name: 'Eliminatórias Copa Ouro CONCACAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Argentina Torneo Federal A': {
    name: 'Torneio Federal A da Argentina',
    expectedCountry: 'Argentina',
  },
  'Argentinian Primera C': {
    name: 'Primera C Argentina',
    expectedCountry: 'Argentina',
  },
  'Copa AUF Uruguay': { name: 'Copa AUF Uruguai', expectedCountry: 'Uruguai' },
  'Canadian Northern Super League': {
    name: 'Canadian Northern Super League',
    expectedCountry: 'Canadá',
  },
  'Coppa Italia Women': {
    name: 'Coppa Itália Feminina',
    expectedCountry: 'Itália',
  },
  'Norwegian Cupen': { name: 'Copa da Noruega', expectedCountry: 'Noruega' },
  'Copa Ecuador': { name: 'Copa do Equador', expectedCountry: 'Equador' },
  'Irish FAI Cup': { name: 'Copa FAI da Irlanda', expectedCountry: 'Irlanda' },
  'CONCACAF W Champions Cup': {
    name: 'Copa das Campeãs Feminina CONCACAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'FIFA U20 World Cup': {
    name: 'Copa do Mundo Sub-20 FIFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
  'English Premier League Summer Series': {
    name: 'Série de Verão da Premier League Inglesa',
    expectedCountry: 'Mundo',
  },
  'Emirates Cup': { name: 'Copa Emirates', expectedCountry: 'Mundo' },
  'USL Cup': { name: 'USL Cup', expectedCountry: 'Mundo' },
  'Copa America Femenina': {
    name: 'Copa América Feminina',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'Lithuanian Football Cup': {
    name: 'Copa da Lituânia',
    expectedCountry: 'Lituânia',
  },
  'Lithuanian Supercup': {
    name: 'Supercopa da Lituânia',
    expectedCountry: 'Lituânia',
  },
  'Copa Venezuela': { name: 'Copa da Venezuela', expectedCountry: 'Venezuela' },
  'Supercopa de Venezuela': {
    name: 'Supercopa da Venezuela',
    expectedCountry: 'Venezuela',
  },
  'Mexican Campeon de Campeones': {
    name: 'Copa dos Campeões do México',
    expectedCountry: 'México',
  },
  'Argentinian Supercopa Internacional': {
    name: 'Supercopa Internacional Argentina',
    expectedCountry: 'Argentina',
  },
  'Argentinian Trofeo de Campeones': {
    name: 'Troféu de Campeões Argentina',
    expectedCountry: 'Argentina',
  },
  'Recopa Sudamericana': {
    name: 'Recopa Sul-Americana',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/Conmebol_Recopa.png`,
  },

  'CAFA Nations Cup': {
    name: 'Copa das Nações CAFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/afc.svg`,
  },

  'FIFA Intercontinental Cup': {
    name: 'Copa Intercontinental FIFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/FIFA_Intercontinental_Cup.png`,
  },
  'Supercopa de Chile': {
    name: 'Supercopa do Chile',
    expectedCountry: 'Chile',
  },
  'UEFA Womens Europa Cup': {
    name: 'Liga Europa Feminina UEFA',
    expectedCountry: 'Mundo',
  },
  'CONCACAF Caribbean Cup': {
    name: 'Copa do Caribe CONCACAF',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/concacaf-logo.svg`,
  },
  'Copa Libertadores Femenina': {
    name: 'Copa Libertadores Feminina',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/conmebol-logo.svg`,
  },
  'Latvian Cup': { name: 'Copa da Letônia', expectedCountry: 'Letônia' },
  'FIFA Womens U17 World Cup': {
    name: 'Copa do Mundo Sub-17 Feminina FIFA',
    expectedCountry: 'Mundo',
    logo: `/badges_leagues/fifa_logo_1.png`,
  },
};

export const translateLeague = (league: string): LeagueTranslation => {
  return leagueTranslations[league] || { name: league };
};
