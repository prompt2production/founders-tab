-- CreateEnum
CREATE TYPE "NudgeType" AS ENUM ('EXPENSE_APPROVAL', 'WITHDRAWAL_APPROVAL');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "nudgeCooldownHours" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Nudge" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NudgeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nudge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Nudge_expenseId_type_idx" ON "Nudge"("expenseId", "type");

-- AddForeignKey
ALTER TABLE "Nudge" ADD CONSTRAINT "Nudge_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nudge" ADD CONSTRAINT "Nudge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
