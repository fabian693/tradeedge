-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "DrawdownType" AS ENUM ('TRAILING_EOD', 'STATIC', 'DAILY_LOSS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Market" AS ENUM ('NQ', 'ES');

-- CreateEnum
CREATE TYPE "TradingSession" AS ENUM ('LONDON', 'NY');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "DailyBias" AS ENUM ('BULLISH', 'BEARISH');

-- CreateEnum
CREATE TYPE "IFVGTimeframe" AS ENUM ('M1', 'M2', 'M5', 'M15');

-- CreateEnum
CREATE TYPE "SetupGrade" AS ENUM ('A_PLUS', 'A', 'B');

-- CreateEnum
CREATE TYPE "Confirmation" AS ENUM ('LIQUIDITY_SWEEP', 'SMT_DIVERGENCE', 'FVG_ALIGNMENT');

-- CreateEnum
CREATE TYPE "SLType" AS ENUM ('AGGRESSIVE', 'SAFE');

-- CreateEnum
CREATE TYPE "TradeResult" AS ENUM ('WIN', 'LOSS', 'BREAKEVEN');

-- CreateEnum
CREATE TYPE "PsychologyProfile" AS ENUM ('DISCIPLINED', 'DEVELOPING', 'EMOTIONAL', 'HIGH_RISK');

-- CreateEnum
CREATE TYPE "DailyRecommendation" AS ENUM ('GO', 'CAUTION', 'NO_GO');

-- CreateEnum
CREATE TYPE "FollowedRules" AS ENUM ('YES', 'MOSTLY', 'NO');

-- CreateEnum
CREATE TYPE "DisciplineGrade" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "ChecklistVerdict" AS ENUM ('A_PLUS', 'B_SETUP', 'DO_NOT_TRADE');

-- CreateEnum
CREATE TYPE "WeekGrade" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "FollowedRoutine" AS ENUM ('YES', 'MOSTLY', 'NO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "googleId" TEXT,
    "experienceLevel" "ExperienceLevel",
    "propFirm" TEXT,
    "accountSize" DOUBLE PRECISION,
    "preferredSession" "TradingSession",
    "timezone" TEXT DEFAULT 'UTC',
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "propFirmName" TEXT,
    "accountSize" DOUBLE PRECISION NOT NULL,
    "startingBalance" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "profitTarget" DOUBLE PRECISION,
    "drawdownType" "DrawdownType",
    "drawdownValue" DOUBLE PRECISION,
    "dailyLossLimit" DOUBLE PRECISION,
    "consistencyRule" DOUBLE PRECISION,
    "maxContracts" INTEGER,
    "payoutFrequency" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "market" "Market" NOT NULL,
    "session" "TradingSession" NOT NULL,
    "direction" "Direction" NOT NULL,
    "dailyBias" "DailyBias" NOT NULL,
    "ifvgTimeframe" "IFVGTimeframe",
    "setupGrade" "SetupGrade" NOT NULL,
    "confirmation1" "Confirmation",
    "confirmation2" "Confirmation",
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "slPrice" DOUBLE PRECISION NOT NULL,
    "slType" "SLType",
    "tpPrice" DOUBLE PRECISION,
    "contracts" INTEGER NOT NULL DEFAULT 1,
    "rrTarget" DOUBLE PRECISION,
    "exitPrice" DOUBLE PRECISION,
    "result" "TradeResult",
    "rrAchieved" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION,
    "ruleViolation" BOOLEAN NOT NULL DEFAULT false,
    "violationDescription" TEXT,
    "screenshotUrl" TEXT,
    "wentWell" TEXT,
    "toImprove" TEXT,
    "notes" TEXT,
    "psychologyScore" INTEGER,
    "killzoneConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychologyBaseline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "profileType" "PsychologyProfile" NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PsychologyBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychologyCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "financialPressure" INTEGER NOT NULL,
    "focus" INTEGER NOT NULL,
    "emotionalStability" INTEGER NOT NULL,
    "readiness" INTEGER NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "recommendation" "DailyRecommendation" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PsychologyCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PsychologyReflection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeId" TEXT,
    "date" DATE NOT NULL,
    "followedRules" "FollowedRules" NOT NULL,
    "feltEmotional" BOOLEAN NOT NULL DEFAULT false,
    "revengeTrade" BOOLEAN NOT NULL DEFAULT false,
    "overtraded" BOOLEAN NOT NULL DEFAULT false,
    "disciplineGrade" "DisciplineGrade" NOT NULL,
    "wentWell" TEXT,
    "toImprove" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PsychologyReflection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "session" "TradingSession" NOT NULL,
    "dailyBiasSet" BOOLEAN NOT NULL DEFAULT false,
    "sessionHighsLowsMarked" BOOLEAN NOT NULL DEFAULT false,
    "premiumDiscountSet" BOOLEAN NOT NULL DEFAULT false,
    "prepCompleted" BOOLEAN NOT NULL DEFAULT false,
    "htLtReviewed" BOOLEAN NOT NULL DEFAULT false,
    "calendarChecked" BOOLEAN NOT NULL DEFAULT false,
    "killzoneSelected" BOOLEAN NOT NULL DEFAULT false,
    "ifvgIdentified" BOOLEAN NOT NULL DEFAULT false,
    "cleanCloseConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmation1" BOOLEAN NOT NULL DEFAULT false,
    "confirmation2" BOOLEAN NOT NULL DEFAULT false,
    "bothAlign" BOOLEAN NOT NULL DEFAULT false,
    "rrConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "consistencyChecked" BOOLEAN NOT NULL DEFAULT false,
    "dailyTargetChecked" BOOLEAN NOT NULL DEFAULT false,
    "slDecided" BOOLEAN NOT NULL DEFAULT false,
    "tpSet" BOOLEAN NOT NULL DEFAULT false,
    "contractsChecked" BOOLEAN NOT NULL DEFAULT false,
    "verdict" "ChecklistVerdict",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPnl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPsychologyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ruleViolations" INTEGER NOT NULL DEFAULT 0,
    "bestTradeId" TEXT,
    "worstDecision" TEXT,
    "whatWorked" TEXT,
    "whatToImprove" TEXT,
    "followedRoutine" "FollowedRoutine",
    "disciplineGrade" "DisciplineGrade",
    "nextWeekGoal" TEXT,
    "weekGrade" "WeekGrade",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "PsychologyBaseline_userId_key" ON "PsychologyBaseline"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PsychologyCheckin_userId_date_key" ON "PsychologyCheckin"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Checklist_userId_date_session_key" ON "Checklist"("userId", "date", "session");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_userId_weekStartDate_key" ON "WeeklyReview"("userId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologyBaseline" ADD CONSTRAINT "PsychologyBaseline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologyCheckin" ADD CONSTRAINT "PsychologyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologyReflection" ADD CONSTRAINT "PsychologyReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PsychologyReflection" ADD CONSTRAINT "PsychologyReflection_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReview" ADD CONSTRAINT "WeeklyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReview" ADD CONSTRAINT "WeeklyReview_bestTradeId_fkey" FOREIGN KEY ("bestTradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
