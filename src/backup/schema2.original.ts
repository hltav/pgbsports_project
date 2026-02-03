// // This is your Prisma schema file,
// // learn more about it in the docs: https://pris.ly/d/prisma-schema

// // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

// generator client {
//   provider = "prisma-client-js"
// }

// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }

// // User types enum
// enum Role {
//   USER
//   TEST_USER
//   ADMIN

// }

// // Type of event enum
// // enum EventType {
// //   SINGLE
// //   MULTIPLE
// //   LIVE
// // }

// enum BetType {
//   SINGLE // Aposta simples
//   MULTIPLE // Múltipla
//   SYSTEM // Sistema

//   @@map("bet_type")
// }

// enum OperationType {
//   DEPOSIT
//   WITHDRAWAL
//   STAKE
//   BET_PLACED
//   BET_WIN
//   BET_LOSS
//   BET_VOID
//   BET_CASHOUT
//   UNID_VALUE_CHANGE
//   BALANCE_ADJUSTMENT
//   BET_BONUS
//   TRANSFER
// }

// enum Result {
//   pending
//   win
//   lose
//   draw
//   cashout
//   returned
//   void
//   half_win
//   half_lose
// }

// enum MatchStatus {
//   SCHEDULED
//   LIVE
//   FINISHED
//   POSTPONED
//   CANCELLED
//   ABANDONED
//   HALF_TIME
//   NOT_STARTED
//   FIRST_HALF
//   SECOND_HALF
// }

// enum EmailVerificationType {
//   EMAIL_CONFIRMATION
//   RESET_PASSWORD
// }

// enum AlertType {
//   DRAWDOWN
//   PROFIT_TARGET
//   LOSS_LIMIT
//   STREAK
//   ROI_DROP
// }

// enum StatPeriod {
//   FULL_TIME
//   FIRST_HALF // ESSENCIAL para LangChain
//   SECOND_HALF //ESSENCIAL para LangChain
// }

// enum EventType {
//   GOAL
//   CARD
//   SUBSTITUTION
//   VAR
//   PENALTY
//   OWN_GOAL
// }

// model User {
//   id                  Int                 @id @default(autoincrement())
//   firstname           String
//   lastname            String
//   nickname            String              @unique
//   email               String              @unique @db.VarChar(255)
//   searchableEmailHash String              @unique @db.VarChar(64)
//   password            String
//   role                Role                @default(USER)
//   emailVerifications  EmailVerification[]
//   clientData          ClientData?
//   emailVerifiedAt     DateTime?
//   refreshToken        String?
//   createdAt           DateTime            @default(now())
//   updatedAt           DateTime            @updatedAt
//   bankrolls           Bankroll[]
//   Bets                Bets[]
//   avatar              Image?
// }

// //Client Data
// model ClientData {
//   id        Int      @id @default(autoincrement())
//   gender    String
//   cpf       String   @unique
//   phone     String   @default("")
//   image     String
//   userId    Int      @unique
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   address   Address?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// //Client Address
// model Address {
//   id           Int        @id @default(autoincrement())
//   direction    String?
//   houseNumber  String?
//   neighborhood String?
//   city         String?
//   state        String?
//   country      String?
//   clientDataId Int        @unique
//   clientData   ClientData @relation(fields: [clientDataId], references: [id], onDelete: Cascade)
//   createdAt    DateTime   @default(now())
//   updatedAt    DateTime   @updatedAt
// }

// //=== BANCA ==//

// // MODELO PRINCIPAL - BANKROLL
// model Bankroll {
//   id               Int               @id @default(autoincrement())
//   name             String            @db.VarChar(100)
//   // === VALORES BASE ===
//   balance          Decimal           @db.Decimal(15, 2)
//   unidValue        Decimal           @db.Decimal(15, 2)
//   initialBalance   Decimal           @db.Decimal(15, 2)
//   // Totalizadores financeiros
//   totalDeposited   Decimal           @default(0) @db.Decimal(15, 2)
//   totalWithdrawn   Decimal           @default(0) @db.Decimal(15, 2)
//   totalStaked      Decimal           @default(0) @db.Decimal(15, 2)
//   totalReturned    Decimal           @default(0) @db.Decimal(15, 2)
//   // === INFORMAÇÕES GERAIS ===
//   bookmaker        String            @default("Unknown") @db.VarChar(100)
//   currency         String            @default("BRL") @db.VarChar(3)
//   isActive         Boolean           @default(true)
//   // === TIMESTAMPS ===
//   createdAt        DateTime          @default(now())
//   updatedAt        DateTime          @updatedAt
//   // === RELACIONAMENTOS ===
//   userId           Int
//   user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
//   bets             Bets[] // ← APOSTA = EVENT
//   histories        BankrollHistory[]
//   goals            BankrollGoal[]
//   snapshotsDaily   DailySnapshot[]
//   snapshotsWeekly  WeeklySnapshot[]
//   snapshotsMonthly MonthlySnapshot[]
//   snapshotsYearly  YearlySnapshot[]
//   streaks          BankrollStreak[]
//   records          BankrollRecord[]
//   alerts           BankrollAlert[]
//   operations       Operation[]

//   // === CONSTRAINTS E ÍNDICES ===
//   @@unique([userId, name])
//   @@index([userId, isActive])
//   @@index([bookmaker])
//   @@map("bankrolls")
// }

// // HISTÓRICO DE OPERAÇÕES (SIMPLIFICADO)
// model BankrollHistory {
//   id              Int           @id @default(autoincrement())
//   bankrollId      Int
//   type            OperationType
//   date            DateTime      @default(now())
//   // Estado antes/depois
//   balanceBefore   Decimal       @db.Decimal(15, 2)
//   balanceAfter    Decimal       @db.Decimal(15, 2)
//   unidValueBefore Decimal       @db.Decimal(15, 2)
//   unidValueAfter  Decimal       @db.Decimal(15, 2)
//   amount          Decimal       @db.Decimal(15, 2)
//   // Referências
//   betId           Int? // Se for relacionado a um Event
//   description     String?       @db.VarChar(500)
//   createdAt       DateTime      @default(now())
//   // Relacionamento
//   bankroll        Bankroll      @relation(fields: [bankrollId], references: [id], onDelete: Cascade)
//   bets            Bets?         @relation(fields: [betId], references: [id])

//   // Índices
//   @@index([bankrollId, date(sort: Desc)])
//   @@index([bankrollId, type, date(sort: Desc)])
//   @@index([betId])
//   @@map("bankroll_histories")
// }

// // OPERAÇÕES FINANCEIRAS
// model Operation {
//   id                Int           @id @default(autoincrement())
//   bankrollId        Int
//   type              OperationType
//   amount            Decimal       @db.Decimal(15, 2)
//   date              DateTime      @default(now())
//   description       String?       @db.VarChar(255)
//   // Para transferências entre bancas
//   relatedBankrollId Int?
//   // Relacionamento
//   bankroll          Bankroll      @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@index([bankrollId, date(sort: Desc)])
//   @@index([bankrollId, type])
//   @@map("operations")
// }

// // STREAKS E SEQUÊNCIAS
// model BankrollStreak {
//   id          Int       @id @default(autoincrement())
//   bankrollId  Int
//   type        String    @db.VarChar(50) // WIN_STREAK, LOSS_STREAK, GREEN_SEQUENCE
//   length      Int // Tamanho da sequência
//   startDate   DateTime
//   endDate     DateTime?
//   totalProfit Decimal   @db.Decimal(15, 2)
//   totalROI    Decimal   @db.Decimal(10, 4)
//   createdAt   DateTime  @default(now())
//   // Relacionamento
//   bankroll    Bankroll  @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@index([bankrollId, type])
//   @@index([bankrollId, length(sort: Desc)])
//   @@map("bankroll_streaks")
// }

// // RECORDES
// model BankrollRecord {
//   id         Int      @id @default(autoincrement())
//   bankrollId Int
//   type       String   @db.VarChar(50)
//   // Exemplos: MAX_DAILY_PROFIT, MAX_MONTHLY_PROFIT, MAX_DRAWDOWN,
//   // BEST_STREAK, WORST_STREAK, HIGHEST_ODD, BIGGEST_WIN
//   value      Decimal  @db.Decimal(15, 2)
//   date       DateTime
//   metadata   Json? // Ex: { streakLength: 7, betId: 123 }
//   createdAt  DateTime @default(now())
//   // Relacionamento
//   bankroll   Bankroll @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@index([bankrollId, type])
//   @@index([bankrollId, value(sort: Desc)])
//   @@map("bankroll_records")
// }

// // METAS E OBJETIVOS
// model BankrollGoal {
//   id           Int       @id @default(autoincrement())
//   bankrollId   Int
//   description  String    @db.VarChar(255)
//   targetProfit Decimal   @db.Decimal(15, 2)
//   currentValue Decimal   @default(0) @db.Decimal(15, 2)
//   period       String?   @db.VarChar(20) // DAILY, WEEKLY, MONTHLY, YEARLY
//   deadline     DateTime?
//   achievedAt   DateTime?
//   isActive     Boolean   @default(true)
//   createdAt    DateTime  @default(now())
//   updatedAt    DateTime  @updatedAt
//   // Relacionamento
//   bankroll     Bankroll  @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@index([bankrollId, isActive])
//   @@index([bankrollId, deadline])
//   @@map("bankroll_goals")
// }

// // SNAPSHOTS DIÁRIOS
// model DailySnapshot {
//   id              Int      @id @default(autoincrement())
//   bankrollId      Int
//   year            Int
//   month           Int
//   day             Int
//   // Métricas do dia
//   balance         Decimal  @db.Decimal(15, 2)
//   unidValue       Decimal  @db.Decimal(15, 2)
//   dailyProfit     Decimal  @db.Decimal(15, 2)
//   dailyROI        Decimal  @db.Decimal(10, 4)
//   unitsChange     Decimal  @db.Decimal(10, 2)
//   // Drawdown
//   peakBalance     Decimal  @db.Decimal(15, 2)
//   maxDrawdown     Decimal  @db.Decimal(15, 2)
//   dailyDrawdown   Decimal  @db.Decimal(15, 2)
//   drawdownPercent Decimal  @db.Decimal(5, 2)
//   // Apostas do dia
//   betsPlaced      Int      @default(0)
//   betsWon         Int      @default(0)
//   betsLost        Int      @default(0)
//   winRate         Decimal  @db.Decimal(6, 3)
//   createdAt       DateTime @default(now())
//   // Relacionamento
//   bankroll        Bankroll @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@unique([bankrollId, year, month, day])
//   @@index([bankrollId, year, month, day(sort: Desc)])
//   @@map("snapshots_daily")
// }

// // SNAPSHOTS SEMANAIS

// model WeeklySnapshot {
//   id              Int      @id @default(autoincrement())
//   bankrollId      Int
//   year            Int
//   week            Int // 1-53
//   // Métricas da semana
//   balance         Decimal  @db.Decimal(15, 2)
//   unidValue       Decimal  @db.Decimal(15, 2)
//   weeklyProfit    Decimal  @db.Decimal(15, 2)
//   weeklyROI       Decimal  @db.Decimal(10, 4)
//   unitsChange     Decimal  @db.Decimal(10, 2)
//   // Drawdown
//   peakBalance     Decimal  @db.Decimal(15, 2)
//   maxDrawdown     Decimal  @db.Decimal(15, 2)
//   drawdownPercent Decimal  @db.Decimal(5, 2)
//   // Apostas da semana
//   betsPlaced      Int      @default(0)
//   betsWon         Int      @default(0)
//   betsLost        Int      @default(0)
//   winRate         Decimal  @db.Decimal(6, 3)
//   createdAt       DateTime @default(now())
//   // Relacionamento
//   bankroll        Bankroll @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@unique([bankrollId, year, week])
//   @@index([bankrollId, year, week(sort: Desc)])
//   @@map("snapshots_weekly")
// }

// // SNAPSHOTS MENSAIS
// model MonthlySnapshot {
//   id              Int      @id @default(autoincrement())
//   bankrollId      Int
//   year            Int
//   month           Int
//   // Métricas do mês
//   balance         Decimal  @db.Decimal(15, 2)
//   unidValue       Decimal  @db.Decimal(15, 2)
//   monthlyProfit   Decimal  @db.Decimal(15, 2)
//   monthlyROI      Decimal  @db.Decimal(10, 4)
//   unitsChange     Decimal  @db.Decimal(10, 2)
//   // Drawdown
//   peakBalance     Decimal  @db.Decimal(15, 2)
//   maxDrawdown     Decimal  @db.Decimal(15, 2)
//   drawdownPercent Decimal  @db.Decimal(5, 2)
//   // Apostas do mês
//   betsPlaced      Int      @default(0)
//   betsWon         Int      @default(0)
//   betsLost        Int      @default(0)
//   winRate         Decimal  @db.Decimal(6, 3)
//   createdAt       DateTime @default(now())
//   // Relacionamento
//   bankroll        Bankroll @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@unique([bankrollId, year, month])
//   @@index([bankrollId, year, month(sort: Desc)])
//   @@map("snapshots_monthly")
// }

// // SNAPSHOTS ANUAIS
// model YearlySnapshot {
//   id              Int      @id @default(autoincrement())
//   bankrollId      Int
//   year            Int
//   // Métricas do ano
//   balance         Decimal  @db.Decimal(15, 2)
//   unidValue       Decimal  @db.Decimal(15, 2)
//   yearlyProfit    Decimal  @db.Decimal(15, 2)
//   yearlyROI       Decimal  @db.Decimal(10, 4)
//   unitsChange     Decimal  @db.Decimal(10, 2)
//   // Drawdown
//   peakBalance     Decimal  @db.Decimal(15, 2)
//   maxDrawdown     Decimal  @db.Decimal(15, 2)
//   drawdownPercent Decimal  @db.Decimal(5, 2)
//   // Apostas do ano
//   betsPlaced      Int      @default(0)
//   betsWon         Int      @default(0)
//   betsLost        Int      @default(0)
//   winRate         Decimal  @db.Decimal(6, 3)
//   createdAt       DateTime @default(now())
//   // Relacionamento
//   bankroll        Bankroll @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@unique([bankrollId, year])
//   @@index([bankrollId, year(sort: Desc)])
//   @@map("snapshots_yearly")
// }

// // ALERTAS
// model BankrollAlert {
//   id          Int       @id @default(autoincrement())
//   bankrollId  Int
//   type        AlertType
//   threshold   Decimal   @db.Decimal(15, 4)
//   message     String    @db.VarChar(255)
//   isActive    Boolean   @default(true)
//   triggeredAt DateTime?
//   createdAt   DateTime  @default(now())
//   updatedAt   DateTime  @updatedAt
//   // Relacionamento
//   bankroll    Bankroll  @relation(fields: [bankrollId], references: [id], onDelete: Cascade)

//   // Índices
//   @@index([bankrollId, type])
//   @@index([bankrollId, isActive])
//   @@map("bankroll_alerts")
// }

// //========EVENTOS ESPORTIVOS========///

// // ============================================
// // MODELO: APOSTA DO USUÁRIO (BET/EVENT)
// // ============================================
// model Bets {
//   id               Int               @id @default(autoincrement())
//   bankrollId       Int
//   userId           Int
//   // === REFERÊNCIA AO JOGO REAL (OPCIONAL) ===
//   externalMatchId  Int
//   apiSportsEventId String?           @db.VarChar(50) // Redundante mas útil para lookup
//   tsdbEventId      String?           @db.VarChar(50) // Redundante mas útil para lookup
//   // === CONTEXTO DO EVENTO (SNAPSHOT) ===
//   // Guardamos snapshot para casos onde o jogo não existe mais na API
//   // ou para manter histórico exato do momento da aposta
//   sport            String            @db.VarChar(50)
//   league           String            @db.VarChar(100)
//   eventDescription String            @db.VarChar(255) // "Flamengo vs Palmeiras"
//   eventDate        DateTime?
//   homeTeam         String?           @db.VarChar(100)
//   awayTeam         String?           @db.VarChar(100)
//   homeTeamBadge    String?           @db.VarChar(255)
//   awayTeamBadge    String?           @db.VarChar(255)
//   leagueBadge      String?           @db.VarChar(255)
//   // === INFORMAÇÕES DO MERCADO ===
//   market           String            @db.VarChar(100) // "1X2", "Over/Under"
//   marketCategory   String            @db.VarChar(100) // "Resultado Final"
//   marketSub        String?           @db.VarChar(100)
//   selection        String            @db.VarChar(100) // "Casa", "Over 2.5"
//   // === VALORES DA APOSTA ===
//   odd              Decimal           @db.Decimal(10, 2)
//   stake            Decimal           @db.Decimal(15, 2)
//   potentialReturn  Decimal           @db.Decimal(15, 2) // stake * odd
//   actualReturn     Decimal?          @db.Decimal(15, 2)
//   // === SNAPSHOT DA BANCA NO MOMENTO DA APOSTA ===
//   bankrollBalance  Decimal           @db.Decimal(15, 2)
//   unitValue        Decimal           @db.Decimal(15, 2)
//   stakeInUnits     Decimal           @db.Decimal(10, 2)
//   // === STATUS E RESULTADO ===
//   result           Result            @default(pending)
//   // === CAMPOS CALCULADOS ===
//   profit           Decimal?          @db.Decimal(15, 2) // actualReturn - stake
//   roi              Decimal?          @db.Decimal(10, 4) // (profit / stake) * 100
//   isWin            Boolean? // result == WON
//   // === DATAS ===
//   placedAt         DateTime          @default(now())
//   settledAt        DateTime?
//   // === METADADOS E ANÁLISE ===
//   confidence       Int?              @db.SmallInt // 1-10
//   expectedValue    Decimal?          @db.Decimal(10, 4)
//   betType          BetType           @default(SINGLE)
//   isLive           Boolean           @default(false)
//   tags             Json? // ["Value Bet", "Top League"]
//   notes            String?           @db.Text
//   // === TIMESTAMPS ===
//   createdAt        DateTime          @default(now())
//   updatedAt        DateTime          @updatedAt
//   // === RELACIONAMENTOS ===
//   bankroll         Bankroll          @relation(fields: [bankrollId], references: [id], onDelete: Cascade)
//   user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
//   externalMatch    ExternalMatch     @relation(fields: [externalMatchId], references: [id])
//   histories        BankrollHistory[]

//   // === ÍNDICES ===
//   @@index([bankrollId, userId])
//   @@index([userId, result, placedAt(sort: Desc)])
//   @@index([bankrollId, result])
//   @@index([result, placedAt(sort: Desc)])
//   @@index([externalMatchId])
//   @@index([apiSportsEventId])
//   @@index([sport, result])
//   @@index([market, result])
//   @@index([settledAt])
//   @@map("bets")
// }

// // MODELO: EVENTO ESPORTIVO REAL (FONTE EXTERNA)
// model ExternalMatch {
//   id                     Int                   @id @default(autoincrement())
//   // === IDENTIFICAÇÃO ÚNICA DA API ===
//   apiSportsEventId       String                @unique @db.VarChar(50)
//   tsdbEventId            String?               @unique @db.VarChar(50)
//   apiSource              String                @default("thesportsdb") @db.VarChar(50)
//   externalMatchDetailsId Int?                  @unique
//   // === INFORMAÇÕES BÁSICAS DO JOGO ===
//   sport                  String                @db.VarChar(50)
//   league                 String                @db.VarChar(100)
//   leagueBadge            String?               @db.VarChar(255)
//   leagueId               String?               @db.VarChar(50)
//   season                 String?               @db.VarChar(20)
//   round                  Int?                  @db.SmallInt
//   country                String?               @db.VarChar(100)
//   // === TIMES ===
//   homeTeam               String                @db.VarChar(100)
//   awayTeam               String                @db.VarChar(100)
//   homeTeamBadge          String?               @db.VarChar(255)
//   awayTeamBadge          String?               @db.VarChar(255)
//   // === PLACARES ===
//   homeScoreHT            Int? // Half Time
//   awayScoreHT            Int?
//   homeScoreFT            Int? // Full Time
//   awayScoreFT            Int?
//   // === STATUS E DATAS ===
//   status                 MatchStatus           @default(SCHEDULED)
//   eventDate              DateTime
//   eventDateLocal         DateTime?
//   timezone               String?               @db.VarChar(50)
//   isPostponed            Boolean               @default(false)
//   // === METADADOS ===
//   thumbnail              String?               @db.VarChar(255)
//   venue                  String?               @db.VarChar(200)
//   // === SINCRONIZAÇÃO ===
//   lastSyncAt             DateTime              @default(now())
//   syncAttempts           Int                   @default(0) @db.SmallInt
//   syncError              String?               @db.Text
//   // === TIMESTAMPS ===
//   createdAt              DateTime              @default(now())
//   updatedAt              DateTime              @updatedAt
//   // === RELACIONAMENTO ===
//   bets                   Bets[] // Uma partida pode ter N apostas
//   matchStatistics        MatchStatistic[] // Estatísticas estruturadas
//   matchEvents            MatchEvent[] // Eventos
//   matchLineups           MatchLineup[] // Escalações
//   playerMatchStats       PlayerMatchStat[] // Estatísticas de jogadores
//   externalMatchDetails   ExternalMatchDetails?

//   // === ÍNDICES ===
//   @@index([apiSportsEventId])
//   @@index([status, eventDate])
//   @@index([eventDate(sort: Desc)])
//   @@index([sport, league])
//   @@index([apiSource, apiSportsEventId])
//   @@map("external_matches")
// }

// // ========================================
// // MODELOS AUXILIARES 
// // ========================================
// model ExternalMatchDetails {
//   id                   Int           @id @default(autoincrement())
//   // Link para o match principal (One-to-One)
//   externalMatchId      Int           @unique
//   externalMatch        ExternalMatch @relation(fields: [externalMatchId], references: [id], onDelete: Cascade)
//   // === DADOS ESPECÍFICOS DA API-FOOTBALL ===
//   referee              String?       @db.VarChar(100)
//   venueId              Int?
//   venueName            String?       @db.VarChar(200)
//   venueCity            String?       @db.VarChar(100)
//   // Dados dos times (mais completos que só o nome)
//   homeTeamId           Int
//   awayTeamId           Int
//   homeWinner           Boolean?
//   awayWinner           Boolean?
//   // === DADOS TEMPORAIS DETALHADOS ===
//   fixtureTimestamp     BigInt // timestamp Unix
//   periodsFirst         BigInt? // timestamp do início do 1º tempo
//   periodsSecond        BigInt? // timestamp do início do 2º tempo
//   statusLong           String?       @db.VarChar(50) // "Match Finished"
//   statusShort          String?       @db.VarChar(20) // "FT"
//   statusElapsed        Int? // minutos jogados (ex: 90)
//   statusExtra          Int? // minutos de acréscimo
//   // === DADOS COMPLEMENTARES (JSON) ===
//   // Armazena estruturas complexas como arrays de objetos
//   events               Json? // Array de eventos (gols, cartões, substituições)
//   lineups              Json? // Escalações e substituições
//   players              Json? // Estatísticas por jogador
//   // === ESTATÍSTICAS (O CORAÇÃO DA ANÁLISE) ===
//   // Estatísticas totais do jogo (do endpoint padrão)
//   statisticsTotal      Json?
//   // ⭐⭐ ESTATÍSTICAS POR TEMPO (do endpoint com ?half=true) ⭐⭐
//   statisticsFirstHalf  Json? // statistics_1h da API
//   statisticsSecondHalf Json? // statistics_2h da API
//   // === METADADOS DE SINCRONIZAÇÃO ===
//   lastApiSyncAt        DateTime      @default(now())
//   dataHash             String?       @db.VarChar(100) // Para verificar se houve mudança
//   rawApiResponse       Json? // Backup da resposta bruta da API (opcional)

//   @@map("external_match_details")
// }

// model MatchStatistic {
//   id               Int           @id @default(autoincrement())
//   externalMatchId  Int
//   externalMatch    ExternalMatch @relation(fields: [externalMatchId], references: [id], onDelete: Cascade)
//   teamId           String        @db.VarChar(50)
//   teamName         String        @db.VarChar(100)
//   period           StatPeriod    @default(FULL_TIME)
//   // Chutes
//   shotsTotal       Int?
//   shotsOnGoal      Int?
//   shotsOffGoal     Int?
//   shotsBlocked     Int?
//   shotsInsideBox   Int?
//   shotsOutsideBox  Int?
//   // Posse e passes
//   possession       Int? // Percentual (ex: 58)
//   passesTotal      Int?
//   passesAccurate   Int?
//   passesPercentage Int?
//   // Outros
//   corners          Int?
//   offsides         Int?
//   fouls            Int?
//   yellowCards      Int?
//   redCards         Int?
//   goalkeeperSaves  Int?
//   // Avançado
//   expectedGoals  Decimal? @db.Decimal(5, 2)
//   goalsPrevented Decimal? @db.Decimal(5, 2)

//   createdAt DateTime @default(now())

//   @@unique([externalMatchId, teamId, period])
//   @@index([externalMatchId, period])
//   @@map("match_statistics")
// }

// model MatchEvent {
//   id              Int           @id @default(autoincrement())
//   externalMatchId Int
//   externalMatch   ExternalMatch @relation(fields: [externalMatchId], references: [id], onDelete: Cascade)
//   teamId          String        @db.VarChar(50)
//   teamName        String        @db.VarChar(100)
//   minute          Int
//   extraMinute     Int?
//   eventType       EventType
//   detail          String?       @db.VarChar(100)
//   playerId        String?       @db.VarChar(50)
//   playerName      String?       @db.VarChar(100)
//   assistId        String?       @db.VarChar(50)
//   assistName      String?       @db.VarChar(100)
//   comments        String?       @db.Text

//   createdAt DateTime @default(now())

//   @@index([externalMatchId, minute])
//   @@index([eventType])
//   @@map("match_events")
// }

// model MatchLineup {
//   id              Int           @id @default(autoincrement())
//   externalMatchId Int
//   externalMatch   ExternalMatch @relation(fields: [externalMatchId], references: [id], onDelete: Cascade)
//   teamId          String        @db.VarChar(50)
//   teamName        String        @db.VarChar(100)
//   formation       String?       @db.VarChar(10)
//   coachId         String?       @db.VarChar(50)
//   coachName       String?       @db.VarChar(100)
//   coachPhoto      String?       @db.VarChar(255)
//   startingXI      Json // [{playerId: "123", name: "Player", position: "G", number: 1}]
//   substitutes     Json // Array de reservas
//   createdAt       DateTime      @default(now())

//   @@unique([externalMatchId, teamId])
//   @@map("match_lineups")
// }

// model PlayerMatchStat {
//   id               Int           @id @default(autoincrement())
//   externalMatchId  Int
//   externalMatch    ExternalMatch @relation(fields: [externalMatchId], references: [id], onDelete: Cascade)
//   playerId         String        @db.VarChar(50)
//   playerName       String        @db.VarChar(100)
//   playerPhoto      String?       @db.VarChar(255)
//   teamId           String        @db.VarChar(50)
//   // Jogo
//   position         String?       @db.VarChar(10)
//   number           Int?
//   minutesPlayed    Int?
//   rating           Decimal?        @db.Decimal(3, 1)
//   isCaptain        Boolean       @default(false)
//   isSubstitute     Boolean       @default(false)
//   // Ataque
//   goals            Int?
//   assists          Int?
//   shotsTotal       Int?
//   shotsOnGoal      Int?
//   // Passes
//   passesTotal      Int?
//   passesAccurate   Int?
//   passesKey        Int?
//   // Defesa
//   tackles          Int?
//   blocks           Int?
//   interceptions    Int?
//   // Duelos
//   duelsTotal       Int?
//   duelsWon         Int?
//   // Dribles
//   dribblesAttempts Int?
//   dribblesSuccess  Int?
//   dribblesPast     Int?
//   // Disciplina
//   foulsDrawn       Int?
//   foulsCommitted   Int?
//   yellowCards      Int?
//   redCards         Int?
//   // Goleiro
//   saves            Int?
//   goalsConceded    Int?
//   createdAt        DateTime      @default(now())

//   @@unique([externalMatchId, playerId])
//   @@index([playerId])
//   @@index([externalMatchId, rating(sort: Desc)])
//   @@map("player_match_stats")
// }

// // Email Verification Model
// model EmailVerification {
//   id        Int                   @id @default(autoincrement())
//   token     String                @unique
//   userId    Int
//   user      User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
//   type      EmailVerificationType
//   used      Boolean               @default(false)
//   expiresAt DateTime
//   verified  Boolean               @default(false)
//   createdAt DateTime              @default(now())
// }

// //Image Model
// model Image {
//   id        Int      @id @default(autoincrement())
//   url       String
//   userId    Int      @unique
//   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// generator client {
//   provider = "prisma-client-js"
// }

// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
//   schemas  = ["enum", "user", "bankrolls", "sports_data", "betting", "utils"] // Defina seus namespaces
// }


