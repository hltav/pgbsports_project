// // This is your Prisma schema file,
// // learn more about it in the docs: https://pris.ly/d/prisma-schema

// // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

// generator client {
//   provider = "prisma-client-js"
// }

// datasource db {
//   provider = "postgresql"
//    url      = env("DATABASE_URL")
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

// enum HistoryType {
//   DEPOSIT // Depósito de fundos
//   WITHDRAWAL // Saque de fundos
//   BET_PLACED // Aposta realizada
//   BET_WON // Aposta ganha
//   BET_LOST // Aposta perdida
//   BET_VOID // Aposta anulada
//   UNID_VALUE_CHANGE // Mudança no valor da unidade
//   BALANCE_ADJUSTMENT // Ajuste manual (se necessário)
// }

// enum Result {
//   pending
//   win
//   lose
//   draw
//   returned
//   void
// }

// enum EmailVerificationType {
//   EMAIL_CONFIRMATION
//   RESET_PASSWORD
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
//   Event               Event[]
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

// //Bankroll Data
// model Bankroll {
//   id             Int               @id @default(autoincrement())
//   name           String
//   balance        Decimal
//   unidValue      Decimal
//   initialBalance Decimal
//   totalDeposited Decimal           @default(0)
//   totalWithdrawn Decimal           @default(0)
//   totalStaked    Decimal           @default(0)
//   totalReturned  Decimal           @default(0)
//   bookmaker      String            @default("Unknown")
//   userId         Int
//   user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)
//   events         Event[]
//   histories      BankrollHistory[]

//   @@unique([userId, name])
// }

// // Histórico COMPLETO - registra todas as operações
// model BankrollHistory {
//   id              Int         @id @default(autoincrement())
//   bankrollId      Int
//   bankroll        Bankroll    @relation(fields: [bankrollId], references: [id], onDelete: Cascade)
//   date            DateTime    @default(now())
//   type            HistoryType
//   balanceBefore   Decimal
//   balanceAfter    Decimal
//   unidValue       Decimal
//   amount          Decimal?
//   eventId         Int?
//   eventName       String?
//   stake           Decimal?
//   odds            Decimal?
//   potentialWin    Decimal?
//   actualReturn    Decimal?
//   unidValueBefore Decimal?
//   unidValueAfter  Decimal?
//   description     String?

//   @@index([bankrollId, date])
//   @@index([eventId])
//   @@index([type, date])
// }

// //Event Model
// model Event {
//   id               Int       @id @default(autoincrement())
//   bankId           Int
//   bank             Bankroll  @relation(fields: [bankId], references: [id], onDelete: Cascade)
//   // eventType      EventType?
//   modality         String
//   league           String
//   odd              Decimal
//   event            String
//   market           String
//   marketCategory   String
//   marketSub        String?
//   optionMarket     String
//   amount           Decimal
//   result           Result    @default(pending)
//   apiEventId       String?
//   homeTeam         String?
//   awayTeam         String?
//   eventDate        DateTime?
//   userId           Int
//   user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
//   createdAt        DateTime  @default(now())
//   updatedAt        DateTime  @updatedAt
//   strTimestamp     String?
//   strTime          String?
//   strTimeLocal     String?
//   dateEvent        String?
//   dateEventLocal   String?
//   timezone         String?
//   strLeague        String?
//   strBadge         String?
//   strSeason        String?
//   intRound         Int?
//   homeScoreHT      Int?
//   awayScoreHT      Int?
//   homeScoreFT      Int?
//   awayScoreFT      Int?
//   intHomeScore     String?
//   intAwayScore     String?
//   strHomeTeamBadge String?
//   strAwayTeamBadge String?
//   strCountry       String?
//   strStatus        String?
//   strPostponed     String?
//   strThumb         String?

//   //@@index([userId, eventType])
//   @@index([result, apiEventId])
//   @@index([eventDate])
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
